import { applyAction } from "../sim/actions.js";
export function project(initialState, actions, endExclusive = actions.length) {
  return actions
    .slice(0, endExclusive)
    .reduce(applyAction, structuredClone(initialState));
}
