import test from "node:test";
import assert from "node:assert/strict";
import { Storage } from "../meta/storage.js";
import { addHistory, comparisonType, historyRecord } from "../meta/history.js";
import { validateSession } from "../meta/session.js";
import { simulateRegular } from "../sim/engine.js";
import { inputFor, complete } from "./helpers.js";
test("浏览器拒绝访问 localStorage 时仍可启动内存会话", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const notices = [];
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("blocked");
    },
  });
  try {
    const store = new Storage(undefined, (message) => notices.push(message));
    assert.equal(store.read("session"), null);
    assert.equal(store.write("session", {}), false);
    assert.equal(notices.length, 2);
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
});
test("损坏或配额受限存储不抛出未处理错误，并报告失败", () => {
  const notices = [];
  const map = new Map();
  const adapter = {
    getItem: (k) => map.get(k),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
  const store = new Storage(adapter, (m) => notices.push(m));
  assert.ok(store.write("x", { a: 1 }));
  assert.deepEqual(store.read("x"), { a: 1 });
  map.set("gamex:v1:x", "{broken");
  assert.equal(store.read("x"), null);
  assert.ok(notices.length);
  const full = new Storage(
    {
      setItem() {
        throw new Error("quota");
      },
    },
    (m) => notices.push(m),
  );
  assert.equal(full.write("x", {}), false);
  assert.ok(notices.length === 2);
});
test("历史去重、50 局保留、比较模式与版本隔离", () => {
  const a = historyRecord("a", complete(inputFor()), "2026-11-09");
  const b = historyRecord(
    "b",
    complete(inputFor("programmer", 2026, "quality")),
    "2026-11-09",
  );
  assert.equal(addHistory([a], a).length, 1);
  assert.match(comparisonType([a, b]), /同一场景/);
  const c = historyRecord(
    "c",
    complete(inputFor("programmer", 5)),
    "2026-11-09",
  );
  assert.match(comparisonType([a, c]), /同一策略/);
  c.versions.engine = "other";
  assert.match(comparisonType([a, c]), /版本不同/);
  let list = [];
  for (let i = 0; i < 55; i++)
    list = addHistory(list, { ...a, runId: String(i) });
  assert.equal(list.length, 50);
  assert.equal(list[0].runId, "54");
});
test("历史摘要控制体积并保留事件因果，不修改完整回放", () => {
  const run = complete(inputFor("product"));
  const original = JSON.stringify(run);
  const record = historyRecord("size-test", run, "2026-11-09");
  assert.ok(JSON.stringify(record).length < 30000);
  assert.ok(
    record.performance.keyEvents.every(
      (log) => log.eventId && log.triggeredRule && log.consequence,
    ),
  );
  assert.equal(JSON.stringify(run), original);
});
test("存档动作序号、版本和观看位置均校验", () => {
  const saved = {
    storageVersion: 1,
    regular: simulateRegular(inputFor()),
    playback: { nextActionIndex: 7 },
  };
  assert.deepEqual(validateSession(saved), saved);
  assert.throws(() =>
    validateSession({ ...saved, playback: { nextActionIndex: -1 } }),
  );
  const broken = structuredClone(saved);
  broken.regular.actions[0].sequence = 100;
  assert.throws(() => validateSession(broken));
  assert.throws(() => validateSession({ ...saved, storageVersion: 99 }));
});
