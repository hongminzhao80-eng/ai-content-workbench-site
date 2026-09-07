// ============================================================================
// 页面组装层：读取 content/* 数据，输出每个页面的 {url, file, html}
// 全部内链使用相对地址（relTo），产物可直接部署于任意路径。
// ============================================================================
import { site, esc } from "./templates.mjs";
import { relTo } from "./templates.mjs";
import { icon } from "./icons.mjs";
import { pageShell, sectionHead, tagsChips, faqList, medicalComplianceBanner, complianceNotice, blocksHtml, leadFormHtml, ctaBandHtml, heroUiMock, videoPlaceholderHtml, stepsList } from "./templates.mjs";
import { jsonLdOrg, jsonLdProduct, jsonLdFaq, jsonLdBreadcrumb, jsonLdArticle } from "./templates.mjs";
import { home } from "../content/home.js";
import { product } from "../content/product.js";
import { industries, industryOrder } from "../content/industries.js";
import { cases } from "../content/cases.js";
import { articles, categories, categoryOrder } from "../content/insights.js";
import { faqs, homeFaqIds } from "../content/faqs.js";
import { about, privacy, terms } from "../content/legal.js";
import { trialPage, demoPage, partnersPage } from "../content/landing.js";

// ---------- 小工具 ----------
const faqByIds = (ids) => ids.map((id) => faqs.find((f) => f.id === id)).filter(Boolean);
const caseById = (id) => cases.find((c) => c.id === id);
const articleBySlug = (slug) => articles.find((a) => a.slug === slug);
const catLabel = (id) => (categories.find((c) => c.id === id) || {}).label || id;
const industry = (slug) => industries[slug];

const trialHref = (u) => relTo(u, "/trial/");
const demoHref = (u) => relTo(u, "/demo/");
const partnerHref = (u) => relTo(u, "/partners/");

function crumbs(activeUrl, items) {
  // items: [{label, url(绝对站点路径)}]；末项为当前页
  return (
    '<nav class="breadcrumb" aria-label="面包屑"><ol>' +
    items
      .map((it, i) => {
        const last = i === items.length - 1;
        const h = relTo(activeUrl, it.url);
        return (
          "<li>" +
          (last
            ? '<span aria-current="page">' + esc(it.label) + "</span>"
            : '<a href="' + h + '">' + esc(it.label) + "</a>") +
          "</li>"
        );
      })
      .join("") +
    "</ol></nav>"
  );
}

function band(activeUrl, o) {
  return ctaBandHtml({
    heading: o.heading,
    note: o.note || "",
    primary: { label: o.primaryLabel || site.headerCtas.primary.label, href: o.primaryHref || trialHref(activeUrl) },
    secondary: o.secondaryHref ? { label: o.secondaryLabel || site.headerCtas.secondary.label, href: o.secondaryHref } : null
  });
}

function cardIconChip(name) {
  return '<span class="ic-chip" aria-hidden="true">' + icon(name) + "</span>";
}

function caseCard(c, activeUrl) {
  return (
    '<article class="case-card"><a class="case-card-link" href="' + relTo(activeUrl, "/cases/" + c.slug + "/") + '">' +
    '<div class="case-card-top">' +
    '<span class="chip chip-type">' + esc(c.typeLabel) + "</span>" +
    (c.demo ? '<span class="chip chip-demo">演示场景</span>' : "") +
    (c.anonymous ? '<span class="chip chip-anon">信息脱敏</span>' : "") +
    "</div>" +
    '<h3 class="case-card-title">' + esc(c.title) + "</h3>" +
    "<p>" + esc(c.summary) + "</p>" +
    '<span class="link-more">查看案例详情' + icon("arrowRight", "icon-sm") + "</span>" +
    "</a></article>"
  );
}

function articleCard(a, activeUrl) {
  return (
    '<article class="article-card"><a href="' + relTo(activeUrl, "/insights/" + a.slug + "/") + '">' +
    '<div class="article-card-meta"><span class="chip chip-cat">' + esc(catLabel(a.category)) + "</span>" +
    '<time datetime="' + esc(a.date) + '">' + esc(a.date) + "</time></div>" +
    "<h3>" + esc(a.title) + "</h3>" +
    "<p>" + esc(a.excerpt) + "</p>" +
    '<span class="link-more">阅读全文' + icon("arrowRight", "icon-sm") + "</span>" +
    "</a></article>"
  );
}


function heroShotHtml(media, u) {
  return (
    '<figure class="shot-hero">' +
    '<img src="' + relTo(u, media.src) + '" alt="' + esc(media.alt) + '" loading="eager"/>' +
    (media.caption ? '<figcaption class="mock-note">' + esc(media.caption) + "</figcaption>" : "") +
    "</figure>"
  );
}

function fileRowHtml(f, u) {
  return (
    "<li>" + icon("download", "icon-sm") +
    '<div><a href="' + relTo(u, f.href) + '" download>' + esc(f.label) + "</a><em>" + esc(f.note) + "</em></div></li>"
  );
}
// ---------- 首页 ----------
function buildHome() {
  const u = "/";
  const selected = faqByIds(homeFaqIds);
  const jsonLd = [jsonLdOrg(), jsonLdFaq(selected)];
  const hero = home.hero;
  const body =
    '<!-- ======== 首页（依据需求 §5.2 模块顺序 / 附录A 文案骨架） ======== -->\n' +
    '<section class="hero">\n<div class="container hero-grid">\n' +
    '<div class="hero-copy">\n' +
    '<p class="hero-kicker">' + esc(hero.kicker) + "</p>\n" +
    '<h1 class="hero-h1">' + esc(site.heroTitle) + "</h1>\n" +
    '<p class="hero-sub">' + esc(site.heroSubtitle) + "</p>\n" +
    '<div class="hero-tags">' + tagsChips(site.heroTags) + "</div>\n" +
    '<div class="hero-ctas">' +
    '<a class="btn btn-primary btn-lg" href="' + trialHref(u) + '">' + esc(site.headerCtas.primary.label) + "</a>" +
    '<a class="btn btn-outline btn-lg" href="' + demoHref(u) + '">' + esc(site.headerCtas.secondary.label) + "</a>" +
    "</div>\n</div>\n" +
    '<div class="hero-media">' + (hero.media && hero.media.kind === "shot" ? heroShotHtml(hero.media, u) : heroUiMock(hero.media)) + "</div>\n" +
    "</div>\n</section>\n" +

    // 02 痛点
    '<section class="section" aria-labelledby="pain-title">\n<div class="container">\n' +
    sectionHead(home.pain.eyebrow, home.pain.heading, null, "h2").replace('class="sec-title"', 'id="pain-title" class="sec-title"') +
    '<div class="grid grid-4">' +
    home.pain.items.map((p) => '<div class="p-card">' + cardIconChip(p.icon) + "<h3>" + esc(p.title) + "</h3><p>" + esc(p.desc) + "</p></div>").join("") +
    "</div>\n</div>\n</section>\n" +

    // 03 工作流
    '<section class="section section-dark" aria-labelledby="flow-title">\n<div class="container">\n' +
    sectionHead(home.workflow.eyebrow, home.workflow.heading, home.workflow.lead, "h2").replace('class="sec-title"', 'id="flow-title" class="sec-title"') +
    '<ol class="flow">' +
    home.workflow.steps
      .map(
        (s, i) =>
          '<li><span class="flow-no">' + String(i + 1).padStart(2, "0") + "</span>" + cardIconChip(s.icon) +
          "<h3>" + esc(s.title) + "</h3><p>" + esc(s.desc) + "</p></li>"
      )
      .join("") +
    "</ol>\n" +
    '<div class="center mt-4"><a class="btn btn-primary" href="' + relTo(u, "/product/") + '">查看完整产品功能</a></div>\n' +
    "</div>\n</section>\n" +

    // 04 核心功能
    '<section class="section" aria-labelledby="feat-title">\n<div class="container">\n' +
    sectionHead(home.features.eyebrow, home.features.heading, home.features.lead, "h2").replace('class="sec-title"', 'id="feat-title" class="sec-title"') +
    '<div class="grid grid-3">' +
    home.features.items
      .map((f) => {
        const href = f.href.startsWith("#") ? f.href : relTo(u, f.href);
        return (
          '<a class="f-card" href="' + href + '">' + cardIconChip(f.icon) +
          "<h3>" + esc(f.title) + "</h3><p>" + esc(f.desc) + "</p>" +
          '<span class="link-more">功能详情' + icon("arrowRight", "icon-sm") + "</span></a>"
        );
      })
      .join("") +
    "</div>\n</div>\n</section>\n" +

    // 05 行业
    '<section class="section section-tint" aria-labelledby="ind-title">\n<div class="container">\n' +
    sectionHead(home.industries.eyebrow, home.industries.heading, home.industries.lead, "h2").replace('class="sec-title"', 'id="ind-title" class="sec-title"') +
    '<div class="grid grid-4">' +
    home.industries.items
      .map(
        (it) =>
          '<a class="i-card" href="' + relTo(u, it.href) + '">' + cardIconChip(it.icon) +
          "<h3>" + esc(it.title) + "</h3><p>" + esc(it.desc) + "</p>" +
          '<ul class="tag-list">' + it.tags.map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul>" +
          '<span class="link-more">进入行业方案' + icon("arrowRight", "icon-sm") + "</span></a>"
      )
      .join("") +
    "</div>\n</div>\n</section>\n" +

    // 06 部署与数据
    '<section class="section" aria-labelledby="trust-title">\n<div class="container trust-grid">\n' +
    '<div class="trust-copy">\n' +
    sectionHead(home.trust.eyebrow, home.trust.heading, home.trust.lead, "h2").replace('class="sec-title"', 'id="trust-title" class="sec-title"') +
    '<ul class="trust-list">' +
    home.trust.points
      .map((p) => "<li>" + cardIconChip(p.icon) + "<div><h3>" + esc(p.title) + "</h3><p>" + esc(p.desc) + "</p></div></li>")
      .join("") +
    "</ul>\n" +
    '<div class="hero-ctas">' +
    '<a class="btn btn-outline" href="' + demoHref(u) + '">' + esc(home.trust.ctaLabel) + "</a>" +
    '<a class="btn btn-link" href="#faq">' + esc(home.trust.faqCtaLabel) + icon("chevronDown", "icon-sm") + "</a>" +
    "</div>\n</div>\n" +
    '<aside class="trust-panel">' +
    '<h3>数据与交付边界（公开口径）</h3><ul>' +
    "<li>内容与素材归档在机构自有环境，支持本地部署；</li>" +
    "<li>平台生成内容供机构在自身流程中使用，发布审核由机构完成；</li>" +
    "<li>试用开通、授权与交付按内部流程执行，官网不自动签发授权。</li>" +
    "</ul></aside>\n</div>\n</section>\n" +

    // 07 实机演示与真实产出（截图/成品来自真实产品，标注上线前复核）
    '<section class="section section-tint" aria-labelledby="demo-title">\n<div class="container">\n' +
    sectionHead(home.demo.eyebrow, home.demo.heading, null, "h2").replace('class="sec-title"', 'id="demo-title" class="sec-title"') +
    '<div class="demo-show-grid">\n' +
    '<div class="demo-copy">\n' +
    '<p class="sec-lead">' + esc(home.demo.lead) + "</p>\n" +
    '<div class="hero-ctas">' +
    '<a class="btn btn-primary" href="' + demoHref(u) + '">预约产品演示</a> ' +
    '<a class="btn btn-outline" href="' + relTo(u, "/product/") + '">' + esc(home.demo.screenshot.ctaLabel) + "</a>" +
    "</div>\n</div>\n" +
    '<div class="demo-shot">' + heroShotHtml(home.demo.screenshot, u) + "</div>\n" +
    "</div>\n" +
    '<div class="demo-outputs">\n' +
    "<h3>" + esc(home.demo.outputs.title) + "</h3>\n" +
    "<p>" + esc(home.demo.outputs.note) + "</p>\n" +
    '<div class="grid grid-4">' +
    home.demo.outputs.posters
      .map(
        (pp) =>
          '<figure class="poster-card"><img src="' + relTo(u, pp.src) + '" alt="' + esc(pp.alt) + '" loading="lazy"/>' +
          "<figcaption><strong>" + esc(pp.title) + "</strong></figcaption></figure>"
      )
      .join("") +
    "</div>\n" +
    '<ul class="file-list">' + home.demo.outputs.files.map((f) => fileRowHtml(f, u)).join("") + "</ul>\n" +
    '<p class="mock-note">以上为真实产品界面与真实生成成品（演示示例），上线前由业务复核；医疗健康内容发布前须经机构审核。</p>\n' +
    "</div>\n</div>\n</section>\n" +
    // 08 案例
    '<section class="section" aria-labelledby="case-title">\n<div class="container">\n' +
    sectionHead(home.cases.eyebrow, home.cases.heading, home.cases.lead, "h2").replace('class="sec-title"', 'id="case-title" class="sec-title"') +
    '<div class="grid grid-3">' +
    home.cases.featuredIds.map((id) => caseCard(caseById(id), u)).join("") +
    "</div>\n" +
    '<div class="center mt-4"><a class="btn btn-outline" href="' + relTo(u, "/cases/") + '">' + esc(home.cases.ctaLabel) + "</a></div>\n" +
    "</div>\n</section>\n" +

    // 09 试用转化
    '<section class="section section-tint" aria-labelledby="trial-title">\n<div class="container split">\n' +
    '<div>\n' +
    sectionHead(home.trial.eyebrow, home.trial.heading, home.trial.lead, "h2").replace('class="sec-title"', 'id="trial-title" class="sec-title"') +
    "</div>\n" + '<div class="split-cta">' +
    '<a class="btn btn-primary btn-lg" href="' + trialHref(u) + '">' + esc(site.headerCtas.primary.label) + "</a>\n" +
    '<a class="btn btn-outline btn-lg" href="' + demoHref(u) + '">' + esc(site.headerCtas.secondary.label) + "</a>\n" +
    "</div>\n</div>\n</section>\n" +

    // 10 FAQ / 合规
    '<section class="section" id="faq" aria-labelledby="faq-title">\n<div class="container container-narrow">\n' +
    sectionHead(home.faq.eyebrow, home.faq.heading, null, "h2").replace('class="sec-title"', 'id="faq-title" class="sec-title"') +
    faqList(selected) +
    '<p class="faq-more">更多问题，可在 <a href="' + demoHref(u) + '">预约产品演示</a> 时直接提问。</p>\n' +
    '<p class="compliance-line">' + esc(home.faq.complianceLine) + "</p>\n" +
    "</div>\n</section>\n";

  const bandHtml = band(u, { heading: home.bottomCta.heading, note: home.bottomCta.note });
  const html = pageShell({ url: u, activeUrl: u, title: home.seo.title, description: home.seo.description, body: body + bandHtml, jsonLd, ogType: "website" });
  return { url: u, file: "index.html", html };
}

// ---------- 产品功能页 ----------
function buildProduct() {
  const u = "/product/";
  const jsonLd = [jsonLdOrg(), jsonLdProduct(product.hero.lead)];
  const anchors = product.anchorTitles
    .map((a) => '<a class="chip chip-anchor" href="#' + a.id + '">' + esc(a.label) + "</a>")
    .join("");
  const feats = product.features
    .map((f) => {
      const d = f.demo;
      const shotHtml = f.shot
        ? '<figure class="product-shot"><img src="' + relTo(u, f.shot.src) + '" alt="' + esc(f.shot.alt) + '" loading="lazy"/>' +
          '<figcaption class="mock-note">' + esc(f.shot.caption || "真实产品界面（示例）") + "</figcaption></figure>\n"
        : "";
      const fileHtml = f.file
        ? '<p class="feature-file"><a class="btn btn-outline btn-sm" href="' + relTo(u, f.file.href) + '" download>' + esc(f.file.label) + "</a><em>" + esc(f.file.note) + "</em></p>\n"
        : "";
      return (
        '<section class="feature" id="' + f.id + '">\n' +
        '<div class="feature-head">\n<span class="feature-num">' + esc(f.num) + "</span>\n" +
        "<div><h2>" + esc(f.title) + "</h2>" + '<p class="feature-sum">' + esc(f.summary) + "</p></div>\n" +
        "</div>\n" +
        '<div class="demo-boxes">\n' +
        '<div class="demo-box demo-in"><h3>' + esc(d.inputLabel || "输入什么（示例）") + "</h3><p>" + esc(d.input) + "</p></div>\n" +
        '<div class="demo-arrow" aria-hidden="true">' + icon("arrowRight") + "</div>\n" +
        '<div class="demo-box demo-proc"><h3>' + esc(d.processLabel || "系统做什么") + "</h3><ul>" +
        d.process.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul></div>\n" +
        '<div class="demo-arrow" aria-hidden="true">' + icon("arrowRight") + "</div>\n" +
        '<div class="demo-box demo-out"><h3>' + esc(d.outputLabel || "得到什么（示意）") + "</h3><ul>" +
        d.output.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul></div>\n" +
        "</div>\n" +
        shotHtml + fileHtml +
        '<div class="feature-meta">\n' +
        (f.scenarios ? '<div class="meta-row"><h4>适用场景</h4><ul class="tag-list">' + f.scenarios.map((s2) => "<li>" + esc(s2) + "</li>").join("") + "</ul></div>" : "") +
        (f.note ? '<p class="feature-note">' + esc(f.note) + "</p>" : "") +
        '<div class="meta-cta"><a class="btn btn-outline" href="' + relTo(u, f.cta.href) + '">' + esc(f.cta.label) + "</a></div>\n" +
        "</div>\n</section>\n"
      );
    })
    .join("");


  const body =
    '<section class="hero hero-inner">\n<div class="container">\n' +
    '<p class="hero-kicker">' + esc(product.hero.eyebrow) + "</p>\n" +
    '<h1 class="hero-h1">产品功能</h1>\n' +
    '<p class="hero-sub hero-slogan">' + esc(product.hero.heading) + "</p>\n" +
    '<p class="hero-sub">' + esc(product.hero.lead) + "</p>\n" +
    "</div>\n</section>\n" +
    '<section class="section section-anchors">\n<div class="container"><nav class="anchor-row" aria-label="功能目录">' + anchors + "</nav></div>\n</section>\n" +
    '<section class="section">\n<div class="container">\n' +
    sectionHead(product.overview.kicker, product.overview.title, product.overview.lead, "h2") +
    '<div class="matrix">' +
    product.overview.matrix.map((m) => '<div class="matrix-item">' + cardIconChip(m.icon) + "<span>" + esc(m.label) + "</span></div>").join("") +
    "</div>\n</div>\n</section>\n" +
    '<div class="mid-cta">\n<div class="container mid-cta-inner">' +
    "<p>" + esc(product.ctaBand.heading) + "</p>" +
    '<a class="btn btn-primary" href="' + trialHref(u) + '">' + esc(site.headerCtas.primary.label) + "</a> " +
    '<a class="btn btn-outline" href="' + demoHref(u) + '">' + esc(site.headerCtas.secondary.label) + "</a>" +
    "</div></div>\n" +
    '<div class="feature-list">' + feats + "</div>\n";

  const bandHtml = band(u, {
    heading: product.ctaBand.heading,
    note: product.ctaBand.lead,
    primaryHref: trialHref(u),
    secondaryHref: demoHref(u)
  });
  const html = pageShell({
    url: u, activeUrl: u, title: product.seo.title, description: product.seo.description,
    body: body + bandHtml, jsonLd, ogType: "website"
  });
  return { url: u, file: "product/index.html", html };
}

// ---------- 行业方案页 ----------
function buildIndustry(slug) {
  const ind = industry(slug);
  if (!ind) return null;
  const u = "/solutions/" + slug + "/";
  const jsonLd = [jsonLdOrg()];
  const caseItem = cases.find((c) => c.industry === slug);
  const related = industryOrder.filter((s) => s !== slug);
  const sec = [];
  sec.push(
    '<section class="hero hero-inner">\n<div class="container">\n' +
    crumbs(u, [{ label: "首页", url: "/" }, { label: ind.navLabel + "方案", url: u }]) +
    '<p class="hero-kicker">' + esc(ind.hero.eyebrow) + "</p>\n" +
    '<h1 class="hero-h1">' + esc(ind.hero.heading) + "</h1>\n" +
    '<p class="hero-sub">' + esc(ind.hero.lead) + "</p>\n" +
    '<div class="hero-ctas">' +
    '<a class="btn btn-primary btn-lg" href="' + relTo(u, ind.cta.href || "/trial/") + '">' + esc(ind.cta.label) + "</a> " +
    '<a class="btn btn-outline btn-lg" href="' + demoHref(u) + '">' + esc(ind.cta.secondaryLabel) + "</a>" +
    "</div>\n</div>\n</section>\n" +
    (ind.compliance ? complianceNotice(ind.compliance) : "")
  );
  if (ind.positioning) {
    sec.push(
      '<section class="section">\n<div class="container container-narrow">\n' +
      '<p class="lead-para">' + esc(ind.positioning) + "</p>\n" +
      "</div>\n</section>\n"
    );
  }
  sec.push(
    '<section class="section section-tint" aria-labelledby="t-' + slug + '">\n<div class="container">\n' +
    sectionHead("典型宣传任务", slug === "healthcare" ? "医疗 / 卫健的高频宣传任务" : "这些高频任务，最先适合上工作台", null, "h2").replace('class="sec-title"', 'id="t-' + slug + '" class="sec-title"') +
    '<div class="grid grid-5">' +
    ind.tasks.map((t) => '<div class="p-card">' + cardIconChip(t.icon) + "<h3>" + esc(t.title) + "</h3><p>" + esc(t.desc) + "</p></div>").join("") +
    "</div>\n</div>\n</section>\n"
  );
  sec.push(
    '<section class="section">\n<div class="container">\n' +
    sectionHead("价值重点", "这个场景下，工作台主要解决什么", null, "h2") +
    '<div class="grid grid-3">' +
    ind.value.map((v) => '<div class="p-card p-card-big">' + cardIconChip(v.icon) + "<h3>" + esc(v.title) + "</h3><p>" + esc(v.desc) + "</p></div>").join("") +
    "</div>\n</div>\n</section>\n"
  );
  if (ind.compliance) {
    sec.push(
      '<section class="section section-tint">\n<div class="container container-narrow">\n' +
      sectionHead("合规边界", "医疗健康内容的公开口径", null, "h2") +
      complianceNotice(ind.compliance) +
      '<p class="muted small">页面与物料涉及医疗健康内容时，请一并遵守上述边界。更多说明见 <a href="' + relTo(u, '/privacy/') + '">隐私政策</a> 与 <a href="' + relTo(u, '/terms/') + '">服务条款</a>。</p>\n' +
      "</div>\n</section>\n"
    );
  }
  if (caseItem) {
    sec.push(
      '<section class="section section-tint">\n<div class="container">\n' +
      sectionHead("相关案例", "演示场景示例", null, "h2") +
      '<div class="grid grid-3">' + caseCard(caseItem, u) + "</div>\n" +
      "</div>\n</section>\n"
    );
  }
  sec.push(
    '<section class="section">\n<div class="container">\n' +
    sectionHead("其他行业方案", "查看其他机构的落地方式", null, "h2") +
    '<nav class="chip-nav" aria-label="行业方案切换">' +
    related.map((s) => '<a class="chip chip-navlink" href="' + relTo(u, "/solutions/" + s + "/") + '">' + esc(industry(s).navLabel) + "方案</a>").join("") +
    "</nav>\n</div>\n</section>\n"
  );
  const body = sec.join("");
  const bandHtml = band(u, {
    heading: "想看看这个行业场景在真实任务里怎么跑？",
    note: "预约一场针对您机构类型的在线演示，现场验证后再决定。",
    primaryLabel: ind.cta.label,
    secondaryHref: demoHref(u),
    secondaryLabel: "预约演示"
  });
  const html = pageShell({ url: u, activeUrl: u, title: ind.seo.title, description: ind.seo.description, body: body + bandHtml, jsonLd });
  return { url: u, file: "solutions/" + slug + "/index.html", html };
}

// ---------- 案例列表 / 详情 ----------
function buildCaseList() {
  const u = "/cases/";
  const jsonLd = [jsonLdOrg()];
  const body =
    '<section class="hero hero-inner">\n<div class="container">\n' +
    crumbs(u, [{ label: "首页", url: "/" }, { label: "客户案例", url: u }]) +
    '<p class="hero-kicker">客户案例</p>\n' +
    '<h1 class="hero-h1">客户案例</h1>\n' +
    '<p class="hero-sub">按“客户类型、原始问题、使用模块、实施方式、成果证据”组织案例（需求 §8.1）。当前页面为演示场景案例（信息脱敏）；正式客户案例需获得授权后公示。</p>\n' +
    "</div>\n</section>\n" +
    '<section class="section">\n<div class="container">\n' +
    '<div class="grid grid-2">' +
    cases.map((c) => caseCard(c, u)).join("") +
    "</div>\n" +
    '<p class="compliance-line mt-4">所有量化成果需可回溯到客户记录或实测数据；本页演示场景不包含无法核验的数字表述。</p>\n' +
    "</div>\n</section>\n";
  const bandHtml = band(u, {
    heading: "还没有您想看的场景？",
    note: "预约一场针对您机构任务的演示，看完再决定是否试用。",
    secondaryHref: trialHref(u),
    secondaryLabel: site.headerCtas.primary.label
  });
  const html = pageShell({ url: u, activeUrl: u, title: "客户案例_AI内容创作工作台", description: "查看AI内容创作工作台在不同机构场景中的应用案例：医院科普、学校招生、政务社区、连锁门店等（演示场景，信息脱敏）。", body: body + bandHtml, jsonLd });
  return { url: u, file: "cases/index.html", html };
}

function showcaseTile(s) {
  const iconNames = { layout: "layout", image: "image", doc: "doc", send: "send", archive: "archive", video: "video" };
  return (
    '<figure class="showcase-tile">' +
    '<span class="showcase-ic">' + icon(iconNames[s.kind] || "image") + "</span>" +
    "<figcaption><strong>" + esc(s.label) + "</strong><em>" + esc(s.note) + "</em></figcaption>" +
    "</figure>"
  );
}

function buildCaseDetail(c) {
  const u = "/cases/" + c.slug + "/";
  const jsonLd = [jsonLdOrg()];
  const body =
    '<section class="hero hero-inner">\n<div class="container">\n' +
    crumbs(u, [{ label: "首页", url: "/" }, { label: "客户案例", url: "/cases/" }, { label: c.title, url: u }]) +
    '<div class="case-top-chips">' +
    '<span class="chip chip-type">' + esc(c.typeLabel) + "</span>" +
    (c.demo ? '<span class="chip chip-demo">演示场景</span>' : "") +
    (c.anonymous ? '<span class="chip chip-anon">客户信息脱敏</span>' : "") +
    "</div>\n" +
    '<h1 class="hero-h1">' + esc(c.title) + "</h1>\n" +
    '<p class="hero-sub">' + esc(c.summary) + "</p>\n" +
    "</div>\n</section>\n" +
    (c.industry === "healthcare" ? medicalComplianceBanner() : "") +
    '<section class="section">\n<div class="container container-narrow">\n' +
    '<div class="case-section"><h2>原始问题</h2><ol class="rich-ol">' +
    c.problem.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ol></div>\n" +
    '<div class="case-section"><h2>使用模块</h2><ul class="tag-list">' +
    c.modules.map((m) => "<li>" + icon(m.icon === "pen" ? "pen" : m.icon, "icon-sm") + " " + esc(m.label) + "</li>").join("") + "</ul></div>\n" +
    '<div class="case-section"><h2>实施方式</h2><ol class="rich-ol">' +
    c.approach.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ol></div>\n" +
    '<div class="case-section"><h2>成果证据</h2><ul class="check-list">' +
    c.results.map((x) => "<li>" + icon("check", "icon-sm") + "<span>" + esc(x) + "</span></li>").join("") + "</ul></div>\n" +
        (c.outputs && c.outputs.length
      ? '<div class="case-section"><h2>真实产出示例</h2><div class="grid grid-2">' +
        c.outputs
          .map((o) =>
            o.kind === "img"
              ? '<figure class="poster-card poster-card-sm"><img src="' + relTo(u, o.src) + '" alt="' + esc(o.alt) + '" loading="lazy"/><figcaption><strong>' + esc(o.label) + "</strong><em>" + esc(o.note) + "</em></figcaption></figure>"
              : '<figure class="file-card">' + icon("doc", "icon-sm") + '<div><a href="' + relTo(u, o.href) + '" download>' + esc(o.label) + "</a><em>" + esc(o.note) + "</em></div></figure>"
          )
          .join("") +
        "</div></div>\n"
      : "") +
    '<div class="case-section"><h2>界面与成品</h2><div class="grid grid-3">' +
    c.showcase.map(showcaseTile).join("") + "</div></div>\n" +

    '<p class="case-cta">' + esc(c.ctaNote) + "</p>\n" +
    '<div class="hero-ctas">' +
    '<a class="btn btn-primary" href="' + demoHref(u) + '">预约同类场景演示</a> ' +
    '<a class="btn btn-outline" href="' + relTo(u, "/cases/") + '">返回案例列表</a>' +
    "</div>\n</div>\n</section>\n";
  const html = pageShell({
    url: u, activeUrl: u, title: c.title + "_客户案例_AI内容创作工作台",
    description: (c.summary || c.title).slice(0, 150), body, jsonLd, ogType: "article"
  });
  return { url: u, file: "cases/" + c.slug + "/index.html", html };
}

// ---------- 试用 / 演示 / 合作 转化页 ----------
function buildTrial() {
  const u = "/trial/";
  const jsonLd = [jsonLdOrg(), jsonLdFaq(faqByIds(trialPage.faqIds))];
  const body =
    '<section class="hero hero-inner hero-split">\n<div class="container form-page-grid">\n' +
    '<div>\n' +
    crumbs(u, [{ label: "首页", url: "/" }, { label: "申请 7 天试用", url: u }]) +
    '<p class="hero-kicker">' + esc(trialPage.hero.eyebrow) + "</p>\n" +
    '<h1 class="hero-h1">' + esc(trialPage.hero.heading) + "</h1>\n" +
    '<p class="hero-sub">' + esc(trialPage.hero.lead) + "</p>\n" +
    stepsList(trialPage.steps) +
    '<ul class="note-list">' +
    trialPage.notes.map((n) => "<li>" + icon("info", "icon-sm") + "<span>" + esc(n) + "</span></li>").join("") +
    "</ul>\n</div>\n" +
    '<aside class="form-card">' +
    '<h2>申请 7 天试用</h2><p class="form-card-sub">带 * 为必填；提交前请阅读并同意隐私政策。</p>' +
    leadFormHtml(u, "trial") +
    "</aside>\n</div>\n</section>\n" +
    '<section class="section" aria-labelledby="tf">\n<div class="container container-narrow">\n' +
    sectionHead("常见问题", "试用相关 FAQ", null, "h2").replace('class="sec-title"', 'id="tf" class="sec-title"') +
    faqList(faqByIds(trialPage.faqIds)) +
    "</div>\n</section>\n";
  const bandHtml = band(u, {
    heading: "拿不准是否合适？先预约一场产品演示。",
    note: "15–30 分钟在线演示，按您的机构与场景定制。",
    primaryLabel: site.headerCtas.secondary.label,
    primaryHref: demoHref(u),
    secondaryHref: relTo(u, "/"),
    secondaryLabel: "返回首页"
  });
  const html = pageShell({ url: u, activeUrl: u, title: trialPage.seo.title, description: trialPage.seo.description, body: body + bandHtml, jsonLd });
  return { url: u, file: "trial/index.html", html };
}

function buildDemo() {
  const u = "/demo/";
  const jsonLd = [jsonLdOrg(), jsonLdFaq(faqByIds(demoPage.faqIds))];
  const bullets = demoPage.bullets
    .map((b) => "<li>" + cardIconChip(b.icon) + "<div><h3>" + esc(b.title) + "</h3><p>" + esc(b.desc) + "</p></div></li>")
    .join("");
  const body =
    '<section class="hero hero-inner hero-split">\n<div class="container form-page-grid">\n' +
    '<div>\n' +
    crumbs(u, [{ label: "首页", url: "/" }, { label: "预约产品演示", url: u }]) +
    '<p class="hero-kicker">' + esc(demoPage.hero.eyebrow) + "</p>\n" +
    '<h1 class="hero-h1">' + esc(demoPage.hero.heading) + "</h1>\n" +
    '<p class="hero-sub">' + esc(demoPage.hero.lead) + "</p>\n" +
    '<ul class="demo-bullets">' + bullets + "</ul>\n</div>\n" +
    '<aside class="form-card">' +
    '<h2>预约产品演示</h2><p class="form-card-sub">带 * 为必填；提交后由专人联系确认演示时间。</p>' +
    leadFormHtml(u, "demo") +
    "</aside>\n</div>\n</section>\n" +
    '<section class="section">\n<div class="container container-narrow">\n' +
    sectionHead("常见问题", "演示与试用相关 FAQ", null, "h2") +
    faqList(faqByIds(demoPage.faqIds)) +
    "</div>\n</section>\n";
  const bandHtml = band(u, {
    heading: "看完演示想直接上手？",
    note: "在真实任务上验证 7 天，用结果说话。",
    primaryLabel: site.headerCtas.primary.label,
    primaryHref: trialHref(u),
    secondaryHref: relTo(u, "/"),
    secondaryLabel: "返回首页"
  });
  const html = pageShell({ url: u, activeUrl: u, title: demoPage.seo.title, description: demoPage.seo.description, body: body + bandHtml, jsonLd });
  return { url: u, file: "demo/index.html", html };
}

function buildPartners() {
  const u = "/partners/";
  const jsonLd = [jsonLdOrg(), jsonLdFaq(faqByIds(partnersPage.faqIds))];
  const group = (s) =>
    '<section class="section" aria-labelledby="pg-' + s.id + '">\n<div class="container">\n' +
    '<h2 id="pg-' + s.id + '" class="sec-title">' + esc(s.title) + "</h2>\n" +
    '<div class="grid grid-3">' +
    s.items.map((it) => '<div class="p-card p-card-big">' + cardIconChip(it.icon) + "<h3>" + esc(it.title) + "</h3><p>" + esc(it.desc) + "</p></div>").join("") +
    "</div>\n</div>\n</section>\n";
  const body =
    '<section class="hero hero-inner hero-split">\n<div class="container form-page-grid">\n' +
    '<div>\n' +
    crumbs(u, [{ label: "首页", url: "/" }, { label: "渠道合作", url: u }]) +
    '<p class="hero-kicker">' + esc(partnersPage.hero.eyebrow) + "</p>\n" +
    '<h1 class="hero-h1">' + esc(partnersPage.hero.heading) + "</h1>\n" +
    '<p class="hero-sub">' + esc(partnersPage.hero.lead) + "</p>\n" +
    stepsList([{ num: "1", title: "提交申请", desc: "填写公司、区域与资源情况。" }, { num: "2", title: "商务沟通", desc: "渠道负责人与您沟通区域与机制。" }, { num: "3", title: "演示与培训", desc: "为伙伴团队做产品演示与交付培训。" }, { num: "4", title: "签约合作", desc: "以正式商务文件确认区域与分润。" }]) +
    "</div>\n" +
    '<aside class="form-card">' +
    '<h2>提交合作申请</h2><p class="form-card-sub">带 * 为必填；信息仅用于合作对接。</p>' +
    leadFormHtml(u, "partner") +
    "</aside>\n</div>\n</section>\n" +
    partnersPage.sections.map(group).join("") +
    '<aside class="mech-note container container-narrow">' + esc(partnersPage.mechanismNote) + "</aside>\n" +
    '<section class="section section-tint">\n<div class="container container-narrow">\n' +
    sectionHead("常见问题", "伙伴关心的 FAQ", null, "h2") +
    faqList(faqByIds(partnersPage.faqIds)) +
    "</div>\n</section>\n";
  const bandHtml = band(u, {
    heading: "对合作还有其他问题？",
    note: "可以先约一场产品演示，实地看看产品边界与交付方式。",
    primaryLabel: "预约产品演示",
    primaryHref: demoHref(u),
    secondaryHref: relTo(u, "/about/"),
    secondaryLabel: "关于我们"
  });
  const html = pageShell({ url: u, activeUrl: u, title: partnersPage.seo.title, description: partnersPage.seo.description, body: body + bandHtml, jsonLd });
  return { url: u, file: "partners/index.html", html };
}

// ---------- 内容中心 ----------
function buildInsights() {
  const u = "/insights/";
  const jsonLd = [jsonLdOrg()];
  const catSecs = categoryOrder
    .map((cid) => {
      const cat = categories.find((c) => c.id === cid);
      const list = articles.filter((a) => a.category === cid);
      if (!list.length) return "";
      return (
        '<section class="section section-' + (categoryOrder.indexOf(cid) % 2 ? "tint" : "plain") + '" aria-labelledby="cat-' + cid + '">\n<div class="container">\n' +
        '<h2 id="cat-' + cid + '" class="sec-title">' + esc(cat.label) + "</h2>" +
        (cat.desc ? '<p class="sec-lead">' + esc(cat.desc) + "</p>" : "") +
        '<div class="grid grid-2">' +
        list.map((a) => articleCard(a, u)).join("") +
        "</div>\n</div>\n</section>\n"
      );
    })
    .join("");
  const body =
    '<section class="hero hero-inner">\n<div class="container">\n' +
    crumbs(u, [{ label: "首页", url: "/" }, { label: "内容中心", url: u }]) +
    '<p class="hero-kicker">内容中心</p>\n' +
    '<h1 class="hero-h1">内容中心</h1>\n' +
    '<p class="hero-sub">产品教程、行业方法与 AI 宣传知识，帮助机构团队更快上手内容生产。真实客户使用案例请前往客户案例页查看。</p>\n' +
    "</div>\n</section>\n" +
    catSecs;
  const bandHtml = band(u, {
    heading: "文章看完，想在自己的任务上试试？",
    note: "申请 7 天试用，用真实任务验证。",
    secondaryHref: demoHref(u),
    secondaryLabel: site.headerCtas.secondary.label
  });
  const html = pageShell({ url: u, activeUrl: u, title: "内容中心_教程与行业方法_AI内容创作工作台", description: "AI内容创作工作台内容中心：AI公众号排版教程、海报与折页制作流程、医院/学校/政务宣传方法与选题知识。", body: body + bandHtml, jsonLd });
  return { url: u, file: "insights/index.html", html };
}

function buildArticle(a) {
  const u = "/insights/" + a.slug + "/";
  const related = articles.filter((x) => x.category === a.category && x.slug !== a.slug).slice(0, 2);
  const jsonLd = [jsonLdOrg(), jsonLdArticle(a), jsonLdBreadcrumb([{ name: "首页", url: site.domain + "/" }, { name: "内容中心", url: site.domain + "/insights/" }, { name: a.title, url: site.domain + u }])];
  const body =
    '<article>\n<div class="container article-wrap">\n' +
    crumbs(u, [{ label: "首页", url: "/" }, { label: "内容中心", url: "/insights/" }, { label: a.title, url: u }]) +
    '<header class="article-head">' +
    '<div class="article-meta"><span class="chip chip-cat">' + esc(catLabel(a.category)) + "</span>" +
    '<time datetime="' + esc(a.date) + '">' + esc(a.date) + "</time>" +
    '<span>' + esc(a.readMinutes || 4) + " 分钟阅读</span></div>\n" +
    "<h1>" + esc(a.title) + "</h1>\n" +
    '<p class="article-excerpt">' + esc(a.excerpt) + "</p>\n" +
    "</header>\n" +
    '<div class="article-body">' + blocksHtml(a.body) + "</div>\n" +
    (related.length
      ? '<aside class="article-related"><h2>相关阅读</h2><div class="grid grid-2">' +
        related.map((r) => articleCard(r, u)).join("") +
        "</div></aside>"
      : "") +
    '<p class="article-date-note">最后更新：' + esc(a.updated || a.date) + "。本页内容可能随版本与运营策略调整。</p>\n" +
    "</div>\n</article>\n";
  const bandHtml = band(u, {
    heading: "读完想上手试试？",
    note: "申请 7 天试用，用自己的真实任务验证。",
    secondaryHref: demoHref(u),
    secondaryLabel: site.headerCtas.secondary.label
  });
  const html = pageShell({ url: u, activeUrl: u, title: a.title + "_内容中心_AI内容创作工作台", description: (a.excerpt || a.title).slice(0, 150), body: body + bandHtml, jsonLd, ogType: "article" });
  return { url: u, file: "insights/" + a.slug + "/index.html", html };
}

// ---------- 关于 / 隐私 / 条款 ----------
function buildSectionsPage(def) {
  const u = def.url;
  const jsonLd = [jsonLdOrg()];
  const secs = def.sections
    .map(
      (s) =>
        '<section class="section" id="' + s.id + '">\n<div class="container container-narrow">\n' +
        '<h2 class="sec-title">' + esc(s.title) + "</h2>\n" +
        blocksHtml(s.blocks) +
        "</div>\n</section>\n"
    )
    .join("");
  const body =
    '<section class="hero hero-inner">\n<div class="container">\n' +
    crumbs(u, [{ label: "首页", url: "/" }, { label: def.hero.heading, url: u }]) +
    '<p class="hero-kicker">' + (def.eyebrow || "") + "</p>\n" +
    '<h1 class="hero-h1">' + esc(def.hero.heading) + "</h1>\n" +
    (def.hero.lead ? '<p class="hero-sub">' + esc(def.hero.lead) + "</p>" : "") +
    "</div>\n</section>\n" +
    secs;
  const html = pageShell({ url: u, activeUrl: u, title: def.seo.title, description: def.seo.description, body, jsonLd });
  return { url: u, file: def.file, html };
}

// ---------- 404 ----------
function build404() {
  const u = "/404.html";
  const html = pageShell({
    url: u, activeUrl: u, title: "404_页面不存在_AI内容创作工作台", description: "您访问的页面不存在或已移动。", noindex: true,
    body:
      '<section class="section error-page">\n<div class="container error-inner">\n' +
      '<p class="error-code">404</p>\n' +
      '<h1 class="hero-h1">页面不存在或已移动</h1>\n' +
      '<p>您可以返回首页，或通过“关于我们”页面的联系方式与我们取得联系。</p>\n' +
      '<div class="hero-ctas">' +
      '<a class="btn btn-primary btn-lg" href="' + relTo(u, "/") + '">返回首页</a> ' +
      '<a class="btn btn-outline btn-lg" href="' + relTo(u, "/demo/") + '">预约产品演示</a>' +
      "</div>\n</div>\n</section>\n"
  });
  return { url: u, file: "404.html", html };
}

// ---------- 汇总导出 ----------
export function allPages() {
  const pages = [];
  pages.push(buildHome());
  pages.push(buildProduct());
  for (const s of industryOrder) pages.push(buildIndustry(s));
  pages.push(buildCaseList());
  for (const c of cases) pages.push(buildCaseDetail(c));
  pages.push(buildTrial());
  pages.push(buildDemo());
  pages.push(buildPartners());
  pages.push(buildInsights());
  for (const a of articles) pages.push(buildArticle(a));
  pages.push(buildSectionsPage({ url: "/about/", file: "about/index.html", seo: about.seo, hero: about.hero, sections: about.sections }));
  pages.push(buildSectionsPage({ url: "/privacy/", file: "privacy/index.html", seo: privacy.seo, hero: privacy.hero, sections: privacy.sections }));
  pages.push(buildSectionsPage({ url: "/terms/", file: "terms/index.html", seo: terms.seo, hero: terms.hero, sections: terms.sections }));
  pages.push(build404());
  return pages.filter(Boolean);
}

