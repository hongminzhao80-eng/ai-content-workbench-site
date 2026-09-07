// ============================================================================
// 基础模板层：URL 解析、SEO head、Header/Footer、通用组件、表单、JSON-LD
// 依赖：site.config（含表单枚举）、lib/icons.mjs
// ============================================================================
import { site, ORG_TYPES, TEAM_SIZES, NEEDS, REGIONS } from "../site.config.js";
import { icon, logoMark } from "./icons.mjs";

export { site };

// ---------- 基础工具 ----------
export const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// 将任意字符安全放进 JSON-LD/属性
const jsSafe = (s) => String(s).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

function dirSegs(url) {
  const clean = url.split("?")[0].split("#")[0];
  const parts = clean.split("/").filter(Boolean); // 去掉首尾空段
  // 目录型页面以 / 结尾；文件型如 /404.html 取目录深度
  return parts.filter((p) => !p.endsWith(".html"));
}
function stripIndex(url) {
  const clean = url.split("?")[0].split("#")[0];
  let parts = clean.split("/").filter(Boolean);
  if (parts[parts.length - 1] === "index.html") parts.pop();
  return parts;
}

// 从当前页面 URL 解析到目标绝对 URL 的相对 href
export function relTo(currentUrl, target) {
  if (!target) return target;
  if (/^(https?:)?\/\//.test(target) || target.startsWith("mailto:") || target.startsWith("tel:") || target.startsWith("javascript:")) return target;
  if (target.startsWith("#")) return target;
  const cur = dirSegs(currentUrl);
  const tgt = stripIndex(target);
  const prefix = cur.length ? "../".repeat(cur.length) : "";
  // 文件型目标（含扩展名，如 .css/.js/.webp/.pdf）不加尾部斜杠；目录型页面保留 "/"
  const last = tgt.length ? tgt[tgt.length - 1] : "";
  const isFile = /^[^/]+\.[A-Za-z0-9]+$/.test(last || "");
  const middle = tgt.length ? (isFile ? tgt.join("/") : tgt.join("/") + "/") : "";
  return prefix + middle;
}

export const assetUrl = relTo;

// ---------- JSON-LD ----------
export function jsonLdOrg() {
  return { "@context": "https://schema.org", "@type": "Organization", name: site.productName, url: site.domain + "/", description: site.heroTitle };
}
export function jsonLdBreadcrumb(items) {
  // items: [{name, url}]
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url }))
  };
}
export function jsonLdFaq(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/<[^>]*>/g, " ") }
    }))
  };
}
export function jsonLdArticle(a) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.date,
    dateModified: a.updated || a.date,
    author: { "@type": "Organization", name: site.productName },
    publisher: { "@type": "Organization", name: site.companyName }
  };
}
export function jsonLdProduct(p) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: site.productName,
    description: p,
    brand: { "@type": "Brand", name: site.productName },
    url: site.domain + "/product/"
  };
}

// ---------- SEO head ----------
// o: {url, title, description, canonical?, noindex?, ogType?, jsonLd[]}
export function seoHead(o) {
  const canonical = o.canonical || site.domain + o.url;
  const ogType = o.ogType || "website";
  const ld = o.jsonLd || [];
  const ldHtml = ld.length
    ? "\n" + ld.map((x) => '<script type="application/ld+json">' + jsSafe(JSON.stringify(x)) + "</script>").join("\n")
    : "";
  const robots = o.noindex ? "noindex, nofollow" : "index, follow";
  return (
    '<meta charset="utf-8"/>\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>\n' +
    '<meta name="generator" content="ai-content-workbench-website"/>\n' +
    '<meta name="robots" content="' + robots + '"/>\n' +
    "<title>" + esc(o.title) + "</title>\n" +
    '<meta name="description" content="' + esc(o.description) + '"/>\n' +
    '<link rel="canonical" href="' + esc(canonical) + '"/>\n' +
    '<meta property="og:type" content="' + esc(ogType) + '"/>\n' +
    '<meta property="og:site_name" content="' + esc(site.productName) + '"/>\n' +
    '<meta property="og:title" content="' + esc(o.title) + '"/>\n' +
    '<meta property="og:description" content="' + esc(o.description) + '"/>\n' +
    '<meta property="og:url" content="' + esc(canonical) + '"/>\n' +
    '<meta property="og:locale" content="zh_CN"/>\n' +
    '<meta name="theme-color" content="#0E3B2C"/>\n' +
    ldHtml
  );
}

// 内联 app 配置（表单运行时使用）
export function appConfigJson() {
  return JSON.stringify({
    productName: site.productName,
    companyName: site.companyName,
    demoMode: site.forms.demoMode,
    leadsEndpoint: site.forms.leadsEndpoint,
    partnersEndpoint: site.forms.partnersEndpoint,
    mobilePattern: site.forms.mobilePattern,
    orgTypes: ORG_TYPES,
    teamSizes: TEAM_SIZES,
    needs: NEEDS,
    regions: REGIONS,
    analytics: { enabled: site.analytics.enabled, id: site.analytics.id }
  });
}

// ---------- 品牌 ----------
function brandHtml(href) {
  return (
    '<a class="brand" href="' + href + '" aria-label="' + esc(site.productName) + ' 首页">' +
    logoMark() +
    '<span class="brand-name">' + esc(site.productName) + "</span></a>"
  );
}

// ---------- Header / 移动抽屉 ----------
function headerHtml(activeUrl) {
  const isActive = (href) => href === activeUrl || (href !== "/" && activeUrl.startsWith(href));
  const nav = site.nav
    .map((item) => {
      const href = relTo(activeUrl, item.href);
      const active = isActive(item.href);
      const cls = ["nav-item", active ? "is-current" : "", item.children ? "has-drop" : ""].filter(Boolean).join(" ");
      const drop = item.children
        ? '<ul class="drop">' +
          item.children
            .map((c) => '<li><a href="' + relTo(activeUrl, c.href) + '"' + (activeUrl === c.href ? ' aria-current="page"' : "") + ">" + esc(c.label) + "</a></li>")
            .join("") +
          "</ul>"
        : "";
      return (
        '<li class="' + cls + '"><a href="' + href + '"' + (item.children ? ' class="nav-parent"' : "") + (active && !item.children ? ' aria-current="page"' : "") + ">" +
        esc(item.label) +
        (item.children ? icon("chevronDown", "icon-sm") : "") +
        "</a>" + drop + "</li>"
      );
    })
    .join("");
  return (
    '<header class="site-header">\n' +
    '  <div class="container header-inner">\n' +
    "    " + brandHtml(relTo(activeUrl, "/")) + "\n" +
    '    <nav class="main-nav" aria-label="主导航">\n      <ul class="nav-list">' + nav + "</ul>\n    </nav>\n" +
    '    <div class="header-ctas">\n' +
    '      <a class="btn btn-outline btn-sm" href="' + relTo(activeUrl, site.headerCtas.secondary.href) + '">' + esc(site.headerCtas.secondary.label) + "</a>\n" +
    '      <a class="btn btn-primary btn-sm" href="' + relTo(activeUrl, site.headerCtas.primary.href) + '">' + esc(site.headerCtas.primary.label) + "</a>\n" +
    '      <button class="btn-icon nav-toggle" type="button" aria-label="打开菜单" aria-expanded="false" aria-controls="mobile-drawer" data-nav-toggle>' +
    icon("menu") + "</button>\n" +
    "    </div>\n  </div>\n</header>\n"
  );
}

function drawerHtml(activeUrl) {
  const isActive = (href) => href === activeUrl || (href !== "/" && activeUrl.startsWith(href));
  const nav = site.nav
    .map((item) => {
      const child = item.children
        ? '<ul class="drawer-sub">' +
          item.children.map((c) => '<li><a href="' + relTo(activeUrl, c.href) + '"' + (activeUrl === c.href ? ' aria-current="page"' : "") + ">" + esc(c.label) + "</a></li>").join("") +
          "</ul>"
        : "";
      return '<li class="' + (isActive(item.href) ? "is-current" : "") + '"><a href="' + relTo(activeUrl, item.href) + '">' + esc(item.label) + "</a>" + child + "</li>";
    })
    .join("");
  return (
    '<div class="drawer" id="mobile-drawer" data-drawer hidden>\n' +
    '  <div class="drawer-head">' + brandHtml(relTo(activeUrl, "/")) +
    '    <button class="btn-icon" type="button" data-drawer-close aria-label="关闭菜单">' + icon("close") + "</button></div>\n" +
    '  <ul class="drawer-nav">' + nav + "</ul>\n" +
    '  <div class="drawer-ctas">\n' +
    '    <a class="btn btn-primary btn-block" href="' + relTo(activeUrl, site.headerCtas.primary.href) + '">' + esc(site.headerCtas.primary.label) + "</a>\n" +
    '    <a class="btn btn-outline btn-block" href="' + relTo(activeUrl, site.headerCtas.secondary.href) + '">' + esc(site.headerCtas.secondary.label) + "</a>\n" +
    "  </div>\n</div>\n" +
    '<div class="drawer-backdrop" data-drawer-backdrop hidden></div>\n'
  );
}

// ---------- Footer ----------
function footerHtml(activeUrl) {
  const col = (title, links) =>
    '<div class="footer-col"><h3 class="footer-title">' + title + "</h3><ul>" +
    links.map((l) => '<li><a href="' + relTo(activeUrl, l.href) + '">' + esc(l.label) + "</a></li>").join("") + "</ul></div>";
  const links = {
    products: [
      { label: "产品功能总览", href: "/product/" },
      { label: "AI 文案生成", href: "/product/#feature-copywriting" },
      { label: "公众号排版", href: "/product/#feature-wechat-layout" },
      { label: "海报与折页", href: "/product/#feature-poster" }
    ],
    industries: [
      { label: "医疗 / 卫健方案", href: "/solutions/healthcare/" },
      { label: "教育方案", href: "/solutions/education/" },
      { label: "政府 / 事业单位方案", href: "/solutions/government/" },
      { label: "企业 / 连锁方案", href: "/solutions/enterprise/" }
    ],
    resources: [
      { label: "客户案例", href: "/cases/" },
      { label: "内容中心", href: "/insights/" },
      { label: "申请 7 天试用", href: "/trial/" },
      { label: "预约产品演示", href: "/demo/" },
      { label: "渠道合作", href: "/partners/" }
    ],
    company: [
      { label: "关于我们", href: "/about/" },
      { label: "隐私政策", href: "/privacy/" },
      { label: "服务条款", href: "/terms/" }
    ]
  };
  return (
    '<footer class="site-footer">\n' +
    '  <div class="container">\n' +
    '    <div class="footer-grid">\n' +
    '      <div class="footer-brand-col">\n' +
    "        " + brandHtml(relTo(activeUrl, "/")) + "\n" +
    '        <p class="footer-blurb">面向机构宣传部门的一体化AI内容创作工作台：文案、排版、海报、折页、短视频脚本与企业微信内容。</p>\n' +
    '        <ul class="footer-contact">\n' +
    '          <li>' + icon("phone", "icon-sm") + '<span>电话：' + esc(site.contact.phone) + '<!-- [上线前替换: 联系电话] --></span></li>\n' +
    '          <li>' + icon("mail", "icon-sm") + '<span>邮箱：' + esc(site.contact.email) + '<!-- [上线前替换: 联系邮箱] --></span></li>\n' +
    '          <li>' + icon("chat", "icon-sm") + '<span>' + esc(site.contact.wechat) + '<!-- [上线前替换: 微信号/企业微信] --></span></li>\n' +
    "        </ul>\n" +
    "      </div>\n" +
    "      " + col("产品功能", links.products) + "\n" +
    "      " + col("行业方案", links.industries) + "\n" +
    "      " + col("资源与支持", links.resources) + "\n" +
    "      " + col("关于与合规", links.company) + "\n" +
    "    </div>\n" +
    '    <div class="footer-legal">\n' +
    '      <p>© ' + site.copyrightYear + " " + esc(site.companyName) + ' <!-- [上线前替换: 运营主体名称] --> · ' + esc(site.productName) + "</p>\n" +
    '      <p>备案号：' + esc(site.icp) + '<!-- [上线前替换: ICP备案号] --></p>\n' +
    '      <p class="footer-note">' + esc(site.publishNote) + "</p>\n" +
    "    </div>\n  </div>\n</footer>\n"
  );
}

// ---------- 通用小组件 ----------
export function btnPrimary(label, href) {
  return '<a class="btn btn-primary" href="' + href + '">' + esc(label) + "</a>";
}
export function btnSecondary(label, href) {
  return '<a class="btn btn-outline" href="' + href + '">' + esc(label) + "</a>";
}
export function sectionHead(eyebrow, title, lead, as = "h2") {
  const t = as === "h1" ? '<h1 class="sec-title">' + esc(title) + "</h1>" : "<" + as + ' class="sec-title">' + esc(title) + "</" + as + ">";
  return (
    '<div class="sec-head">' +
    (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + "</p>" : "") +
    t +
    (lead ? '<p class="sec-lead">' + esc(lead) + "</p>" : "") +
    "</div>"
  );
}
export function tagsChips(items) {
  return '<ul class="tag-list">' + items.map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul>";
}
export function complianceNotice(c) {
  return (
    '<aside class="compliance">' +
    '<div class="compliance-ic">' + icon("shield") + "</div>" +
    '<div class="compliance-body"><h3>' + esc(c.title) + "</h3><p>" + esc(c.body) + "</p></div></aside>"
  );
}
export function faqList(items, openFirst) {
  return (
    '<div class="faq-list">' +
    items
      .map(
        (f, i) =>
          '<details class="faq-item"' + (openFirst && i === 0 ? " open" : "") + ">" +
          "<summary><span>" + esc(f.question) + "</span>" + icon("plus", "icon-faq") + "</summary>" +
          '<div class="faq-answer">' + f.answer + "</div></details>"
      )
      .join("") +
    "</div>"
  );
}

// 医疗合规提示条（医疗行业页专用，来源：需求 §7.1 / 设计 §11.2）
export function medicalComplianceBanner() {
  return (
    '<div class="medical-banner">' +
    icon("shield", "icon-sm") +
    "<span>医疗健康相关生成内容仅用于健康科普与内容创作辅助，不构成临床诊断、治疗建议或医疗广告；机构用户应确认发布主体资质并履行内容审核及发布前审查义务。</span>" +
    "</div>"
  );
}

// 结构块渲染（文章/条款/关于正文）：blocks: [{t:'p'|'h2'|'ul'|'ol'|'note'|'contact', v:string|string[]}]
export function blocksHtml(blocks) {
  const token = (s) =>
    String(s)
      .replace(/\{\{companyName\}\}/g, site.companyName)
      .replace(/\{\{phone\}\}/g, site.contact.phone)
      .replace(/\{\{email\}\}/g, site.contact.email)
      .replace(/\{\{wechat\}\}/g, site.contact.wechat)
      .replace(/\{\{icp\}\}/g, site.icp)
      .replace(/\{\{domain\}\}/g, site.domain);
  const contactHtml =
    '<ul class="contact-rows">' +
    '<li>' + icon("phone", "icon-sm") + "<span><strong>电话</strong>" + esc(site.contact.phone) + '<!-- [上线前替换: 联系电话] --></span></li>' +
    '<li>' + icon("mail", "icon-sm") + "<span><strong>邮箱</strong>" + esc(site.contact.email) + '<!-- [上线前替换: 联系邮箱] --></span></li>' +
    '<li>' + icon("chat", "icon-sm") + "<span><strong>企业微信</strong>" + esc(site.contact.wechat) + '<!-- [上线前替换: 微信号/企业微信] --></span></li>' +
    '<li>' + icon("clock", "icon-sm") + "<span><strong>服务时间</strong>工作日 9:00–18:00（节假日顺延，以运营安排为准）</span>" + "</li>" +
    "</ul>";
  return blocks
    .map((b) => {
      if (b.t === "p") return "<p>" + token(b.v) + "</p>";
      if (b.t === "h2") return "<h2>" + token(b.v) + "</h2>";
      if (b.t === "ul") return '<ul class="rich-ul">' + b.v.map((x) => "<li>" + token(x) + "</li>").join("") + "</ul>";
      if (b.t === "ol") return '<ol class="rich-ol">' + b.v.map((x) => "<li>" + token(x) + "</li>").join("") + "</ol>";
      if (b.t === "note") return '<aside class="note">' + token(b.v) + "</aside>";
      if (b.t === "contact") return contactHtml;
      return "";
    })
    .join("");
}

// ---------- 页面骨架 ----------
// o: {url, activeUrl, title, description, body, noindex?, jsonLd?, ogType?, breadcrumbs?, replaceNotes?}
export function pageShell(o) {
  const activeUrl = o.activeUrl || o.url;
  const head = seoHead({ url: o.url, title: o.title, description: o.description, noindex: o.noindex, ogType: o.ogType, jsonLd: o.jsonLd, canonical: o.canonical });
  return (
    "<!DOCTYPE html>\n" +
    '<html lang="zh-CN">\n<head>\n' + head + "\n" +
    '<link rel="stylesheet" href="' + assetUrl(activeUrl, "/styles/main.css") + '"/>\n' +
    "</head>\n<body>\n" +
    '<noscript><p class="noscript-bar">本网站的部分交互（导航菜单与申请表单）需要启用 JavaScript；也可以直接通过页脚联系方式联系我们。</p></noscript>\n' +
    '<a class="skip-link" href="#main">跳至主要内容</a>\n' +
    headerHtml(activeUrl) +
    drawerHtml(activeUrl) +
    '<div class="page"><main id="main">\n' + o.body + "\n</main></div>\n" +
    footerHtml(activeUrl) + "\n" +
    '<script type="application/json" id="app-config">' + jsSafe(appConfigJson()) + "</script>\n" +
    '<script src="' + assetUrl(activeUrl, "/js/main.js") + '" defer></script>\n' +
    "</body>\n</html>"
  );
}

export function breadcrumbNav(items) {
  // items: [{label, url}] 相对页面的绝对 URL；渲染时做相对化
  return '<nav class="breadcrumb" aria-label="面包屑"><ol>' +
    items.map((it, i) => {
      const last = i === items.length - 1;
      return "<li>" + (last ? '<span aria-current="page">' + esc(it.label) + "</span>" : '<a href="' + esc(it.url) + '">' + esc(it.label) + "</a>") + "</li>";
    }).join("") +
    "</ol></nav>";
}

// ---------- 表单字段小助手（标签/提示/必填） ----------
function fld(label, id, control, o) {
  return (
    '<div class="field' + (o.full ? " field-full" : "") + '">' +
    '<label for="' + id + '">' + esc(label) + (o.req ? '<span class="req" aria-hidden="true">*</span>' : "") + "</label>" +
    control +
    (o.hint ? '<p class="field-hint">' + esc(o.hint) + "</p>" : "") +
    "</div>"
  );
}
function inputFld(o) {
  const c =
    '<input type="' + (o.type || "text") + '" id="' + o.id + '" name="' + o.name + '"' +
    (o.req ? " required" : "") +
    (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") +
    (o.autocomplete ? ' autocomplete="' + o.autocomplete + '"' : "") +
    (o.inputmode ? ' inputmode="' + o.inputmode + '"' : "") + "/>";
  return fld(o.label, o.id, c, o);
}
function selectFld(o, options, firstLabel) {
  const optsHtml =
    '<option value="">' + esc(firstLabel || "请选择") + "</option>" +
    options.map((x) => '<option value="' + esc(x.value) + '">' + esc(x.label) + "</option>").join("");
  const c = '<select id="' + o.id + '" name="' + o.name + '"' + (o.req ? " required" : "") + ">" + optsHtml + "</select>";
  return fld(o.label, o.id, c, o);
}
function radiosFld(o, options) {
  const inner = options
    .map((x) =>
      '<label class="choice"><input type="radio" name="' + o.name + '" value="' + esc(x.value) + '"/><span>' + esc(x.label) + "</span></label>"
    )
    .join("");
  return (
    '<fieldset class="field field-full"><legend>' + esc(o.label) + '<span class="req" aria-hidden="true">*</span></legend>' +
    '<div class="choice-row">' + inner + "</div></fieldset>"
  );
}
function checksFld(o, options) {
  const inner = options
    .map((x) =>
      '<label class="choice"><input type="checkbox" name="' + o.name + '" value="' + esc(x.value) + '"/><span>' + esc(x.label) + "</span></label>"
    )
    .join("");
  return (
    '<fieldset class="field field-full"><legend>' + esc(o.label) + '<span class="req" aria-hidden="true">*</span></legend>' +
    '<div class="choice-row choice-row-checks">' + inner + "</div></fieldset>"
  );
}
function areaFld(o) {
  const c = '<textarea id="' + o.id + '" name="' + o.name + '" rows="3"' + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + "></textarea>";
  return fld(o.label, o.id, c, o);
}

// 地区选择（省/市联动，选项由 JS 从 app-config 填充）
function regionFlds(type) {
  return (
    '<div class="field field-full">' +
    '<label>' + "所在省/市" + '<span class="req" aria-hidden="true">*</span></label>' +
    '<div class="region-row">' +
    '<select id="' + type + '-province" name="province" required data-region-province aria-label="省份"><option value="">请选择省份</option></select>' +
    '<select id="' + type + '-city" name="city" required data-region-city aria-label="城市"><option value="">请选择城市</option></select>' +
    "</div></div>"
  );
}

// ---------- 线索表单（试用/演示/合作）----------
// 字段规范：需求 §9.2（试用）、§10（合作）；演示表单同试用精简 + 场景需求；设计 §6.3 payload 契约
export function leadFormHtml(activeUrl, type) {
  const privacyHref = relTo(activeUrl, "/privacy/");
  const hidden =
    '<input type="hidden" name="lead_type" value="' + type + '"/>' +
    '<input type="hidden" name="submission_id" value=""/>' +
    '<input type="hidden" name="source" value=""/>' +
    '<input type="hidden" name="utm_source" value=""/><input type="hidden" name="utm_medium" value=""/><input type="hidden" name="utm_campaign" value=""/><input type="hidden" name="utm_content" value=""/><input type="hidden" name="utm_term" value=""/>' +
    '<input type="hidden" name="landing_page" value=""/>';
  let fields = "";
  if (type === "trial") {
    fields =
      inputFld({ id: "t-org", name: "org_name", label: "机构名称", req: true, placeholder: "如：某某市第一人民医院 / 某某中学" }) +
      selectFld({ id: "t-otype", name: "org_type", label: "机构类型", req: true }, ORG_TYPES) +
      regionFlds("t") +
      inputFld({ id: "t-contact", name: "contact_name", label: "联系人", req: true, autocomplete: "name" }) +
      inputFld({ id: "t-mobile", name: "mobile", label: "手机号", req: true, type: "tel", autocomplete: "tel", inputmode: "tel", placeholder: "11 位手机号" }) +
      inputFld({ id: "t-wechat", name: "wechat", label: "微信（选填）", placeholder: "便于销售团队添加沟通" }) +
      radiosFld({ name: "team_size", label: "宣传团队人数" }, TEAM_SIZES) +
      checksFld({ name: "needs", label: "最想解决的问题（可多选）" }, NEEDS) +
      areaFld({ id: "t-msg", name: "message", label: "补充说明（选填）", placeholder: "例如：主要做公众号健康科普，想重点验证排版与海报" });
  } else if (type === "demo") {
    fields =
      inputFld({ id: "d-org", name: "org_name", label: "机构名称", req: true, placeholder: "如：某某医院宣传科 / 某某连锁品牌市场部" }) +
      selectFld({ id: "d-otype", name: "org_type", label: "机构类型", req: true }, ORG_TYPES) +
      regionFlds("d") +
      inputFld({ id: "d-contact", name: "contact_name", label: "联系人", req: true, autocomplete: "name" }) +
      inputFld({ id: "d-mobile", name: "mobile", label: "手机号", req: true, type: "tel", autocomplete: "tel", inputmode: "tel", placeholder: "11 位手机号" }) +
      inputFld({ id: "d-wechat", name: "wechat", label: "微信（选填）" }) +
      areaFld({ id: "d-msg", name: "message", label: "想重点了解的场景（选填）", placeholder: "例如：医院健康科普推文 + 海报；或连锁门店多主体企微发送" });
  } else {
    fields =
      inputFld({ id: "p-org", name: "org_name", label: "公司名称", req: true, placeholder: "公司全称" }) +
      regionFlds("p") +
      inputFld({ id: "p-contact", name: "contact_name", label: "联系人", req: true, autocomplete: "name" }) +
      inputFld({ id: "p-mobile", name: "mobile", label: "手机号", req: true, type: "tel", autocomplete: "tel", inputmode: "tel", placeholder: "11 位手机号" }) +
      inputFld({ id: "p-business", name: "business", label: "主营业务", req: true, placeholder: "如：区域软件代理 / 信息化集成 / 广告设计" }) +
      selectFld({ id: "p-coverage", name: "coverage", label: "覆盖行业（选填）" }, ORG_TYPES) +
      selectFld({ id: "p-clients", name: "client_resources", label: "客户资源情况（选填）" }, [
        { value: "hospital", label: "医院/医疗机构客户资源" },
        { value: "education", label: "学校/教育机构客户资源" },
        { value: "government", label: "政府/事业单位客户资源" },
        { value: "enterprise", label: "企业/连锁客户资源" },
        { value: "channel", label: "信息化项目/渠道资源" },
        { value: "other", label: "其他" }
      ]) +
      areaFld({ id: "p-msg", name: "message", label: "合作意向与资源说明（选填）", placeholder: "例：可覆盖 XX 省内医院客户，希望了解区域代理政策" });
  }
  const submitLabel = type === "trial" ? "提交试用申请" : type === "demo" ? "预约演示" : "提交合作申请";
  return (
    '<form class="lead-form" data-lead-form data-type="' + type + '" novalidate>' +
    hidden +
    '<div class="form-grid">' + fields + "</div>" +
    '<p class="form-privacy">' +
    '<label class="choice"><input type="checkbox" name="privacy" required/><span>我已阅读并同意 <a href="' + privacyHref + '" target="_blank" rel="noopener">《隐私政策》</a>，同意运营方为跟进试用/演示/合作事宜联系我。</span></label>' +
    "</p>" +
    '<div class="form-error" role="alert" data-form-error hidden></div>' +
    '<div class="form-actions">' +
    '<button type="submit" class="btn btn-primary btn-lg btn-block" data-form-submit>' + submitLabel + "</button>" +
    '<p class="form-note">提交即代表同意隐私政策；信息仅用于销售跟进，不对外出售。</p>' +
    "</div></form>"
  );
}

// ---------- 页尾 CTA 带（需求附录A6；o.primary/secondary 为已相对化的 href） ----------
export function ctaBandHtml(o) {
  return (
    '<section class="cta-band" aria-labelledby="cta-band-title"><div class="container cta-band-inner">' +
    '<div class="cta-band-copy"><h2 id="cta-band-title">' + esc(o.heading) + "</h2>" +
    (o.note ? "<p>" + esc(o.note) + "</p>" : "") + "</div>" +
    '<div class="cta-band-actions">' +
    '<a class="btn btn-primary btn-lg" href="' + o.primary.href + '">' + esc(o.primary.label) + "</a>" +
    (o.secondary ? '<a class="btn btn-outline-invert btn-lg" href="' + o.secondary.href + '">' + esc(o.secondary.label) + "</a>" : "") +
    "</div></div></section>"
  );
}

// ---------- 产品窗口示意（首页 Hero；真实截图缺失时使用，标注上线前替换） ----------
export function heroUiMock(media) {
  const nav = media.nav.map((n, i) => "<li" + (i === 0 ? ' class="is-on"' : "") + ">" + icon(i === 0 ? "pen" : "dot", "icon-sm") + "<span>" + esc(n) + "</span></li>").join("");
  const outputs = media.body.outputs.map((x) => "<li>" + icon("check", "icon-sm") + "<span>" + esc(x) + "</span></li>").join("");
  return (
    '<figure class="ui-mock" role="img" aria-label="工作台界面示意：输入宣传主题后，AI生成文案、排版与物料建议">' +
    '<div class="ui-mock-bar"><span class="mock-dot mock-dot-r"></span><span class="mock-dot mock-dot-y"></span><span class="mock-dot mock-dot-g"></span>' +
    '<span class="ui-mock-title">' + esc(media.windowTitle) + "</span></div>" +
    '<div class="ui-mock-body">' +
    '<ul class="ui-mock-nav" aria-hidden="true">' + nav + "</ul>" +
    '<div class="ui-mock-main">' +
    '<p class="ui-mock-field">' + esc(media.body.fieldLabel) + "</p>" +
    '<p class="ui-mock-input">' + esc(media.body.fieldValue) + "</p>" +
    '<p class="ui-mock-out">' + esc(media.body.outputLabel) + "</p>" +
    '<ul class="ui-mock-list">' + outputs + "</ul>" +
    "</div></div>" +
    '<figcaption class="mock-note">示意界面 · 上线前替换为脱敏产品截图</figcaption>' +
    "</figure>"
  );
}

// ---------- 演示视频占位（点击播放；content 提供 v.src 后将加载真实视频文件） ----------
export function videoPlaceholderHtml(v) {
  return (
    '<div class="video-frame" data-video-frame' + (v.src ? ' data-video-src="' + esc(v.src) + '"' : "") + ">" +
    '<button type="button" class="video-poster" data-video-play aria-label="播放演示视频：' + esc(v.label) + '">' +
    '<span class="video-play-ic">' + icon("play") + "</span>" +
    '<span class="video-copy"><strong>' + esc(v.label) + "</strong>" +
    (v.durationNote ? "<em>" + esc(v.durationNote) + "</em>" : "") +
    "</span></button>" +
    '<div class="video-player" hidden data-video-player>' +
    "<p>演示视频尚未接入。</p>" +
    '<p class="mock-note">演示视频占位 · 上线前替换为 30–60 秒脱敏实机录屏（在 content/home.js 的 demo.video.src 填入视频地址）</p>' +
    "</div></div>"
  );
}

// ---------- 步骤条（试用/演示流程等 num 列表） ----------
export function stepsList(steps, tone) {
  // tone: "dark"|"light"
  return (
    '<ol class="steps steps-' + (tone || "dark") + '">' +
    steps.map((s) => '<li><span class="step-no">' + esc(s.num) + '</span><div><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></div></li>').join('') +
    "</ol>"
  );
}

