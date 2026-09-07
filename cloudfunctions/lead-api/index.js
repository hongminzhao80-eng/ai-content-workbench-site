/* ============================================================================
 * lead-api · 官网线索收集云函数（试用 / 演示 / 渠道合作）
 * 路由：POST /api/v1/leads（trial|demo）  POST /api/v1/partners（partner）
 * 契约见 README 第四节；安全要求见设计文档 §10 / §16：
 *   服务端独立校验、幂等去重、基础限流、白名单落库、错误不泄露内部细节。
 * 数据库：集合 leads（tcb db 或控制台可查询/导出）
 * ========================================================================== */
const cloudbase = require("@cloudbase/node-sdk");
const nodemailer = require("nodemailer");

const ADMIN_URL = "https://gzzhm518-d2g3ba6o6ecfb077f-1251417578.ap-shanghai.app.tcloudbase.com/admin"; // 后台地址（邮件内指引）

const ALLOWED_ORIGINS = [
  "https://hongminzhao80-eng.github.io", // GitHub Pages 线上
  "http://127.0.0.1:8630",               // 本地预览
  "http://localhost:8630"
];
const LEAD_TYPES = ["trial", "demo", "partner"];
const ORG_TYPES = ["hospital", "education", "government", "enterprise", "association", "chain", "other"];
const NEEDS_ALLOWED = ["copywriting", "wechat_layout", "poster", "leaflet", "short_video", "wecom", "other"];
const TEAM_SIZES = ["1", "2-3", "4-10", "10+"];
const MOBILE_RE = /^1[3-9]\d{9}$/;
const MAX_STR = 500;      // 普通字段最大长度
const MAX_MSG = 2000;     // message 最大长度
const RATE_LIMIT = 12;    // 同一来源 IP 每分钟允许提交次数

// ---- 内存限流（冷启动会重置；生产可替换为腾讯云 WAF/网关限流）----
const rateBuckets = new Map();
function rateLimited(ip, now) {
  const key = ip || "unknown";
  const win = Math.floor(now / 60000);
  const rec = rateBuckets.get(key);
  if (!rec || rec.win !== win) {
    rateBuckets.set(key, { win, count: 1 });
    if (rateBuckets.size > 5000) rateBuckets.clear(); // 防内存膨胀
    return false;
  }
  rec.count += 1;
  return rec.count > RATE_LIMIT;
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.indexOf(origin) >= 0 ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "600",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function respond(statusCode, body, origin) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify(body)
  };
}

// ---- 白名单清洗（只保存约定字段，防注入）----
function sanitize(o) {
  const s = (v, max) => {
    if (v === undefined || v === null) return "";
    const t = String(v).trim();
    return t.length > max ? t.slice(0, max) : t;
  };
  const clean = {
    lead_type: o.lead_type || "",
    organization_name: s(o.organization_name, MAX_STR),
    organization_type: s(o.organization_type, 40),
    province: s(o.province, 60),
    city: s(o.city, 60),
    contact_name: s(o.contact_name, 80),
    mobile: s(o.mobile, 20),
    wechat: s(o.wechat, 100),
    team_size: s(o.team_size, 10),
    needs: Array.isArray(o.needs) ? o.needs.filter((n) => typeof n === "string").map((n) => n.slice(0, 40)).slice(0, 8) : [],
    business: s(o.business, 200),
    coverage: s(o.coverage, 40),
    client_resources: s(o.client_resources, 40),
    message: s(o.message, MAX_MSG),
    source: s(o.source, 80),
    utm_source: s(o.utm_source, 200),
    utm_medium: s(o.utm_medium, 200),
    utm_campaign: s(o.utm_campaign, 200),
    utm_content: s(o.utm_content, 200),
    utm_term: s(o.utm_term, 200),
    landing_page: s(o.landing_page, 300),
    submission_id: s(o.submission_id, 80)
  };
  return clean;
}

function validate(clean) {
  const errs = [];
  if (!LEAD_TYPES.includes(clean.lead_type)) errs.push("lead_type 无效");
  if (!clean.organization_name) errs.push("请填写机构/公司名称");
  if (!clean.contact_name) errs.push("请填写联系人");
  if (!MOBILE_RE.test(clean.mobile)) errs.push("手机号格式不正确");
  if (clean.organization_type && !ORG_TYPES.includes(clean.organization_type)) errs.push("organization_type 无效");
  if (clean.team_size && !TEAM_SIZES.includes(clean.team_size)) errs.push("team_size 无效");
  if (clean.lead_type === "partner" && !clean.business) errs.push("请填写主营业务");
  if (clean.lead_type === "trial" && clean.needs.length === 0) errs.push("请至少选择一个最想解决的问题");
  for (const n of clean.needs) if (!NEEDS_ALLOWED.includes(n)) errs.push("needs 含无效值");
  return errs;
}

function getDb() {
  // CloudBase 云函数内多方式获取当前环境（按可用性依次尝试）
  let env;
  try {
    if (typeof cloudbase.getCloudbaseContext === "function") {
      const ctx = cloudbase.getCloudbaseContext();
      if (ctx && ctx.env) env = ctx.env;
    }
  } catch (e) { /* ignore */ }
  env = env || process.env.TCB_ENV || process.env.SCF_NAMESPACE || process.env.TENCENTCLOUD_TCB_ENVID;
  env = env || cloudbase.SYMBOL_CURRENT_ENV; // 兜底：当前环境
  return cloudbase.init({ env: env || undefined }).database();
}

// 集合不存在时自动创建（体验版同样适用）
async function ensureCollection(db, name) {
  try {
    const list = await db.collection(name).limit(1).get();
    if (list && Array.isArray(list.data)) return true;
  } catch (e) {
    if (!e || !/not exist|NOT_EXIST|collection/i.test(String(e.message || e.errMsg || e.code || ""))) throw e;
  }
  // 集合不存在 → 尝试创建
  if (db.createCollection) {
    await db.createCollection(name).catch((e2) => {
      if (e2 && /exist|EXIST/i.test(String(e2.message || e2.errMsg || e2.code || ""))) return;
      throw e2;
    });
  }
  return true;
}


// ---- 新线索邮件通知（SMTP 环境变量未配置时自动跳过，不影响提交）----
const TYPE_CN = { trial: "试用申请", demo: "演示预约", partner: "渠道合作申请" };
const ORG_CN = {
  hospital: "医院/医疗机构", education: "学校/教育机构", government: "政府/事业单位",
  enterprise: "企业", association: "协会", chain: "连锁机构", other: "其他"
};
const NEED_CN = {
  copywriting: "写稿/内容生成", wechat_layout: "公众号排版", poster: "海报制作",
  leaflet: "宣传折页/单页", short_video: "短视频脚本", wecom: "企业微信发送", other: "其他"
};

async function resolveNotifyTo(db) {
  // 收件人：后台配置的 app_config.notify_settings.to_email；未配置时默认发件人本人
  try {
    const r = await db.collection("app_config").where({ _id: "notify_settings" }).limit(1).get();
    const d = r && r.data && r.data[0];
    if (d && d.to_email && String(d.to_email).indexOf("@") > 0) return String(d.to_email).trim();
  } catch (e) { /* 集合/文档不存在则用默认 */ }
  return (process.env.SMTP_USER || "").trim();
}

async function sendNewLeadMail(db, lead) {
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  if (!user || !pass) {
    console.info("[lead-api] SMTP_USER/SMTP_PASS 未配置，跳过邮件通知");
    return { skipped: true };
  }
  const host = String(process.env.SMTP_HOST || "smtp.qq.com").trim();
  const port = parseInt(process.env.SMTP_PORT || "465", 10) || 465;
  const to = await resolveNotifyTo(db);
  if (!to) return { skipped: true, reason: "no-recipient" };

  const lines = [];
  lines.push("【官网新线索】" + (TYPE_CN[lead.lead_type] || lead.lead_type) + " - " + lead.organization_name);
  lines.push("");
  lines.push("类型：" + (TYPE_CN[lead.lead_type] || lead.lead_type));
  lines.push("机构/公司：" + lead.organization_name);
  if (lead.organization_type) lines.push("行业：" + (ORG_CN[lead.organization_type] || lead.organization_type));
  if (lead.province || lead.city) lines.push("地区：" + (lead.province || "") + " " + (lead.city || ""));
  lines.push("联系人：" + lead.contact_name);
  lines.push("手机号：" + lead.mobile);
  if (lead.wechat) lines.push("微信：" + lead.wechat);
  if (lead.team_size) lines.push("团队规模：" + lead.team_size + " 人");
  if (Array.isArray(lead.needs) && lead.needs.length) {
    lines.push("想解决的问题：" + lead.needs.map(function (n) { return NEED_CN[n] || n; }).join("、"));
  }
  if (lead.business) lines.push("主营业务：" + lead.business);
  if (lead.coverage) lines.push("覆盖区域：" + lead.coverage);
  if (lead.message) lines.push("补充说明：" + lead.message);
  lines.push("");
  lines.push("提交时间：" + (lead.created_at || ""));
  lines.push("来源：" + (lead.source || "direct") + (lead.source_page ? "（" + lead.source_page + "）" : ""));
  lines.push("");
  lines.push("请及时登录官网管理后台跟进：");
  lines.push(ADMIN_URL);

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: { user: user, pass: pass }
  });

  const mail = await transporter.sendMail({
    from: "\"" + (process.env.SMTP_FROM_NAME || "AI内容创作工作台官网") + "\" <" + user + ">",
    to: to,
    subject: "官网新线索：" + (TYPE_CN[lead.lead_type] || lead.lead_type) + " · " + lead.organization_name + "（请跟进）",
    text: lines.join("\n")
  });
  return { ok: true, id: mail && mail.messageId };
}

async function notifyNewLead(db, lead) {
  // 总超时 12s，失败只记日志，绝不阻断提交响应
  const timeout = new Promise(function (_, reject) {
    setTimeout(function () { reject(new Error("mail timeout")); }, 12000);
  });
  try {
    return await Promise.race([sendNewLeadMail(db, lead), timeout]);
  } catch (e) {
    console.error("[lead-api] 邮件通知失败", e && e.message);
    return { failed: true };
  }
}

exports.main = async (event = {}) => {
  const headers = event.headers || {};
  const origin = String(headers.origin || headers.Origin || "");
  const httpMethod = String(event.httpMethod || event.method || "GET").toUpperCase();
  const path = String(event.path || (event.requestContext && event.requestContext.path) || "");
  const ipRaw = String(headers["x-forwarded-for"] || headers["X-Forwarded-For"] || (event.requestContext && event.requestContext.sourceIp) || "unknown");
  const ip = ipRaw.split(",")[0].trim();
  const now = Date.now();

  // 来源校验：浏览器请求必须携带白名单 Origin；带 Origin 但不在白名单 → 403
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return respond(403, { code: 403, message: "请求来源不被允许" }, origin);
  }

  // CORS 预检
  if (httpMethod === "OPTIONS") return respond(204, { code: 0 }, origin);

  if (httpMethod !== "POST") return respond(405, { code: 405, message: "Method Not Allowed" }, origin);

  // 限流
  if (rateLimited(ip, now)) return respond(429, { code: 429, message: "提交过于频繁，请稍后再试" }, origin);

  // 路由：/api/v1/leads -> trial|demo（由 body.lead_type 细分）；/api/v1/partners -> partner
  let rawBody = event.body;
  let body = {};
  if (typeof rawBody === "string" && rawBody) {
    try { body = JSON.parse(rawBody); } catch (e) { return respond(400, { code: 400, message: "请求体不是合法 JSON" }, origin); }
  } else if (rawBody && typeof rawBody === "object") {
    body = rawBody;
  }

  // 幂等：submission_id 已存在则 409（需稳定库查询）
  const sid = String(body.submission_id || "").trim();
  if (!sid) return respond(400, { code: 400, message: "缺少 submission_id" }, origin);

  // 判断 lead_type：显式给出优先，其次按路径推导
  let leadType = String(body.lead_type || "").trim();
  if (!LEAD_TYPES.includes(leadType)) {
    if (path.indexOf("/partners") >= 0) leadType = "partner";
    else leadType = body.lead_type ? "" : "trial";
  }
  body.lead_type = leadType;

  const clean = sanitize(body);
  const errs = validate(clean);
  if (errs.length) return respond(400, { code: 400, message: errs[0] }, origin);

  try {
    const db = getDb();
    await ensureCollection(db, "leads");
    const col = db.collection("leads");

    // 幂等查重
    const dup = await col.where({ submission_id: sid }).limit(1).get().catch(() => null);
    if (dup && dup.data && dup.data.length > 0) {
      return respond(409, { code: 409, message: "已收到您的申请，请勿重复提交" }, origin);
    }

    const doc = Object.assign({}, clean, {
      created_at: new Date().toISOString(),
      client_ip: ip.slice(0, 64),
      status: "new",
      source_page: clean.landing_page || path || ""
    });
    delete doc.landing_page; // 已并入 source_page（保留原字段亦可，见注释）

    const addRes = await col.add(doc).catch((e) => { throw e; });
    // 新线索即时邮件通知（SMTP 未配置或失败都不影响提交成功）
    await notifyNewLead(db, doc);
    return respond(201, { code: 0, message: "提交成功", id: addRes && addRes.id }, origin);
  } catch (e) {
    console.error("[lead-api] db error", e && e.message, e && e.stack);
    const dbg = (event.queryStringParameters && event.queryStringParameters.debug === "1") ? { debug: String((e && e.message) || e) } : {};
    return respond(500, Object.assign({ code: 500, message: "提交暂时失败，请稍后重试或联系我们" }, dbg), origin);
  }
};