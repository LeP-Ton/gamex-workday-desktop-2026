const range = (id, label, min, max, value, hint) => ({
  id,
  label,
  type: "range",
  min,
  max,
  default: value,
  hint,
});
const select = (id, label, options, value, hint) => ({
  id,
  label,
  type: "select",
  options,
  default: value,
  hint,
});
const toggle = (id, label, value, hint) => ({
  id,
  label,
  type: "toggle",
  default: value,
  hint,
});
export const parameterGroups = [
  {
    title: "工作强度",
    letter: "A",
    description: "做多少，以及怎么做",
    parameters: [
      range(
        "intensity",
        "常规工作强度",
        0,
        100,
        68,
        "提高产能，也会消耗更多体力。强度过高时，错误和过劳会反过来拖慢工作。",
      ),
      select(
        "focusMode",
        "专注模式",
        [
          ["deep", "深度工作"],
          ["parallel", "多线并行"],
        ],
        "deep",
        "深度工作减少中断；多线并行更灵活，但切换有代价。",
      ),
      range(
        "parallelism",
        "任务并行度",
        1,
        3,
        1,
        "同时推进更多工作，单个任务会分走注意力。依赖尚未完成的任务不能提前执行。",
      ),
    ],
  },
  {
    title: "时间与沟通",
    letter: "B",
    description: "留一点时间给人与人",
    parameters: [
      range(
        "mainTaskShare",
        "主任务投入",
        30,
        90,
        76,
        "投入越多，任务越快；沟通预算减少，微信可能积压。",
      ),
      select(
        "wechatMode",
        "微信响应",
        [
          ["instant", "秒回"],
          ["delayed", "延迟回复"],
          ["batch", "批量处理"],
        ],
        "delayed",
        "秒回及时但容易被打断；延迟到下一轮，批量在每轮沟通窗口处理。",
      ),
    ],
  },
  {
    title: "质量与风险",
    letter: "C",
    description: "为速度付出什么代价",
    parameters: [
      range(
        "changeAcceptance",
        "需求变更接受度",
        0,
        100,
        45,
        "接受变更提升合作体验，也增加范围和返工。",
      ),
      select(
        "qualityPreference",
        "质量偏好",
        [
          ["fast", "快速交付"],
          ["balanced", "平衡"],
          ["meticulous", "精雕细琢"],
        ],
        "balanced",
        "精细处理减少错误，但需要更多工作预算。",
      ),
      select(
        "selfCheck",
        "自测 / 复核",
        [
          ["never", "从不"],
          ["milestones", "关键节点"],
          ["everyStep", "每一步"],
        ],
        "milestones",
        "提前检查占用预算，但能在错误扩散前发现问题。",
      ),
      select(
        "redlineTolerance",
        "合规红线",
        [
          ["zero", "零容忍"],
          ["flexible", "灵活处理"],
          ["risky", "铤而走险"],
        ],
        "zero",
        "灵活处理可能更快，但缺失流程会放大职业风险。",
      ),
    ],
  },
];
export const specialParameters = {
  programmer: [
    range(
      "debtTolerance",
      "技术债容忍度",
      0,
      100,
      35,
      "容忍债务可快速实现，后续故障和修复会更昂贵。",
    ),
    toggle(
      "refactorOnChange",
      "变更时重构",
      true,
      "现在投入额外工作，减少后续技术债。",
    ),
    select(
      "reviewStrictness",
      "代码评审",
      [
        ["lenient", "宽松"],
        ["standard", "标准"],
        ["strict", "严格"],
      ],
      "standard",
      "严格评审增加检查成本，也更容易发现缺陷。",
    ),
  ],
  finance: [
    select(
      "formulaCheck",
      "公式核查",
      [
        ["never", "从不"],
        ["milestones", "关键节点"],
        ["everyStep", "每一步"],
      ],
      "milestones",
      "核查能阻止错误沿关联表传播，但会占用时间。",
    ),
    range(
      "anomalyReporting",
      "异常上报意愿",
      0,
      100,
      75,
      "及时上报能降低合规风险，但需要解释和沟通。",
    ),
    toggle(
      "bypassApproval",
      "绕过审批链",
      false,
      "加快交付，但不能算作已审批交付；零容忍时不可启用。",
    ),
  ],
  product: [
    range(
      "documentDetail",
      "文档详细度",
      0,
      100,
      70,
      "细致描述降低歧义，但撰写变慢。",
    ),
    select(
      "stakeholderPriority",
      "干系人优先级",
      [
        ["boss", "老板"],
        ["client", "客户"],
        ["team", "交付团队"],
      ],
      "team",
      "优先对象满意度更高，其他意见需要更多协调。",
    ),
    range(
      "meetingParticipation",
      "会议参与度",
      0,
      100,
      55,
      "更多会议减少意见冲突，也挤占文档时间。",
    ),
  ],
  designer: [
    range(
      "revisionLimit",
      "改稿轮次上限",
      1,
      5,
      3,
      "更多修改提高获批机会，也累积创意疲劳；到上限不自动获批。",
    ),
    toggle(
      "multiProposal",
      "多方案对冲",
      true,
      "前期多投入一些，降低风格误判风险。",
    ),
    select(
      "intentStrategy",
      "客户意图策略",
      [
        ["clarify", "先沟通澄清"],
        ["reference", "参考已知偏好"],
        ["intuition", "相信设计直觉"],
      ],
      "clarify",
      "澄清消耗沟通；猜测更快，但与客户偏好的偏差更大。",
    ),
  ],
};
export const priorityRules = [
  { id: "boss_first", label: "老板消息优先", hint: "老板来信优先即时安排" },
  { id: "client_first", label: "客户消息优先", hint: "客户来信优先即时安排" },
  {
    id: "finish_first",
    label: "快交付时专注",
    hint: "剩余低于 20% 时延后非紧急消息",
  },
  {
    id: "unread_batch",
    label: "未读多时批处理",
    hint: "未读超过 5 条时集中处理",
  },
  {
    id: "help_colleague",
    label: "同事求助都响应",
    hint: "优先回应求助；与推迟互斥",
  },
  {
    id: "defer_colleague",
    label: "同事求助都推迟",
    hint: "留到后续沟通窗口；与响应互斥",
  },
];
export const presets = [
  {
    id: "balanced",
    name: "稳稳下班",
    description: "认真工作，也照顾自己",
    values: {},
  },
  {
    id: "efficiency",
    name: "效率狂魔",
    description: "先交付，再说别的",
    values: {
      intensity: 94,
      mainTaskShare: 89,
      parallelism: 3,
      focusMode: "parallel",
      qualityPreference: "fast",
      selfCheck: "never",
      changeAcceptance: 65,
      redlineTolerance: "risky",
      priorityRules: ["finish_first", "boss_first"],
    },
  },
  {
    id: "quality",
    name: "质量卫士",
    description: "多检查一步，少返工一次",
    values: {
      intensity: 76,
      mainTaskShare: 80,
      qualityPreference: "meticulous",
      selfCheck: "everyStep",
      changeAcceptance: 30,
      priorityRules: ["client_first", "finish_first"],
    },
  },
  {
    id: "social",
    name: "职场达人",
    description: "先把沟通这件事做好",
    values: {
      intensity: 70,
      mainTaskShare: 58,
      wechatMode: "instant",
      changeAcceptance: 80,
      focusMode: "parallel",
      parallelism: 2,
      priorityRules: ["boss_first", "client_first", "help_colleague"],
    },
  },
  {
    id: "chill",
    name: "佛系打工",
    description: "细水长流，量力而行",
    values: {
      intensity: 44,
      mainTaskShare: 68,
      wechatMode: "batch",
      changeAcceptance: 20,
      priorityRules: ["unread_batch"],
    },
  },
];
export function defaultStrategy(professionId = "programmer") {
  const result = Object.fromEntries(
    parameterGroups.flatMap((g) => g.parameters).map((p) => [p.id, p.default]),
  );
  result.priorityRules = ["boss_first", "unread_batch"];
  result.special = Object.fromEntries(
    specialParameters[professionId].map((p) => [p.id, p.default]),
  );
  return result;
}
export function presetStrategy(professionId, presetId) {
  return {
    ...defaultStrategy(professionId),
    ...structuredClone(presets.find((p) => p.id === presetId)?.values ?? {}),
  };
}
