// ============================================================================
// 行业方案内容库（来源：需求 §7.1-§7.4；页面结构一致：定位/典型任务/价值/工作流/合规/CTA）
// 医疗页 compliance 为必填（§7.1 / §11.2 合规提示组件文案）。
// ============================================================================

export const industries = {
  healthcare: {
    slug: "healthcare",
    navLabel: "医疗 / 卫健",
    icon: "cross",
    seo: {
      title: "医院宣传AI_医疗健康科普创作方案_AI内容创作工作台",
      description:
        "面向医院、妇幼保健院与卫健机构的AI内容创作方案：健康科普推文、义诊通知、活动海报、健康教育折页等高频宣传任务；支持本地部署、数据自主，明确医疗内容合规边界。"
    },
    hero: {
      eyebrow: "行业方案 · 医疗 / 卫健",
      heading: "把健康科普与宣传任务，交给可持续的内容工作流",
      lead: "面向医院、妇幼保健院、疾控与卫健机构等宣传和健康教育场景：让科普素材有积累、让内容生产有节奏、让发布有合规边界。"
    },
    positioning: "医院宣传科、健康教育科、办公室常年在科普推文、活动通知、海报与折页之间高频切换，人手与专业设计资源有限。工作台把这类任务组织成模板化工作流，让重复性文案、排版与设计劳动可被工具承接。",
    tasks: [
      { icon: "pen", title: "健康科普推文", desc: "按科室、节气和主题批量产出科普初稿，数据与口径留空待科室核对。" },
      { icon: "doc", title: "义诊/活动通知", desc: "通知结构统一，成稿可继续转成海报与单页。" },
      { icon: "image", title: "活动海报", desc: "主题 + 构图方案 + AI 生图，快速出多稿对照。" },
      { icon: "doc", title: "健康教育折页", desc: "A4 三折页/单页内容适配与 PDF 输出准备。" },
      { icon: "layout", title: "公众号更新", desc: "科室号、院号多主体排版，发布前统一审核。" }
    ],
    value: [
      { icon: "clock", title: "减少重复性劳动", desc: "文案、排版、设计的高频重复环节由工具承接，人员聚焦选题与审核。" },
      { icon: "server", title: "本地部署与数据自主", desc: "可部署到机构环境，宣传素材归档在机构侧。" },
      { icon: "workflow", title: "形成内容工作流", desc: "同一主题从推文延展到海报、折页与短视频脚本，模板沉淀复用。" }
    ],
    compliance: {
      // 需求 §7.1 + 设计 §11.2 固定提示组件文案
      title: "医疗内容合规提示",
      body: "平台生成的医疗健康相关内容用于健康科普与内容创作辅助，不构成临床诊断、治疗建议或医疗广告。机构用户应自行确认发布主体资质（如医疗机构执业许可等），并履行内容审核及发布前审查义务。禁止将生成内容用于疗效、诊断或治疗建议等表述。"
    },
    cta: {
      label: "申请医疗机构试用",
      secondaryLabel: "预约医疗场景演示",
      href: "/trial/"
    }
  },

  education: {
    slug: "education",
    navLabel: "学校 / 教育",
    icon: "school",
    seo: {
      title: "学校宣传AI_招生宣传与校园活动方案_AI内容创作工作台",
      description:
        "面向学校与教育机构的AI宣传方案：招生推文、校园活动、政策通知、活动海报等高频任务一体化创作，AI内容创作工作台让校办与宣传老师更快出稿。"
    },
    hero: {
      eyebrow: "行业方案 · 教育",
      heading: "招生季、活动季，宣传内容也能跟得上节奏",
      lead: "面向中小学、高校、职业院校与教育管理单位：把招生活动、政策通知和校园品牌内容，放进一套可复用、可交接的工作流。"
    },
    positioning: "校办、宣传与招生部门的内容任务随学期节奏集中爆发，文稿、视觉与发布渠道分散在不同人手里。工作台把选题、写稿、排版、海报到发布准备串成一条线，降低对个别“会做图、会排版”同学的依赖。",
    tasks: [
      { icon: "pen", title: "招生推文", desc: "校情介绍、招生简章、开放日预告等文案快速成稿。" },
      { icon: "image", title: "校园活动海报", desc: "迎新、晚会、运动会等活动视觉多稿对照。" },
      { icon: "doc", title: "政策 / 通知", desc: "报到、考试、假期等通知类内容规范统一。" },
      { icon: "layout", title: "公众号排版", desc: "学校公众号模板化排版，风格保持一致。" },
      { icon: "video", title: "活动短视频脚本", desc: "回顾类短视频脚本、分镜与素材清单。" }
    ],
    value: [
      { icon: "clock", title: "应对爆发式任务", desc: "招生季、活动季内容集中产出，模板与初稿加速周转。" },
      { icon: "palette", title: "风格统一可沉淀", desc: "校徽色系、栏目版式与口吻可配置复用。" },
      { icon: "user", title: "降低人员依赖", desc: "宣传资料沉淀在系统，新人按模板即可上手。" }
    ],
    compliance: null,
    cta: {
      label: "申请学校试用",
      secondaryLabel: "预约教育场景演示",
      href: "/trial/"
    }
  },

  government: {
    slug: "government",
    navLabel: "政府 / 事业单位",
    icon: "building",
    seo: {
      title: "政务宣传AI_政策宣传与社区服务方案_AI内容创作工作台",
      description:
        "面向政府机关与事业单位的AI内容创作方案：政策宣传、会议通知、社区服务推文与宣传折页，规范化生产、数据自主、稳定工作流，支持本地部署。"
    },
    hero: {
      eyebrow: "行业方案 · 政府 / 事业单位",
      heading: "规范化、连续化的政务内容生产",
      lead: "面向政府机关、事业单位与社区服务机构：政策宣传、会议通知与社区服务内容高频且要求规范，用稳定的工作流承接，内容数据留在机构侧。"
    },
    positioning: "政务宣传内容的规范要求高、节奏连续，临时外包难以沉淀口径。工作台提供模板化的内容生产流程：结构统一、口径可审、素材留档，配合本地部署实现数据自主。",
    tasks: [
      { icon: "pen", title: "政策宣传", desc: "政策解读推文结构规范，重点数据留位核对。" },
      { icon: "doc", title: "会议/活动通知", desc: "通知要素完整、格式统一。" },
      { icon: "doc", title: "社区服务推文", desc: "便民服务、活动预告等高频内容稳定产出。" },
      { icon: "doc", title: "宣传折页", desc: "办事指南、服务清单等单页/折页内容适配。" },
      { icon: "server", title: "内容留档", desc: "发布素材统一归档，便于追溯与复用。" }
    ],
    value: [
      { icon: "workflow", title: "规范化生产", desc: "模板固化内容结构与审核要点，降低口径漂移。" },
      { icon: "server", title: "数据自主", desc: "支持本地部署，宣传内容与素材归档在机构侧。" },
      { icon: "clock", title: "连续内容供应", desc: "高频栏目按固定节奏产出，不再等人手。" }
    ],
    compliance: null,
    cta: {
      label: "申请政企场景试用",
      secondaryLabel: "预约政务场景演示",
      href: "/trial/"
    }
  },

  enterprise: {
    slug: "enterprise",
    navLabel: "企业 / 连锁 / 协会",
    icon: "store",
    seo: {
      title: "企业宣传AI_多品牌多门店内容管理方案_AI内容创作工作台",
      description:
        "面向企业、连锁与协会的AI内容创作方案：品牌推文、产品海报、活动单页与内部刊物，品牌口吻统一、多主体企业微信管理，总部到门店的内容矩阵化协同。"
    },
    hero: {
      eyebrow: "行业方案 · 企业 / 连锁 / 协会",
      heading: "总部一套标准，门店各自出活",
      lead: "面向品牌、市场与运营团队：品牌推文、产品海报、活动单页与内部内容在多门店、多主体之间统一生产与分发，素材与品牌风格持续沉淀。"
    },
    positioning: "多门店、多品牌或多分支的机构，内容既要“各自贴近本地”，又要“统一不跑调”。工作台通过品牌口吻与版式配置、多主体企业微信管理、素材库复用，让总部定标准、门店出内容。",
    tasks: [
      { icon: "pen", title: "品牌推文", desc: "公众号推文按品牌口吻生成，多分支可复用底稿。" },
      { icon: "image", title: "产品/活动海报", desc: "开业、促销、会员日活动视觉快速出稿。" },
      { icon: "doc", title: "活动单页与刊物", desc: "宣传单页、内部刊物内容适配与输出。" },
      { icon: "send", title: "多主体企业微信", desc: "多门店/多主体发送与定时任务（以验收版本为准）。" },
      { icon: "palette", title: "品牌素材库", desc: "活动物料统一归档，门店按模板本地化。" }
    ],
    value: [
      { icon: "palette", title: "品牌口吻统一", desc: "总部定义话术与版式，门店产出自动对齐。" },
      { icon: "send", title: "矩阵化管理", desc: "多主体、多主题内容统一计划与分发。" },
      { icon: "archive", title: "物料持续沉淀", desc: "历史物料检索复用，不再重复找外包。" }
    ],
    compliance: null,
    cta: {
      label: "申请企业试用",
      secondaryLabel: "预约企业场景演示",
      href: "/trial/"
    }
  }
};

// 行业页通用默认字段（模板读取 industries[slug]，fallback 字段在此定义以免遗漏）
export const industryOrder = ["healthcare", "education", "government", "enterprise"];

export const industryFeaturedCaseIds = {
  healthcare: ["demo-hospital-health"],
  education: ["demo-education-admission"],
  government: ["demo-gov-community"],
  enterprise: ["demo-chain-multiwecom"]
};
