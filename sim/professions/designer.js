import { clamp, round } from "../prng.js";
export const palettes = {
  minimal: { bg: "#e7eadf", ink: "#395847", orb: "#a8bf9c" },
  bold: { bg: "#e7f264", ink: "#293d49", orb: "#9bacc2" },
  warm: { bg: "#efe4d3", ink: "#7d5846", orb: "#cdab8a" },
};
export const designer = {
  initialArtifact(input) {
    return {
      id: "main",
      kind: "design",
      version: 0,
      preference: input.environment.preference,
      style: "minimal",
      palette: palettes.minimal,
      layers: [
        { id: "bg", name: "背景 / Background", visible: true },
        { id: "orb", name: "主形态 / 视觉元素", visible: false },
        { id: "title", name: "标题 / Another Year", visible: false },
        { id: "subtitle", name: "副标题 / 给自己新一页", visible: false },
        { id: "brand", name: "品牌 / GAMEX", visible: true },
      ],
      activeLayer: "bg",
      proposals: [],
      revisions: [],
      approved: false,
      width: 1080,
      height: 1350,
    };
  },
  efficiency(state, s) {
    return (
      (s.special.multiProposal ? 0.87 : 1.05) *
      (s.special.intentStrategy === "clarify" ? 0.94 : 1)
    );
  },
  work(state, task, s) {
    const a = state.artifact;
    a.style =
      s.special.intentStrategy === "intuition"
        ? "bold"
        : s.special.intentStrategy === "reference"
          ? "minimal"
          : a.preference;
    a.palette = palettes[a.style];
    if (task.id !== "task-1") {
      a.layers.forEach((layer) => (layer.visible = true));
      a.activeLayer =
        task.id === "task-2"
          ? "title"
          : task.id === "task-3"
            ? "subtitle"
            : "brand";
    }
    if (task.id === "task-2" && !a.proposals.length)
      a.proposals = s.special.multiProposal
        ? [
            { id: "A", style: a.style },
            { id: "B", style: a.preference },
          ]
        : [{ id: "A", style: a.style }];
    if (task.id === "task-3") {
      a.width = 1080;
      a.height = 1350;
    }
    if (task.id === "task-4" && task.completed) {
      const aligned = a.style === a.preference || s.special.multiProposal;
      a.approved = aligned && state.quality >= 65;
      task.accepted = a.approved;
      task.completed = a.approved;
      if (!a.approved) {
        task.revisionCount++;
        task.requiredWork += 10;
        task.stage = "待客户验收";
        a.revisions.push({
          round: state.round,
          reason: "风格或质量未达到预期",
          version: a.version + 1,
        });
        if (task.revisionCount >= s.special.revisionLimit) {
          task.blocked = true;
          task.stage = "改稿上限 · 未获验收";
        }
      }
    }
    state.professionState.risk = round(
      clamp(
        state.professionState.risk +
          (s.intensity > 80 ? 2.5 : 0.5) +
          task.revisionCount -
          (s.special.multiProposal ? 0.5 : 0),
      ),
    );
    a.version++;
  },
  change(state, s, task) {
    const a = state.artifact;
    a.approved = false;
    a.revisions.push({
      round: state.round,
      version: a.version + 1,
      reason: "收到客户变更，更新配色与标题层级",
    });
    a.activeLayer = "title";
    a.style = a.preference;
    a.palette = palettes[a.style];
    a.layers.find((l) => l.id === "title").visible = true;
    if (task.revisionCount >= s.special.revisionLimit) {
      task.blocked = true;
      task.stage = "改稿上限 · 待验收";
    }
    state.professionState.revisions++;
    state.professionState.risk = clamp(state.professionState.risk + 5);
    a.version++;
    return s.special.multiProposal ? 5 : 2;
  },
  fail(state, task) {
    const a = state.artifact;
    a.revisions.push({
      round: state.round,
      version: a.version,
      reason: "版式层级与安全区需调整",
    });
    a.activeLayer = "subtitle";
    task.revisionCount++;
    state.professionState.risk = clamp(state.professionState.risk + 4);
  },
  feedback(state, s, task, message) {
    const a = state.artifact;
    a.titleScale = Math.max(0.8, (a.titleScale ?? 1) - 0.05);
    a.orbOffset = (a.orbOffset ?? 45) - 9;
    a.activeLayer = "title";
    a.approved = false;
    a.revisions.push({
      round: state.round,
      version: ++a.version,
      reason: message.text,
    });
    task.revisionCount++;
    if (task.revisionCount >= s.special.revisionLimit) {
      task.blocked = true;
      task.stage = "改稿上限 · 待验收";
    }
    state.professionState.risk = clamp(state.professionState.risk + 2);
  },
  check(state) {
    const a = state.artifact;
    a.revisions.push({
      round: state.round,
      version: a.version + 1,
      reason: "校正安全区与图层间距，检查字体和渠道规格",
    });
    a.activeLayer = "subtitle";
    a.version++;
  },
};
