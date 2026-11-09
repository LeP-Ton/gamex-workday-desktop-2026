import { clamp, round } from "./prng.js";
export function progress(state) {
  const weight = state.tasks.reduce((sum, t) => sum + t.completionWeight, 0);
  return round(
    state.tasks.reduce(
      (sum, t) =>
        sum +
        Math.min(1, t.doneWork / t.requiredWork) * 100 * t.completionWeight,
      0,
    ) / weight,
  );
}
export function responseDecision(message, state, strategy) {
  const unread = state.messages.filter(
    (m) => m.sender !== "self" && m.status === "unread",
  ).length;
  const predicates = {
    boss_first: message.source === "boss",
    client_first: message.source === "client",
    finish_first: progress(state) > 80 && message.urgency !== "urgent",
    unread_batch: unread > 5,
    help_colleague: message.source === "colleague" && message.intent === "help",
    defer_colleague:
      message.source === "colleague" && message.intent === "help",
  };
  const matched = strategy.priorityRules.find((id) => predicates[id]);
  const mode =
    matched === "finish_first"
      ? "after_delivery"
      : matched === "defer_colleague"
        ? "delayed"
        : matched === "unread_batch"
          ? "batch"
          : matched
            ? "instant"
            : strategy.wechatMode;
  return {
    rule: matched ?? `default:${strategy.wechatMode}`,
    mode,
    ready:
      mode === "instant" ||
      mode === "batch" ||
      (mode === "delayed" && message.round < state.round) ||
      (mode === "after_delivery" && progress(state) >= 99.9),
  };
}
export function capacity(state, strategy, overtime) {
  const interruption =
    state.messages.filter((m) => m.round === state.round && m.sender !== "self")
      .length * (strategy.wechatMode === "instant" ? 0.08 : 0.025);
  const switching =
    (strategy.parallelism - 1) * (strategy.focusMode === "deep" ? 0.1 : 0.055);
  const overload =
    strategy.intensity > 85 &&
    strategy.parallelism === 3 &&
    strategy.wechatMode === "instant"
      ? 0.68
      : 1;
  return round(
    ((90 * strategy.intensity) / 100) *
      (0.48 + state.energy / 190) *
      Math.max(0.45, 1 - interruption - switching) *
      overload *
      (overtime ? 1.35 : 1),
  );
}
export function errorProbability(state, strategy) {
  const checks = { never: 0.04, milestones: -0.02, everyStep: -0.05 }[
    strategy.selfCheck
  ];
  const processRisk =
    strategy.redlineTolerance === "risky"
      ? 0.05
      : strategy.redlineTolerance === "flexible"
        ? 0.015
        : -0.01;
  const reviewRisk =
    strategy.special.reviewStrictness === "lenient"
      ? 0.025
      : strategy.special.reviewStrictness === "strict"
        ? -0.02
        : 0;
  return clamp(
    0.06 +
      state.professionState.risk / 300 +
      Math.max(0, 45 - state.energy) / 180 +
      Math.max(0, strategy.intensity - 80) / 250 +
      (strategy.qualityPreference === "fast"
        ? 0.13
        : strategy.qualityPreference === "meticulous"
          ? -0.04
          : 0) +
      checks +
      processRisk +
      reviewRisk,
    0.015,
    0.8,
  );
}
