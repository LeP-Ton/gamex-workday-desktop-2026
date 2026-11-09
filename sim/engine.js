import { validateRunInput, VERSION } from "./schema.js";
import { createRng, deriveSeed, clamp, round } from "./prng.js";
import { eventPools } from "../data/events.js";
import { professions } from "../data/professions.js";
import {
  capacity,
  errorProbability,
  responseDecision,
  progress,
} from "./strategies.js";
import { programmer } from "./professions/programmer.js";
import { finance } from "./professions/finance.js";
import { product } from "./professions/product.js";
import { designer } from "./professions/designer.js";
import { diffState } from "./actions.js";
import { scoreRun } from "./scoring.js";

export const adapters = { programmer, finance, product, designer };
function initialState(input) {
  return {
    round: 0,
    phase: "running",
    tasks: input.taskBrief.subtasks.map((t) => ({
      ...structuredClone(t),
      doneWork: 0,
      stage: "待开始",
      completed: false,
      accepted: false,
      revisionCount: 0,
    })),
    artifact: adapters[input.professionId].initialArtifact(input),
    messages: [],
    relationships: { boss: 72, client: 72, colleague: 72 },
    energy: 100,
    accumulatedEnergyCost: 0,
    overwork: 0,
    interruptionCost: 0,
    unreadPressure: 0,
    errorRateBp: 0,
    errors: [],
    rework: 0,
    quality: 92,
    professionState: {
      risk: input.environment.initialRisk,
      revisions: 0,
      scopeChanges: 0,
    },
    npcExpectations: 0,
    metrics: { effort: 0, acceptedChanges: 0, replies: 0 },
  };
}
function computeSegment(
  input,
  start,
  first,
  last,
  choice,
  counters = { actions: 0, events: 0, logs: 0 },
  rngState,
) {
  const state = structuredClone(start),
    actions = [],
    logs = [],
    snapshots = [];
  const adapter = adapters[input.professionId],
    strategy = input.strategy;
  const rng = createRng(rngState ?? deriveSeed(input.seed, "work-risk"));
  const nextEventId = () =>
    `r${String(state.round).padStart(2, "0")}:e${++counters.events}`;
  function emit(
    kind,
    event,
    text,
    mutate = () => {},
    rule = "work:scheduled",
    key = false,
  ) {
    const before = structuredClone(state);
    mutate();
    const patches = diffState(before, state);
    const sequence = counters.actions++;
    const action = {
      actionId: `a${sequence}`,
      sequence,
      round: state.round,
      eventId: event.eventId,
      parentEventId: event.parentEventId ?? null,
      relatedTaskId:
        event.relatedTaskId ??
        state.tasks.find((t) => !t.completed)?.id ??
        "task-4",
      artifactId: "main",
      actorId: "employee",
      appId: kind.startsWith("chat.")
        ? "wechat"
        : professions[input.professionId].app,
      kind,
      payload: { text },
      artifactPatches: patches.filter((p) => p.path[0] === "artifact"),
      stateDelta: patches.filter((p) => p.path[0] !== "artifact"),
      presentation: {
        target: kind.startsWith("chat.") ? "chat-content" : "work-content",
        text,
      },
      importance: key ? "key" : "normal",
    };
    actions.push(action);
    const impact = round(
      patches.reduce(
        (n, p) =>
          n +
          (typeof p.before === "number" && typeof p.after === "number"
            ? Math.abs(p.after - p.before)
            : 1),
        0,
      ),
    );
    logs.push({
      logId: `l${counters.logs}`,
      sequence: counters.logs++,
      round: state.round,
      eventId: event.eventId,
      parentEventId: event.parentEventId ?? null,
      source: event.source ?? "self",
      action: kind,
      triggeredRule: rule,
      stateDelta: patches,
      consequence: text,
      relatedTaskId: action.relatedTaskId,
      actionIds: [action.actionId],
      importance: action.importance,
      impact,
    });
  }
  function relationship(source, amount) {
    if (Object.hasOwn(state.relationships, source))
      state.relationships[source] = round(
        clamp(state.relationships[source] + amount),
      );
  }
  for (let r = first; r <= last; r++) {
    const ev = { eventId: `r${r}:start`, source: "system" };
    emit(
      "round.start",
      ev,
      `第 ${r} 轮 · ${r > 10 ? (choice ? "加班推进" : "按正常节奏收尾") : "常规工作"}`,
      () => {
        state.round = r;
        state.phase = "running";
      },
    );
    const incomingRng = createRng(deriveSeed(input.seed, `events:${r}`));
    const pool = eventPools[input.professionId];
    const schedule = [0, 1, 2, 7, 4, 5, 8, 3, 10, 9, 11, 3];
    const eventIndexes = [schedule[r - 1]];
    if (
      input.environment.clientChangeFrequency === "frequent" &&
      [3, 6, 9].includes(r)
    )
      eventIndexes.push(6);
    for (const index of eventIndexes) {
      const def = pool[index];
      const target =
        state.tasks.find((t) => !t.completed) ?? state.tasks.at(-1);
      const message = {
        id: `m${r}-${index}`,
        eventId: nextEventId(),
        source: def.source,
        sender: def.source,
        recipient: "employee",
        conversationId: def.source,
        intent: def.intent,
        urgency: def.urgency,
        round: r,
        deadlineRound: Math.min(
          12,
          r + (input.environment.urgency === "urgent" ? 1 : 2),
        ),
        relatedTaskId: target.id,
        artifactId: "main",
        text: def.text.replaceAll("{task}", target.title),
        status: "unread",
        changeSize: 8 + Math.floor(incomingRng.next() * 13),
      };
      emit(
        "chat.receive",
        message,
        `${message.text}`,
        () => {
          state.messages.push(message);
        },
        "event:arrival",
        def.intent === "change" || def.intent === "risk",
      );
    }
    const budget = capacity(state, strategy, r > 10 && choice);
    let communication = round(budget * (1 - strategy.mainTaskShare / 100));
    const queue = state.messages
      .filter((m) => m.sender !== "self" && m.status === "unread")
      .map((m) => ({ m, decision: responseDecision(m, state, strategy) }));
    queue.sort((a, b) => {
      const rank = (x) => {
        const i = strategy.priorityRules.indexOf(x.decision.rule);
        return i < 0 ? 99 : i;
      };
      return rank(a) - rank(b) || a.m.round - b.m.round;
    });
    let interruptions = 0;
    for (const { m, decision } of queue) {
      if (!decision.ready || communication < 4) {
        if (!m.deferredRound || m.deferredRound !== r)
          emit(
            "chat.defer",
            m,
            `「${m.text.slice(0, 18)}…」暂缓：${communication < 4 ? "沟通预算不足" : "按策略留到后续窗口"}。`,
            () => {
              m.deferredRound = r;
            },
            decision.rule,
          );
        continue;
      }
      communication -= 4;
      const accept =
        m.intent === "change" &&
        strategy.changeAcceptance >= 15 + incomingRng.next() * 80;
      const reply =
        m.intent === "change"
          ? accept
            ? "收到，我会把这项变更纳入，更新对应交付物并补充检查。"
            : "已收到，这次先保证已确认的范围，新增部分记录到后续评估。"
          : m.intent === "help"
            ? "我把当前交接信息整理给你，相关边界会一起说明。"
            : m.intent === "deadline"
              ? `当前整体进度 ${Math.round(progress(state))}%，我会按已确认范围推进并同步阻塞。`
              : "收到，我会结合当前任务核对，也会保留处理记录。";
      emit(
        "chat.reply",
        m,
        `回复${m.source === "boss" ? "老板" : m.source === "client" ? "客户" : "同事"}：${reply}`,
        () => {
          m.status = "replied";
          state.messages.push({
            id: `${m.id}-reply`,
            eventId: m.eventId,
            source: "self",
            sender: "self",
            recipient: m.source,
            conversationId: m.source,
            intent: "reply",
            round: r,
            text: reply,
            status: "sent",
            relatedTaskId: m.relatedTaskId,
          });
          state.metrics.replies++;
          state.metrics.effort = round(state.metrics.effort + 4);
          relationship(m.source, m.round === r ? 2 : 0.5);
          if (decision.mode === "instant") {
            interruptions++;
            state.interruptionCost = round(
              state.interruptionCost + (strategy.focusMode === "deep" ? 2 : 1),
            );
            if (m.source === "boss")
              state.npcExpectations = clamp(state.npcExpectations + 4);
          }
        },
        decision.rule,
        m.intent === "change",
      );
      if (m.intent === "change" && accept) {
        const task = state.tasks.find((t) => t.id === m.relatedTaskId);
        const changeEvent = {
          ...m,
          eventId: nextEventId(),
          parentEventId: m.eventId,
        };
        emit(
          "work.change",
          changeEvent,
          `接受变更：「${task.title}」增加工作量并更新交付物；已完成的确认需要重新检查。`,
          () => {
            const extra =
              m.changeSize + adapter.change(state, strategy, task, m);
            task.requiredWork += extra;
            task.completed = false;
            task.accepted = false;
            task.revisionCount++;
            state.rework += extra;
            state.metrics.acceptedChanges++;
            state.professionState.scopeChanges++;
            const invalidated = new Set([task.id]);
            for (let depth = 0; depth < state.tasks.length; depth++)
              for (const dependent of state.tasks)
                if (
                  !invalidated.has(dependent.id) &&
                  dependent.dependsOn.some((id) => invalidated.has(id))
                ) {
                  if (dependent.completed) dependent.requiredWork += 3;
                  dependent.completed = false;
                  dependent.accepted = false;
                  invalidated.add(dependent.id);
                }
            relationship("client", 3);
          },
          `quality:accept-${strategy.changeAcceptance}`,
          true,
        );
      } else if (m.intent === "change")
        emit(
          "work.decline",
          m,
          "保留原任务范围，避免立即返工；客户需要等待后续排期。",
          () => relationship("client", -2),
          "quality:scope-protection",
          true,
        );
      if (m.intent === "support")
        emit(
          "work.support",
          m,
          "参考资料已补齐，减少后续误判。",
          () => {
            state.professionState.risk = round(
              clamp(state.professionState.risk - 2),
            );
          },
          "work:reference",
        );
      if (m.intent === "feedback" && adapter.feedback) {
        const task = state.tasks.find((t) => t.id === m.relatedTaskId);
        emit(
          "work.feedback",
          { ...m, eventId: nextEventId(), parentEventId: m.eventId },
          `将反馈落实到「${task.title}」：${m.text}`,
          () => {
            adapter.feedback(state, strategy, task, m);
            task.requiredWork += 3;
            task.completed = false;
            task.accepted = false;
            state.rework += 3;
          },
          "work:feedback",
          true,
        );
      }
    }
    const qualityFactor = { fast: 1.22, balanced: 1, meticulous: 0.83 }[
      strategy.qualityPreference
    ];
    const specialtyFactor = adapter.efficiency?.(state, strategy) ?? 1;
    const specialtyCheck =
      strategy.special.formulaCheck === "everyStep" ||
      (strategy.special.formulaCheck === "milestones" && r % 3 === 0) ||
      strategy.special.reviewStrictness === "strict";
    const checking =
      (strategy.selfCheck !== "never" &&
        (strategy.selfCheck === "everyStep" || r % 3 === 0)) ||
      specialtyCheck;
    const checkRate = checking
      ? specialtyCheck || strategy.selfCheck === "everyStep"
        ? 0.15
        : 0.07
      : 0;
    const workBudget = Math.max(
      0,
      (budget * strategy.mainTaskShare) / 100 -
        interruptions * (strategy.focusMode === "deep" ? 2 : 1),
    );
    const runnable = state.tasks
      .filter(
        (t) =>
          !t.completed &&
          !t.blocked &&
          t.dependsOn.every(
            (id) => state.tasks.find((x) => x.id === id).completed,
          ),
      )
      .slice(0, strategy.parallelism);
    const share = runnable.length
      ? (workBudget * (1 - checkRate) * qualityFactor * specialtyFactor) /
        runnable.length
      : 0;
    for (const task of runnable) {
      if (share < 0.01) continue;
      const taskEvent = {
        eventId: nextEventId(),
        source: "self",
        relatedTaskId: task.id,
      };
      const actualWork = Math.min(task.requiredWork - task.doneWork, share);
      const stageIndex =
        input.professionId === "programmer"
          ? Math.min(3, Math.floor((task.doneWork / task.requiredWork) * 4))
          : state.tasks.indexOf(task);
      const workingStage = professions[input.professionId].stages[stageIndex];
      emit(
        "work.advance",
        taskEvent,
        `推进「${task.title}」：投入 ${round(actualWork)} 工作量，执行${workingStage}。`,
        () => {
          task.doneWork = round(
            Math.min(task.requiredWork, task.doneWork + actualWork),
          );
          task.completed = task.doneWork >= task.requiredWork - 0.01;
          task.stage = workingStage;
          task.accepted = task.completed;
          if (task.completed) task.stage = "已交付";
          adapter.work(state, task, strategy);
          state.metrics.effort = round(
            state.metrics.effort +
              actualWork / (qualityFactor * specialtyFactor),
          );
        },
        `work:${strategy.focusMode}`,
        actualWork >= task.requiredWork - task.doneWork,
      );
      const probability = errorProbability(state, strategy);
      const sample = rng.next();
      if (sample < probability) {
        const cost = 7 + Math.round(state.professionState.risk / 8);
        emit(
          "work.error",
          {
            ...taskEvent,
            eventId: nextEventId(),
            parentEventId: taskEvent.eventId,
          },
          `「${task.title}」暴露边界问题，需返工 ${cost}；风险来自疲劳、检查深度和${professions[input.professionId].riskName}。`,
          () => {
            task.requiredWork += cost;
            task.completed = false;
            task.accepted = false;
            task.stage = "返工检查";
            state.rework += cost;
            state.quality = clamp(state.quality - 4);
            state.errors.push({
              eventId: taskEvent.eventId,
              taskId: task.id,
              resolved: false,
              cost,
            });
            adapter.fail(state, task, strategy);
          },
          `risk:p=${Math.round(probability * 100)}%`,
          true,
        );
      }
    }
    if (workBudget > 2 && checking) {
      emit(
        "work.check",
        { eventId: nextEventId(), source: "self" },
        "主动检查当前交付物：定位已知问题、补齐记录，并降低后续风险。",
        () => {
          adapter.check(state, strategy);
          state.errors.forEach((e) => {
            e.resolved = true;
          });
          state.quality = clamp(state.quality + 1.5);
          state.professionState.risk = round(
            clamp(state.professionState.risk - 2.5),
          );
          state.metrics.effort = round(
            state.metrics.effort + workBudget * checkRate,
          );
        },
        `quality:${strategy.selfCheck}`,
        state.errors.some((e) => !e.resolved),
      );
    }
    for (const m of state.messages.filter(
      (m) =>
        m.sender !== "self" && m.status === "unread" && m.deadlineRound <= r,
    )) {
      emit(
        "chat.expire",
        m,
        "消息到期仍未处理：对方需要重新安排工作，关系和后续响应期待受到影响。",
        () => {
          m.status = "expired";
          relationship(
            m.source,
            -(m.urgency === "urgent" ? 4 : 2) -
              (m.source === "boss" ? state.npcExpectations / 25 : 0),
          );
        },
        "deadline:unanswered",
        true,
      );
    }
    emit(
      "round.end",
      { eventId: nextEventId(), source: "system" },
      `第 ${r} 轮结束：进度 ${Math.round(progress(state))}%，体力与风险已同步。`,
      () => {
        const consumption = Math.max(
          0,
          strategy.intensity * 0.065 +
            interruptions * 0.55 +
            (r > 10 && choice ? 3.2 : 0) +
            Math.max(0, strategy.parallelism - 1) * 0.4,
        );
        const recovery = strategy.intensity < 55 ? 2.8 : 0.8;
        state.accumulatedEnergyCost = round(
          state.accumulatedEnergyCost + consumption,
        );
        state.energy = round(clamp(state.energy - consumption + recovery));
        state.overwork = round(
          clamp(
            state.overwork +
              Math.max(0, 35 - state.energy) / 5 +
              (r > 10 && choice ? 3 : 0),
          ),
        );
        state.unreadPressure = state.messages.filter(
          (m) => m.status === "unread",
        ).length;
        state.errorRateBp = Math.round(
          errorProbability(state, strategy) * 10000,
        );
        const manager = input.environment.bossStyle;
        if (manager === "process" && checking) relationship("boss", 0.4);
        if (
          manager === "responsive" &&
          state.messages.some(
            (m) => m.source === "boss" && m.status === "unread",
          )
        )
          relationship("boss", -0.8 - state.npcExpectations / 50);
        if (
          input.environment.collaborationClimate === "supportive" &&
          state.metrics.replies > 0
        )
          relationship("colleague", 0.2);
        if (
          r >= 8 &&
          progress(state) < (input.environment.urgency === "urgent" ? 65 : 45)
        )
          relationship("boss", -2);
        if (r === 10) state.phase = "awaiting_overtime_choice";
        if (r === 12) {
          state.phase = "completed";
          relationship("boss", (progress(state) - 75) / 5);
          relationship(
            "client",
            state.tasks.filter((t) => t.accepted).length - 2,
          );
        }
      },
    );
    snapshots.push({
      schemaVersion: 1,
      round: r,
      state: structuredClone(state),
      actionEndSequence: counters.actions,
      logEndSequence: counters.logs,
    });
  }
  return {
    snapshots,
    actions,
    logs,
    finalState: structuredClone(state),
    rngState: rng.state,
    counters: { ...counters },
  };
}
export function simulateRegular(rawInput) {
  const input = validateRunInput(rawInput);
  if (!adapters[input.professionId]) throw new Error("该职业尚未接入");
  const start = initialState(input);
  const segment = computeSegment(input, start, 1, 10, false);
  return {
    input,
    initialState: start,
    snapshots: segment.snapshots,
    actions: segment.actions,
    logs: segment.logs,
    checkpoint: {
      schemaVersion: 1,
      engineVersion: VERSION,
      phase: "awaiting_overtime_choice",
      completedRound: 10,
      input,
      state: segment.finalState,
      rngState: segment.rngState,
      counters: segment.counters,
    },
  };
}
export function continueAfterOvertime(checkpoint, choice) {
  if (typeof choice !== "boolean") throw new Error("请先选择是否加班");
  if (
    checkpoint?.phase !== "awaiting_overtime_choice" ||
    checkpoint.completedRound !== 10 ||
    checkpoint.state?.round !== 10 ||
    checkpoint.state.phase !== "awaiting_overtime_choice" ||
    !Number.isInteger(checkpoint.rngState) ||
    !["actions", "events", "logs"].every((key) =>
      Number.isInteger(checkpoint.counters?.[key]),
    ) ||
    checkpoint.engineVersion !== VERSION
  )
    throw new Error("加班检查点无效或版本不兼容");
  const segment = computeSegment(
    validateRunInput(checkpoint.input),
    checkpoint.state,
    11,
    12,
    choice,
    { ...checkpoint.counters },
    checkpoint.rngState,
  );
  return { ...segment, input: checkpoint.input, overtimeChoice: choice };
}
export function mergeSegments(regular, continuation) {
  if (
    JSON.stringify(regular.input) !== JSON.stringify(continuation.input) ||
    continuation.actions[0].sequence !== regular.actions.length
  )
    throw new Error("续算片段不匹配");
  const run = {
    input: regular.input,
    overtimeChoice: continuation.overtimeChoice,
    initialState: regular.initialState,
    snapshots: [...regular.snapshots, ...continuation.snapshots],
    actions: [...regular.actions, ...continuation.actions],
    logs: [...regular.logs, ...continuation.logs],
    finalState: continuation.finalState,
  };
  run.performance = scoreRun(run);
  return run;
}
