// 候选内容具有职业含义；是否发生及其后果由环境、轮次和工作状态决定。
const common = [
  [
    "kickoff",
    "boss",
    "brief",
    "今天先推进「{task}」，关键边界记得留痕。有阻塞及时说。",
  ],
  [
    "change",
    "client",
    "change",
    "「{task}」有个边界需要调整，能否把这项变化一起纳入？",
  ],
  [
    "help",
    "colleague",
    "help",
    "我在跟进「{task}」的关联工作，能帮我确认一下交接信息吗？",
  ],
  [
    "deadline",
    "boss",
    "deadline",
    "想了解「{task}」的进展，今天能否给出可交付的版本？",
  ],
  [
    "feedback",
    "client",
    "feedback",
    "看了「{task}」的当前版本，这处细节还需要再打磨。",
  ],
  [
    "support",
    "colleague",
    "support",
    "我补齐了「{task}」的参考资料，需要的话可以一起核对。",
  ],
];
const special = {
  programmer: [
    [
      "idempotency",
      "client",
      "change",
      "退款要增加重复请求校验，不能出现两次扣减。",
    ],
    [
      "legacy",
      "colleague",
      "risk",
      "旧服务还有空值分支，直接复用可能引入隐藏故障。",
    ],
    [
      "review",
      "colleague",
      "feedback",
      "评审建议把校验逻辑抽出来，测试更容易覆盖。",
    ],
    [
      "ci",
      "boss",
      "deadline",
      "提交前确认退款回归测试，别让修复影响已有订单。",
    ],
    [
      "scope",
      "client",
      "change",
      "能一起支持部分退款吗？需要的话我补业务规则。",
    ],
    ["thanks", "colleague", "support", "接口说明很清楚，我这边联调顺畅多了。"],
  ],
  finance: [
    [
      "invoice",
      "client",
      "change",
      "补来一张红字发票，需要同步调整季度凭证明细。",
    ],
    ["tax", "colleague", "risk", "关联表有一处税率口径不同，汇总前请复核。"],
    ["audit", "boss", "feedback", "请保留异常处理记录，审计需要追溯凭证。"],
    [
      "approval",
      "boss",
      "deadline",
      "最终报表要完成审批再发出，金额不能只看汇总。",
    ],
    ["expense", "client", "change", "跨部门费用需要重分类，影响两张汇总表。"],
    ["proof", "colleague", "support", "缺失的凭证已补齐，可以继续核对。"],
  ],
  product: [
    ["scope", "client", "change", "希望加入多渠道退款，是否能纳入这一版 PRD？"],
    [
      "conflict",
      "boss",
      "risk",
      "客户想做全量，但交付团队担心范围；请明确本期边界。",
    ],
    [
      "review",
      "colleague",
      "feedback",
      "异常流程描述不够详细，评审还不能确认。",
    ],
    ["baseline", "boss", "deadline", "请锁定这版需求基线，变更需要重新确认。"],
    [
      "permission",
      "client",
      "change",
      "补充一个角色权限，需要同步流程和验收条件。",
    ],
    [
      "agreement",
      "colleague",
      "support",
      "我们认同当前流程，边界清楚后实现更顺畅。",
    ],
  ],
  designer: [
    ["style", "client", "change", "希望主视觉更醒目，同时保留品牌原有的感觉。"],
    ["brief", "colleague", "risk", "各渠道安全区不同，延展不能直接裁切。"],
    [
      "revision",
      "client",
      "feedback",
      "标题与背景有些抢，希望再调整一下视觉层级。",
    ],
    ["delivery", "boss", "deadline", "提案时把主图与延展一起展示，方便确认。"],
    ["color", "client", "change", "可以再看看另一个配色方案吗？"],
    [
      "assets",
      "colleague",
      "support",
      "我整理了品牌色和渠道规格，给你做参考。",
    ],
  ],
};
export const eventPools = Object.fromEntries(
  Object.entries(special).map(([id, rows]) => [
    id,
    [...common, ...rows].map(([key, source, intent, text]) => ({
      id: `${id}-${key}`,
      source,
      intent,
      text,
      urgency: intent === "deadline" || intent === "risk" ? "urgent" : "normal",
    })),
  ]),
);
