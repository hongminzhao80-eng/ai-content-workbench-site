/* ============================================================================
 * admin-leads · 官网线索轻量管理（页面 + 查看 / 标记已跟进 / 删除）
 * 访问：https://<envid>-xxx.app.tcloudbase.com/admin   （页面在 page.html）
 * 口令：云函数环境变量 ADMIN_KEY（仓库内为占位，真值见本地 .admin-key）
 * API（同源，无需 CORS）：?action=list|set|del|check&key=...
 * ========================================================================== */
const fs = require("fs");
const path = require("path");
const cloudbase = require("@cloudbase/node-sdk");

let pageCache = null;
function getPage() {
  if (pageCache == null) {
    pageCache = fs.readFileSync(path.join(__dirname, "page.html"), "utf8");
  }
  return pageCache;
}

function getDb() {
  let env;
  try {
    if (typeof cloudbase.getCloudbaseContext === "function") {
      const ctx = cloudbase.getCloudbaseContext();
      if (ctx && ctx.env) env = ctx.env;
    }
  } catch (e) { /* ignore */ }
  env = env || process.env.TCB_ENV || process.env.SCF_NAMESPACE || process.env.TENCENTCLOUD_TCB_ENVID;
  env = env || cloudbase.SYMBOL_CURRENT_ENV;
  return cloudbase.init({ env: env || undefined }).database();
}

async function ensureCollection(db, name) {
  try {
    const list = await db.collection(name).limit(1).get();
    if (list && Array.isArray(list.data)) return true;
  } catch (e) {
    if (!e || !/not exist|NOT_EXIST|collection/i.test(String(e.message || e.errMsg || e.code || ""))) throw e;
  }
  if (db.createCollection) {
    await db.createCollection(name).catch((e2) => {
      if (e2 && /exist|EXIST/i.test(String(e2.message || e2.errMsg || e2.code || ""))) return;
      throw e2;
    });
  }
  return true;
}

function respond(statusCode, obj, ct) {
  return {
    statusCode,
    headers: {
      "Content-Type": ct || "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache"
    },
    body: typeof obj === "string" ? obj : JSON.stringify(obj)
  };
}

exports.main = async (event = {}) => {
  const method = String(event.httpMethod || event.method || "GET").toUpperCase();
  const qs = event.queryStringParameters || {};
  const key = String(qs.key || "").trim();
  const action = String(qs.action || "").trim();
  const isApi = ["check", "list", "set", "del", "getconfig", "setconfig"].indexOf(action) >= 0;

  // 页面（无 action 的 GET）
  if (!isApi && method === "GET") {
    return respond(200, getPage(), "text/html; charset=utf-8");
  }
  if (!isApi) return respond(405, { code: 405, message: "Method Not Allowed" });

  const adminKey = process.env.ADMIN_KEY || "";
  if (!adminKey) return respond(500, { code: 500, message: "服务端未配置 ADMIN_KEY" });
  if (key !== adminKey) return respond(401, { code: 401, message: "口令错误或无权限" });

  const db = getDb();
  const col = db.collection("leads");
  const cfgCol = function () { return db.collection("app_config"); };
  

  try {
    if (action === "check") return respond(200, { code: 0, data: true });

    if (action === "list") {
      const type = String(qs.type || "").trim();
      const status = String(qs.status || "").trim();
      const limit = Math.min(parseInt(qs.limit || "100", 10) || 100, 200);
      const where = {};
      if (type) where.lead_type = type;
      if (status) where.status = status;
      const res = await col.where(where).orderBy("created_at", "desc").limit(limit).get();
      let total = res.data ? res.data.length : 0;
      try { const cnt = await col.where(where).count(); total = (cnt && cnt.total) || total; } catch (e) { /* ignore */ }
      const fields = ["_id", "submission_id", "lead_type", "organization_name", "organization_type",
        "province", "city", "contact_name", "mobile", "wechat", "team_size", "needs", "business",
        "coverage", "client_resources", "message", "source", "landing_page", "source_page",
        "status", "created_at", "updated_at"];
      const list = (res.data || []).map(function (d) {
        const o = {};
        fields.forEach(function (k) { if (d[k] !== undefined) o[k] = d[k]; });
        return o;
      });
      return respond(200, { code: 0, data: { list: list, total: total } });
    }

    if (action === "set") {
      const id = String(qs.id || "").trim();
      const status = String(qs.status || "").trim();
      if (!id) return respond(400, { code: 400, message: "缺少 id" });
      if (["new", "contacted", "done", "invalid"].indexOf(status) < 0) return respond(400, { code: 400, message: "状态无效" });
      await col.doc(id).update({ status: status, updated_at: new Date().toISOString() });
      return respond(200, { code: 0, message: "已更新" });
    }

    if (action === "del") {
      const id = String(qs.id || "").trim();
      if (!id) return respond(400, { code: 400, message: "缺少 id" });
      await col.doc(id).remove();
      return respond(200, { code: 0, message: "已删除" });
    }

    if (action === "getconfig") {
      await ensureCollection(db, "app_config");
      try {
        const r = await cfgCol().where({ _id: "notify_settings" }).limit(1).get();
        const d = r && r.data && r.data[0];
        return respond(200, { code: 0, data: { to_email: (d && d.to_email) || "", enabled: !!(d && d.enabled) } });
      } catch (e) {
        return respond(200, { code: 0, data: { to_email: "", enabled: false } });
      }
    }

    if (action === "setconfig") {
      await ensureCollection(db, "app_config");
      const email = String(qs.email || "").trim();
      if (!email || email.length > 200 || email.indexOf("@") < 1) {
        return respond(400, { code: 400, message: "邮箱格式不正确" });
      }
      await cfgCol().doc("notify_settings").set({
        to_email: email,
        enabled: true,
        updated_at: new Date().toISOString()
      });
      return respond(200, { code: 0, message: "通知邮箱已保存" });
    }

    return respond(400, { code: 400, message: "未知操作" });
  } catch (e) {
    console.error("[admin-leads]", e && e.message, e && e.stack);
    const dbg = qs.debug === "1" ? { debug: String((e && e.message) || e) } : {};
    return respond(500, Object.assign({ code: 500, message: "操作失败，请稍后重试" }, dbg));
  }
};