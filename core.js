/* Core: data loading, references, storage, helpers. */
(function (W) {
  "use strict";
  var BQ = W.BQ = {};
  BQ.Q = null; BQ.B = null;
  BQ.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  BQ.$ = function (sel, el) { return (el || document).querySelector(sel); };
  BQ.$$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  BQ.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };
  BQ.now = function () { return new Date().toISOString(); };

  BQ.loadQuran = function () {
    if (BQ.Q) return Promise.resolve(BQ.Q);
    return fetch("data/quran.json").then(function (r) { return r.json(); }).then(function (d) { BQ.Q = d; return d; });
  };
  var bibleP = null;
  BQ.loadBible = function () {
    if (BQ.B) return Promise.resolve(BQ.B);
    if (!bibleP) bibleP = fetch("data/bible.json").then(function (r) { return r.json(); }).then(function (d) {
      BQ.B = d; BQ.bookNames = d.b.map(function (x) { return x[0]; }); return d;
    });
    return bibleP;
  };

  /* ---------- Quran references ---------- */
  BQ.parseQ = function (ref) {
    var m = String(ref).trim().match(/^(?:(?:q|quran|surah|sura)\s*)?(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?$/i);
    if (!m) return null;
    var s = +m[1], a = +m[2], b = m[3] ? +m[3] : a;
    if (s < 1 || s > 114) return null;
    return { s: s, a: a, b: Math.max(a, b) };
  };
  BQ.qVerses = function (ref) {
    var p = typeof ref === "string" ? BQ.parseQ(ref) : ref;
    if (!p || !BQ.Q) return [];
    var su = BQ.Q.s[p.s - 1], out = [];
    for (var i = p.a; i <= p.b && i <= su[4].length; i++) out.push({ s: p.s, a: i, ya: su[4][i - 1][0], pk: su[4][i - 1][1] });
    return out;
  };
  BQ.surahName = function (s) { var x = BQ.Q && BQ.Q.s[s - 1]; return x ? x[0] + " (" + x[1] + ")" : "Surah " + s; };

  /* ---------- Bible references ---------- */
  var ABBR = { gen: "Genesis", ex: "Exodus", exod: "Exodus", lev: "Leviticus", num: "Numbers", deut: "Deuteronomy", dt: "Deuteronomy", josh: "Joshua", judg: "Judges", ps: "Psalms", psalm: "Psalms", prov: "Proverbs", eccl: "Ecclesiastes", song: "Song of Solomon", isa: "Isaiah", jer: "Jeremiah", lam: "Lamentations", ezek: "Ezekiel", dan: "Daniel", hos: "Hosea", mic: "Micah", hab: "Habakkuk", zech: "Zechariah", mal: "Malachi", matt: "Matthew", mt: "Matthew", mk: "Mark", lk: "Luke", jn: "John", rom: "Romans", gal: "Galatians", eph: "Ephesians", phil: "Philippians", col: "Colossians", heb: "Hebrews", jas: "James", rev: "Revelation" };
  BQ.findBook = function (name) {
    var n = String(name).trim().toLowerCase().replace(/\.$/, "").replace(/\s+/g, " ");
    var names = BQ.bookNames || [];
    if (ABBR[n]) return names.indexOf(ABBR[n]);
    var n2 = n.replace(/^(i{1,3})\s/, function (_, r) { return r.length + " "; }).replace(/^(first|second|third)\s/, function (_, w) { return { first: 1, second: 2, third: 3 }[w] + " "; });
    for (var i = 0; i < names.length; i++) if (names[i].toLowerCase() === n2) return i;
    if (n2 === "psalm") return names.indexOf("Psalms");
    if (n2.length >= 3) for (var j = 0; j < names.length; j++) if (names[j].toLowerCase().indexOf(n2) === 0) return j;
    return -1;
  };
  BQ.parseB = function (ref) {
    var m = String(ref).trim().match(/^((?:[123]|i{1,3}|first|second|third)?\s*[a-z][a-z .]*?)\s*(\d{1,3})(?:\s*:\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?)?$/i);
    if (!m || !BQ.B) return null;
    var bi = BQ.findBook(m[1]);
    if (bi < 0) return null;
    var ch = +m[2], chap = BQ.B.b[bi][1][ch - 1];
    if (!chap) return null;
    var a = m[3] ? +m[3] : 1, b = m[4] ? +m[4] : (m[3] ? a : chap.length);
    if (a > chap.length) return null;
    return { bi: bi, book: BQ.B.b[bi][0], c: ch, a: a, b: Math.min(Math.max(a, b), chap.length), whole: !m[3] };
  };
  BQ.bVerses = function (ref) {
    var p = typeof ref === "string" ? BQ.parseB(ref) : ref;
    if (!p) return [];
    var chap = BQ.B.b[p.bi][1][p.c - 1], out = [];
    for (var i = p.a; i <= p.b; i++) out.push({ book: p.book, c: p.c, v: i, t: chap[i - 1] });
    return out;
  };
  BQ.bHref = function (book, c, v) { return "#/bible/" + encodeURIComponent(book) + "/" + c + (v ? "/" + v : ""); };

  /* ---------- Topics & verse index ---------- */
  BQ.cat = function (id) { return (W.BQ_CATS || []).filter(function (c) { return c.id === id; })[0] || { id: id, name: id, icon: "•" }; };
  BQ.allTopics = function () {
    var custom = BQ.store.data.custom.map(function (c) {
      return { id: "my-" + c.id, cid: c.id, mine: true, cat: c.cat || "social", sev: "Notable", title: c.title, summary: c.summary || "", q: c.q || [], b: c.b || [], analysis: c.analysis || "", responses: "", followups: [], sources: [], tags: ["my point"] };
    });
    return (W.BQ_TOPICS || []).concat(custom);
  };
  BQ.topic = function (id) { return BQ.allTopics().filter(function (t) { return t.id === id; })[0]; };
  BQ.verseIndex = function () {
    var idx = {};
    BQ.allTopics().forEach(function (t) {
      (t.q || []).forEach(function (r) {
        var p = BQ.parseQ(r); if (!p) return;
        for (var a = p.a; a <= p.b; a++) { var k = p.s + ":" + a; (idx[k] = idx[k] || []); if (idx[k].indexOf(t.id) < 0) idx[k].push(t.id); }
      });
    });
    return idx;
  };

  /* ---------- Storage (notes, bookmarks, custom points) ---------- */
  var KEY = "bq-data";
  BQ.store = {
    data: { notes: [], bookmarks: [], custom: [], tomb: { notes: {}, bookmarks: {}, custom: {} } },
    load: function () {
      try { var d = JSON.parse(localStorage.getItem(KEY) || "null"); if (d) this.data = this.norm(d); } catch (e) { }
      return this.data;
    },
    norm: function (d) {
      d = d || {}; ["notes", "bookmarks", "custom"].forEach(function (k) { if (!Array.isArray(d[k])) d[k] = []; });
      d.tomb = d.tomb || {}; ["notes", "bookmarks", "custom"].forEach(function (k) { d.tomb[k] = d.tomb[k] || {}; });
      return d;
    },
    save: function () { localStorage.setItem(KEY, JSON.stringify(this.data)); },
    set: function (d) { this.data = this.norm(d); this.save(); },
    add: function (kind, item) { item.id = item.id || BQ.uid(); item.createdAt = item.createdAt || BQ.now(); item.updatedAt = BQ.now(); this.data[kind].unshift(item); this.save(); return item; },
    remove: function (kind, id) {
      var list = this.data[kind], i = list.findIndex(function (x) { return x.id === id; });
      if (i < 0) return null;
      var it = list.splice(i, 1)[0]; this.data.tomb[kind][id] = BQ.now(); this.save();
      return { item: it, index: i };
    },
    restore: function (kind, rec) {
      rec.item.updatedAt = BQ.now(); delete this.data.tomb[kind][rec.item.id];
      this.data[kind].splice(Math.min(rec.index, this.data[kind].length), 0, rec.item); this.save();
    },
    isBookmarked: function (ref) { return this.data.bookmarks.some(function (b) { return b.ref === ref; }); }
  };

  /* ---------- UI helpers ---------- */
  var toastTimer = null;
  BQ.toast = function (msg, actionLabel, action, ms) {
    var t = BQ.$("#toast");
    t.innerHTML = "<span>" + BQ.esc(msg) + "</span>" + (actionLabel ? '<button class="btn small gold" id="toastAct">' + BQ.esc(actionLabel) + "</button>" : "");
    t.hidden = false;
    if (actionLabel) BQ.$("#toastAct").onclick = function () { t.hidden = true; action(); };
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, ms || (actionLabel ? 7000 : 2600));
  };
  BQ.openModal = function (html, onReady) {
    BQ.$("#modalBody").innerHTML = html; BQ.$("#modal").hidden = false; document.body.style.overflow = "hidden";
    BQ.$("#modal").scrollTop = 0; if (onReady) onReady(BQ.$("#modalBody"));
  };
  BQ.closeModal = function () { BQ.$("#modal").hidden = true; document.body.style.overflow = ""; };
  BQ.hl = function (text, terms) {
    var s = BQ.esc(text);
    (terms || []).forEach(function (t) {
      if (!t) return;
      var re = new RegExp("(" + BQ.esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      s = s.replace(re, "<mark>$1</mark>");
    });
    return s;
  };
  BQ.download = function (name, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
})(window);
