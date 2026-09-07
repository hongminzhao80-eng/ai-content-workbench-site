// ============================================================================
// AI内容创作工作台 · 官网站点配置（集中配置：品牌/主体/联系方式/域名/表单/SEO）
// 依据：需求规格说明书 V1.0 + 系统开发设计说明书 V1.0
// 【上线前替换】标记的值均为源文件未提供的占位项，正式上线前必须按 README 清单替换。
// 页面产物会在对应占位处生成 HTML 注释：<!-- [上线前替换: ...] -->，便于全局检索。
// ============================================================================

export const site = {
  // ---------- 品牌（名称口径：源文件统一采用“AI内容创作工作台”；若业务方最终定名不同仅需替换此处并重建） ----------
  productName: "AI内容创作工作台",
  // 首屏主标题（需求文档 §3.2 / §5.3 / 附录A1 唯一推荐口径）
  heroTitle: "一个AI工作台，完成机构全部宣传内容",
  // 首屏副标题（需求文档 §3.2 / §5.3）
  heroSubtitle:
    "从公众号文章、海报、宣传折页，到短视频脚本和企业微信内容，AI辅助完成选题、写稿、排版、配图和发布准备。",
  heroTags: ["本地部署", "数据自主", "多行业场景", "7天试用"], // ≤4 个（§5.3）

  // ---------- 上线前必须替换的占位项（源文件均未提供，见需求 §23 / 设计 §23） ----------
  domain: "https://www.example.com", // [上线前替换] 正式域名（用于 canonical / sitemap / OG url）
  companyName: "【运营主体名称待确认】", // [上线前替换] 公司/运营主体名称
  contact: {
    phone: "400-000-0000（待确认）", // [上线前替换] 正式联系电话
    wechat: "AI内容创作工作台官方服务号（微信号待确认）", // [上线前替换] 微信号/企业微信
    email: "contact@example.com（待确认）", // [上线前替换] 正式邮箱
    qrcodeText: "企业微信二维码（待提供，上线前替换）"
  },
  icp: "京ICP备00000000号-1（待确认）", // [上线前替换] 正式备案号
  copyrightYear: "2026", // 与文档编制年度一致；上线后按需更新
  publishNote: "本网站为开发构建版本，正式信息与素材上线前由业务方确认并替换。", // 页脚小字

  // ---------- 主导航（需求 §4.2：产品功能｜行业方案｜客户案例｜内容中心｜渠道合作｜关于我们） ----------
  nav: [
    { label: "首页", href: "/" },
    { label: "产品功能", href: "/product/" },
    { label: "行业方案", href: "/solutions/healthcare/", children: [
      { label: "医疗/卫健", href: "/solutions/healthcare/" },
      { label: "教育", href: "/solutions/education/" },
      { label: "政府/事业单位", href: "/solutions/government/" },
      { label: "企业/连锁/协会", href: "/solutions/enterprise/" }
    ]},
    { label: "客户案例", href: "/cases/" },
    { label: "内容中心", href: "/insights/" },
    { label: "渠道合作", href: "/partners/" },
    { label: "关于我们", href: "/about/" }
  ],
  headerCtas: {
    primary: { label: "申请7天试用", href: "/trial/" },
    secondary: { label: "预约产品演示", href: "/demo/" }
  },

  // ---------- 表单（需求 §9 / 设计 §6、§20） ----------
  forms: {
    // demoMode=false：已接入 CloudBase 云函数后端（lead-api），提交真实入库。
    // 环境：gzzhm518-d2g3ba6o6ecfb077f（体验版）；函数 HTTP 网关见下两行。
    demoMode: false,
    // 提交接口（设计文档 §6.1：POST /api/v1/leads、POST /api/v1/partners）
    // CloudBase HTTP 访问服务（体验版无法配置安全域名，由云函数内部做 Origin 白名单校验）
    leadsEndpoint: "https://gzzhm518-d2g3ba6o6ecfb077f-1251417578.ap-shanghai.app.tcloudbase.com/api/v1/leads",
    partnersEndpoint: "https://gzzhm518-d2g3ba6o6ecfb077f-1251417578.ap-shanghai.app.tcloudbase.com/api/v1/partners",
    // 手机号校验：中国大陆手机号基础格式
    mobilePattern: "^1[3-9]\\d{9}$"
  },

  // ---------- 统计（设计 §9 事件字典；ID 由运营提供后启用，缺省为空不注入任何第三方脚本） ----------
  analytics: {
    enabled: false, // [上线前替换] 启用后注入 analytics.script
    id: "",
    script: ""
  },

  // ---------- 合规：禁止词/需人工确认词扫描（check.mjs 使用；命中禁止词构建失败） ----------
  compliance: {
    // 硬性禁止（出现在任意公开页面即失败）：与需求 §3.4、§16.4 及设计 §11 对应
    forbidden: [
      "订阅自动续费", "自动续费", "年费订阅", "在线订阅", "年费套餐", // 未就绪订阅能力（§3.4）
      "提升疗效", "疗效提升", "治愈率", "治愈", "降低误诊", "诊断建议", "治疗建议", "诊疗建议", "医疗广告生成", // 医疗功效类（§3.4/§16.4）
      "0成本", "零成本", "永不宕机", "100%一键发布", "一键自动发布", "全自动成片", // 技术绝对化（§3.4）
      "效率提升90", "成本降低80", "效率提升95" // 不可核验数字（§8.1）
    ],
    // 软性提示（命中仅告警不失败，提示人工复核）
    review: ["仅供参考", "保证100", "包治", "官方认证疗效"]
  }
};

// 机构类型下拉选项值（对应需求 §9.2，payload organization_type 枚举）
export const ORG_TYPES = [
  { value: "hospital", label: "医院/医疗机构" },
  { value: "education", label: "学校/教育机构" },
  { value: "government", label: "政府/事业单位" },
  { value: "enterprise", label: "企业" },
  { value: "association", label: "协会" },
  { value: "chain", label: "连锁机构" },
  { value: "other", label: "其他" }
];

// 最想解决的问题 多选枚举（§9.2 needs，payload 使用 value 数组）
export const NEEDS = [
  { value: "copywriting", label: "写稿/内容生成" },
  { value: "wechat_layout", label: "公众号排版" },
  { value: "poster", label: "海报制作" },
  { value: "leaflet", label: "宣传折页/单页" },
  { value: "short_video", label: "短视频脚本" },
  { value: "wecom", label: "企业微信发送" },
  { value: "other", label: "其他" }
];

// 宣传团队人数（§9.2 team_size 单选枚举）
export const TEAM_SIZES = [
  { value: "1", label: "1人" },
  { value: "2-3", label: "2-3人" },
  { value: "4-10", label: "4-10人" },
  { value: "10+", label: "10人以上" }
];

// 区域（省/市）来源：中国省级行政区 + 主要城市（可编辑）；校验用
export const REGIONS = [
  { province: "北京市", cities: ["北京市"] },
  { province: "天津市", cities: ["天津市"] },
  { province: "河北省", cities: ["石家庄市", "唐山市", "保定市", "邯郸市", "其他"] },
  { province: "山西省", cities: ["太原市", "大同市", "临汾市", "其他"] },
  { province: "内蒙古自治区", cities: ["呼和浩特市", "包头市", "其他"] },
  { province: "辽宁省", cities: ["沈阳市", "大连市", "其他"] },
  { province: "吉林省", cities: ["长春市", "吉林市", "其他"] },
  { province: "黑龙江省", cities: ["哈尔滨市", "大庆市", "其他"] },
  { province: "上海市", cities: ["上海市"] },
  { province: "江苏省", cities: ["南京市", "苏州市", "无锡市", "常州市", "徐州市", "其他"] },
  { province: "浙江省", cities: ["杭州市", "宁波市", "温州市", "嘉兴市", "绍兴市", "其他"] },
  { province: "安徽省", cities: ["合肥市", "芜湖市", "蚌埠市", "其他"] },
  { province: "福建省", cities: ["福州市", "厦门市", "泉州市", "其他"] },
  { province: "江西省", cities: ["南昌市", "赣州市", "九江市", "其他"] },
  { province: "山东省", cities: ["济南市", "青岛市", "烟台市", "潍坊市", "临沂市", "其他"] },
  { province: "河南省", cities: ["郑州市", "洛阳市", "开封市", "新乡市", "其他"] },
  { province: "湖北省", cities: ["武汉市", "宜昌市", "襄阳市", "其他"] },
  { province: "湖南省", cities: ["长沙市", "株洲市", "衡阳市", "其他"] },
  { province: "广东省", cities: ["广州市", "深圳市", "东莞市", "佛山市", "珠海市", "其他"] },
  { province: "广西壮族自治区", cities: ["南宁市", "桂林市", "柳州市", "其他"] },
  { province: "海南省", cities: ["海口市", "三亚市", "其他"] },
  { province: "重庆市", cities: ["重庆市"] },
  { province: "四川省", cities: ["成都市", "绵阳市", "德阳市", "南充市", "其他"] },
  { province: "贵州省", cities: ["贵阳市", "遵义市", "六盘水市", "其他"] },
  { province: "云南省", cities: ["昆明市", "曲靖市", "大理白族自治州", "其他"] },
  { province: "西藏自治区", cities: ["拉萨市", "其他"] },
  { province: "陕西省", cities: ["西安市", "咸阳市", "宝鸡市", "其他"] },
  { province: "甘肃省", cities: ["兰州市", "天水市", "其他"] },
  { province: "青海省", cities: ["西宁市", "其他"] },
  { province: "宁夏回族自治区", cities: ["银川市", "其他"] },
  { province: "新疆维吾尔自治区", cities: ["乌鲁木齐市", "其他"] },
  { province: "香港特别行政区", cities: ["香港"] },
  { province: "澳门特别行政区", cities: ["澳门"] },
  { province: "台湾省", cities: ["台北市", "其他"] }
];