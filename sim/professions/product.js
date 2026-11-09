import { clamp, round } from "../prng.js";
export const product = {
  initialArtifact() {
    return {
      id: "main",
      kind: "document",
      version: 0,
      title: "退款自助化 · 产品需求文档",
      sections: [
        {
          id: "task-1",
          title: "01 / 背景与目标",
          text: "用户退款流程依赖人工协助。本期希望让符合条件的用户自主完成退款申请。",
          confirmed: false,
        },
        {
          id: "task-2",
          title: "02 / 流程与边界",
          text: "待梳理：申请入口、资格校验、退款状态与异常路径。",
          confirmed: false,
        },
        {
          id: "task-3",
          title: "03 / 评审与意见",
          text: "等待业务、研发和客服共同评审。",
          confirmed: false,
        },
        {
          id: "task-4",
          title: "04 / 范围与验收",
          text: "本期范围待确认，交付基线尚未锁定。",
          confirmed: false,
        },
      ],
      revisions: [],
      comments: [],
      conflicts: 0,
      baseline: false,
    };
  },
  efficiency(state, s) {
    return (
      0.98 -
      (s.special.documentDetail / 100) * 0.13 -
      (s.special.meetingParticipation / 100) * 0.09
    );
  },
  work(state, task, s) {
    const a = state.artifact,
      section = a.sections.find((section) => section.id === task.id);
    const detail = s.special.documentDetail >= 60;
    const text = {
      "task-1":
        "目标：缩短用户退款等待，降低人工协助成本。指标：符合资格的申请可自助完成，异常状态有清晰反馈。",
      "task-2": detail
        ? "主流程：订单详情 → 申请退款 → 校验资格与剩余额度 → 二次确认 → 原路退回。\n边界：重复提交返回已有结果；部分退款累计不超过实付；超期订单提示转人工。\n验收：不同订单状态与失败重试均有可追踪结果。"
        : "用户从订单页发起退款，通过资格校验后原路退回。异常场景待补充。",
      "task-3": `业务、研发、客服已参与评审。${s.special.meetingParticipation >= 55 ? "会上逐项澄清口径，关键冲突已记录并收敛。" : "部分意见仍需异步确认，存在边界理解差异。"}`,
      "task-4":
        "本期包含：标准退款申请、状态追踪、异常提示。后续评估：跨渠道与更多角色权限。验收条件已按需求版本逐项对应。",
    };
    const latest = a.revisions.filter((r) => r.taskId === task.id).at(-1);
    section.text =
      text[task.id] + (latest ? `\n已纳入变更：${latest.summary}` : "");
    section.confirmed = task.completed;
    if (task.id === "task-3" && s.special.meetingParticipation >= 55)
      a.conflicts = Math.max(0, a.conflicts - 1);
    if (task.id === "task-4" && task.completed) {
      a.baseline = a.conflicts === 0;
      task.accepted = a.baseline;
      task.completed = a.baseline;
      if (!a.baseline) {
        task.stage = "待意见确认";
        task.requiredWork += 4;
        a.comments.push("仍有冲突意见，不能锁定交付基线。");
      }
    }
    const source =
      s.special.stakeholderPriority === "team"
        ? "colleague"
        : s.special.stakeholderPriority;
    state.relationships[source] = round(
      clamp(state.relationships[source] + 0.5),
    );
    state.professionState.risk = round(
      clamp(state.professionState.risk + (detail ? -0.7 : 1.4) + a.conflicts),
    );
    a.version++;
  },
  change(state, s, task, message) {
    const a = state.artifact,
      section = a.sections.find((x) => x.id === task.id);
    a.revisions.push({
      version: a.version + 1,
      round: state.round,
      taskId: task.id,
      summary: message?.text ?? "补充变更对应的流程、权限或异常边界",
      before: section.text,
      after: `${section.text}\n新增：${message?.text ?? "补充变更对应的流程、权限或异常边界"}，需重新评审。`,
    });
    section.text = a.revisions.at(-1).after;
    section.confirmed = false;
    a.baseline = false;
    a.sections
      .filter((x) =>
        state.tasks.find((t) => t.id === x.id)?.dependsOn.includes(task.id),
      )
      .forEach((x) => (x.confirmed = false));
    a.conflicts += s.special.meetingParticipation < 55 ? 1 : 0;
    state.professionState.risk = clamp(
      state.professionState.risk + 7 - s.special.documentDetail / 25,
    );
    a.comments.push(`第 ${state.round} 轮变更使相关确认失效，需重新评审。`);
    a.version++;
    return 4;
  },
  fail(state, task) {
    state.artifact.conflicts++;
    state.artifact.comments.push(
      `${task.title}：异常边界存在不同理解，已要求澄清。`,
    );
    state.professionState.risk = clamp(state.professionState.risk + 4);
  },
  feedback(state, s, task, message) {
    const a = state.artifact;
    a.comments.push(message.text);
    a.sections.find((x) => x.id === task.id).confirmed = false;
    a.baseline = false;
    a.conflicts++;
    a.version++;
  },
  check(state) {
    const a = state.artifact;
    a.conflicts = Math.max(0, a.conflicts - 1);
    a.comments.push(`第 ${state.round} 轮核对：澄清冲突意见并补充验收条件。`);
    a.version++;
  },
};
