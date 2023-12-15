# SugarWs

```ts
export class SugarWs extends WebSocket {
  // implementation
}
```

> So you can see that this websocket is not complicated extension of original
> browser's (so and **Deno**'s) websocket.

> This package should work in `browser` (so you can import it from npm's
> `sugar_ws`) as same as in `Deno` (so you can import it both from
> `'npm:sugar_ws'` or `https://deno.land/x/sugar_ws/mod.ts`)

## Important improvements:

- `.once()` this method has the same API as the original `.addEventListener()`
  with only difference that it will auto-remove listener after first call
- `.wait_for(state: 'open' | 'close')` add more simple control over final states
  of websocket. So you can `await` for open or close and then do your stuff
  - important to note that this method only waiting for `open` or `close` states
    but not acting them
  - `.wait_for('close').and_close()` syntax sugar for:
    ```ts
    await sugar_ws.wait_for("close").and_close();
    // the same as
    sugar_ws.close();
    await sugar_ws.wait_for("close");
    ```
    - be careful:
      ```ts
      // this is not the same
      (await sugar_ws.wait_for("close")).close(); // <= should not work
      // also not work
      await sugar_ws.wait_for("close");
      sugar_ws.close();
      // last examples should not work because you started to wait
      // closing before "close" happen)))
      // and you blocked next line `.close()`
      // HOWEVER may be your simply waiting that `.close()` is happen somewhere
      // so in this situation it's ok to wait for this
      await sugar_ws.wait_for("close");
      ```
  - `.wait_for('open').and(cb: (ws: SugarWs) => unknown)` syntax sugar for:
    ```ts
    const sugar_ws = new SugarWs("ws://localhost:5432");
    sugar_ws.on("message", () => console.log("new message!"));
    sugar_ws.once("error", () => sugar_ws.send("ok, google, help me!"));
    await sugar_ws.wait_for("open");
    // the same as
    await new SugarWs("ws://localhost:5432")
      .wait_for("open")
      .and((s) => {
        s.on("message", () => console.log("new message!"));
        s.once("error", () => s.send("ok, google, help me!"));
      });
    // in case your websocket is already open - the listeners for "open" event will ignored
    ```
    > so it like `.then()` syntax in `Promise`... Im not sure is it really
    > handy...

## Also improvements, but not so important:

- `.send_if_open()` will send only if websocket's `readyState` is `OPEN`
- `.on()` alias for original's `.addEventListener()`...so this is sugar only

## Example of usage:

```ts
import { SugarWs } from "https://deno.land/x/sugar_ws/mod.ts";

const ws = await new SugarWs(`ws://localhost:3333`).wait_for("open");

ws.send_if_open("ping");
ws.once(
  "message",
  ({ data }) => console.log("may be FIRST but exactly LAST message:", data),
);

await new Promise<void>((resolve) => setTimeout(resolve, 1000));
await ws.wait_for("close").and_close();

ws.send_if_open("hi!"); // will not send because websocket is already closed
```

## Updates:

[x] _2023-12-09_: `useWs` hook for `react` or `preact`: > now awailable as
return value from `get_useWs` > // TODO add tests, documentation

- [x] _2023-12-02_: `using` feature:
  > implement `[Symbol.asyncDispose]` method so now you can create sugar_ws
  > instance via `using`
  ```ts
  await using sugar = new SugarWs("ws://localhost:3000");
  ```
  ### P.S.
  > Explanation: with `using` keyword instead of `let` or `const`, the sugar_ws
  > instance will be automatically closed when you will loose reference on it
  > (or +/- something like that... read typescript documentation about `using`)
- [x] _2023-11-15_: `.wait_for('open')` simplicity:
  > after calling `.wait_for('open').and(your_callback)` current version
- [x] _2023-11-15_: `.wait_for('open')` update return value:
  > change parameter for `.and_add_event_listeners()` so now this is callback
  > that should return array of arrays (in previous version you defined this
  > array at once) purposes: with new implementation you have access to
  > websocket before it open example:
  ```ts
  const ws = await new SugarWs(`ws://localhost:${server.port}`)
    .wait_for(
      "open",
    ).and_add_listeners((sugar) => [[
      () => sugar.send("client is ready!"),
      "open",
      "once",
    ]]);
  ```
- [x] _2023-11-14_: `.wait_for('open')` update return value:
  > change parameter for `.and_add_event_listeners_for()`
- [x] _2023-11-14_: `.wait_for('open')` has sugar return value
  ```ts
  Promise<SugarWs> & { on_open(your_cb() => void) => Promise<SugarWs> }
  ```
  - description:
    > So you can `await` `open` event of websocket and add `onopen` callbacks at
    > once. Under the hood your listeners will be added firstly and only then
    > `open` command will send (if not already sended)
    ```ts
    const sugar = await new SugarWs("ws://localhost:5432")
      .wait_for("open")
      .on_open(() => console.log("hi there!"));
    ```
- [x] _2023-11-13_: `.once()` return `() => void` function that will remove
      listener if it is not already called
  - description:
    > to remove simple listeners you should do nothing special - call
    > `.removeEventListener('some-event', your_cb)` but in case with `.once()` -
    > you can not get `your_cb` in terms that sugar_ws will listened not exactly
    > for it but for it's replaced version... so if you should remove it you
    > probably can call this new return value, it do it for you

- [x] _2023-11-06_: add static method `sugarize` to upgrade already existed
      instance of `WebSocket` to `SugarWs`
  ```ts
  const constructor_sugar = new SugarWs("ws://localhost:3333");
  // the same as
  const from_static_sugar = SugarWs.sugarize(
    new WebSocket("ws://localhost:3333"),
  );
  ```
- [x] _2023-11-07_: `.send_if_open()` return `boolean` to indicate is message
      was sen

### P.S.

> Not enough tested the behavior for situations when `.wait_for(...)` promises
> started without resolving. For example start wait on open but websocket will
> never do it. In future the additional under-the-hood protections, may be
> options should be created to handle or auto-handle such situations.

[see code](https://github.com/nik-kita/sugar_ws/blob/main/source-code.md)
