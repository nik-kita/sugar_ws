# SugarWs

```ts
export class SugarWs extends WebSocket {
  // implementation
}
```

> So you can see that this websocket is not complicated extension of original
> browser's (so and **Deno**'s) websocket.

## Important improvements:

- `.once()` this method has the same API as the original `.addEventListener()`
  with only difference that it will auto-remove listener after first call
- `.wait_for(state: 'open' | 'close')` add more simple control over final states
  of websocket. So you can `await` for open or close and than do your stuff
  - important to note that this method only waiting for `open` or `close` states
    but not acting them
  - `.wait_for('close').and_close()` syntax sugar for:
    ```ts
    sugar_ws.close();
    await sugar_ws.wait_for("close");
    // the same as
    await sugar_ws.wait_for("close").and_close();
    // BUT NOT AS
    (await sugar_ws.wait_for("close")).close(); // <= should not work because you wait to DO close only when close happen)))
    ```
  - in any case be careful with usage of these methods especially in repeated
    scenarios... more tests are needed for this feature
- `.send_if_open()` will send only if websocket's `readyState` is `OPEN`
- `.on()` alias for original's `.addEventListener()`...so this is sugar only

## Example of usage:

```ts
import {
  assert,
  assertThrows,
} from "https://deno.land/std@0.205.0/assert/mod.ts";
import { delay } from "https://deno.land/std@0.205.0/async/delay.ts";
import { SugarWs } from "./mod.ts";

const ws = await new SugarWs(`ws://localhost:3333`).wait_for("open");
assert(ws.readyState === ws.OPEN, '`.wait_for("open")` is not work');
ws.onmessage = ({ data }) => console.log(data);
ws.send_if_open("ping");
ws.once("message", ({ data }) => onceMessages.push(data));
await delay(5_000);
await ws.wait_for("close").and_close();
assert(
  ws.readyState === ws.CLOSED,
  '`.wait_for("close").and_close()` is not working',
);
assertThrows(
  () => ws.send("hi!"),
  "should not send because ws is closed already",
);
assert(
  new Boolean(ws.send_if_open("hi!")),
  "ws is close => should not send => no error",
);
```

### P.S.

> Not enough tested the behavior for situations when `.wait_for(...)` promises
> started without resolving. For example start wait on open but websocket will
> never do it. In future the additional under-the-hood protections, may be
> options should be created to handle or auto-handle such situations.

[see code](./mod.ts)
