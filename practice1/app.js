'use strict';

/* ---------- Closure: createTask ---------- */
const randomDelay = () => Math.round(500 + Math.random() * 1500); // 500-2000 ms
const FAIL_RATE = 0.3;

function createTask(name, onChange = () => {}) {
  // Private state: only the returned methods can read or change it.
  let count = 0;
  let status = 'Idle';
  let time = null;

  return {
    run(delay = randomDelay()) {
      count++;
      status = 'Running';
      time = null;
      onChange();
      const start = performance.now();

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          time = Math.round(performance.now() - start);
          if (Math.random() < FAIL_RATE) {
            status = 'Failed';
            onChange();
            reject(new Error(`${name} failed`));
          } else {
            status = 'Completed';
            onChange();
            resolve(name);
          }
        }, delay);
      });
    },
    getCount: () => count,
    reset() { count = 0; status = 'Idle'; time = null; onChange(); },
    getState: () => ({ name, status, count, time }),
  };
}

/* ---------- UI: task list ---------- */
const $ = (id) => document.getElementById(id);
const tasks = ['Load Users', 'Load Posts', 'Load Comments'].map((n) => createTask(n, render));

function render() {
  $('tasks').innerHTML = tasks.map((t, i) => {
    const s = t.getState();
    return `<li>
      <span class="name">${s.name}<span class="badge ${s.status.toLowerCase()}">${s.status}</span></span>
      <span class="meta">Runs: ${t.getCount()} &nbsp; Time: ${s.time === null ? '-' : s.time + ' ms'}</span>
      <span><button data-run="${i}">Run</button> <button class="ghost" data-reset="${i}">Reset</button></span>
    </li>`;
  }).join('');
}

$('tasks').addEventListener('click', (e) => {
  const { run, reset } = e.target.dataset;
  if (run !== undefined) tasks[run].run().catch(() => {}); // failure is already shown in the UI
  if (reset !== undefined) tasks[reset].reset();
});

/* ---------- Run all at once ---------- */
$('runAll').addEventListener('click', async () => {
  $('allStatus').textContent = 'Running...';
  // allSettled waits for every promise and never rejects, so one failure cannot hide the rest.
  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  const failed = results.filter((r) => r.status === 'rejected').length;
  $('allStatus').textContent =
    `All tasks finished: ${results.length - failed} completed, ${failed} failed.`;
});

/* ---------- Sequential vs concurrent ---------- */
$('compare').addEventListener('click', async () => {
  const out = $('compareOut');
  out.textContent = 'Measuring...';
  const delays = tasks.map(randomDelay); // same delays for both runs

  let t0 = performance.now();
  for (let i = 0; i < tasks.length; i++) {
    try { await tasks[i].run(delays[i]); } catch { /* keep going */ }
  }
  const seq = Math.round(performance.now() - t0);

  t0 = performance.now();
  await Promise.allSettled(tasks.map((t, i) => t.run(delays[i])));
  const con = Math.round(performance.now() - t0);

  const sum = delays.reduce((a, b) => a + b, 0);
  out.innerHTML = `
    <p>Delays: ${delays.join(' + ')} ms (sum ${sum} ms, longest ${Math.max(...delays)} ms)</p>
    <p><span class="bad">Sequential:</span> ${seq} ms, close to the sum, because each task waits for the previous one.</p>
    <p><span class="good">Concurrent:</span> ${con} ms, close to the longest task, because all timers run at the same time.</p>`;
});

/* ---------- Event loop demo ---------- */
const predicted = [
  'script start',
  'async start',
  'script end',
  'promise 1',
  'async after await',
  'promise 2',
  'timer 1 (0 ms)',
  'timer 2 (10 ms)',
];

function runEventLoopDemo() {
  const actual = [];
  const log = (msg) => { console.log(msg); actual.push(msg); };

  return new Promise((done) => {
    log('script start');

    setTimeout(() => log('timer 1 (0 ms)'), 0);
    setTimeout(() => { log('timer 2 (10 ms)'); done(actual); }, 10);

    Promise.resolve()
      .then(() => log('promise 1'))
      .then(() => log('promise 2'));

    (async function demo() {
      log('async start');
      await null; // the rest of demo() becomes a microtask
      log('async after await');
    })();

    log('script end');
  });
}

const list = (id, items) => { $(id).innerHTML = items.map((x) => `<li>${x}</li>`).join(''); };
list('predicted', predicted);

$('loopDemo').addEventListener('click', async () => {
  list('actual', []);
  $('loopVerdict').textContent = 'Running...';
  const actual = await runEventLoopDemo();
  list('actual', actual);
  const same = actual.every((line, i) => line === predicted[i]);
  $('loopVerdict').textContent = same
    ? 'The prediction matches the actual output.'
    : 'The output differs from the prediction. Compare the two lists.';
});

render();
