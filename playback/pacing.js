export const pacingPresets = {
  quick: { label: "快速", duration: 90_000 },
  standard: { label: "标准", duration: 720_000 },
  immersive: { label: "沉浸", duration: 2_700_000 },
};
export function actionDurations(actions, preset = "standard") {
  const total =
    pacingPresets[preset]?.duration ?? pacingPresets.standard.duration;
  const weight = (a) =>
    a.kind === "round.start"
      ? 0.35
      : a.kind === "round.end"
        ? 0.45
        : a.kind === "chat.defer"
          ? 0.5
          : a.kind === "work.advance"
            ? 2
            : 1;
  const roundWeights = new Map();
  actions.forEach((a) =>
    roundWeights.set(a.round, (roundWeights.get(a.round) ?? 0) + weight(a)),
  );
  return actions.map(
    (a) => ((total / 12) * weight(a)) / roundWeights.get(a.round),
  );
}
