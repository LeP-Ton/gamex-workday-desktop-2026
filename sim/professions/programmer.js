import { clamp, round } from "../prng.js";
export const programmer = {
  initialArtifact() {
    return {
      id: "main",
      kind: "code",
      version: 0,
      activeFile: "refund.ts",
      files: {
        "refund.ts":
          '// 订单退款服务 · 工作区已就绪\nimport { validateRefund } from "./validator";\n\nexport async function refundOrder(order) {\n  // 待实现：金额校验、幂等处理与退款提交\n  return { status: "pending", orderId: order.id };\n}\n',
        "validator.ts": "// 退款校验规则\nexport const MAX_REFUND_RATIO = 1;\n",
        "refund.test.ts":
          "// 交付门禁\n// 待覆盖：正常退款 / 重复请求 / 异常金额\n",
        "README.md": "# 订单退款模块\n\n目标：安全、可追溯地处理退款。\n",
      },
      terminal: ["工作区已连接。等待开始今日任务…"],
      diagnostics: [],
      commits: [],
    };
  },
  work(state, task, strategy) {
    const a = state.artifact;
    const code = {
      "task-1":
        'export interface RefundRequest {\n  orderId: string;\n  amount: number;\n  requestId: string;\n}\n\nexport function validateRefund(input: RefundRequest) {\n  if (input.amount <= 0) throw new Error("退款金额必须大于 0");\n  return Boolean(input.orderId && input.requestId);\n}',
      "task-2":
        'export async function refundOrder(input: RefundRequest) {\n  validateRefund(input);\n  const order = await orders.find(input.orderId);\n  if (!order) throw new Error("订单不存在");\n  const result = await payments.refund(order, input.amount);\n  return { status: "success", refundId: result.id };\n}',
      "task-3":
        "export async function ensureIdempotency(requestId: string) {\n  const cached = await refunds.findByRequest(requestId);\n  if (cached) return { duplicate: true, result: cached };\n  await locks.acquire(`refund:${requestId}`);\n  return { duplicate: false };\n}",
      "task-4":
        'describe("订单退款 / 交付门禁", () => {\n  it("正确处理合法退款", async () => {\n    expect(await runRefund()).toHaveProperty("refundId");\n  });\n  it("重复请求只退款一次", async () => {\n    expect(await repeatRefund()).toEqual({ count: 1 });\n  });\n});',
    };
    if (state.metrics.acceptedChanges > 0)
      code["task-2"] =
        `export async function refundOrder(input: RefundRequest) {\n  validateRefund(input);\n  const previous = await ensureIdempotency(input.requestId);\n  if (previous.duplicate) return previous.result;\n  const order = await orders.find(input.orderId);\n  if (input.amount > order.remainingAmount) {\n    throw new Error("退款不可超过剩余实付金额");\n  }\n  return payments.refund(order, input.amount);\n}\n// 变更版本 ${state.metrics.acceptedChanges}：同步部分退款与重复请求边界`;
    a.activeFile =
      task.id === "task-1"
        ? "validator.ts"
        : task.id === "task-4"
          ? "refund.test.ts"
          : "refund.ts";
    const blocks = Object.entries(state.codeBlocks ?? {});
    const map = Object.fromEntries(blocks);
    map[task.id] = code[task.id];
    state.codeBlocks = map;
    a.files[a.activeFile] =
      `${a.activeFile === "refund.ts" ? 'import { validateRefund } from "./validator";\n\n' : "// GameX 工作区 · 自动生成的仿真代码\n"}${Object.entries(
        map,
      )
        .filter(([id]) =>
          a.activeFile === "refund.test.ts"
            ? id === "task-4"
            : a.activeFile === "validator.ts"
              ? id === "task-1"
              : id === "task-2" || id === "task-3",
        )
        .map(([, value]) => value)
        .join(
          "\n\n",
        )}\n\n// ${task.title} · ${task.stage} · 第 ${state.round} 轮\n// 完成度 ${Math.min(100, Math.round((task.doneWork / task.requiredWork) * 100))}%`;
    const debt = strategy.special.debtTolerance / 100;
    state.professionState.risk = round(
      clamp(
        state.professionState.risk +
          debt * 2 +
          (strategy.qualityPreference === "fast" ? 1.5 : -0.6),
      ),
    );
    if (task.completed) {
      a.commits.push({
        taskId: task.id,
        round: state.round,
        text: `feat: ${task.title}`,
      });
      a.terminal.push(`✓ ${task.title} · 已通过交付门禁并提交`);
    }
    a.version += 1;
  },
  efficiency(state, strategy) {
    return strategy.special.reviewStrictness === "lenient"
      ? 1.05
      : strategy.special.reviewStrictness === "strict"
        ? 0.96
        : 1;
  },
  change(state, strategy) {
    const refactor = strategy.special.refactorOnChange;
    state.professionState.risk = round(
      clamp(state.professionState.risk + (refactor ? -5 : 7)),
    );
    state.artifact.terminal.push(
      refactor
        ? "变更评估：同步重构校验逻辑，降低后续技术债。"
        : "变更评估：采用局部修补，保留技术债。",
    );
    state.artifact.activeFile = "refund.ts";
    state.artifact.files["refund.ts"] +=
      `\n// 需求变更已纳入版本 ${state.metrics.acceptedChanges + 1}\nexport const allowPartialRefundV${state.metrics.acceptedChanges + 1} = true;\n`;
    return refactor ? 6 : 0;
  },
  check(state) {
    for (const file of Object.keys(state.artifact.files))
      state.artifact.files[file] = state.artifact.files[file].replaceAll(
        "// FIXME: 补齐退款边界保护",
        'export function guardRefundAmount(amount: number) {\n  if (!Number.isFinite(amount) || amount <= 0) throw new Error("非法退款金额");\n  return amount;\n}',
      );
    state.artifact.terminal.push(
      `$ test refund --round ${state.round}`,
      state.errors.some((e) => !e.resolved)
        ? "修复后回归：退款与幂等测试通过 ✓"
        : "✓ 类型校验与退款路径检查通过",
    );
    state.artifact.diagnostics = [];
  },
  feedback(state, strategy, task) {
    state.artifact.activeFile = "validator.ts";
    state.artifact.files["validator.ts"] +=
      `\n// 第 ${state.round} 轮评审反馈：抽出边界校验，便于测试\nexport function isRefundableV${state.round}(amount: number, remaining: number) {\n  return amount > 0 && amount <= remaining;\n}\n`;
    state.artifact.terminal.push(
      `评审意见已落实到 validator.ts，关联 ${task.title}`,
    );
    state.professionState.risk = clamp(state.professionState.risk - 1);
  },
  fail(state, task) {
    state.artifact.diagnostics.push({
      file: state.artifact.activeFile,
      taskId: task.id,
      text: "边界校验遗漏，已加入返工队列",
    });
    state.artifact.files[state.artifact.activeFile] +=
      "\n// FIXME: 补齐退款边界保护\n";
    state.artifact.terminal.push("✕ 退款边界测试失败：需要补充保护分支");
  },
};
