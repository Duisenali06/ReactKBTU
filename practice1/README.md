# Async Lab

A small vanilla JavaScript project (HTML + CSS + JS, no libraries) for practicing closures, the call stack, promises, `async/await`, the event loop, tasks and microtasks.

Open `index.html` in a browser. Files: `index.html`, `style.css`, `app.js`.

## 1. How the closure keeps the counter private

`createTask(name)` declares `let count = 0` inside the function and returns an object with `run`, `getCount` and `reset`. Those methods "close over" `count`, so they can still use it after `createTask` has finished. Outside code has no property to touch, so `task.count` is `undefined` and the only way to read it is `getCount()`. Every call to `createTask` creates a new scope, so "Load Users", "Load Posts" and "Load Comments" each have their own counter.

## 2. Call stack example

When "Run All Tasks" is clicked, the click handler is pushed on the call stack. It calls `tasks.map(...)`, which calls `task.run()` for each task. Each `run()` increments the counter, creates a `Promise`, calls `setTimeout` and returns. Every function pops off the stack as soon as it returns, so the stack is empty again after a few microseconds, even though the tasks have not finished yet.

```
run() -> Promise constructor -> setTimeout()   (each call returns and pops)
map callback -> click handler                  (stack becomes empty)
```

## 3. How JavaScript continues while `setTimeout` waits

`setTimeout` does not block. The browser's timer (a Web API, outside the JS engine) counts the time. JavaScript keeps running the rest of the code and handles other events. When the time is up, the browser puts the callback into the task queue, and the event loop moves it to the call stack once the stack is empty. That is why all three tasks can "load" at the same time.

## 4. Event loop demo: predicted vs actual

Prediction, written before running:

```
script start
async start
script end
promise 1
async after await
promise 2
timer 1 (0 ms)
timer 2 (10 ms)
```

Actual output: identical (the page also checks this and shows the result).

Why:

1. **Call stack:** `script start`, then the two `setTimeout` calls are handed to the browser. `Promise.resolve().then(...)` queues "promise 1" as a microtask. `demo()` runs synchronously and logs `async start`, then `await null` pauses it and queues its continuation as a microtask. Then `script end` is logged. The stack is empty.
2. **Microtask queue:** runs completely before anything else: `promise 1` (which queues `promise 2`), then `async after await`, then `promise 2`.
3. **Task queue:** the event loop takes the next task: `timer 1`, then `timer 2` (10 ms).

## 5. Tasks vs microtasks

A **task** (macrotask) is a unit of work such as a `setTimeout` callback, a click event or a network event. The event loop runs one task, then does the microtask step. A **microtask** is a promise callback (`.then`, `.catch`, `.finally`) or the code after an `await`. After each task, and whenever the call stack empties, the engine runs the **whole** microtask queue, including microtasks added while it runs, before the next task. So `Promise.resolve().then(...)` always beats `setTimeout(..., 0)`.

## 6. Multiple promises and errors

- Each `run()` returns a promise that resolves on success and rejects with an `Error` on a random failure (30% chance).
- **Run All Tasks** uses `Promise.allSettled`, which waits for every promise and never rejects, so "All tasks finished" appears only after every task has completed or failed. `Promise.all` would reject on the first failure and stop waiting for the rest.
- Single **Run** buttons use `.catch()`, and the sequential comparison uses `try/catch` around each `await`, so one failure does not crash the flow or leave an unhandled rejection. The failed status is shown in the UI.

## 7. Sequential vs concurrent

```js
// sequential: each task starts after the previous one is done
await task1.run(); await task2.run(); await task3.run();

// concurrent: all timers start at once
await Promise.allSettled([task1.run(), task2.run(), task3.run()]);
```

Sequential time is about the **sum** of the delays, for example 900 + 1500 + 700 = ~3100 ms. Concurrent time is about the **longest** delay, ~1500 ms. Loading is only waiting on timers (or the network), so nothing stops the tasks from waiting together. The compare button uses the same random delays for both runs, so the difference comes only from how the promises are awaited. Use sequential only when a task needs the result of the previous one.
