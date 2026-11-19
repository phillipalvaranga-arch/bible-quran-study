/* Views part 2: Other Books guide, compare, notes, quiz/flashcards, print sheet, sync. */
(function (W) {
  "use strict";
  var BQ = W.BQ, esc = BQ.esc, V = BQ.views;

  V.books = function (el) {
    var G = W.BQ_BOOKS;
    el.innerHTML = "<h1>📚 Other Books of Islam</h1><p>" + esc(G.intro) + '</p><div class="row noprint">' + G.sections.map(function (s) { return '<a class="btn small" href="#/books" data-jump="' + s.id + '">' + s.icon + " " + esc(s.title) + "</a>"; }).join("") + "</div>" +
      G.sections.map(function (s) {
        return '<section class="card" id="sec-' + s.id + '"><h2>' + s.icon + " " + esc(s.title) + "</h2><p>" + esc(s.text) + "</p>" +
          '<div class="grid">' + s.items.map(function (i) { return '<div class="resp"><b>' + esc(i.name) + '</b><div class="small mute">' + esc(i.by) + '</div><div class="small">' + esc(i.note) + "</div></div>"; }).join("") + "</div>" +
          (s.shia ? '<p class="resp"><b>Shia collections:</b> ' + esc(s.shia) + "</p>" : "") +
          "<h3>⚑ Controversies found in these books</h3>" + s.controversies.map(function (id) { var t = BQ.topic(id); return t ? '<span class="badge sev-' + esc(t.sev) + '" data-topic="' + esc(id) + '">' + esc(t.title) + "</span>" : ""; }).join("") +
          '<p><a class="btn small" href="#/topics?cat=' + s.id + '">Open all ' + esc(BQ.cat(s.id).name) + " cards →</a></p></section>";
      }).join("") +
      '<section class="card"><h2>❓ Why these books matter</h2><p>Many core Islamic teachings and practices are not found in the Quran itself:</p>' + G.why.map(function (w) { return '<div class="resp"><b>' + esc(w.t) + "</b> — " + esc(w.d) + ' <span class="badge" data-topic="' + esc(w.id) + '">Open card</span></div>'; }).join("") +
      "<h3>Quranist vs Sunni vs Shia</h3>" + G.views.map(function (v) { return '<div class="resp"><b>' + esc(v.t) + ":</b> " + esc(v.d) + "</div>"; }).join("") + "</section>";
    BQ.$$("[data-jump]", el).forEach(function (a) { a.onclick = function (e) { e.preventDefault(); BQ.$("#sec-" + a.getAttribute("data-jump")).scrollIntoView({ behavior: "smooth" }); }; });
  };

  V.compare = function (el, params) {
    var T = BQ.allTopics(), t = params.t ? BQ.topic(params.t) : null;
    var lq = params.l || (t ? (t.q || [])[0] || "" : "4:157"), rb = params.r || (t ? (t.b || [])[0] || "" : "1 Corinthians 15:3-4");
    el.innerHTML = '<h1>↔️ Side-by-side</h1><div class="card noprint"><label>Load the verses of a weak point</label><select id="cT"><option value="">— choose a point —</option>' +
      T.map(function (x) { return '<option value="' + esc(x.id) + '"' + (t && t.id === x.id ? " selected" : "") + ">" + esc(BQ.cat(x.cat).icon + " " + x.title) + "</option>"; }).join("") +
      '</select><div class="cols"><div><label>Quran reference (e.g. 4:157 or 5:46-47)</label><input id="cL" value="' + esc(lq) + '"></div><div><label>Bible reference (e.g. John 19:30 or Isaiah 53)</label><input id="cR" value="' + esc(rb) + '"></div></div><p><button class="btn gold" id="cGo">Compare</button></p></div><div id="cOut"><p class="loading">Loading…</p></div>';
    BQ.$("#cT").onchange = function () { location.hash = "#/compare?t=" + encodeURIComponent(this.value); };
    BQ.$("#cGo").onclick = function () { location.hash = "#/compare?l=" + encodeURIComponent(BQ.$("#cL").value) + "&r=" + encodeURIComponent(BQ.$("#cR").value) + (t ? "&t=" + t.id : ""); };
    BQ.loadBible().then(function () {
      var L = t && !params.l ? t.q : [lq], R = t && !params.r ? t.b : [rb];
      BQ.$("#cOut").innerHTML = (t ? '<div class="card"><h2>' + esc(t.title) + "</h2><p>" + esc(t.summary) + '</p><button class="btn small" data-topic="' + esc(t.id) + '">Open full card</button></div>' : "") +
        '<div class="cols"><div><h2>📖 Quran</h2>' + (L || []).map(function (r) { return BQ.parseQ(r) ? V.qBlock(r) : '<p class="warn">Not a Quran reference: ' + esc(r) + "</p>"; }).join("") + '</div><div><h2>✝️ Bible (KJV)</h2>' + (R || []).map(function (r) { return BQ.parseB(r) ? V.bBlock(r) : '<p class="warn">Not a Bible reference: ' + esc(r) + "</p>"; }).join("") + "</div></div>";
    });
  };

  /* ---------- Notes / bookmarks / my points ---------- */
  V.notes = function (el) {
    var D = BQ.store.data;
    el.innerHTML = '<h1>📝 Notes, Bookmarks &amp; My Points</h1><div class="row noprint"><button class="btn gold" data-act="note" data-ref="">➕ New note</button><button class="btn" id="exp">⬇️ Export JSON</button><label class="btn" style="margin:0">⬆️ Import JSON<input type="file" id="imp" accept="application/json,.json" hidden></label><a class="btn" href="#/sync">☁️ Sync</a></div>' +
      "<h2>Notes (" + D.notes.length + ")</h2>" + (D.notes.length ? D.notes.map(function (n) {
        return '<div class="card"><div class="row" style="justify-content:space-between"><b>' + esc(n.ref || "General") + '</b><span class="small mute">' + esc(new Date(n.updatedAt).toLocaleString()) + "</span></div><p style=\"white-space:pre-wrap\">" + esc(n.text) + '</p><div class="row noprint"><button class="btn small" data-act="editnote" data-id="' + n.id + '">Edit</button><button class="btn small danger" data-act="del" data-kind="notes" data-id="' + n.id + '">Delete</button></div></div>';
      }).join("") : '<p class="mute">No notes yet. Tap “📝 Note” on any verse or point.</p>') +
      "<h2>Bookmarks (" + D.bookmarks.length + ")</h2>" + (D.bookmarks.length ? D.bookmarks.map(function (b) {
        return '<div class="card row" style="justify-content:space-between"><a href="' + esc(refHref(b.ref)) + '" data-bmref="' + esc(b.ref) + '">' + esc(b.ref) + '</a><button class="btn small danger" data-act="del" data-kind="bookmarks" data-id="' + b.id + '">Remove</button></div>';
      }).join("") : '<p class="mute">No bookmarks yet.</p>') +
      "<h2>My custom points (" + D.custom.length + ')</h2><div class="card noprint"><label>Title</label><input id="cpT" placeholder="e.g. Jesus as the Word of God (4:171)"><label>Category</label><select id="cpC">' + (W.BQ_CATS || []).map(function (c) { return '<option value="' + c.id + '">' + c.icon + " " + esc(c.name) + "</option>"; }).join("") +
      '</select><div class="cols"><div><label>Quran refs (comma-separated, e.g. 4:171, 3:45)</label><input id="cpQ"></div><div><label>Bible refs (e.g. John 1:1-3, Colossians 1:16)</label><input id="cpB"></div></div><label>Summary &amp; analysis</label><textarea id="cpA"></textarea><div id="cpWarn"></div><p><button class="btn gold" id="cpSave">Save point</button></p></div>' +
      D.custom.map(function (c) { return '<div class="card"><b>' + esc(c.title) + '</b> <span class="badge" data-topic="my-' + c.id + '">Open</span><div class="small mute">' + esc((c.q || []).join(", ")) + " · " + esc((c.b || []).join(", ")) + '</div><button class="btn small danger" data-act="del" data-kind="custom" data-id="' + c.id + '">Delete</button></div>'; }).join("");
    BQ.$("#exp").onclick = function () { BQ.download("bible-quran-study-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(BQ.store.data, null, 2)); BQ.toast("Exported"); };
    BQ.$("#imp").onchange = function () {
      var f = this.files[0]; if (!f) return;
      f.text().then(function (txt) {
        var d = JSON.parse(txt); BQ.store.set(W.BQSync.merge(BQ.store.data, BQ.store.norm(d))); BQ.toast("Imported and merged"); V.notes(el);
      }).catch(function () { BQ.toast("That file is not valid JSON"); });
    };
    BQ.$("#cpSave").onclick = function (e) {
      var title = BQ.$("#cpT").value.trim(); if (!title) { BQ.toast("Add a title"); return; }
      var split = function (s) { return s.split(/[,;]/).map(function (x) { return x.trim(); }).filter(Boolean); };
      var q = split(BQ.$("#cpQ").value), b = split(BQ.$("#cpB").value);
      var badQ = q.filter(function (r) { return !BQ.parseQ(r); });
      BQ.loadBible().then(function () {
        var badB = b.filter(function (r) { return !BQ.parseB(r); });
        if (badQ.length || badB.length) { BQ.$("#cpWarn").innerHTML = '<div class="warn">Not recognised: ' + esc(badQ.concat(badB).join(", ")) + "</div>"; return; }
        var dup = BQ.allTopics().filter(function (t) { return t.title.toLowerCase() === title.toLowerCase(); })[0];
        if (dup && !e.target.dataset.force) { BQ.$("#cpWarn").innerHTML = '<div class="warn">⚠️ A point with this title already exists. Tap Save again to keep both.</div>'; e.target.dataset.force = "1"; return; }
        BQ.store.add("custom", { title: title, cat: BQ.$("#cpC").value, q: q, b: b, analysis: BQ.$("#cpA").value.trim(), summary: BQ.$("#cpA").value.trim().slice(0, 180) });
        BQ.toast("Point saved"); V.notes(el);
      });
    };
  };
  function refHref(ref) {
    var m = /^Quran (\d+):(\d+)/.exec(ref); if (m) return "#/surah/" + m[1] + "/" + m[2];
    if (/^Point: /.test(ref)) { var t = BQ.allTopics().filter(function (x) { return "Point: " + x.title === ref; })[0]; return t ? "#/topic/" + t.id : "#/topics"; }
    var p = BQ.B && BQ.parseB(ref); if (p) return BQ.bHref(p.book, p.c, p.a);
    return "#/search?q=" + encodeURIComponent(ref) + "&bible=1";
  }
  V.noteDialog = function (ref, existing) {
    BQ.openModal("<h2>" + (existing ? "Edit note" : "New note") + '</h2><label>Reference (optional)</label><input id="nRef" value="' + esc(existing ? existing.ref : ref) + '"><label>Note</label><textarea id="nText">' + esc(existing ? existing.text : "") + '</textarea><div id="nWarn"></div><div class="row"><button class="btn gold" id="nSave">Save note</button><button class="btn" id="nCancel">Cancel</button></div>', function (box) {
      BQ.$("#nText", box).focus();
      BQ.$("#nCancel", box).onclick = BQ.closeModal;
      BQ.$("#nSave", box).onclick = function (e) {
        var r = BQ.$("#nRef", box).value.trim(), t = BQ.$("#nText", box).value.trim();
        if (!t) { BQ.toast("Write something first"); return; }
        var dup = BQ.store.data.notes.filter(function (n) { return (!existing || n.id !== existing.id) && n.text.trim().toLowerCase() === t.toLowerCase() && (n.ref || "") === r; })[0];
        if (dup && !e.target.dataset.force) { BQ.$("#nWarn", box).innerHTML = '<div class="warn">⚠️ Duplicate: you already saved this same note for ' + esc(r || "General") + ". Tap Save again to keep both.</div>"; e.target.dataset.force = "1"; return; }
        if (existing) { existing.ref = r; existing.text = t; existing.updatedAt = BQ.now(); BQ.store.save(); }
        else BQ.store.add("notes", { ref: r, text: t });
        BQ.closeModal(); BQ.toast("Note saved"); if (/^#\/notes/.test(location.hash)) V.notes(BQ.$("#view"));
      };
    });
  };

  /* ---------- Quiz & flashcards ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function makeQuestions(cat) {
    var T = (W.BQ_TOPICS || []).filter(function (t) { return !cat || t.cat === cat; }), ALL = W.BQ_TOPICS, qs = [];
    T.forEach(function (t) {
      var others = shuffle(ALL.filter(function (x) { return x.cat !== t.cat; }));
      if (t.q && t.q.length) {
        var wrong = shuffle(ALL.filter(function (x) { return x.id !== t.id && x.q && x.q.length && x.q[0] !== t.q[0]; })).slice(0, 3).map(function (x) { return x.q[0]; });
        qs.push({ q: "Which Quran passage is central to: “" + t.title + "”?", a: t.q[0], opts: shuffle([t.q[0]].concat(wrong)), id: t.id });
      }
      var cats = shuffle((W.BQ_CATS || []).filter(function (c) { return c.id !== t.cat; })).slice(0, 3).map(function (c) { return c.name; });
      qs.push({ q: "Which category does this point belong to? “" + t.title + "”", a: BQ.cat(t.cat).name, opts: shuffle([BQ.cat(t.cat).name].concat(cats)), id: t.id });
      (t.sources || []).forEach(function (s) {
        if (!s.quote || !s.url) return;
        var srcs = shuffle(ALL.reduce(function (acc, x) { return acc.concat((x.sources || []).filter(function (y) { return y.quote && y.t !== s.t; }).map(function (y) { return y.t; })); }, [])).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 3);
        if (srcs.length === 3) qs.push({ q: "Which source records: “" + s.quote + "”", a: s.t, opts: shuffle([s.t].concat(srcs)), id: t.id });
      });
      if (t.b && t.b.length) {
        var wb = shuffle(others.filter(function (x) { return x.b && x.b.length; })).slice(0, 3).map(function (x) { return x.b[0]; });
        qs.push({ q: "Which Bible passage is the contrast offered for: “" + t.title + "”?", a: t.b[0], opts: shuffle([t.b[0]].concat(wb)), id: t.id });
      }
    });
    return shuffle(qs);
  }
  V.quiz = function (el, params) {
    var mode = params.mode || "quiz", cat = params.cat || "";
    el.innerHTML = '<h1>🎯 Quiz &amp; Flashcards</h1><div class="row noprint"><a class="btn' + (mode === "quiz" ? " gold" : "") + '" href="#/quiz?mode=quiz&cat=' + cat + '">Quiz</a><a class="btn' + (mode === "cards" ? " gold" : "") + '" href="#/quiz?mode=cards&cat=' + cat + '">Flashcards</a><select id="qCat" style="flex:1 1 200px"><option value="">All categories</option>' +
      (W.BQ_CATS || []).map(function (c) { return '<option value="' + c.id + '"' + (c.id === cat ? " selected" : "") + ">" + c.icon + " " + esc(c.name) + "</option>"; }).join("") + '</select></div><div id="qz"></div>';
    BQ.$("#qCat").onchange = function () { location.hash = "#/quiz?mode=" + mode + "&cat=" + this.value; };
    var box = BQ.$("#qz");
    if (mode === "cards") {
      var cards = shuffle((W.BQ_TOPICS || []).filter(function (t) { return !cat || t.cat === cat; })), i = 0, flipped = false;
      var draw = function () {
        var t = cards[i];
        box.innerHTML = '<p class="mute">Card ' + (i + 1) + " of " + cards.length + ' — tap the card to flip</p><div class="card flash" id="fc">' + (flipped ? "<div><p>" + esc(t.summary) + '</p><p class="small mute">Quran ' + esc((t.q || []).join(", ")) + " · Bible " + esc((t.b || []).slice(0, 3).join(", ")) + "</p></div>" : "<b>" + esc(t.title) + "</b>") + '</div><div class="row"><button class="btn" id="fp">◀ Prev</button><button class="btn gold" id="ff">Flip</button><button class="btn" id="fn">Next ▶</button><button class="btn" data-topic="' + esc(t.id) + '">Open card</button></div>';
        BQ.$("#fc").onclick = BQ.$("#ff").onclick = function () { flipped = !flipped; draw(); };
        BQ.$("#fp").onclick = function () { i = (i - 1 + cards.length) % cards.length; flipped = false; draw(); };
        BQ.$("#fn").onclick = function () { i = (i + 1) % cards.length; flipped = false; draw(); };
      };
      if (cards.length) draw(); else box.innerHTML = '<p class="mute">No cards.</p>';
      return;
    }
    var qs = makeQuestions(cat).slice(0, 10), n = 0, score = 0;
    var ask = function () {
      if (n >= qs.length) {
        var best = Math.max(score, +(localStorage.getItem("bq-quiz-best") || 0)); localStorage.setItem("bq-quiz-best", best);
        box.innerHTML = '<div class="card"><h2>Score: ' + score + " / " + qs.length + '</h2><p class="mute">Best: ' + best + '</p><a class="btn gold" href="#/quiz?mode=quiz&cat=' + cat + "&r=" + Date.now() + '">Play again</a></div>'; return;
      }
      var Q = qs[n];
      box.innerHTML = '<div class="card"><p class="mute">Question ' + (n + 1) + " of " + qs.length + " · Score " + score + "</p><h2>" + esc(Q.q) + "</h2>" + Q.opts.map(function (o, k) { return '<button class="btn qopt" data-k="' + k + '">' + esc(o) + "</button>"; }).join("") + '<div id="qFb"></div></div>';
      BQ.$$(".qopt", box).forEach(function (b) {
        b.onclick = function () {
          if (box.dataset.done === "1") return; box.dataset.done = "1";
          var pick = Q.opts[+b.dataset.k], ok = pick === Q.a; if (ok) score++;
          BQ.$$(".qopt", box).forEach(function (x) { if (Q.opts[+x.dataset.k] === Q.a) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
          BQ.$("#qFb").innerHTML = "<p><b>" + (ok ? "✅ Correct" : "❌ The answer is: " + esc(Q.a)) + '</b></p><div class="row"><button class="btn small" data-topic="' + esc(Q.id) + '">Study this point</button><button class="btn gold" id="qNext">Next ▶</button></div>';
          BQ.$("#qNext").onclick = function () { box.dataset.done = "0"; n++; ask(); };
        };
      });
    };
    box.dataset.done = "0";
    if (qs.length) ask(); else box.innerHTML = '<p class="mute">No questions.</p>';
  };

  /* ---------- Print sheet ---------- */
  V.print = function (el) {
    var sel = JSON.parse(localStorage.getItem("bq-print") || "[]"), T = W.BQ_TOPICS.concat(BQ.allTopics().filter(function (t) { return t.mine; }));
    el.innerHTML = '<h1>🖨️ Printable Study Sheet</h1><div class="card noprint"><p class="mute">Choose points (or add them from any card), then print or save as PDF.</p><div class="row"><button class="btn gold" id="pPrint">🖨️ Print</button><button class="btn" id="pClear">Clear</button></div><div style="max-height:260px;overflow:auto;margin-top:10px">' +
      T.map(function (t) { return '<label class="chk" style="margin:6px 0"><input type="checkbox" data-pid="' + esc(t.id) + '"' + (sel.indexOf(t.id) >= 0 ? " checked" : "") + "> " + esc(BQ.cat(t.cat).icon + " " + t.title) + "</label>"; }).join("") + '</div></div><div id="sheet"><p class="loading">Loading…</p></div>';
    BQ.$("#pPrint").onclick = function () { W.print(); };
    BQ.$("#pClear").onclick = function () { localStorage.setItem("bq-print", "[]"); V.print(el); };
    BQ.$$("[data-pid]", el).forEach(function (c) { c.onchange = function () { var s = JSON.parse(localStorage.getItem("bq-print") || "[]"), id = c.dataset.pid; s = c.checked ? s.concat([id]) : s.filter(function (x) { return x !== id; }); localStorage.setItem("bq-print", JSON.stringify(s)); V.print(el); }; });
    BQ.loadBible().then(function () {
      var list = sel.map(BQ.topic).filter(Boolean);
      BQ.$("#sheet").innerHTML = list.length ? "<h2>Bible &amp; Quran Study Sheet — " + new Date().toLocaleDateString() + "</h2>" + list.map(function (t) {
        return '<div class="card"><h2>' + esc(t.title) + '</h2><p class="small mute">' + esc(BQ.cat(t.cat).name) + " · " + esc(t.sev) + "</p><p><b>" + esc(t.summary) + "</b></p>" + (t.q || []).map(function (r) { return V.qBlock(r, { actions: false }); }).join("") + "<p>" + esc(t.analysis) + "</p>" +
          (t.responses ? "<p><i>Muslim response:</i> " + esc(t.responses) + "</p>" : "") + (t.b || []).map(function (r) { return V.bBlock(r, { actions: false }); }).join("") +
          ((t.sources || []).length ? '<p class="small">Sources: ' + t.sources.map(function (s) { return esc(s.t) + (s.url ? " (" + esc(s.url) + ")" : ""); }).join("; ") + "</p>" : "") + "</div>";
      }).join("") : '<p class="mute">Nothing selected yet.</p>';
    });
  };

  /* ---------- Sync ---------- */
  V.sync = function (el) {
    var S = W.BQSync, last = S.last();
    el.innerHTML = '<h1>☁️ Sync between your devices</h1><div class="card"><p>Notes, bookmarks and your custom points sync through a <b>private GitHub Gist</b> on your own account. Create a GitHub token with only the <b>gist</b> scope and paste it below on each device. The token stays in this browser only and is sent only to api.github.com. Deletions sync too.</p>' +
      '<p class="small"><a href="https://github.com/settings/tokens/new?scopes=gist&description=Bible%20Quran%20Study%20Sync" target="_blank" rel="noopener">Create a gist-scope token on GitHub ↗</a></p>' +
      (S.hasToken() ? '<p>✅ A token is saved on this device.' + (S.gistId() ? " Gist: <code>" + esc(S.gistId()) + "</code>" : "") + "</p>" : '<label for="tok">Gist token</label><input id="tok" type="password" autocomplete="off" spellcheck="false" placeholder="Paste token (never shared or exported)">') +
      '<div class="row" style="margin-top:10px">' + (S.hasToken() ? '<button class="btn gold" id="syncGo">🔄 Sync now</button><button class="btn danger" id="syncForget">Forget token on this device</button>' : '<button class="btn gold" id="tokSave">Save token &amp; sync</button>') + "</div>" +
      '<p id="syncMsg" class="mute">' + (last ? "Last synced: " + esc(new Date(last).toLocaleString()) : "Not synced yet on this device.") + "</p></div>";
    var msg = BQ.$("#syncMsg");
    var run = function () {
      msg.textContent = "Syncing…";
      S.syncNow(function () { return BQ.store.data; }, function (d) { BQ.store.set(d); }).then(function (m) { msg.textContent = m + " " + new Date().toLocaleString(); BQ.toast(m); })
        .catch(function (e) { msg.textContent = "⚠️ " + e.message; });
    };
    if (BQ.$("#tokSave")) BQ.$("#tokSave").onclick = function () { var v = BQ.$("#tok").value.trim(); if (!v) { BQ.toast("Paste a token first"); return; } S.setToken(v); V.sync(el); run(); };
    if (BQ.$("#syncGo")) BQ.$("#syncGo").onclick = run;
    if (BQ.$("#syncForget")) BQ.$("#syncForget").onclick = function () { S.forget(); BQ.toast("Token removed from this device"); V.sync(el); };
  };
})(window);
