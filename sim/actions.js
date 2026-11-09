export function diffState(before, after, path = []) {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (
    before &&
    after &&
    !Array.isArray(before) &&
    !Array.isArray(after) &&
    typeof before === "object" &&
    typeof after === "object"
  ) {
    return [
      ...new Set([...Object.keys(before), ...Object.keys(after)]),
    ].flatMap((key) => diffState(before[key], after[key], [...path, key]));
  }
  return [
    {
      path,
      before: before === undefined ? null : structuredClone(before),
      after: after === undefined ? null : structuredClone(after),
    },
  ];
}
export function applyAction(state, action) {
  const next = structuredClone(state);
  for (const patch of [...action.artifactPatches, ...action.stateDelta]) {
    let target = next;
    for (const key of patch.path.slice(0, -1)) target = target[key];
    target[patch.path.at(-1)] = structuredClone(patch.after);
  }
  return next;
}
