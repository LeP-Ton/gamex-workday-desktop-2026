import { clamp, round } from "../prng.js";
function recalculate(a) {
  const rows = a.sheets[0].rows;
  const sum = rows.slice(1).reduce((total, row) => total + (+row[2] || 0), 0);
  const tax = rows
    .slice(1)
    .reduce((total, row) => total + round((+row[2] || 0) * 0.06), 0);
  a.sheets[1].rows = [
    ["季度", "收入合计", "销项税额", "税后金额", "核对状态"],
    [
      "第一季度",
      sum,
      round(tax),
      round(sum - tax),
      a.anomalies.length ? "存在来源异常" : "口径一致",
    ],
    [
      "第二季度",
      round(sum * 1.1),
      round(tax * 1.1),
      round((sum - tax) * 1.1),
      "关联计算",
    ],
    [
      "上半年",
      round(sum * 2.1),
      round(tax * 2.1),
      round((sum - tax) * 2.1),
      a.anomalies.length ? "需重算" : "已重算",
    ],
  ];
  a.formula = "=SUM('凭证明细'!C2:C7)";
}
export const finance = {
  initialArtifact() {
    return {
      id: "main",
      kind: "sheet",
      version: 0,
      activeSheet: 0,
      selectedCell: "C2",
      formula: "=SUM(C2:C7)",
      sheets: [
        {
          name: "凭证明细",
          rows: [
            ["凭证编号", "业务项目", "金额", "税率", "核查状态"],
            ...[
              "订单收入",
              "退款冲回",
              "服务收入",
              "渠道结算",
              "跨部门费用",
              "发票调整",
            ].map((name, i) => [`Q1-${101 + i}`, name, "", "6%", "待录入"]),
          ],
        },
        {
          name: "季度汇总",
          rows: [
            ["季度", "收入合计", "销项税额", "税后金额", "核对状态"],
            ["第一季度", 0, 0, 0, "待核对"],
          ],
        },
        {
          name: "审批记录",
          rows: [["轮次", "报表版本", "审批状态", "处理说明"]],
        },
      ],
      anomalies: [],
      sourceValues: {},
      traces: [],
      approval: "pending",
    };
  },
  efficiency(state, s) {
    return (
      (s.special.formulaCheck === "everyStep" ? 0.94 : 1) *
      (1 - (s.special.anomalyReporting / 100) * 0.04)
    );
  },
  work(state, task, s) {
    const a = state.artifact,
      pct = task.doneWork / task.requiredWork;
    if (task.id === "task-1") {
      a.activeSheet = 0;
      for (let i = 1; i <= Math.ceil(pct * 6); i++) {
        a.sheets[0].rows[i][2] = [28450, -3200, 18600, 42500, -6700, 9400][
          i - 1
        ];
        a.sheets[0].rows[i][4] = "已录入";
      }
      a.selectedCell = `C${Math.min(7, Math.ceil(pct * 6) + 1)}`;
    } else if (task.id === "task-2") {
      a.activeSheet = 0;
      a.sheets[0].rows.slice(1).forEach((row) => {
        if (row[2] !== "") row[4] = a.anomalies.length ? "需复核" : "已核对";
      });
      a.selectedCell = "E4";
    } else if (task.id === "task-3") {
      a.activeSheet = 1;
      a.selectedCell = "B2";
    } else {
      a.activeSheet = 2;
      if (task.completed) {
        const approved = !s.special.bypassApproval && !a.anomalies.length;
        a.approval = approved
          ? "approved"
          : s.special.bypassApproval
            ? "bypassed"
            : "pending";
        task.accepted = approved;
        task.completed = approved;
        task.blocked = !approved;
        task.stage = approved ? "审批通过" : "未审批交付";
        a.sheets[2].rows.push([
          state.round,
          `v${a.version + 1}`,
          approved ? "通过" : "缺失",
          approved ? "凭证、口径与流程一致" : "绕过审批或存在来源异常",
        ]);
        if (!approved)
          state.professionState.risk = clamp(state.professionState.risk + 22);
      }
    }
    recalculate(a);
    a.version++;
    state.professionState.risk = round(
      clamp(
        state.professionState.risk +
          (s.redlineTolerance === "risky" ? 1.8 : -0.4),
      ),
    );
  },
  change(state) {
    const a = state.artifact;
    a.sheets[0].rows[6][2] = (+a.sheets[0].rows[6][2] || 9400) + 1200;
    a.sheets[0].rows[6][4] = "变更待核";
    a.traces.push("补充凭证：费用重分类，季度汇总随源表重算");
    a.approval = "pending";
    recalculate(a);
    state.professionState.risk = clamp(state.professionState.risk + 4);
    return 2;
  },
  feedback(state, s, task, message) {
    const a = state.artifact;
    a.traces.push(message.text);
    a.sheets[0].rows[3][4] = "审阅意见已留痕";
    a.activeSheet = 0;
    a.selectedCell = "E4";
    a.approval = "pending";
    a.version++;
  },
  fail(state) {
    const a = state.artifact;
    const row = a.sheets[0].rows[3];
    if (!Object.hasOwn(a.sourceValues, "C4"))
      a.sourceValues.C4 = +row[2] || 18600;
    row[2] = a.sourceValues.C4 + 900;
    row[4] = "金额异常";
    a.anomalies.push({
      cell: "C4",
      affected: ["季度汇总!B2", "季度汇总!D2", "季度汇总!B4"],
    });
    a.activeSheet = 1;
    a.selectedCell = "B2";
    recalculate(a);
    state.professionState.risk = clamp(state.professionState.risk + 7);
  },
  check(state, s) {
    const a = state.artifact;
    if (a.anomalies.length) {
      a.sheets[0].rows[3][2] = a.sourceValues.C4;
      a.sheets[0].rows[3][4] = "已更正";
      a.anomalies = [];
      a.traces.push("追溯 C4 原始凭证，更正后重算全部关联表");
      recalculate(a);
    }
    if (s.special.anomalyReporting >= 50) {
      state.professionState.risk = clamp(state.professionState.risk - 2);
      a.traces.push("异常核对记录已上报并留痕");
    }
    state.tasks
      .filter((t) => t.blocked && !s.special.bypassApproval)
      .forEach((t) => {
        t.blocked = false;
      });
  },
};
