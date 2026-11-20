/* KJV vs Quran: topic comparison library. KJV is always shown first (left on wide screens). */
(function (W) {
  "use strict";
  var BQ = W.BQ, esc = BQ.esc, V = BQ.views;
  function side() { return localStorage.getItem("bq-side") !== "0"; }
  function pk() { return localStorage.getItem("bq-pk") !== "0"; }
  BQ.cmp = function (id) { return (W.BQ_COMPARE || []).filter(function (c) { return c.id === id; })[0]; };

  function block(c) {
    var kj = '<div class="kvq-col"><h2 class="kvq-h kjv">✝️ What the King James Bible says</h2>' + c.kjv.map(function (r) { return V.bBlock(r); }).join("") + "</div>";
    var qr = '<div class="kvq-col"><h2 class="kvq-h qur">📖 What the Quran says <span class="small mute">(Yusuf Ali' + (pk() ? " · Pickthall beneath" : "") + ")</span></h2>" + c.quran.map(function (r) { return V.qBlock(r); }).join("") + "</div>";
    var rel = (c.related || []).map(function (id) { var t = BQ.topic(id); return t ? '<span class="badge sev-' + esc(t.sev) + '" data-topic="' + esc(id) + '">⚑ ' + esc(t.title) + "</span>" : ""; }).join("");
    return '<div class="' + (side() ? "cols" : "") + '">' + kj + qr + "</div>" +
      '<div class="card cmpbox"><h2>⚖️ Comparison</h2><p><b>✅ Where they agree:</b> ' + esc(c.agree) + "</p><p><b>↔️ Where they differ:</b> " + esc(c.differ) + "</p><p><b>❗ Why it matters:</b> " + esc(c.matters) + "</p>" +
      (c.muslim ? '<p class="resp"><b>🕌 How Muslims interpret it:</b> ' + esc(c.muslim) + "</p>" : "") +
      (rel ? "<p><b>Related weak-point cards:</b><br>" + rel + "</p>" : "") + "</div>";
  }
  function toggles() {
    return '<div class="row noprint"><label class="chk"><input type="checkbox" id="kvSide" ' + (side() ? "checked" : "") + '> Show side by side</label><label class="chk"><input type="checkbox" id="kvPk" ' + (pk() ? "checked" : "") + "> Show Pickthall</label></div>";
  }
  function wireToggles(rerender) {
    BQ.$("#kvSide").onchange = function () { localStorage.setItem("bq-side", this.checked ? "1" : "0"); rerender(); };
    BQ.$("#kvPk").onchange = function () { localStorage.setItem("bq-pk", this.checked ? "1" : "0"); rerender(); };
  }

  V.kvq = function (el, id, params) {
    params = params || {};
    BQ.loadBible().then(function () {
      if (id === "custom") return custom(el, params);
      if (id) return detail(el, id);
      var L = W.BQ_COMPARE, cat = params.cat || "", f = (params.f || "").toLowerCase();
      function link(c) { return "#/kvq?" + (c ? "cat=" + encodeURIComponent(c) : "") + (f ? "&f=" + encodeURIComponent(f) : ""); }
      el.innerHTML = '<h1>📖 KJV vs Quran</h1><p class="mute">' + L.length + " topics. Each one shows what the King James Bible says, then what the Quran says, word for word from the full bundled texts, followed by a short, fair comparison.</p>" +
        '<div class="card noprint"><h2>🔎 Compare any verse</h2><div class="cols"><div><label for="anyK">KJV reference</label><input id="anyK" placeholder="e.g. John 1:1 or Isaiah 53:4-6"></div><div><label for="anyQ">Quran reference</label><input id="anyQ" placeholder="e.g. 4:157 or 112:1-4"></div></div><p><button class="btn gold" id="anyGo">Compare these verses</button></p><div id="anyMsg"></div></div>' +
        '<input id="kvF" placeholder="Search the comparison topics…" value="' + esc(f) + '" aria-label="Filter topics">' +
        '<div class="filters"><a class="badge' + (!cat ? " on" : "") + '" href="' + link("") + '">All</a>' + W.BQ_CMP_CATS.map(function (c) { return '<a class="badge' + (cat === c ? " on" : "") + '" href="' + link(c) + '">' + esc(c) + "</a>"; }).join("") + "</div>" +
        '<div class="grid" id="kvList">' + L.filter(function (c) { return !cat || c.cat === cat; }).map(function (c) {
          var hay = (c.title + " " + c.cat + " " + c.kjv.join(" ") + " " + c.quran.join(" ") + " " + c.agree + " " + c.differ).toLowerCase();
          return '<a class="card kvq-item" style="text-decoration:none;color:inherit' + (f && hay.indexOf(f) < 0 ? ";display:none" : "") + '" href="#/kvq/' + c.id + '" data-hay="' + esc(hay) + '"><span class="badge">' + esc(c.cat) + "</span><h3>" + esc(c.title) + '</h3><div class="small"><b>KJV:</b> ' + esc(c.kjv.join("; ")) + '</div><div class="small"><b>Quran:</b> ' + esc(c.quran.join("; ")) + "</div></a>";
        }).join("") + "</div>";
      var inp = BQ.$("#kvF");
      inp.oninput = function () { var v = inp.value.toLowerCase().trim(); BQ.$$("#kvList .kvq-item").forEach(function (a) { a.style.display = !v || a.getAttribute("data-hay").indexOf(v) >= 0 ? "" : "none"; }); };
      BQ.$("#anyGo").onclick = function () {
        var k = BQ.$("#anyK").value.trim(), q = BQ.$("#anyQ").value.trim(), bad = [];
        if (k && !BQ.parseB(k)) bad.push("KJV “" + k + "”");
        if (q && !BQ.parseQ(q)) bad.push("Quran “" + q + "”");
        if (!k && !q) bad.push("Enter at least one reference");
        if (bad.length) { BQ.$("#anyMsg").innerHTML = '<p class="warn">Not recognised: ' + esc(bad.join(", ")) + "</p>"; return; }
        location.hash = "#/kvq/custom?k=" + encodeURIComponent(k) + "&q=" + encodeURIComponent(q);
      };
    });
  };
  function custom(el, p) {
    var k = p.k || "", q = p.q || "";
    var pb = k && BQ.parseB(k), pq = q && BQ.parseQ(q);
    el.innerHTML = '<p class="noprint"><a class="btn small" href="#/kvq">◀ All topics</a></p><h1>Compare: ' + esc(k || "—") + " vs Quran " + esc(q || "—") + "</h1>" + toggles() +
      '<div class="' + (side() ? "cols" : "") + '"><div class="kvq-col"><h2 class="kvq-h kjv">✝️ What the King James Bible says</h2>' + (pb ? V.bBlock(k) : '<p class="warn">No valid KJV reference.</p>') + '</div><div class="kvq-col"><h2 class="kvq-h qur">📖 What the Quran says</h2>' + (pq ? V.qBlock(q) : '<p class="warn">No valid Quran reference.</p>') + "</div></div>" +
      '<div class="row noprint"><button class="btn" id="kvPrint">🖨️ Print</button></div>';
    wireToggles(function () { custom(el, p); });
    BQ.$("#kvPrint").onclick = function () { W.print(); };
  }
  function detail(el, id) {
    var L = W.BQ_COMPARE, i = L.findIndex(function (c) { return c.id === id; }), c = L[i];
    if (!c) { el.innerHTML = '<p class="warn">Topic not found.</p><a class="btn" href="#/kvq">All topics</a>'; return; }
    var prev = L[(i - 1 + L.length) % L.length], next = L[(i + 1) % L.length], ref = "KJV vs Quran: " + c.title;
    el.innerHTML = '<div class="row noprint"><a class="btn small" href="#/kvq">◀ All topics</a><a class="btn small" href="#/kvq/' + prev.id + '">‹ ' + esc(prev.title) + '</a><a class="btn small" href="#/kvq/' + next.id + '">' + esc(next.title) + " ›</a></div>" +
      '<span class="badge">' + esc(c.cat) + "</span><h1>" + esc(c.title) + "</h1>" + toggles() +
      '<div class="row noprint" style="margin:8px 0"><button class="btn" data-act="bm" data-ref="' + esc(ref) + '">' + (BQ.store.isBookmarked(ref) ? "★ Bookmarked" : "☆ Bookmark") + '</button><button class="btn" data-act="note" data-ref="' + esc(ref) + '">📝 Note</button><button class="btn" id="kvPrint">🖨️ Print</button></div>' + block(c);
    wireToggles(function () { detail(el, id); });
    BQ.$("#kvPrint").onclick = function () { W.print(); };
  }
})(window);
