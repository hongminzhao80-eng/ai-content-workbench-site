// ============================================================================
// 客户案例内容库（来源：需求 §8.1；核心包《运营方案_5_客户案例集》试点事实 + 真实产出素材）
// 说明：案例 1 为真实试点场景（妇幼保健院健康教育科）——客户名默认不对外点名，
// 均标注“试点/演示场景”；成果为定性描述（真实工作方式），不出现不可核验百分比。
// outputs 字段用于页面渲染“真实产出示例”（海报/PDF/提示词，均来自核心包真实生成）。
// ============================================================================

export const cases = [
  {
    id: "demo-hospital-health",
    slug: "hospital-health-kepu-workflow",
    industry: "healthcare",
    typeLabel: "医院 / 卫健",
    anonymous: true,
    demo: true,
    pilot: true,
    title: "妇幼保健院健康教育科：健康科普从“等人手”到“有节奏”",
    summary: "试点单位（某妇幼保健院 · 健康教育科）将健康科普推文、活动海报、宣传折页与短视频提示词纳入工作台流程；下方海报/折页等为本产品真实生成的成品示例（客户名脱敏，上线前复核）。",
    problem: [
      "健康科普推文需求分散在各科室，宣传人员有限，月初月末经常集中赶稿。",
      "公众号排版风格在不同编辑手里不一致，返工多。",
      "活动海报、义诊通知、健康折页常需外部设计协助，沟通与等待周期长。"
    ],
    modules: [
      { icon: "pen", label: "AI 文案" },
      { icon: "layout", label: "公众号排版" },
      { icon: "image", label: "海报生图" },
      { icon: "doc", label: "折页/单页" },
      { icon: "archive", label: "素材库" }
    ],
    approach: [
      "第一步：围绕真实科普主题（如出生缺陷防治）进行 7 天试用验证；",
      "第二步：按科室分工配置常用主题库与医院品牌色、科室落款；",
      "第三步：宣传人员按周更新节奏使用，素材自动归档；",
      "第四步：发布流程保持不变——初稿由 AI 辅助生成，科室核对专业口径，机构完成审核后发布。"
    ],
    results: [
      "健康科普主题沉淀为主题库与素材，集中赶稿期的初稿准备明显提速。",
      "公众号排版由 AI 现场设计并一键复制，编辑间交接与返工减少。",
      "海报经构图方案 + AI 生图产出，中文文字清晰，不再每次依赖外部设计。",
      "折页输出打印级 PDF；素材按月归档、可检索复用，新人上手更快。"
    ],
    // 真实产出示例（来自核心包演示素材；上线前复核）
    outputs: [
      { kind: "img", src: "/assets/gallery/poster-newborn-guard.webp", alt: "出生缺陷防治主题宣传海报（真实生成示例）", label: "出生缺陷防治 · 宣传海报", note: "AI 文案 + Seedream 生图（真实生成）" },
      { kind: "img", src: "/assets/gallery/poster-cancer-early.webp", alt: "两癌筛查主题宣传海报（真实生成示例）", label: "两癌筛查 · 宣传海报", note: "AI 文案 + Seedream 生图（真实生成）" },
      { kind: "file", href: "/assets/downloads/出生缺陷防治宣传折页_示例.pdf", label: "出生缺陷防治三折页（PDF）", note: "A4 三折页 · 打印级成品示例" },
      { kind: "file", href: "/assets/downloads/出生缺陷防治_短视频提示词示例.md", label: "短视频提示词示例", note: "即梦/可灵分镜 · 可直接复制" },
      { kind: "img", src: "/assets/gallery/poster-healthy-life.webp", alt: "全民健康生活方式日主题海报（真实生成示例）", label: "全民健康生活方式日 · 海报", note: "节点性科普海报（真实生成）" }
    ],
    showcase: [
      { kind: "layout", label: "公众号排版界面示意", note: "真实界面截图见首页演示区（ui-gzh）" },
      { kind: "archive", label: "素材库归档", note: "生成内容按月自动归档" }
    ],
    ctaNote: "本案例为试点/演示场景（客户信息脱敏）。想看在您科室的科普任务上怎么跑？"
  },
  {
    id: "demo-education-admission",
    slug: "education-admission-season",
    industry: "education",
    typeLabel: "学校 / 教育",
    anonymous: true,
    demo: true,
    title: "学校宣传组：招生季内容不再全部压在一个人身上",
    summary: "某学校宣传组以招生推文、开放日海报与通知内容走模板化流程，多栏目风格统一、内容留档可交接。（演示场景，客户信息脱敏）",
    problem: [
      "招生季推文、简章、开放日预告集中爆发，文案与海报依赖个别人加班赶制。",
      "公众号排版风格随编辑变动，学校视觉不统一。",
      "往年物料散落在个人电脑，来年复用要重新找人要文件。"
    ],
    modules: [
      { icon: "pen", label: "AI 文案" },
      { icon: "layout", label: "公众号排版" },
      { icon: "image", label: "海报" },
      { icon: "archive", label: "素材库" }
    ],
    approach: [
      "第一步：以真实“招生简章解读”任务试用，验证口径与结构；",
      "第二步：建立校情介绍、通知、活动三大栏目模板；",
      "第三步：招生季按周排期产出，多老师分工协作；",
      "第四步：发布前按学校流程审核，素材统一归档。"
    ],
    results: [
      "招生活动内容按栏目模板分工产出，不再集中在个别人手上。",
      "公众号视觉与栏目口吻保持一致。",
      "往期物料在素材库中可检索复用，人员交接更顺畅。"
    ],
    showcase: [
      { kind: "layout", label: "招生推文排版示意", note: "示意画面 · 上线前替换为脱敏截图" },
      { kind: "image", label: "开放日海报示意", note: "示意画面 · 上线前替换为脱敏成品" },
      { kind: "doc", label: "宣传单页示意", note: "示意画面 · 上线前替换为脱敏成品" }
    ],
    ctaNote: "本案例为演示场景。想看在您学校的招生宣传任务上怎么跑？"
  },
  {
    id: "demo-gov-community",
    slug: "government-community-service",
    industry: "government",
    typeLabel: "政府 / 事业单位",
    anonymous: true,
    demo: true,
    title: "社区服务单位：便民通知与宣传内容规范化留档",
    summary: "某社区服务单位将便民通知、活动预告与办事指南内容模板化生产，口径统一、素材留档。（演示场景，客户信息脱敏）",
    problem: [
      "便民通知、活动预告类内容频次高、要素多，容易出现遗漏。",
      "内容由多人轮流负责，表述与格式不稳定。",
      "宣传物料与历史文案缺少统一归档，追溯与复用困难。"
    ],
    modules: [
      { icon: "pen", label: "AI 文案" },
      { icon: "layout", label: "公众号排版" },
      { icon: "doc", label: "折页/单页" },
      { icon: "archive", label: "素材库" }
    ],
    approach: [
      "第一步：以真实便民服务通知任务试用，校准要素清单；",
      "第二步：固化通知/预告/指南三类模板结构与审核要点；",
      "第三步：按发布计划稳定产出，保留人工审核环节；",
      "第四步：内容与物料统一归档，支持追溯。"
    ],
    results: [
      "通知要素清单化，常见遗漏点通过模板减少。",
      "不同负责人产出的格式与口径更统一。",
      "历史通知与宣传物料归档可查，复用便利。"
    ],
    showcase: [
      { kind: "layout", label: "社区服务推文示意", note: "示意画面 · 上线前替换为脱敏截图" },
      { kind: "doc", label: "办事指南单页示意", note: "示意画面 · 上线前替换为脱敏成品" }
    ],
    ctaNote: "本案例为演示场景。想看在您单位的宣传任务上怎么跑？"
  },
  {
    id: "demo-chain-multiwecom",
    slug: "chain-stores-brand-consistency",
    industry: "enterprise",
    typeLabel: "企业 / 连锁",
    anonymous: true,
    demo: true,
    title: "连锁品牌：总部定标准，门店内容协同产出",
    summary: "某连锁品牌总部统一活动物料模板与品牌口吻，门店按模板本地化后再发布，素材统一回流。（演示场景，客户信息脱敏）",
    problem: [
      "多门店各自做活动海报，风格差异大，品牌形象不统一。",
      "活动文案重复编写，门店与总部之间来回确认成本高。",
      "各店物料与历史活动素材分散，难以复用与复盘。"
    ],
    modules: [
      { icon: "image", label: "海报" },
      { icon: "pen", label: "AI 文案" },
      { icon: "send", label: "多主体企微" },
      { icon: "archive", label: "素材库" }
    ],
    approach: [
      "第一步：以真实门店开业活动物料试用，验证模板与本地化流程；",
      "第二步：总部配置品牌口吻与活动模板，门店填写本地信息；",
      "第三步：门店按模板产出并自查，总部抽查后发布；",
      "第四步：活动物料统一回流素材库，供复盘与复用。"
    ],
    results: [
      "门店活动物料基于总部模板本地化，视觉口径更统一。",
      "重复的活动文案编写工作量下降，确认往返减少。",
      "历史物料统一归档，后续活动可直接复用底稿。"
    ],
    showcase: [
      { kind: "image", label: "门店活动海报示意", note: "示意画面 · 上线前替换为脱敏成品" },
      { kind: "send", label: "企微发送计划示意", note: "示意画面 · 上线前替换为脱敏截图" },
      { kind: "archive", label: "素材库归档示意", note: "示意画面 · 上线前替换为脱敏截图" }
    ],
    ctaNote: "本案例为演示场景。想看在您的连锁门店场景上怎么跑？"
  }
];

// 行业页推荐案例
export const caseIdsByIndustry = {
  healthcare: "demo-hospital-health",
  education: "demo-education-admission",
  government: "demo-gov-community",
  enterprise: "demo-chain-multiwecom"
};
