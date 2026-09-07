/* ============================================================
 * AI内容创作工作台 · 官网前台交互脚本
 * 覆盖：移动导航/抽屉、地区联动、线索表单（试用/演示/合作）、
 *       演示视频占位、轻量埋点钩子（设计文档 §9.1 事件字典）
 * ============================================================ */
(function () {
  "use strict";

  var cfg = null;
  try {
    var el = document.getElementById("app-config");
    if (el) cfg = JSON.parse(el.textContent);
  } catch (e) {
    cfg = null;
  }
  cfg = cfg || { demoMode: true, regions: [], leadsEndpoint: "/api/v1/leads", partnersEndpoint: "/api/v1/partners", mobilePattern: "^1[3-9]\\d{9}$" };

  var pagePath = location.pathname;

  /* ---------- 埋点钩子（§9.1；可替换为正式统计 SDK） ---------- */
  function track(name, params) {
    params = params || {};
    var evt = { event: name, page: pagePath, params: params, at: new Date().toISOString() };
    if (cfg.analytics && cfg.analytics.enabled) {
      // [上线前替换] 在此接入正式统计 SDK（配置 analytics.enabled=true 并填入 site.config）
      try {
        if (window.gtag) window.gtag("event", name, params);
      } catch (e) { /* noop */ }
    }
    if (window.console && window.console.debug) {
      window.console.debug("[aiw-track]", name, JSON.stringify(params));
    }
    window.__aiwEvents = window.__aiwEvents || [];
    window.__aiwEvents.push(evt);
  }

  document.addEventListener("DOMContentLoaded", function () {
    track("page_view");

    /* ---------- 移动导航 ---------- */
    var drawer = document.getElementById("mobile-drawer");
    var backdrop = document.querySelector("[data-drawer-backdrop]");
    var toggleBtn = document.querySelector("[data-nav-toggle]");
    var header = document.querySelector(".site-header");

    function setDrawer(open) {
      if (!drawer || !backdrop) return;
      drawer.hidden = !open;
      backdrop.hidden = !open;
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
        toggleBtn.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      }
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (toggleBtn) toggleBtn.addEventListener("click", function () { setDrawer(true); });
    document.addEventListener("click", function (e) {
      if (backdrop && e.target === backdrop) setDrawer(false);
      if (drawer && drawer.contains(e.target) && e.target.closest("a")) setDrawer(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setDrawer(false);
    });

    function updateHeader() {
      if (!header) return;
      if (window.scrollY > 6) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    /* ---------- CTA 点击埋点 ---------- */
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a.btn") : null;
      if (a) {
        var name = (a.textContent || "").trim();
        track("cta_click", { cta_name: name.slice(0, 30), position: positionTag(a) });
      }
    });

    function positionTag(node) {
      var p = node.closest("[data-position]");
      if (p) return p.getAttribute("data-position");
      if (node.closest(".site-header")) return "header";
      if (node.closest(".cta-band")) return "footer_cta";
      if (node.closest(".hero")) return "hero";
      if (node.closest("form")) return "form";
      return "body";
    }

    /* ---------- 地区联动 ---------- */
    document.querySelectorAll("[data-region-province]").forEach(function (selP) {
      var form = selP.closest("form");
      var selC = form ? form.querySelector("[data-region-city]") : null;
      if (!form || !selC || !cfg.regions || !cfg.regions.length) return;
      function fillCities(prov) {
        selC.innerHTML = '<option value="">请选择城市</option>';
        var found = cfg.regions.find(function (r) { return r.province === prov; });
        (found ? found.cities : []).forEach(function (c) {
          var o = document.createElement("option");
          o.value = c;
          o.textContent = c;
          selC.appendChild(o);
        });
        selC.disabled = !found;
      }
      cfg.regions.forEach(function (r) {
        var o = document.createElement("option");
        o.value = r.province;
        o.textContent = r.province;
        selP.appendChild(o);
      });
      selP.addEventListener("change", function () { fillCities(selP.value); });
    });

    /* ---------- 表单校验 ---------- */
    function invalidField(input, msg) {
      var wrap = input.closest(".field") || input.closest("fieldset");
      if (wrap) wrap.classList.add("is-invalid");
      return msg;
    }
    function clearInvalid(form) {
      form.querySelectorAll(".is-invalid").forEach(function (n) { n.classList.remove("is-invalid"); });
    }
    function showError(form, msg) {
      var box = form.querySelector("[data-form-error]");
      if (!box) return;
      box.textContent = msg;
      box.hidden = false;
      box.focus && box.focus({ preventScroll: true });
    }
    function hideError(form) {
      var box = form.querySelector("[data-form-error]");
      if (box) { box.hidden = true; box.textContent = ""; }
    }

    function validateForm(form) {
      var errors = [];
      var fv = function (n) {
        var i = form.querySelector('[name="' + n + '"]');
        return i ? (i.value || "").trim() : "";
      };
      var requiredTexts = [
        ["org_name", "请填写机构/公司名称"],
        ["contact_name", "请填写联系人"],
        ["business", "请填写主营业务"],
        ["province", "请选择所在省/市"],
        ["city", "请选择所在省/市"]
      ];
      requiredTexts.forEach(function (pair) {
        if (!fv(pair[0])) errors.push(pair[1]);
      });
      var otype = fv("org_type");
      var needsFields = form.querySelectorAll('input[name="needs"]:checked');
      var type = form.getAttribute("data-type");
      if (type !== "partner" && !otype) errors.push("请选择机构类型");
      if (type === "trial" && !needsFields.length) errors.push("请至少选择一个最想解决的问题");
      var mobile = form.querySelector('[name="mobile"]');
      if (mobile) {
        var mv = (mobile.value || "").trim();
        var re = new RegExp(cfg.mobilePattern || "^1[3-9]\\d{9}$");
        if (!mv) errors.push("请填写手机号");
        else if (!re.test(mv)) errors.push("手机号格式不正确，请检查后重试");
      }
      var privacy = form.querySelector('input[name="privacy"]');
      if (privacy && !privacy.checked) errors.push("请阅读并同意隐私政策后提交");
      return errors;
    }

    function collectPayload(form) {
      var type = form.getAttribute("data-type") || "trial";
      var val = function (n) {
        var i = form.querySelector('[name="' + n + '"]');
        if (!i) return "";
        var v = (i.value || "").trim();
        return v === "请选择" ? "" : v;
      };
      var needs = Array.prototype.slice.call(form.querySelectorAll('input[name="needs"]:checked')).map(function (c) { return c.value; });
      var payload = {
        submission_id: val("submission_id"),
        lead_type: type,
        organization_name: val("org_name"),
        organization_type: val("org_type"),
        province: val("province"),
        city: val("city"),
        contact_name: val("contact_name"),
        mobile: val("mobile"),
        wechat: val("wechat"),
        team_size: val("team_size"),
        needs: needs,
        business: val("business"),
        coverage: val("coverage"),
        client_resources: val("client_resources"),
        message: val("message"),
        source: val("source"),
        utm_source: val("utm_source"),
        utm_medium: val("utm_medium"),
        utm_campaign: val("utm_campaign"),
        utm_content: val("utm_content"),
        utm_term: val("utm_term"),
        landing_page: val("landing_page"),
        privacy_consent: true
      };
      // 精简：合作申请不必发送 team_size/needs
      if (type === "partner") { delete payload.team_size; delete payload.needs; }
      Object.keys(payload).forEach(function (k) { if (payload[k] === "" || payload[k] === null || (Array.isArray(payload[k]) && !payload[k].length)) { if (k !== "privacy_consent") delete payload[k]; } });
      return payload;
    }

    function makeId() {
      if (window.crypto && crypto.randomUUID) return "web_" + crypto.randomUUID();
      return "web_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }

    function successPanel(form, title, text, demo) {
      var box = document.createElement("div");
      box.className = "form-success";
      var inner = "";
      if (demo) {
        inner += '<p style="display:flex;gap:8px;align-items:center;color:#b54708;font-weight:600;">尚未连接提交服务（演示模式），本次填写未保存。</p>';
      }
      inner += '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9.5"/></svg>';
      box.innerHTML = inner + "<h3>" + title + "</h3><p>" + text + "</p>";
      form.hidden = true;
      form.parentNode.insertBefore(box, form.nextSibling);
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function showSubmitError(form, msg) {
      var btn = form.querySelector("[data-form-submit]");
      if (btn) { btn.disabled = false; btn.classList.remove("is-loading"); }
      showError(form, msg);
    }

    document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
      var lp = form.querySelector('input[name="landing_page"]');
      if (lp) lp.value = pagePath || "/";
      var src = form.querySelector('input[name="source"]');
      if (src) src.value = sessionStorage.getItem("aiw_source") || "direct";
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
        var i = form.querySelector('[name="' + k + '"]');
        if (i) i.value = sessionStorage.getItem("aiw_utm_" + k) || "";
      });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        hideError(form);
        clearInvalid(form);
        var type = form.getAttribute("data-type") || "trial";
        var errs = validateForm(form);
        if (errs.length) {
          showError(form, errs[0]);
          var first = form.querySelector('[name="org_name"], [name="contact_name"], [name="privacy"]');
          if (first) { try { first.focus(); } catch (e2) {} }
          track("lead_form_error", { type: type, reason: errs[0] });
          return;
        }
        var sid = form.querySelector('input[name="submission_id"]');
        if (sid) sid.value = makeId();
        var payload = collectPayload(form);
        var btn = form.querySelector("[data-form-submit]");
        if (btn) { btn.disabled = true; btn.classList.add("is-loading"); }

        var endpoint = type === "partner" ? cfg.partnersEndpoint : cfg.leadsEndpoint;
        var successTypeEvent = type === "trial" ? "trial_submit" : type === "demo" ? "demo_submit" : "partner_submit";

        function onSuccess(demo, serverMsg) {
          var t = type === "trial" ? "提交成功" : type === "demo" ? "预约申请已提交" : "合作申请已提交";
          var txt = demo
            ? "演示模式下不会保存您的信息。接入正式提交服务后，销售团队将通过您填写的联系方式与您对接。"
            : (serverMsg || "我们已收到您的申请，将尽快由专人按您填写的场景与您联系。");
          successPanel(form, t, txt, demo);
          track(successTypeEvent, { type: type, demo: !!demo, source: payload.source || "" });
        }
        function onFail(msg) {
          showSubmitError(form, msg || "提交暂时失败，请稍后重试或联系我们。");
          track("lead_form_error", { type: type, reason: msg || "network" });
        }

        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (res) {
            if (res.status >= 200 && res.status < 300) {
              return res.json().then(function (d) { onSuccess(false, d && d.message); }).catch(function () { onSuccess(false, ""); });
            }
            if (cfg.demoMode) {
              // 演示模式：静态托管/未接入后端时，POST 不可达（405/404 等）也进入演示成功态，并明确标注未保存
              window.console && window.console.info("[aiw-demo] 未连接提交服务（HTTP " + res.status + "），payload：", payload);
              onSuccess(true);
              return;
            }
            if (res.status === 400) { onFail("请检查必填信息和格式后再提交。"); return; }
            if (res.status === 409) { onFail("已收到您的申请，请勿重复提交。"); return; }
            if (res.status === 429) { onFail("提交过于频繁，请稍后再试。"); return; }
            onFail("提交暂时失败，请稍后重试或联系我们。");
          })
          .catch(function (err) {
            if (cfg.demoMode) {
              // 演示模式：未连接后端时的明确提示（不伪装真实提交）
              window.console && window.console.info("[aiw-demo] 未连接提交服务，payload：", payload);
              onSuccess(true);
            } else {
              onFail();
            }
          });
      });
    });

    /* ---------- 演示视频占位 ---------- */
    document.querySelectorAll("[data-video-frame]").forEach(function (frame) {
      var btn = frame.querySelector("[data-video-play]");
      var player = frame.querySelector("[data-video-player]");
      if (!btn || !player) return;
      btn.addEventListener("click", function () {
        track("video_play", { page: pagePath });
        var src = frame.getAttribute("data-video-src");
        btn.hidden = true;
        player.hidden = false;
        if (src) {
          var video = document.createElement("video");
          video.controls = true;
          video.autoplay = true;
          video.preload = "metadata";
          var source = document.createElement("source");
          source.src = src;
          video.appendChild(source);
          player.textContent = "";
          player.appendChild(video);
        }
      });
    });

    /* ---------- UTM 保留（首次进入） ---------- */
    (function captureUtm() {
      if (sessionStorage.getItem("aiw_utm_done")) return;
      var q = new URLSearchParams(location.search);
      var keys = ["source", "medium", "campaign", "content", "term"];
      keys.forEach(function (k) {
        var v = q.get("utm_" + k);
        if (v) sessionStorage.setItem("aiw_utm_" + k, v);
      });
      var s = q.get("utm_source");
      if (s) sessionStorage.setItem("aiw_source", s);
      sessionStorage.setItem("aiw_utm_done", "1");
    })();
  });
})();
