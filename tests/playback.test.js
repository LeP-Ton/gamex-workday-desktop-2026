import test from "node:test";
import assert from "node:assert/strict";
import { Player } from "../playback/controller.js";
import { actionDurations } from "../playback/pacing.js";
import { simulateRegular, continueAfterOvertime } from "../sim/engine.js";
import { inputFor, complete } from "./helpers.js";
test("三种播放节奏、逐动作、跳节点和直接跳转结果完全相同", () => {
  const run = complete(inputFor());
  for (const preset of ["quick", "standard", "immersive"]) {
    const player = new Player({
      initialState: run.initialState,
      actions: run.actions,
      preset,
    });
    while (player.index < player.actions.length) player.skipToNextKey();
    assert.deepEqual(player.view, run.finalState);
    assert.equal(player.status, "finished");
  }
  const durations = actionDurations(run.actions, "standard");
  assert.ok(Math.abs(durations.reduce((a, b) => a + b, 0) - 720000) < 0.01);
});
test("跳转必须在前 10 轮停下，续接只有一次且动作不重复", () => {
  const regular = simulateRegular(inputFor());
  const p = new Player({
    initialState: regular.initialState,
    actions: regular.actions,
  });
  p.skipToBoundary();
  assert.equal(p.status, "awaiting_choice");
  assert.equal(p.view.round, 10);
  const continuation = continueAfterOvertime(regular.checkpoint, true);
  p.append(continuation.actions);
  assert.throws(() => p.append(continuation.actions));
  p.skipToBoundary();
  assert.equal(p.view.round, 12);
  assert.equal(p.index, p.actions.length);
});
test("任意动作游标的 JSON 恢复与连续播放投影一致", () => {
  const run = complete(inputFor("finance"));
  const p = new Player({
    initialState: run.initialState,
    actions: run.actions,
  });
  for (let i = 0; i < 17; i++) p.commit();
  const cursor = JSON.parse(JSON.stringify(p.getSaveState()));
  const restored = new Player({
    initialState: run.initialState,
    actions: run.actions,
    cursor: cursor.nextActionIndex,
  });
  assert.deepEqual(restored.view, p.view);
  restored.skipToBoundary();
  assert.deepEqual(restored.view, run.finalState);
});
test("暂停使已经排队的旧动画回调失效", () => {
  let callback;
  const oldRequest = globalThis.requestAnimationFrame,
    oldCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = (fn) => {
    callback = fn;
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {};
  try {
    const regular = simulateRegular(inputFor());
    const p = new Player({
      initialState: regular.initialState,
      actions: regular.actions,
    });
    p.play();
    const old = callback;
    p.pause();
    old(1000000);
    assert.equal(p.index, 0);
    assert.equal(p.status, "paused");
  } finally {
    globalThis.requestAnimationFrame = oldRequest;
    globalThis.cancelAnimationFrame = oldCancel;
  }
});
test("沉浸模式模拟 45 分钟及跨日停留：不漂移、不重复、等待不自动选择", () => {
  let callback;
  const oldRequest = globalThis.requestAnimationFrame,
    oldCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = (fn) => {
    callback = fn;
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {};
  try {
    const regular = simulateRegular(inputFor("designer"));
    const p = new Player({
      initialState: regular.initialState,
      actions: regular.actions,
      preset: "immersive",
    });
    p.play();
    for (let time = 0; time < 2_800_000 && p.status === "playing"; time += 200)
      callback(time);
    assert.equal(p.status, "awaiting_choice");
    const index = p.index,
      before = JSON.stringify(p.view);
    callback(86_400_000);
    assert.equal(p.index, index);
    assert.equal(JSON.stringify(p.view), before);
    const continuation = continueAfterOvertime(regular.checkpoint, false);
    p.append(continuation.actions);
    p.play();
    for (let time = 0; time < 800_000 && p.status === "playing"; time += 200)
      callback(time);
    assert.equal(p.status, "finished");
    assert.equal(p.view.round, 12);
  } finally {
    globalThis.requestAnimationFrame = oldRequest;
    globalThis.cancelAnimationFrame = oldCancel;
  }
});
