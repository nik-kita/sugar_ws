import {
  assert,
  assertThrows,
} from "https://deno.land/std@0.205.0/assert/mod.ts";
import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { delay } from "https://deno.land/std@0.205.0/async/delay.ts";
import { ApplicationCloseEvent } from "https://deno.land/x/oak@v12.6.1/application.ts";
import { SugarWs } from "./mod.ts";

// TODO find way to use "data provider" pattern in tests with Deno

const gen_log = (prefix: string, margin_right = 0) => (...args: unknown[]) =>
  console.debug(`${" ".repeat(margin_right)}${prefix}:`, ...args);

Deno.test({
  name: "SugarWs",
}, async (t) => {
  await t.step("instance created wia constructor", async () => {
    const server = gen_test_ws_server();

    await server.started;

    let should_be_one_after_open = 0;

    const ws = await new SugarWs(`ws://localhost:${server.port}`)
      .wait_for(
        "open",
      ).and((sugar) => {
        sugar.once("open", () => void ++should_be_one_after_open);

        return;
      });
    assert(should_be_one_after_open === 1, ".on_open() is not work");
    assert(ws.readyState === ws.OPEN, '`.wait_for("open")` is not work');
    const wsLog = gen_log("ws", 40);

    ws.onerror = (err) => wsLog(err);
    ws.onclose = () => {
      wsLog("closed");
    };
    ws.onmessage = ({ data }) => wsLog(data);
    ws.send_if_open("ping");

    const allMessages = [] as MessageEvent["data"][];
    const onceMessages = [] as MessageEvent["data"][];

    ws.on("message", ({ data }) => {
      allMessages.push(data);
      ws.send_if_open("ping");
    });
    ws.once("message", ({ data }) => onceMessages.push(data));
    let should_still_zero = 0;
    ws.once("message", () => ++should_still_zero)(); // rm once listener
    await delay(1);
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
    assert(allMessages.length > 1, "this is important condition for this test");
    assert(onceMessages.length === 1, "`.once()` is not working");
    assert(should_still_zero === 0);
    server.stop_signal();
    await server.listening;
  });
  await t.step("instance created wia static method", async () => {
    const server = gen_test_ws_server();

    await server.started;

    const ws = await SugarWs.sugarize(
      new WebSocket(`ws://localhost:${server.port}`),
    ).wait_for(
      "open",
    );
    assert(ws.readyState === ws.OPEN, '`.wait_for("open")` is not work');
    const wsLog = gen_log("ws", 40);

    ws.onerror = (err) => wsLog(err);
    ws.onclose = () => {
      wsLog("closed");
    };
    ws.onmessage = ({ data }) => wsLog(data);
    ws.send_if_open("ping");

    const allMessages = [] as MessageEvent["data"][];
    const onceMessages = [] as MessageEvent["data"][];

    ws.on("message", ({ data }) => {
      allMessages.push(data);
      ws.send_if_open("ping");
    });
    ws.once("message", ({ data }) => onceMessages.push(data));
    await delay(1);
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
    assert(allMessages.length > 1, "this is important condition for this test");
    assert(onceMessages.length === 1, "`.once()` is not working");
    server.stop_signal();
    await server.listening;
  });
  await t.step(
    'check Symbol.asyncDispose method for "using" feature',
    async (tt) => {
      await tt.step("dispose at once", async () => {
        // deno-lint-ignore require-await
        (async () => {
          await using s = new SugarWs("ws://localhost");
          console.log("hi");
          s;
        })();
        await delay(1);
      });

      await tt.step("dispose after open", async () => {
        const server = gen_test_ws_server();

        await server.started;
        // deno-lint-ignore no-explicit-any
        let readyState: any;
        // deno-lint-ignore require-await
        await (async () => {
          await using ws = new SugarWs(`ws://localhost:${server.port}`);

          return new Promise<void>((resolve) => {
            ws.on("open", () => {
              resolve();
              console.log("open");
            });
            ws.on("close", () => {
              readyState = ws.readyState;
            });
          });
        })();
        assert(
          readyState === WebSocket.CLOSED,
          "using did not change readyState to CLOSED",
        );
        server.stop_signal();
        await server.listening;
      });
    },
  );
});

type GenWsServerOptions = {
  port: number;
  log: (...args: unknown[]) => void;
  configure_client_ws: (ws: WebSocket) => void;
};

const default_port = 3333;
const gen_default_client_ws_manipulator =
  (log: (...args: unknown[]) => void) => (client_ws: WebSocket) => {
    let counter = 0;
    client_ws.onopen = () => {
      log("server: client_ws is open");
      client_ws.send("do you want to play tennis?");
    };
    client_ws.onerror = log;
    client_ws.onmessage = ({ data }) => {
      log("server: ", data);
      client_ws.send("pong " + ++counter);
    };
  };

function gen_test_ws_server(
  options: Partial<GenWsServerOptions> = {},
) {
  const {
    log = console.debug,
    port = default_port,
  } = options;
  const configure_client_ws = options.configure_client_ws ||
    gen_default_client_ws_manipulator(log);
  const abortController = new AbortController();
  const { signal } = abortController;
  const clients_close_promises = [] as Promise<void>[];
  const clients = [] as WebSocket[];
  const server = new Application()
    .use((ctx) => {
      ctx.isUpgradable || ctx.throw(400, "ws connection expected");

      const clientWs = ctx.upgrade();
      clients.push(clientWs);
      clients_close_promises.push(
        new Promise((resolve) =>
          clientWs.addEventListener("close", () => resolve())
        ),
      );
      configure_client_ws(clientWs);
    });

  const {
    promise: graceful_shutdown,
    resolveContainer,
  } = (() => {
    const resolveContainer = [] as ((value: unknown) => void)[];
    const promise = new Promise((resolve) => {
      resolveContainer.push(resolve);
    });

    return { promise, resolveContainer };
  })();

  server.addEventListener("close", async () => {
    log("server: closing...");
    clients.forEach((c) =>
      [WebSocket.CLOSING, WebSocket.CLOSING].includes(c.readyState) ||
      c.close(1000)
    );
    for await (const closing of clients_close_promises) {
      await closing;
    }
    const last_promise = resolveContainer.pop();
    if (!last_promise) {
      console.error(
        "LOW_LEVEL_TEST_ERROR: unable to resolve last promise for graceful shutdown",
      );
    } else last_promise("complete");
  });

  const started = new Promise((resolve, reject) => {
    server.addEventListener("error", reject);
    server.addEventListener("listen", resolve);
  });

  return {
    port,
    started,
    listening: server.listen({
      port,
      signal,
    }).then(() => graceful_shutdown),
    stop_signal: abortController.abort.bind(
      abortController,
      new ApplicationCloseEvent({}),
    ),
  };
}
