/* Bigfoot Trade Hub */
(function () {
  var EMAIL = "enquiries@bigfoot.com.sg";
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- hide images that fail to load (e.g. offline) ---- */
  $$("img[data-hide-on-error]").forEach(function (im) {
    var hide = function () { im.style.display = "none"; };
    im.addEventListener("error", hide);
    if (im.complete && im.naturalWidth === 0 && im.getAttribute("loading") !== "lazy") hide();
  });

  /* ---- header + menu ---- */
  var top = $("[data-top]"), btn = $(".menu-btn");
  function onScroll() { top.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    btn.setAttribute("aria-expanded", open); btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    top.classList.toggle("open", open); document.body.style.overflow = open ? "hidden" : "";
  }
  btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && top.classList.contains("open")) setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1060 && top.classList.contains("open")) setMenu(false); });

  /* ---- reveal ---- */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  /* ---- wave text ---- */
  var tp = $("[data-wave]");
  if (tp && !reduce) {
    var unit = 0, off = 0, last = 0, hidden = false;
    var measure = function () { try { unit = tp.parentNode.getComputedTextLength() / 4; } catch (e) { unit = 0; } };
    measure(); window.addEventListener("resize", measure);
    if (document.fonts) document.fonts.ready.then(measure);
    var tick = function (t) {
      var dt = last ? Math.min(t - last, 50) : 0; last = t;
      if (!hidden && unit) { off -= dt * 0.06; if (-off > unit) off += unit; tp.setAttribute("startOffset", off); }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", function () { hidden = document.hidden; last = 0; });
  }

  /* ---- photo band parallax ---- */
  $$(".band").forEach(function (band) {
    if (reduce) return;
    var imgs = $$(".band-img img", band);
    var par = function () {
      var r = band.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var q = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
      imgs.forEach(function (im, i) { im.style.setProperty("--py", (-8.3 + q * (i ? -8 : 8)) + "%"); });
    };
    window.addEventListener("scroll", par, { passive: true }); par();
  });

  /* ---- trust photo drift ---- */
  $$(".trust").forEach(function (sec) {
    if (reduce) return;
    var im = $(".trust-img", sec);
    var par = function () {
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var q = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
      im.style.setProperty("--ty", (q * 40) + "px");
    };
    window.addEventListener("scroll", par, { passive: true }); par();
  });

  /* ---- shelf pause ---- */
  $$("[data-pause]").forEach(function (pb) {
    var shelf = pb.closest("[data-shelf]");
    pb.addEventListener("click", function () {
      var p = pb.getAttribute("aria-pressed") !== "true";
      pb.setAttribute("aria-pressed", p); pb.textContent = p ? "Play motion" : "Pause motion"; shelf.classList.toggle("paused", p);
    });
  });

  /* ---- home category enquire uses the selected trade type ---- */
  $$("[data-enq]").forEach(function (a) {
    var sel = $('[data-type-for="' + a.dataset.enq + '"]');
    var upd = function () { a.href = "contact.html?product=" + encodeURIComponent(a.dataset.enq) + "&type=" + encodeURIComponent(sel ? sel.value : "Import"); };
    if (sel) sel.addEventListener("change", upd); upd();
  });

  /* ---- catalogue filter + dialog ---- */
  var cat = $("[data-catalogue]");
  if (cat) {
    var tabs = $$("[data-filter]"), items = $$(".item", cat);
    var filter = function (c, push) {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.filter === c); });
      items.forEach(function (it) {
        var show = c === "All" || it.dataset.cat === c;
        it.hidden = !show;
        if (show) { it.style.animation = "none"; void it.offsetWidth; it.style.animation = ""; }
      });
      if (push && history.replaceState) {
        var u = new URL(location.href); if (c === "All") u.searchParams.delete("cat"); else u.searchParams.set("cat", c);
        u.hash = ""; history.replaceState(null, "", u);
      }
    };
    tabs.forEach(function (t) {
      t.addEventListener("click", function () { filter(t.dataset.filter, true); });
      t.addEventListener("keydown", function (e) {
        var i = tabs.indexOf(t), n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); n.focus(); n.click(); }
      });
    });
    $$("[data-jump]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault(); filter(a.dataset.jump, true);
        $("#catalogue").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      });
    });
    var params = new URLSearchParams(location.search);
    if (params.get("cat")) filter(params.get("cat"), false);

    var dlg = $("[data-pd]"), current = null;
    var open = function (it) {
      current = it;
      { const pi = $("[data-pd-img]", dlg), si = $("img", it); pi.className = si.className; pi.src = si.src; }
      $("[data-pd-cat]", dlg).textContent = it.dataset.cat;
      $("[data-pd-name]", dlg).textContent = it.dataset.name;
      $("[data-pd-short]", dlg).textContent = it.dataset.short;
      $("[data-pd-uses]", dlg).textContent = it.dataset.uses;
      $("[data-pd-forms]", dlg).textContent = it.dataset.forms;
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    };
    items.forEach(function (it) { it.addEventListener("click", function () { open(it); }); });
    $("[data-pd-close]", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { if (current) current.focus({ preventScroll: true }); });
    $("[data-pd-form]", dlg).addEventListener("submit", function (e) {
      e.preventDefault();
      location.href = "contact.html?product=" + encodeURIComponent(current.dataset.cat) + "&type=" +
        encodeURIComponent(this.elements.type.value) + "&note=" + encodeURIComponent("Interested in: " + current.dataset.name);
    });
    // open from hash (e.g. products.html#turmeric)
    var fromHash = function () {
      var id = decodeURIComponent(location.hash.slice(1)); if (!id || id === "catalogue") return;
      var it = document.getElementById(id); if (!it || !it.classList.contains("item")) return;
      filter("All", false);
      it.scrollIntoView({ block: "center", behavior: "auto" }); it.classList.add("flash");
      setTimeout(function () { it.classList.remove("flash"); open(it); }, 450);
    };
    fromHash(); window.addEventListener("hashchange", fromHash);
  }

  /* ---- enquiry form ---- */
  var form = $("[data-form]");
  if (form) {
    var F = form.elements, ready = $("[data-ready]", form), err = $("[data-err]", form), draft = { s: "", b: "" };
    var q = new URLSearchParams(location.search);
    if (q.get("product")) {
      var opt = $$("option", F.product).filter(function (o) { return o.value === q.get("product"); })[0];
      F.product.value = opt ? q.get("product") : "Other food items";
    }
    if (q.get("type")) F.type.value = q.get("type");
    if (q.get("note")) F.notes.value = q.get("note");
    if (q.get("product") || q.get("type")) {
      [F.product, F.type].forEach(function (el) { el.classList.add("flash"); });
      setTimeout(function () { $("#enquire").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, 300);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = F.product.value && F.name.value.trim() && /\S+@\S+\.\S+/.test(F.email.value);
      err.hidden = !!ok;
      if (!ok) { ready.hidden = true; return; }
      draft.s = "Trade enquiry: " + F.product.value + " · " + F.type.value;
      var L = ["Hello Bigfoot Trade Hub,", "", "I would like to enquire about the following:", "",
        "Product: " + F.product.value, "Trade type: " + F.type.value,
        "Quantity: " + (F.qty.value.trim() || "To discuss"), "Market / destination: " + (F.market.value.trim() || "To discuss"), ""];
      if (F.notes.value.trim()) L.push("Notes:", F.notes.value.trim(), "");
      L.push("Name: " + F.name.value.trim());
      if (F.company.value.trim()) L.push("Company: " + F.company.value.trim());
      L.push("Email: " + F.email.value.trim());
      if (F.phone.value.trim()) L.push("Phone: " + F.phone.value.trim());
      L.push("", "Thank you.");
      draft.b = L.join("\n");
      var s = encodeURIComponent(draft.s), b = encodeURIComponent(draft.b), to = encodeURIComponent(EMAIL);
      $('[data-send="mailto"]', form).href = "mailto:" + EMAIL + "?subject=" + s + "&body=" + b;
      $('[data-send="gmail"]', form).href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + to + "&su=" + s + "&body=" + b;
      $('[data-send="outlook"]', form).href = "https://outlook.office.com/mail/deeplink/compose?to=" + to + "&subject=" + s + "&body=" + b;
      ready.hidden = false;
      ready.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
    $("[data-copy]", form).addEventListener("click", function () {
      var text = "To: " + EMAIL + "\nSubject: " + draft.s + "\n\n" + draft.b;
      var done = function () { $("[data-copied]", form).hidden = false; };
      var fallback = function () {
        var t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (x) {} t.remove(); done();
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    });
  }
})();
