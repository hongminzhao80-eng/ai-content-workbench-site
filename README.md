# AI内容创作工作台 · 官网（静态获客站）

依据《AI内容创作工作台_官网开发需求规格说明书_V1.0》与《AI内容创作工作台_官网系统开发设计说明书_V1.0》开发的首期官网前台：全部公开页面（P0+P1）、响应式、SEO 基础、三套合规线索表单（试用/演示/渠道合作）。

交付决策（已与需求方确认）：1) 零依赖静态官网前台，可部署任意静态托管/CDN；2) 全量页面（首页/产品/4 行业/案例/试用/演示/合作/内容中心/关于/隐私/条款/404 共 26 个 HTML 页面）；3) 源文件未提供的品牌信息一律占位并在产物中标注，正式上线前按下方替换清单处理。

## 一、快速开始

环境要求：Node.js 18+，全程零 npm 依赖。

    npm run build     # 生成 dist/（node scripts/build.mjs）
    npm run check     # 质量自检（SEO/内链/禁止词/合规/表单要素，node scripts/check.mjs）
    npm run serve     # 本地静态预览： http://127.0.0.1:8630/  （node scripts/serve.mjs）

- 构建产物全部在 dist/ 目录，可整目录部署；资源引用为相对路径，支持子路径部署。
- 本地预览服务运行时会生成 preview.log（访问日志）与 .preview.pid（进程号）；停止可用 taskkill /PID <pid> /F。

## 二、目录结构

    site.config.js      站点集中配置：品牌/主体/联系方式/域名/表单/统计/合规词表
    content/            内容库（文案与文档章节一一对应，含来源注释）
      home.js           首页：hero/痛点/工作流/功能/行业/信任/演示/案例/FAQ/CTA
      product.js        产品功能：总览 + 7 大功能块（输入→处理→输出→场景→CTA）
      industries.js     4 个行业方案（医疗含 §11.2 合规提示）
      cases.js          案例（演示场景 · 信息脱敏 · 无百分比伪数据）
      insights.js       内容中心文章（教程/行业方法/AI宣传知识/产品动态）
      faqs.js           FAQ 库（试用/部署/数据/合规/交付）
      legal.js          关于我们 / 隐私政策 / 服务条款
      landing.js        试用 / 演示 / 合作三张转化页
    lib/
      templates.mjs     基础模板：SEO head/导航/页脚/表单/组件/JSON-LD
      pages.mjs         页面组装：由 content 渲染全部页面
      icons.mjs         内联 SVG 图标库（无 emoji 图标）
    src/
      styles/main.css   设计系统（墨绿/青绿 + 白/浅灰；响应式；无障碍）
      js/main.js        交互：导航抽屉/地区联动/表单校验与提交/视频占位/埋点钩子
      assets/           favicon.svg（可替换）；正式 Logo 建议替换 logoMark 为正式 SVG
    scripts/
      build.mjs         生成 dist/（26 页 + sitemap.xml + robots.txt）
      check.mjs         质量门：SEO、唯一 H1、内链、禁止词、医疗合规、表单要素
      serve.mjs         本地静态预览（含 404 回退）
    dist/               构建产物（部署此目录）

## 三、页面清单（对应设计文档 §2.1 路由表）

    首页 /                              P0
    产品功能 /product/                   P0
    医疗/卫健 /solutions/healthcare/     P0
    教育     /solutions/education/       P0
    政企     /solutions/government/      P0
    企业/连锁 /solutions/enterprise/     P1
    客户案例 /cases/ 与 /cases/<slug>/（4 篇） P0
    申请试用 /trial/                     P0
    预约演示 /demo/                      P0
    渠道合作 /partners/                  P0
    内容中心 /insights/ 与 /insights/<slug>/（7 篇） P1
    关于我们 /about/                     P1
    隐私政策 /privacy/                   P0
    服务条款 /terms/                     P0
    404     /404.html                    P0
    robots.txt / sitemap.xml             P0

## 四、表单与后端接入契约

- 页面内置试用/演示/合作三套表单，字段按需求 §9.2 与 §10，提交 payload 对齐设计文档 §6.3。
- **已接入 CloudBase 云函数后端（2026-09）**：`site.config.js → forms.demoMode = false`，表单提交真实入库。
  - 环境：`gzzhm518-d2g3ba6o6ecfb077f`（体验版，2027-02-25 到期，ap-shanghai）
  - 云函数：`lead-api`（cloudfunctions/lead-api，服务端校验 + 幂等 + 限流 + Origin 白名单，自动建集合 `leads`）
  - HTTP 网关：https://gzzhm518-d2g3ba6o6ecfb077f-1251417578.ap-shanghai.app.tcloudbase.com/api/v1
  - 提交地址：试用/演示 → POST /api/v1/leads；合作 → POST /api/v1/partners（site.config.js 可改）
  - 查看/导出线索：`tcb db nosql dump leads --file-type json --output-dir ./exports -e gzzhm518-d2g3ba6o6ecfb077f`，或控制台「云开发 → 数据库 → leads」（https://console.cloud.tencent.com/tcb/database）
  - 重新部署云函数：`tcb fn deploy lead-api -e gzzhm518-d2g3ba6o6ecfb077f`（覆盖确认输 y）；网关路由变更：改 cloudbaserc.json 后 `tcb deploy --only=gateway -e <env>`
- 演示模式说明：demoMode=true 时，网络层失败会进入本地演示成功态并明确提示“本次填写未保存”（不伪装真实提交）；后端接入后置 false。

### 线索管理后台（CloudBase admin-leads）

- 后台地址：https://gzzhm518-d2g3ba6o6ecfb077f-1251417578.ap-shanghai.app.tcloudbase.com/admin
- 功能：查看全部线索（试用/演示/合作）、按类型与状态筛选、标记「已联系/已完成/无效」、删除；页面打开后输入管理口令即可使用（口令存 sessionStorage，支持锁定退出）。
- 管理口令：见本地文件 `.admin-key`（**已 gitignore，禁止提交仓库**；公开仓库不得出现明文口令）。
- 更换口令：重新生成后执行 `tcb fn deploy admin-leads -e gzzhm518-d2g3ba6o6ecfb077f`（覆盖确认输 y）；部署前请先在 cloudbaserc.json 的 admin-leads.envVariables.ADMIN_KEY 填入真实值（默认占位 REPLACE_BEFORE_DEPLOY）。
- 说明：轻量口令保护，仅用于内部查看；体验版无法配置网关鉴权，正式运营建议升级套餐并加网关鉴权（enableAuth=true）/接入 CMS 登录。
- 演示模式说明：demoMode=true 时，网络层失败会进入本地演示成功态并明确提示“本次填写未保存”（不伪装真实提交）；后端接入后置 false。

请求示例（设计 §6.3）：

    POST /api/v1/leads   Content-Type: application/json
    {
      "submission_id": "web_xxxx",
      "lead_type": "trial",
      "organization_name": "某某机构",
      "organization_type": "hospital",
      "province": "XX省", "city": "XX市",
      "contact_name": "张三", "mobile": "13800000000",
      "wechat": "", "team_size": "2-3",
      "needs": ["copywriting","wechat_layout","poster"],
      "message": "补充说明",
      "privacy_consent": true,
      "source": "baidu", "utm_source": "...", "landing_page": "/solutions/healthcare/"
    }

响应约定（§6.4 / §20 错误码，前端提示已按此映射）：

    HTTP 201 → 成功态        HTTP 400 → 请检查必填信息和格式后再提交
    HTTP 409 → 已收到您的申请，请勿重复提交
    HTTP 429 → 提交过于频繁，请稍后再试
    HTTP 500 → 提交暂时失败，请稍后重试或联系我们

安全要求（§10 / §16）：服务端必须独立完成校验、限流、反垃圾与隐私同意记录，错误响应不得含数据库/堆栈敏感信息；本前端不承担鉴权与授权逻辑。

## 五、上线前替换清单（产物中均含 “[上线前替换]” HTML 注释，可全局检索）

    1  正式域名          site.config.js → domain（影响 canonical/sitemap/OG）
    2  产品正式名称       site.config.js → productName（现统一“AI内容创作工作台”）
    3  运营主体/公司名称   site.config.js → companyName（页脚/关于/隐私/条款）
    4  电话/邮箱/微信/二维码 site.config.js → contact
    5  ICP 备案号        site.config.js → icp
    6  Logo             lib/icons.mjs → logoMark（替换为正式 SVG）
    7  产品截图/示意      content/home.js → hero.media 与案例 showcase（现为 CSS 示意并标注）
    8  演示视频          content/home.js → demo.video.src（填入 30–60 秒脱敏实机录屏地址）
    9  真实客户案例       content/cases.js（需客户授权后替换，保留“证据原则”）
    10 表单端点/演示模式  site.config.js → forms
    11 统计埋点          site.config.js → analytics（enabled + id + script）
    12 文章日期          content/insights.js（上线时由运营复核）

## 六、合规口径（发布前请勿移除）

- 不出现：未就绪订阅/自动续费/在线支付售卖、疗效/治愈/诊断/治疗建议、绝对化表述（0成本、永不宕机、100%一键发布）、不可核验的百分比数字。
- 医疗/卫健页面与医院场景案例强制展示合规边界（健康科普与内容创作辅助；不构成诊断/治疗建议/医疗广告；机构确认发布主体资质并履行内容审核与发布前审查义务）——check.mjs 会校验。
- 案例遵循证据原则（§8.1）：无授权不点名、无证据不写百分比；现有案例均为“演示场景 · 信息脱敏”。
- 网站不展示内部授权后台地址/私钥/交付路径；真实密钥等敏感信息严禁写入本仓库任何文件（check.mjs 含泄露特征扫描）。

## 七、测试与验收

- npm run check 门禁：每页唯一 title/description/H1、canonical、内链可达、sitemap/robots、禁止词与敏感特征扫描、医疗合规文案、表单要素（data-lead-form/privacy/submission_id）。
- 当前状态：26 页构建零报错；check 0 错误 0 告警；本地 HTTP 全部页面 200（含 404 回退）。
- 依赖后端/CMS 的验收项（入库、权限、限流真验等，对应设计 §16.2 WEB-P0-001~010）在接入后端后执行。

## 八、本期范围与不做

- 做：公开官网前台、SEO/合规/响应式、表单前端与接口契约、CMS 内容源结构（content/ 便于后续映射 CMS 实体）。
- 不做：后端 API 与数据库、CMS 管理后台、登录鉴权、订阅/支付、授权签发（与文档一致）；真实品牌素材与主体信息（见替换清单）；线上部署与域名。



## 十、真实素材清单与复核要求（2026-09 依据开发总包新增）

官网已引入开发总包（C:\Users\Administrator\妇幼工作 → AI宣传内容工作台 核心应用）中的真实产品素材，用于“所见即所得”演示：

| 用途 | 文件 | 说明 |
|---|---|---|
| 首页主视觉 | assets/screens/ui-main.webp | 真实产品主界面截图（演示环境） |
| 公众号排版演示 | assets/screens/ui-gzh.webp | AI 排版预览 + 一键复制按钮 |
| 文案/文本预览 | assets/screens/ui-text.webp | 产品功能页展示 |
| 海报生图界面 | assets/screens/ui-poster.webp | 产品功能页展示 |
| 折页/单页界面 | assets/screens/ui-leaflet.webp | 产品功能页展示 |
| 定时任务界面 | assets/screens/ui-schedule.webp | 备用（未使用则删除） |
| 企业微信发送界面 | assets/screens/ui-wecom.webp | 产品功能页展示 |
| 海报成品 ×4 | assets/gallery/*.webp | 真实生成（出生缺陷/两癌/全民健康生活方式/银龄安康） |
| 折页 PDF 成品 | assets/downloads/出生缺陷防治宣传折页_示例.pdf | 打印级示例下载 |
| 短视频提示词示例 | assets/downloads/出生缺陷防治_短视频提示词示例.md | 真实生成（即梦/可灵分镜） |
| 用户操作教程 | assets/downloads/用户操作教程.pdf | 试用配套手册 |

**上线前复核要求（重要）**：
- 逐张目检上述截图与海报：不得出现患者隐私、个人联系方式、二维码、内部地址/群名/账号、其他单位标识。
- 界面截图如含“石阡妇幼”等试点单位名称或真实发送对象，正式上线前应使用脱敏演示环境重拍或去除标识。
- 海报如需公开宣传展示，请确认其内容与所涉机构无授权问题；本仓库素材来自开发总包演示用途。
- 上述素材已在页面标注“真实示例 · 上线前复核”；替换时保持同名文件即可（webp 亦可换 jpg/png，注意同步 src/assets 后重建）。



## 十一、GitHub Pages 部署指引（两步推送即可上线）

本仓库已准备好两个分支：**main**（项目源码 + dist 构建产物）与 **gh-pages**（dist 静态文件置于仓库根，供 Pages 直接托管）。

### 第 1 步：在 GitHub 创建空仓库（不要勾选任何初始化文件）
- 地址：https://github.com/new
- Repository name：ai-content-workbench-site
- Visibility：Public
- 不要勾选 Add README / .gitignore / license（避免与本地提交冲突）

### 第 2 步：在项目根目录执行推送（会弹出登录/授权窗口，用你的 GitHub 账号确认一次）

    git remote add origin https://github.com/hongminzhao80-eng/ai-content-workbench-site.git
    git push -u origin main
    git push origin gh-pages

### 第 3 步：开启 Pages
- 打开 https://github.com/hongminzhao80-eng/ai-content-workbench-site/settings/pages
- Source：Deploy from a branch
- Branch：gh-pages / (root) → Save
- 访问地址：https://hongminzhao80-eng.github.io/ai-content-workbench-site/

> 后续更新站点：修改后执行 `node scripts/publish-pages.mjs`（自动 rebuild、提交 main、重建 gh-pages），再推送：
> `git push origin main` 与 `git push origin gh-pages --force`（部署分支整分支替换，须 force）。

### 部署后必改项
1. 正式域名未知，canonical/sitemap 仍指向占位域名 https://www.example.com —— 上线正式域名后改 site.config.js 的 domain 并重新 npm run build + 推送两个分支；
2. 真实素材（截图/海报/折页 PDF）务必先完成“上线前复核清单”（见 README 第十节）再公开展示；
3. 表单提交接口为演示模式（未连接后端），公开后可保留或接入 /api/v1/leads。