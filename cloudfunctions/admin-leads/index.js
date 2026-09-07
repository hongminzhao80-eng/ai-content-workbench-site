/* ============================================================================
 * admin-leads · 官网线索轻量管理（查看 / 标记已跟进 / 删除）
 * 访问：https://<envid>-...app.tcloudbase.com/admin
 * 口令：云函数环境变量 ADMIN_KEY（未配置则拒绝管理操作）
 * 安全：口令校验 + 同域页面（无 CORS 暴露）；生产建议加正式登录/网关鉴权
 * ========================================================================== */
const cloudbase = require("@cloudbase/node-sdk");

const LEAD_TYPE_LABEL = { trial: "试用", demo: "演示", partner: "合作" };
const STATUS_LABEL = { new: "新线索", contacted: "已联系", done: "已完成", invalid: "无效" };

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

function json(res, code, data, extra) {
  const body = JSON.stringify(Object.assign({ code }, data, extra || {}));
  return { statusCode: code, headers: { "Content-Type": "application/json; charset=utf-8" }, body };
}
function htmlPage(res) {
  return { statusCode: res.statusCode || 200, headers: { "Content-Type": "text/html; charset=utf-8" }, body: res.body };
}
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function page() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>线索管理 · AI内容创作工作台</title>
<style>
  :root { --g:#0E3B2C; --gl:#1f7a56; --bg:#f4f7f5; --card:#fff; --line:#dfe8e2; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:"Microsoft YaHei",system-ui,sans-serif; background:var(--bg); color:#22303a; }
  header { background:var(--g); color:#fff; padding:14px 22px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  header h1 { font-size:18px; margin:0; font-weight:600; }
  header .hint { font-size:12px; opacity:.75; }
  .toolbar { padding:14px 22px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; background:#fff; border-bottom:1px solid var(--line); }
  .toolbar select, .toolbar input, .toolbar button { padding:7px 10px; border:1px solid #c6d4cc; border-radius:6px; font-size:13px; background:#fff; }
  .toolbar button { background:var(--gl); color:#fff; border-color:var(--gl); cursor:pointer; }
  .toolbar .key-box { margin-left:auto; display:flex; gap:6px; align-items:center; }
  .wrap { padding:18px 22px; }
  table { width:100%; border-collapse:collapse; background:var(--card); box-shadow:0 1px 3px rgba(0,0,0,.06); font-size:13px; }
  th, td { border-bottom:1px solid var(--line); padding:9px 10px; text-align:left; vertical-align:top; }
  th { background:#eef4f0; font-weight:600; white-space:nowrap; }
  td.msg { max-width:240px; white-space:pre-wrap; word-break:break-all; }
  .tag { display:inline-block; padding:2px 8px; border-radius:10px; font-size:12px; }
  .t-trial{background:#e3f2fd;color:#0b5a9c}.t-demo{background:#fff3e0;color:#a35c00}.t-partner{background:#e8f5e9;color:#1b5e20}
  .s-new{background:#fce4ec;color:#ad1457}.s-contacted{background:#fff8e1;color:#8a6d00}.s-done{background:#e8f5e9;color:#1b5e20}.s-invalid{background:#eee;color:#555}
  button.mini { padding:3px 9px; font-size:12px; border-radius:5px; border:1px solid #c6d4cc; background:#fff; cursor:pointer; margin-right:4px; }
  button.mini:hover { border-color:var(--gl); color:var(--gl); }
  .empty { padding:40px; text-align:center; color:#889; }
  .err { color:#c62828; }
  .foot { padding:10px 22px 26px; font-size:12px; color:#7a8a83; }
  .lock { padding:80px 20px; text-align:center; }
  .lock input { padding:10px 14px; width:260px; border:1px solid #c6d4cc; border-radius:8px; font-size:14px; }
  .lock button { padding:10px 22px; border-radius:8px; border:0; background:var(--gl); color:#fff; font-size:14px; margin-left:8px; cursor:pointer; }
  select, button { outline-color: var(--gl); }
</style>
</head>
<body>
<header>
  <h1>AI内容创作工作台 · 线索管理</h1>
  <span class="hint">数据源：CloudBase leads 集合（试用 / 演示 / 渠道合作）</span>
</header>
<div id="root"></div>
<script>
var KEY = sessionStorage.getItem("lead_admin_key") || "";
var BASE = location.pathname.replace(/\/$/, "");

function h(v){ return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function timeLocal(iso){ if(!iso) return "-"; var d=new Date(iso); if(isNaN(d)) return h(iso); return d.toLocaleString("zh-CN",{hour12:false}); }
function tLabel(t){ return ({trial:"试用",demo:"演示",partner:"合作"})[t]||t||"-"; }
function sLabel(s){ return ({new:"新线索",contacted:"已联系",done:"已完成",invalid:"无效"})[s]||s||"-"; }
function sClass(s){ return "s-"+(s||"new"); }
function tClass(t){ return "t-"+(t||"trial"); }
function needsTxt(a){ return Array.isArray(a)&&a.length?a.join("、"):"-"; }

function renderLock(){
  var root=document.getElementById("root");
  root.innerHTML='<div class="lock"><h2>请输入管理口令</h2><div><input id="k" type="password" placeholder="管理口令"/><button onclick="tryKey()">进入</button></div><p class="err" id="err"></p></div>';
}
function tryKey(){
  var k=document.getElementById("k").value.trim();
  if(!k){ return; }
  fetch(BASE+"/api?action=check&key="+encodeURIComponent(k)).then(function(r){return r.json();}).then(function(d){
    if(d.code===0){ KEY=k; sessionStorage.setItem("lead_admin_key",k); load(); }
    else { document.getElementById("err").textContent=d.message||"口令错误"; }
  }).catch(function(){ document.getElementById("err").textContent="网络错误，请重试"; });
}

function toolbar(){
  return '<div class="toolbar">' +
    '<select id="fType"><option value="">全部类型</option><option value="trial">试用</option><option value="demo">演示</option><option value="partner">合作</option></select>' +
    '<select id="fStatus"><option value="">全部状态</option><option value="new">新线索</option><option value="contacted">已联系</option><option value="done">已完成</option><option value="invalid">无效</option></select>' +
    '<button onclick="load()">刷新</button>' +
    '<span id="total" style="font-size:12px;color:#7a8a83"></span>' +
    '<span class="key-box"><button class="mini" onclick="lock()">锁定 / 退出</button></span>' +
    '</div>';
}

function rows(data){
  if(!data||!data.length){ return '<div class="empty">暂无线索</div>'; }
  var out='<table><thead><tr><th>提交时间</th><th>类型</th><th>状态</th><th>机构/公司</th><th>行业</th><th>地区</th><th>联系人</th><th>手机号</th><th>微信</th><th>团队/需求/业务</th><th>留言</th><th>来源</th><th>操作</th></tr></thead><tbody>';
  data.forEach(function(d){
    var lead=d.lead_type||"";
    var extra="";
    if(lead==="trial"){ extra="团队："+h(d.team_size||"-")+"<br/>需求："+needsTxt(d.needs); }
    if(lead==="demo"){ extra="行业："+h(d.organization_type||"-"); }
    if(lead==="partner"){ extra="业务："+h(d.business||"-")+"<br/>区域资源："+h(d.coverage||"-")+"/"+h(d.client_resources||"-"); }
    out+="<tr>"+
      "<td>"+timeLocal(d.created_at)+"</td>"+
      "<td><span class='tag "+tClass(lead)+"'>"+tLabel(lead)+"</span></td>"+
      "<td><span class='tag "+sClass(d.status)+"'>"+sLabel(d.status)+"</span></td>"+
      "<td>"+h(d.organization_name)+"</td>"+
      "<td>"+h(d.organization_type||"-")+"</td>"+
      "<td>"+h(d.province||"")+" "+h(d.city||"")+"</td>"+
      "<td>"+h(d.contact_name)+"</td>"+
      "<td>"+h(d.mobile)+"</td>"+
      "<td>"+h(d.wechat||"-")+"</td>"+
      "<td>"+extra+"</td>"+
      "<td class='msg'>"+h(d.message||"-")+"</td>"+
      "<td>"+h(d.source||"direct")+"<br/><span style='font-size:11px;color:#9aa'>"+h(d.landing_page||d.source_page||"")+"</span></td>"+
      "<td>"+
        (d.status!=="contacted"?'<button class="mini" onclick="act(\''+d._id+'\',\'contacted\')">已联系</button>':"")+
        (d.status!=="done"?'<button class="mini" onclick="act(\''+d._id+'\',\'done\')">已完成</button>':"")+
        '<button class="mini" onclick="act(\''+d._id+'\',\'invalid\')">无效</button>'+
        '<button class="mini" onclick="del(\''+d._id+'\')" style="color:#c62828">删除</button>'+
      "</td></tr>";
  });
  out+="</tbody></table>";
  return out;
}

function load(){
  var type=document.getElementById("fType").value;
  var status=document.getElementById("fStatus").value;
  var q=BASE+"/api?action=list&key="+encodeURIComponent(KEY)+"&type="+type+"&status="+status;
  fetch(q).then(function(r){return r.json();}).then(function(d){
    if(d.code===0){ document.getElementById("root").innerHTML=toolbar()+rows(d.data)+'<div class="foot">共显示 '+d.total+' 条线索（最新优先，最多 200 条）。时间均为北京时间。</div>'; }
    else if(d.code===401){ sessionStorage.removeItem("lead_admin_key"); renderLock(); }
    else { document.getElementById("root").innerHTML='<div class="err" style="padding:20px">'+h(d.message||"加载失败")+'</div>'; }
  }).catch(function(){ document.getElementById("root").innerHTML='<div class="err" style="padding:20px">加载失败，请刷新重试</div>'; });
}
function act(id,status){
  if(!confirm("确认标记该线索为「"+sLabel(status)+"」？")) return;
  fetch(BASE+"/api?action=set&key="+encodeURIComponent(KEY)+"&id="+encodeURIComponent(id)+"&status="+encodeURIComponent(status)).then(function(r){return r.json();}).then(function(d){
    if(d.code===0){ load(); } else { alert(d.message||"操作失败"); }
  }).catch(function(){ alert("操作失败"); });
}
function del(id){
  if(!confirm("确认删除该线索？此操作不可恢复。")) return;
  fetch(BASE+"/api?action=del&key="+encodeURIComponent(KEY)+"&id="+encodeURIComponent(id)).then(function(r){return r.json();}).then(function(d){
    if(d.code===0){ load(); } else { alert(d.message||"删除失败"); }
  }).catch(function(){ alert("删除失败"); });
}
function lock(){ sessionStorage.removeItem("lead_admin_key"); KEY=""; renderLock(); }
(function init(){
  if(!KEY){ renderLock(); } else { load(); }
})();
</script>
</body>
</html>`;
}

// ---------- 请求处理 ----------
exports.main = async (event = {}) => {
  const method = String(event.httpMethod || event.method || "GET").toUpperCase();
  const qs = event.queryStringParameters || {};
  const key = String(qs.key || "").trim();
  const adminKey = process.env.ADMIN_KEY || "";

  const action = String(qs.action || "").trim();
  const isApi = ["check", "list", "set", "del"].indexOf(action) >= 0;

  if (!adminKey) return json({}, 500, { code: 500, message: "未配置 ADMIN_KEY 环境变量，拒绝访问" });

  const authOk = key === adminKey;

  // 管理页面（同源 GET，无 action）
  if (!isApi && method === "GET") {
    return htmlPage({ statusCode: 200, body: page() });
  }
  if (!isApi) return json({}, 405, { code: 405, message: "Method Not Allowed" });

  // 口令校验
  if (!authOk) {
    return json({}, 401, { code: 401, message: "口令错误或无权限" });
  }

  const db = getDb();
  const col = db.collection("leads");

  try {
    if (action === "check") {
      return json({}, 200, { code: 0, data: true });
    }
    if (action === "list") {
      const type = String(qs.type || "").trim();
      const status = String(qs.status || "").trim();
      const limit = Math.min(parseInt(qs.limit || "100", 10) || 100, 200);
      const where = {};
      if (type) where.lead_type = type;
      if (status) where.status = status;
      let query = col.where(where).orderBy("created_at", "desc").limit(limit);
      const res = await query.get();
      // 统计总数
      let total = res.data ? res.data.length : 0;
      try { const cnt = await col.where(where).count(); total = (cnt && cnt.total) || total; } catch (e) { /* ignore */ }
      const list = (res.data || []).map(function (d) {
        const o = {};
        ["_id", "submission_id", "lead_type", "organization_name", "organization_type", "province", "city",
         "contact_name", "mobile", "wechat", "team_size", "needs", "business", "coverage",
         "client_resources", "message", "source", "landing_page", "source_page", "status", "created_at", "updated_at"].forEach(function (k) {
          if (d[k] !== undefined) o[k] = d[k];
        });
        return o;
      });
      return json({}, 200, { code: 0, data: { list: list, total: total } });
    }

    if (action === "set") {
      const id = String(qs.id || "").trim();
      const status = String(qs.status || "").trim();
      if (!id) return json({}, 400, { code: 400, message: "缺少 id" });
      if (!["new", "contacted", "done", "invalid"].includes(status)) return json({}, 400, { code: 400, message: "状态无效" });
      const upd = await col.doc(id).update({ status: status, updated_at: new Date().toISOString() });
      return json({}, 200, { code: 0, data: { updated: !!(upd && upd.updated) }, message: "已更新" });
    }

    if (action === "del") {
      const id = String(qs.id || "").trim();
      if (!id) return json({}, 400, { code: 400, message: "缺少 id" });
      await col.doc(id).remove();
      return json({}, 200, { code: 0, message: "已删除" });
    }

    return json({}, 400, { code: 400, message: "未知操作" });
  } catch (e) {
    console.error("[admin-leads]", e && e.message, e && e.stack);
    const dbg = qs.debug === "1" ? { debug: String((e && e.message) || e) } : {};
    return json({}, 500, Object.assign({ code: 500, message: "操作失败，请稍后重试" }, dbg));
  }
};