import { createScenario } from "../data/environments.js";
import { presetStrategy } from "../data/parameters.js";
import {
  simulateRegular,
  continueAfterOvertime,
  mergeSegments,
} from "../sim/engine.js";
export function inputFor(
  professionId = "programmer",
  seed = 2026,
  preset = "balanced",
) {
  return {
    seed,
    professionId,
    ...createScenario(seed, professionId),
    strategy: presetStrategy(professionId, preset),
  };
}
export function complete(input, choice = false) {
  const regular = simulateRegular(input);
  return mergeSegments(
    regular,
    continueAfterOvertime(regular.checkpoint, choice),
  );
}
