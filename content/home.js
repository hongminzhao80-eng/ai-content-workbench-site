// ============================================================================
// 首页内容模型（来源：需求 §5.2 首页模块顺序 + 附录A 文案骨架 + §3.2/§3.3）
// 2026-09 优化：主视觉与演示区引入真实产品界面截图/真实生成成品（来自核心包，
// 标注“真实示例 · 上线前复核”）。字段注释标注对应章节。
// ============================================================================

export const home = {
  seo: {
    title: "AI内容创作工作台_机构宣传一体化AI工作台",
    description:
      "面向医院、学校、政府与企业等机构宣传部门的AI内容创作工作台：公众号文章、海报、折页、短视频脚本与企业微信内容，一个工作台完成写稿、排版、配图与发布准备。支持本地部署、7天试用。"
  },

  hero: {
    kicker: "面向医院 · 学校 · 政府/事业单位 · 企业/连锁/协会 的宣传部门",
    // h1 取 site.config.heroTitle
    tags: ["本地部署", "数据自主", "多行业场景", "7天试用"],
    // 首屏主视觉：真实产品界面截图（演示环境示例；上线前复核后替换为正式脱敏截图）
    media: {
      kind: "shot",
      src: "/assets/screens/ui-main.webp",
      alt: "AI内容创作工作台主界面：左侧素材库与定时任务区，右侧为选题生成与预览工作区（真实产品界面示例）",
      caption: "真实产品界面 · 演示环境截图（上线前复核）"
    }
  },

  pain: {
    eyebrow: "02 · 机构宣传的真实处境",
    heading: "宣传部门最贵的，不是AI费用，而是人的时间。",
    items: [
      { icon: "clock", title: "写稿慢", desc: "高频内容长期占用宣传人员，选题、起稿、改稿往复循环。" },
      { icon: "layout", title: "排版麻烦", desc: "写完还要找图、排版、反复调整，风格还难以统一。" },
      { icon: "palette", title: "设计分散", desc: "海报、折页常常依赖不同工具或外包，沟通与等待周期长。" },
      { icon: "user", title: "人员依赖", desc: "宣传能力容易绑定个人经验，骨干变动就出现断档。" }
    ]
  },

  workflow: {
    eyebrow: "03 · 一体化工作流",
    heading: "从主题到发布，一条工作流走完机构宣传",
    lead: "把散落在文档、编辑器、设计软件、群聊里的环节，收敛到同一个工作台。",
    steps: [
      { icon: "edit", title: "输入宣传主题", desc: "写下任务、对象与场合，例如“写一篇出生缺陷防治科普推文”。" },
      { icon: "pen", title: "AI 生成文案", desc: "按机构口吻产出标题、正文与要点，可多版对照修改。" },
      { icon: "layout", title: "智能排版", desc: "AI 按文章现场设计版式，一键复制到公众号编辑器。" },
      { icon: "image", title: "AI 配图 / 海报", desc: "构图方案 + AI 生图，中文文字清晰，可继续人工替换定稿。" },
      { icon: "doc", title: "海报 / 折页", desc: "同一主题继续产出活动海报、宣传折页或单页。" },
      { icon: "video", title: "短视频提示词", desc: "按平台模型规范生成脚本、分镜与提示词，供拍摄使用。" },
      { icon: "send", title: "企微发送 / 素材归档", desc: "一键发送企业微信（含定时任务），内容自动归档入库。" }
    ]
  },

  features: {
    eyebrow: "04 · 核心功能",
    heading: "机构宣传的六大高频任务，一个工作台接住",
    lead: "文案、排版、配图、海报/折页、短视频提示词与企业微信发送，同一套工作流接力完成；素材自动归档、数据自主。",
    items: [
      { icon: "pen", title: "AI 文案生成", desc: "6 类内容 × 10 大领域：公众号推文、短视频脚本、海报文案、折页文案、活动通知、知识问答，可批量生成。", href: "/product/#feature-copywriting" },
      { icon: "layout", title: "公众号排版", desc: "AI 按内容现场设计版式，一键复制粘贴进微信编辑器，支持配图插入。", href: "/product/#feature-wechat-layout" },
      { icon: "image", title: "海报一键生图", desc: "7 种风格构图方案 + AI 出图，中文文字逐字准确，可传品牌样板学习风格。", href: "/product/#feature-poster" },
      { icon: "doc", title: "宣传折页 / 单页", desc: "A4 三折页、A4/A5 单页等规格，内容自动适配，输出打印级 PDF。", href: "/product/#feature-leaflet" },
      { icon: "video", title: "短视频提示词", desc: "按即梦/可灵等平台模型规范生成分镜与提示词，可直接复制。", href: "/product/#feature-short-video" },
      { icon: "send", title: "企业微信 / 素材库", desc: "一键发送与定时任务，多主体切换；生成内容自动归档、检索与备份。", href: "/product/#feature-wecom" }
    ]
  },

  industries: {
    eyebrow: "05 · 按行业场景落地",
    heading: "同样的工作流，解决不同机构的宣传难题",
    lead: "医疗、教育、政务、企业与连锁机构各有高频任务与合规要求，行业方案页给出对应落地说明。",
    items: [
      { id: "healthcare", icon: "cross", title: "医疗 / 卫健", desc: "健康科普推文、义诊通知、活动海报与健康教育折页的高频创作。", tags: ["健康科普", "本地部署", "合规边界"], href: "/solutions/healthcare/" },
      { id: "education", icon: "school", title: "学校 / 教育", desc: "招生推文、校园活动、政策通知与活动海报，一篇一版更快出稿。", tags: ["招生宣传", "活动通知"], href: "/solutions/education/" },
      { id: "government", icon: "building", title: "政府 / 事业单位", desc: "政策宣传、会议通知与社区服务内容，规范化连续生产。", tags: ["规范化", "数据自主"], href: "/solutions/government/" },
      { id: "enterprise", icon: "store", title: "企业 / 连锁 / 协会", desc: "品牌推文、产品海报与多门店宣传，多主体、多主题统一管理。", tags: ["品牌口吻", "多主体企微"], href: "/solutions/enterprise/" }
    ]
  },

  trust: {
    eyebrow: "06 · 部署与数据",
    heading: "内容数据是机构的资产，留在机构侧",
    lead: "面向机构的宣传工具，数据边界与交付方式应当清楚、可控。",
    points: [
      { icon: "server", title: "本地部署", desc: "工作台部署在机构自有服务器/电脑，内容与素材留在机构侧。" },
      { icon: "archive", title: "素材自动归档", desc: "生成的文章、排版、海报等内容自动进入素材库，可按月检索。" },
      { icon: "palette", title: "品牌风格可配置", desc: "医院/单位名称、科室落款、品牌色与主题可按机构配置。" },
      { icon: "backup", title: "备份与清理", desc: "素材库支持一键备份；占用空间可一键清理，数据自主可控。" }
    ],
    faqCtaLabel: "查看部署与数据 FAQ",
    ctaLabel: "预约演示，了解部署方式"
  },

  demo: {
    eyebrow: "07 · 实机演示与真实产出",
    heading: "真实产品界面，与它实际生成的内容",
    lead: "下方不是效果图：主界面截图与海报、折页均由工作台实际生成与输出（演示示例，上线前复核）。也可预约演示，在您的真实任务上现场验证。",
    screenshot: {
      src: "/assets/screens/ui-gzh.webp",
      alt: "公众号排版预览界面：AI 排版结果与“一键复制到公众号”按钮（真实产品界面示例）",
      caption: "AI 公众号排版 · 支持一键复制到微信编辑器",
      ctaLabel: "查看产品功能"
    },
    outputs: {
      title: "真实生成成品示例（健康教育场景 · 演示示例）",
      note: "以下海报与折页由工作台按主题生成：AI 文案 → 排版/构图 → Seedream 出图 / 折页 PDF。",
      posters: [
        { src: "/assets/gallery/poster-newborn-guard.webp", alt: "出生缺陷防治主题宣传海报（真实生成示例）", title: "出生缺陷防治 · 早筛早康" },
        { src: "/assets/gallery/poster-cancer-early.webp", alt: "两癌筛查主题宣传海报（真实生成示例）", title: "两癌筛查 · 早检早安" },
        { src: "/assets/gallery/poster-healthy-life.webp", alt: "全民健康生活方式日主题海报（真实生成示例）", title: "全民健康生活方式日" },
        { src: "/assets/gallery/poster-silver-years.webp", alt: "老年健康主题海报（真实生成示例）", title: "银龄安康 · 芳华永驻" }
      ],
      files: [
        { href: "/assets/downloads/出生缺陷防治宣传折页_示例.pdf", label: "出生缺陷防治宣传折页（PDF 成品示例）", note: "A4 三折页 · 打印级输出" },
        { href: "/assets/downloads/出生缺陷防治_短视频提示词示例.md", label: "短视频提示词示例（即梦/可灵分镜）", note: "按平台模型规范生成，可直接复制" },
        { href: "/assets/downloads/用户操作教程.pdf", label: "用户操作教程（PDF）", note: "给机构同事的上手手册" }
      ]
    }
  },

  cases: {
    eyebrow: "08 · 客户案例",
    heading: "同类的机构任务，是这样被接住的",
    lead: "试点/演示场景案例（信息脱敏）：展示真实工作方式与真实产出；正式客户案例需经授权后公示。",
    featuredIds: ["demo-hospital-health", "demo-education-admission", "demo-gov-community"],
    ctaLabel: "查看全部案例"
  },

  trial: {
    eyebrow: "09 · 申请试用",
    heading: "7天试用，先在你的真实任务上验证",
    lead: "填一份试用申请，专人按场景对接并发放 7 天试用（全功能体验，试用期内内容带“试用”标识或按日限量）；也欢迎直接预约产品演示。"
  },

  faq: {
    eyebrow: "10 · 常见问题",
    heading: "关于试用、部署、数据与合规",
    intro: "以下按机构最关心的问题整理；更多疑问可在预约演示时直接沟通。",
    complianceLine: "医疗健康相关生成内容仅用于健康科普与内容创作辅助，不构成临床诊断、治疗建议或医疗广告；机构用户应确认发布主体资质并履行内容审核与发布前审查义务。"
  },

  bottomCta: {
    heading: "现在开始，让AI辅助完成机构宣传内容生产。",
    note: "先试用，再评估，用真实任务验证后再决策。"
  }
};
