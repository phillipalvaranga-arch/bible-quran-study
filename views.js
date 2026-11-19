/* Views part 1: verse blocks, home, search, readers, weak-points catalog, topic modal. */
(function (W) {
  "use strict";
  var BQ = W.BQ, esc = BQ.esc, V = BQ.views = {};
  function pk() { return localStorage.getItem("bq-pk") !== "0"; }

  V.verseActions = function (ref) {
    return '<span class="row noprint" style="margin-top:6px">' +
      '<button class="btn small" data-act="bm" data-ref="' + esc(ref) + '">' + (BQ.store.isBookmarked(ref) ? "★ Bookmarked" : "☆ Bookmark") + "</button>" +
      '<button class="btn small" data-act="note" data-ref="' + esc(ref) + '">📝 Note</button></span>';
  };
  V.qBlock = function (ref, opts) {
    opts = opts || {};
    var vs = BQ.qVerses(ref);
    if (!vs.length) return '<div class="verse">Quran ' + esc(ref) + " (not found)</div>";
    var p = BQ.parseQ(ref);
    return '<div class="verse"><a class="ref" href="#/surah/' + p.s + "/" + p.a + '">Quran ' + esc(ref) + " · " + esc(BQ.Q.s[p.s - 1][0]) + "</a>" +
      vs.map(function (v) {
        return '<div><span class="mute small">' + v.a + "</span> " + BQ.hl(v.ya, opts.terms) + (pk() ? '<span class="alt">Pickthall: ' + BQ.hl(v.pk, opts.terms) + "</span>" : "") + "</div>";
      }).join("") + (opts.actions === false ? "" : V.verseActions("Quran " + ref)) + "</div>";
  };
  V.bBlock = function (ref, opts) {
    opts = opts || {};
    var p = BQ.parseB(ref);
    if (!p) return '<div class="verse bib">' + esc(ref) + " (not found)</div>";
    var vs = BQ.bVerses(p);
    return '<div class="verse bib"><a class="ref" href="' + BQ.bHref(p.book, p.c, p.a) + '">' + esc(ref) + " (KJV)</a>" +
      vs.map(function (v) { return '<div><span class="mute small">' + v.v + "</span> " + BQ.hl(v.t, opts.terms) + "</div>"; }).join("") +
      (opts.actions === false ? "" : V.verseActions(ref)) + "</div>";
  };
  function sevBadge(t) { return '<span class="badge sev-' + esc(t.sev) + '">' + esc(t.sev) + "</span>"; }
  function catBadge(t) { var c = BQ.cat(t.cat); return '<a class="badge" href="#/topics?cat=' + c.id + '">' + c.icon + " " + esc(c.name) + "</a>"; }
  V.topicCard = function (t) {
    return '<div class="card topic" data-topic="' + esc(t.id) + '" tabindex="0" role="button">' + catBadge(t) + sevBadge(t) + (t.mine ? '<span class="badge">My point</span>' : "") +
      "<h3>" + esc(t.title) + '</h3><div class="mute">' + esc(t.summary) + '</div><div class="small mute" style="margin-top:6px">Quran: ' + esc((t.q || []).join(", ") || "—") + "</div></div>";
  };

  /* ---------- Home ---------- */
  V.home = function (el) {
    var T = BQ.allTopics(), groups = {};
    (W.BQ_CATS || []).forEach(function (c) { groups[c.group] = groups[c.group] || []; groups[c.group].push(c); });
    el.innerHTML = '<section class="card hero"><h1>Bible &amp; Quran Study</h1><p>Search the Quran and the Bible, examine <b>' + T.length +
      "</b> cited weak points and controversies — in the Quran, Muhammad's life, and the hadith, sira, tafsir and fiqh books — and compare each with the Bible. Every Quran and Bible quotation is pulled live from the full bundled texts: Quran 114 surahs / 6,236 ayahs (Yusuf Ali &amp; Pickthall), KJV 66 books / 31,102 verses.</p>" +
      '<form id="homeSearch" class="row"><input id="homeQ" placeholder="Search: crucify, Torah, 4:157, John 1:1…" aria-label="Search"><button class="btn gold">🔍 Search &amp; Reveal</button></form>' +
      '<p class="small mute">Analytical and respectful: the goal is honest examination of texts and claims, with Muslim responses included for every point — not hostility toward Muslims.</p></section>' +
      Object.keys(groups).map(function (g) {
        return "<h2>" + esc(g === "Quran" ? "Weak points in the Quran" : g === "Muhammad" ? "Muhammad in Islamic sources" : "Other Books of Islam") + '</h2><div class="grid">' +
          groups[g].map(function (c) {
            var n = T.filter(function (t) { return t.cat === c.id; }).length;
            return '<a class="card" style="text-decoration:none;color:inherit" href="#/topics?cat=' + c.id + '"><h3>' + c.icon + " " + esc(c.name) + '</h3><div class="mute small">' + esc(c.blurb) + '</div><div class="small" style="margin-top:6px">' + n + " points →</div></a>";
          }).join("") + "</div>";
      }).join("") +
      '<h2>Start here</h2><div class="row"><a class="btn" href="#/books">📚 Guide to the Other Books of Islam</a><a class="btn" href="#/compare">↔️ Compare side by side</a><a class="btn" href="#/quiz">🎯 Quiz &amp; flashcards</a><a class="btn" href="#/print">🖨️ Printable study sheet</a></div>';
    BQ.$("#homeSearch").onsubmit = function (e) { e.preventDefault(); location.hash = "#/search?q=" + encodeURIComponent(BQ.$("#homeQ").value); };
  };

  /* ---------- Search & Reveal ---------- */
  function terms(q) {
    var t = [], m, re = /"([^"]+)"|(\S+)/g;
    while ((m = re.exec(q))) t.push((m[1] || m[2]).toLowerCase());
    return t.filter(function (x) { return x.length > 1 || /\d/.test(x); });
  }
  function matchAll(text, ts) { var s = text.toLowerCase(); return ts.every(function (t) { return s.indexOf(t) >= 0; }); }
  V.search = function (el, params) {
    var q = params.q || "", useB = params.bible === "1", useQ = params.quran !== "0";
    el.innerHTML = '<h1>🔍 Search &amp; Reveal</h1><form id="sf" class="card"><div class="row"><input id="sq" value="' + esc(q) + '" placeholder="Keyword, &quot;exact phrase&quot;, 4:157, or John 3:16" aria-label="Search query" style="flex:1 1 280px"><button class="btn gold" type="submit">Search</button></div>' +
      '<div class="row" style="margin-top:10px"><label class="chk"><input type="checkbox" id="sQ" ' + (useQ ? "checked" : "") + '> Quran</label><label class="chk"><input type="checkbox" id="sB" ' + (useB ? "checked" : "") + '> Bible (KJV)</label><label class="chk"><input type="checkbox" id="sPk" ' + (pk() ? "checked" : "") + "> Show Pickthall</label></div></form><div id=\"sr\"></div>";
    BQ.$("#sf").onsubmit = function (e) {
      e.preventDefault();
      location.hash = "#/search?q=" + encodeURIComponent(BQ.$("#sq").value.trim()) + "&bible=" + (BQ.$("#sB").checked ? 1 : 0) + "&quran=" + (BQ.$("#sQ").checked ? 1 : 0);
    };
    BQ.$("#sPk").onchange = function () { localStorage.setItem("bq-pk", this.checked ? "1" : "0"); V.search(el, params); };
    if (!q) { BQ.$("#sr").innerHTML = '<p class="mute">Try: <a href="#/search?q=crucify">crucify</a> · <a href="#/search?q=Torah">Torah</a> · <a href="#/search?q=4%3A157">4:157</a> · <a href="#/search?q=sabbath&bible=1">sabbath (with Bible)</a> · <a href="#/search?q=Bukhari">Bukhari</a> · <a href="#/search?q=John%2014%3A26&bible=1">John 14:26</a></p>'; return; }
    var out = BQ.$("#sr"), idx = BQ.verseIndex(), ts = terms(q), html = "";
    var need = useB || !BQ.parseQ(q) && /^[1-3]?\s*[a-z]/i.test(q);
    (need ? BQ.loadBible() : Promise.resolve()).then(function () {
      // Topic matches
      var tq = q.toLowerCase(), tm = BQ.allTopics().filter(function (t) {
        var hay = [t.title, t.summary, t.analysis, t.responses, (t.tags || []).join(" "), (t.q || []).join(" "), (t.b || []).join(" "), (t.sources || []).map(function (s) { return s.t + " " + (s.quote || ""); }).join(" ")].join(" ").toLowerCase();
        return ts.length && ts.every(function (x) { return hay.indexOf(x) >= 0; }) || hay.indexOf(tq) >= 0;
      });
      if (tm.length) html += "<h2>Weak points &amp; controversies matching “" + esc(q) + "” (" + tm.length + ')</h2><div class="grid">' + tm.slice(0, 24).map(V.topicCard).join("") + "</div>";
      // Reference lookups
      var pq = BQ.parseQ(q), pb = !pq && BQ.B ? BQ.parseB(q) : null;
      if (pq) {
        html += "<h2>Quran " + esc(q) + "</h2>" + BQ.qVerses(pq).map(function (v) { return resultQ(v, idx, []); }).join("");
      } else if (pb) {
        html += "<h2>" + esc(pb.book + " " + pb.c + (pb.whole ? "" : ":" + pb.a + (pb.b !== pb.a ? "-" + pb.b : ""))) + " (KJV)</h2>" + BQ.bVerses(pb).map(function (v) { return resultB(v, []); }).join("");
      } else {
        if (useQ) {
          var hits = [];
          BQ.Q.s.forEach(function (su, si) { su[4].forEach(function (v, ai) { if (matchAll(v[0], ts) || matchAll(v[1], ts)) hits.push({ s: si + 1, a: ai + 1, ya: v[0], pk: v[1] }); }); });
          html += "<h2>Quran: " + hits.length + " verse" + (hits.length === 1 ? "" : "s") + (hits.length > 200 ? " (showing first 200)" : "") + "</h2>" + (hits.length ? hits.slice(0, 200).map(function (v) { return resultQ(v, idx, ts); }).join("") : '<p class="mute">No Quran verses contain all of those words.</p>');
        }
        if (useB) {
          var bh = [];
          BQ.B.b.forEach(function (bk) { bk[1].forEach(function (ch, ci) { ch.forEach(function (t, vi) { if (matchAll(t, ts)) bh.push({ book: bk[0], c: ci + 1, v: vi + 1, t: t }); }); }); });
          html += "<h2>Bible (KJV): " + bh.length + " verse" + (bh.length === 1 ? "" : "s") + (bh.length > 200 ? " (showing first 200)" : "") + "</h2>" + (bh.length ? bh.slice(0, 200).map(function (v) { return resultB(v, ts); }).join("") : '<p class="mute">No KJV verses contain all of those words.</p>');
        }
      }
      out.innerHTML = html || '<p class="mute">No results.</p>';
    });
  };
  function resultQ(v, idx, ts) {
    var ids = idx[v.s + ":" + v.a] || [], ref = v.s + ":" + v.a;
    var badges = ids.map(function (id) { var t = BQ.topic(id), c = BQ.cat(t.cat); return '<span class="badge sev-' + esc(t.sev) + '" data-topic="' + esc(id) + '" title="' + esc(c.name) + '">' + c.icon + " " + esc(t.title.length > 48 ? t.title.slice(0, 46) + "…" : t.title) + "</span>"; }).join("");
    return '<div class="result"><a class="ref" href="#/surah/' + v.s + "/" + v.a + '"><b>Quran ' + ref + "</b></a> <span class=\"mute small\">" + esc(BQ.Q.s[v.s - 1][0]) + "</span> " + badges +
      "<div>" + BQ.hl(v.ya, ts) + "</div>" + (pk() ? '<div class="mute small">Pickthall: ' + BQ.hl(v.pk, ts) + "</div>" : "") +
      '<div class="row noprint" style="margin-top:8px"><button class="btn small gold" data-act="reveal" data-ref="' + ref + '">' + (ids.length ? "🔎 Reveal Weak Point &amp; Bible Answer (" + ids.length + ")" : "🔎 Reveal") + '</button><button class="btn small" data-act="bm" data-ref="Quran ' + ref + '">' + (BQ.store.isBookmarked("Quran " + ref) ? "★" : "☆") + ' Bookmark</button><button class="btn small" data-act="note" data-ref="Quran ' + ref + '">📝 Note</button></div><div class="reveal" hidden></div></div>';
  }
  function resultB(v, ts) {
    var ref = v.book + " " + v.c + ":" + v.v;
    return '<div class="result"><a class="ref" href="' + BQ.bHref(v.book, v.c, v.v) + '"><b>' + esc(ref) + "</b></a> <span class=\"mute small\">KJV</span><div>" + BQ.hl(v.t, ts) + '</div><div class="row noprint" style="margin-top:8px"><button class="btn small" data-act="bm" data-ref="' + esc(ref) + '">' + (BQ.store.isBookmarked(ref) ? "★" : "☆") + ' Bookmark</button><button class="btn small" data-act="note" data-ref="' + esc(ref) + '">📝 Note</button></div></div>';
  }
  V.reveal = function (btn) {
    var box = btn.closest(".result").querySelector(".reveal");
    if (!box.hidden) { box.hidden = true; return; }
    box.hidden = false; box.innerHTML = '<p class="mute">Loading…</p>';
    var ref = btn.getAttribute("data-ref"), ids = BQ.verseIndex()[ref] || [];
    BQ.loadBible().then(function () {
      if (!ids.length) {
        var s = +ref.split(":")[0], near = BQ.allTopics().filter(function (t) { return (t.q || []).some(function (r) { var p = BQ.parseQ(r); return p && p.s === s; }); });
        box.innerHTML = '<p class="mute">No catalogued weak point cites this exact verse.</p>' + (near.length ? "<h3>Points from the same surah</h3>" + near.map(V.topicCard).join("") : "");
        return;
      }
      box.innerHTML = ids.map(function (id) {
        var t = BQ.topic(id);
        return '<div class="card"><span class="badge sev-' + esc(t.sev) + '">' + esc(t.sev) + "</span><h3>" + esc(t.title) + "</h3><p>" + esc(t.summary) + "</p><h3>Biblical answer</h3>" +
          (t.b || []).slice(0, 3).map(function (r) { return V.bBlock(r, { actions: false }); }).join("") +
          '<button class="btn gold small" data-topic="' + esc(id) + '">Open full analysis, Muslim responses &amp; sources →</button></div>';
      }).join("");
    });
  };

  /* ---------- Readers ---------- */
  V.surah = function (el, s, a) {
    s = Math.min(114, Math.max(1, +s || 1));
    var su = BQ.Q.s[s - 1], idx = BQ.verseIndex();
    el.innerHTML = '<div class="row noprint"><a class="btn small" href="#/surah/' + Math.max(1, s - 1) + '">◀ Prev</a><select id="sPick" aria-label="Choose surah" style="flex:1 1 220px">' +
      BQ.Q.s.map(function (x, i) { return '<option value="' + (i + 1) + '"' + (i + 1 === s ? " selected" : "") + ">" + (i + 1) + ". " + esc(x[0]) + " — " + esc(x[1]) + "</option>"; }).join("") +
      '</select><a class="btn small" href="#/surah/' + Math.min(114, s + 1) + '">Next ▶</a></div><h1>Surah ' + s + ": " + esc(su[0]) + ' <span class="mute small">' + esc(su[3]) + " · " + esc(su[1]) + " · " + esc(su[2]) + " · " + su[4].length + ' ayahs</span></h1><label class="chk noprint"><input type="checkbox" id="rPk" ' + (pk() ? "checked" : "") + '> Show Pickthall under Yusuf Ali</label><div class="reader card">' +
      su[4].map(function (v, i) {
        var ids = idx[s + ":" + (i + 1)] || [];
        return '<div class="v' + (+a === i + 1 ? " hl" : "") + '" id="v' + (i + 1) + '"><a class="n" href="#/search?q=' + s + "%3A" + (i + 1) + '">' + s + ":" + (i + 1) + "</a>" + esc(v[0]) + (pk() ? '<span class="alt mute small" style="display:block">Pickthall: ' + esc(v[1]) + "</span>" : "") +
          (ids.length ? "<div>" + ids.map(function (id) { var t = BQ.topic(id); return '<span class="badge sev-' + esc(t.sev) + '" data-topic="' + esc(id) + '">⚑ ' + esc(t.title) + "</span>"; }).join("") + "</div>" : "") + "</div>";
      }).join("") + "</div>";
    BQ.$("#sPick").onchange = function () { location.hash = "#/surah/" + this.value; };
    BQ.$("#rPk").onchange = function () { localStorage.setItem("bq-pk", this.checked ? "1" : "0"); V.surah(el, s, a); };
    if (a) setTimeout(function () { var x = BQ.$("#v" + a); if (x) x.scrollIntoView({ block: "center" }); }, 30);
  };
  V.bible = function (el, book, c, v) {
    el.innerHTML = '<p class="loading">Loading KJV…</p>';
    BQ.loadBible().then(function () {
      var bi = BQ.findBook(book || "Genesis"); if (bi < 0) bi = 0;
      var bk = BQ.B.b[bi]; c = Math.min(bk[1].length, Math.max(1, +c || 1));
      var chap = bk[1][c - 1], prev = c > 1 ? [bi, c - 1] : bi > 0 ? [bi - 1, BQ.B.b[bi - 1][1].length] : null, next = c < bk[1].length ? [bi, c + 1] : bi < 65 ? [bi + 1, 1] : null;
      el.innerHTML = '<div class="row noprint">' + (prev ? '<a class="btn small" href="' + BQ.bHref(BQ.B.b[prev[0]][0], prev[1]) + '">◀ Prev</a>' : "") +
        '<select id="bPick" aria-label="Book" style="flex:1 1 160px">' + BQ.B.b.map(function (x, i) { return '<option value="' + i + '"' + (i === bi ? " selected" : "") + ">" + esc(x[0]) + "</option>"; }).join("") +
        '</select><select id="cPick" aria-label="Chapter" style="flex:0 1 110px">' + bk[1].map(function (_, i) { return '<option value="' + (i + 1) + '"' + (i + 1 === c ? " selected" : "") + ">" + (i + 1) + "</option>"; }).join("") + "</select>" +
        (next ? '<a class="btn small" href="' + BQ.bHref(BQ.B.b[next[0]][0], next[1]) + '">Next ▶</a>' : "") + "</div><h1>" + esc(bk[0]) + " " + c + ' <span class="mute small">KJV · ' + chap.length + ' verses</span></h1><div class="reader card">' +
        chap.map(function (t, i) { return '<div class="v' + (+v === i + 1 ? " hl" : "") + '" id="v' + (i + 1) + '"><span class="n">' + (i + 1) + "</span>" + esc(t) + "</div>"; }).join("") + "</div>";
      BQ.$("#bPick").onchange = function () { location.hash = BQ.bHref(BQ.B.b[this.value][0], 1); };
      BQ.$("#cPick").onchange = function () { location.hash = BQ.bHref(bk[0], this.value); };
      if (v) setTimeout(function () { var x = BQ.$("#v" + v); if (x) x.scrollIntoView({ block: "center" }); }, 30);
    });
  };

  /* ---------- Weak points catalog ---------- */
  V.topics = function (el, params) {
    var cat = params.cat || "", sev = params.sev || "", f = (params.f || "").toLowerCase();
    var list = BQ.allTopics().filter(function (t) {
      return (!cat || t.cat === cat) && (!sev || t.sev === sev) && (!f || (t.title + " " + t.summary + " " + (t.tags || []).join(" ")).toLowerCase().indexOf(f) >= 0);
    });
    function link(k, v) { var p = { cat: cat, sev: sev, f: f }; p[k] = v; return "#/topics?" + Object.keys(p).filter(function (x) { return p[x]; }).map(function (x) { return x + "=" + encodeURIComponent(p[x]); }).join("&"); }
    el.innerHTML = "<h1>⚖️ Weak Points &amp; Controversies</h1><p class=\"mute\">" + BQ.allTopics().length + ' points across the Quran, Muhammad\'s life, and the other books of Islam. Tap a card for verses, analysis, Muslim responses, the Bible\'s answer and sources.</p>' +
      '<div class="filters" id="catF"><a class="badge' + (!cat ? " on" : "") + '" href="' + link("cat", "") + '">All</a>' +
      (W.BQ_CATS || []).map(function (c) { return '<a class="badge' + (cat === c.id ? " on" : "") + '" data-cat="' + c.id + '" href="' + link("cat", c.id) + '">' + c.icon + " " + esc(c.name) + "</a>"; }).join("") + "</div>" +
      '<div class="filters"><a class="badge' + (!sev ? " on" : "") + '" href="' + link("sev", "") + '">Any severity</a>' + ["High", "Medium", "Notable"].map(function (s) { return '<a class="badge sev-' + s + (sev === s ? " on" : "") + '" href="' + link("sev", s) + '">' + s + "</a>"; }).join("") + "</div>" +
      '<input id="tf" placeholder="Filter these cards…" value="' + esc(f) + '" aria-label="Filter">' +
      (cat ? '<p class="mute">' + esc(BQ.cat(cat).blurb || "") + "</p>" : "") + '<p class="small mute">' + list.length + ' shown</p><div class="grid" id="tlist">' + list.map(V.topicCard).join("") + "</div>";
    var tf = BQ.$("#tf"), timer;
    tf.oninput = function () { clearTimeout(timer); timer = setTimeout(function () { history.replaceState(null, "", link("f", tf.value)); var v = tf.value.toLowerCase(); BQ.$$("#tlist .topic").forEach(function (c) { c.style.display = c.textContent.toLowerCase().indexOf(v) >= 0 ? "" : "none"; }); }, 150); };
  };

  V.openTopic = function (id) {
    var t = BQ.topic(id);
    if (!t) { BQ.toast("Point not found"); return; }
    BQ.openModal('<p class="loading">Loading verses…</p>');
    BQ.loadBible().then(function () {
      var c = BQ.cat(t.cat);
      var html = '<a class="badge" href="#/topics?cat=' + c.id + '">' + c.icon + " " + esc(c.name) + '</a><span class="badge sev-' + esc(t.sev) + '">' + esc(t.sev) + "</span>" + (t.mine ? '<span class="badge">My point</span>' : "") +
        "<h1>" + esc(t.title) + '</h1><p><b>' + esc(t.summary) + "</b></p>" +
        ((t.q || []).length ? "<h2>📖 Quran (verbatim)</h2>" + t.q.map(function (r) { return V.qBlock(r); }).join("") : "") +
        (t.analysis ? "<h2>🔎 Analysis</h2><p>" + esc(t.analysis) + "</p>" : "") +
        (t.responses ? '<h2>🕌 Common Islamic responses</h2><button class="btn" id="respBtn" aria-expanded="false">Show Muslim responses &amp; follow-up questions</button><div id="respBox" class="resp" hidden><p>' + esc(t.responses) + "</p>" +
          ((t.followups || []).length ? "<h3>Follow-up questions for respectful dialogue</h3><ul>" + t.followups.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" : "") + "</div>" : "") +
        ((t.b || []).length ? "<h2>✝️ Biblical contrast (KJV)</h2>" + t.b.map(function (r) { return V.bBlock(r); }).join("") : "") +
        ((t.sources || []).length ? "<h2>📚 Verified sources</h2>" + t.sources.map(function (s) { return '<div class="src">• ' + (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.t) + "</a>" : esc(s.t)) + (s.quote ? "<q>" + esc(s.quote) + "</q>" : "") + "</div>"; }).join("") : "") +
        '<div class="row noprint" style="margin-top:14px"><button class="btn" data-act="bm" data-ref="Point: ' + esc(t.title) + '">' + (BQ.store.isBookmarked("Point: " + t.title) ? "★ Bookmarked" : "☆ Bookmark point") + '</button><button class="btn" data-act="note" data-ref="Point: ' + esc(t.title) + '">📝 Note</button><button class="btn" data-act="addprint" data-id="' + esc(t.id) + '">🖨️ Add to study sheet</button><a class="btn" href="#/compare?t=' + encodeURIComponent(t.id) + '">↔️ Compare</a></div>';
      BQ.openModal(html, function (box) {
        var rb = BQ.$("#respBtn", box);
        if (rb) rb.onclick = function () { var r = BQ.$("#respBox", box); r.hidden = !r.hidden; rb.setAttribute("aria-expanded", String(!r.hidden)); rb.textContent = r.hidden ? "Show Muslim responses & follow-up questions" : "Hide Muslim responses"; };
      });
    });
  };
})(window);
