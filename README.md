# SugarWs

```ts
export class SugarWs extends WebSocket {
  // implementation
}
```

> So you can see that this websocket is not complicated extension of original
> browser's (so and **Deno**'s) websocket.

## Updates:

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
  - in any case be careful with usage of these methods especially in repeated
    scenarios... more tests are needed for this feature

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

### P.S.

> Not enough tested the behavior for situations when `.wait_for(...)` promises
> started without resolving. For example start wait on open but websocket will
> never do it. In future the additional under-the-hood protections, may be
> options should be created to handle or auto-handle such situations.

[see code](https://github.com/nik-kita/sugar_ws/blob/main/source-code.md)
