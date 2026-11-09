import { applyAction } from "../sim/actions.js";
import { project } from "./projection.js";
import { actionDurations } from "./pacing.js";
export class Player {
  constructor({
    initialState,
    actions,
    cursor = 0,
    speed = 1,
    preset = "standard",
    onUpdate = () => {},
    onBoundary = () => {},
    onFrame = () => {},
  }) {
    Object.assign(this, {
      initialState,
      actions,
      index: cursor,
      speed,
      preset,
      onUpdate,
      onBoundary,
      onFrame,
    });
    this.view = project(initialState, actions, cursor);
    this.status = "paused";
    this.offset = 0;
    this.epoch = 0;
    this.durations = actionDurations(actions, preset);
  }
  play() {
    if (this.status === "playing") return;
    if (this.index >= this.actions.length) {
      this.boundary();
      return;
    }
    this.status = "playing";
    this.previous = null;
    const epoch = ++this.epoch;
    const tick = (time) => {
      if (this.epoch !== epoch || this.status !== "playing") return;
      if (this.previous !== null)
        this.offset += Math.min(250, time - this.previous) * this.speed;
      this.previous = time;
      const duration = this.durations[this.index];
      this.onFrame(
        this.actions[this.index],
        Math.min(1, this.offset / duration),
      );
      if (this.offset >= duration) {
        this.commit();
        this.offset = 0;
        if (this.index >= this.actions.length) {
          this.boundary();
          return;
        }
      }
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
    this.onUpdate(this);
  }
  pause() {
    ++this.epoch;
    if (this.frame) cancelAnimationFrame(this.frame);
    if (this.status === "playing") this.status = "paused";
    this.onUpdate(this);
  }
  commit() {
    const action = this.actions[this.index];
    if (!action) return;
    this.view = applyAction(this.view, action);
    this.index++;
    this.onUpdate(this, action);
  }
  skipToNextKey() {
    const playing = this.status === "playing";
    this.pause();
    this.offset = 0;
    const next = this.actions.findIndex(
      (a, i) => i >= this.index && a.importance === "key",
    );
    const target = next < 0 ? this.actions.length : next + 1;
    while (this.index < target) this.commit();
    if (this.index >= this.actions.length) this.boundary();
    else if (playing) this.play();
  }
  skipToBoundary() {
    this.pause();
    this.offset = 0;
    while (this.index < this.actions.length) this.commit();
    this.boundary();
  }
  boundary() {
    ++this.epoch;
    this.status =
      this.view.phase === "completed" ? "finished" : "awaiting_choice";
    this.onUpdate(this);
    this.onBoundary(this);
  }
  append(actions) {
    if (
      this.status !== "awaiting_choice" ||
      this.index !== this.actions.length ||
      actions[0]?.sequence !== this.index
    )
      throw new Error("回放续接位置不正确");
    this.actions = [...this.actions, ...actions];
    this.durations = actionDurations(this.actions, this.preset);
    this.status = "paused";
  }
  setSpeed(speed) {
    if (![1, 4, 12].includes(speed)) throw new Error("播放速度无效");
    this.speed = speed;
    this.onUpdate(this);
  }
  getSaveState() {
    return {
      nextActionIndex: this.index,
      speed: this.speed,
      pacingPreset: this.preset,
      status: this.status,
    };
  }
  destroy() {
    this.pause();
    this.onUpdate = () => {};
    this.onBoundary = () => {};
  }
}
