/* Router, global event delegation, theme, service worker. */
(function (W) {
  "use strict";
  var BQ = W.BQ, V = BQ.views;
  BQ.store.load();
  if (localStorage.getItem("bq-theme") === "light") document.body.classList.add("light");
  BQ.$("#themeBtn").onclick = function () {
    var l = document.body.classList.toggle("light"); localStorage.setItem("bq-theme", l ? "light" : "dark");
    BQ.$('meta[name="theme-color"]').setAttribute("content", l ? "#f4ecd8" : "#0b1a33");
  };
  BQ.$("#modalClose").onclick = BQ.closeModal;
  BQ.$("#modal").addEventListener("click", function (e) { if (e.target.id === "modal") BQ.closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") BQ.closeModal(); });

  function parse() {
    var h = location.hash.replace(/^#\/?/, ""), qi = h.indexOf("?"), path = qi >= 0 ? h.slice(0, qi) : h, params = {};
    if (qi >= 0) h.slice(qi + 1).split("&").forEach(function (kv) { if (!kv) return; var p = kv.split("="); params[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, " ")); });
    return { parts: path.split("/").map(decodeURIComponent), params: params };
  }
  function route() {
    var r = parse(), p = r.parts, el = BQ.$("#view"), name = p[0] || "";
    if (name !== "topic") BQ.closeModal();
    BQ.$$("#tabs a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-r") === (name === "topic" ? "topics" : name)); });
    var on = BQ.$("#tabs a.on"); if (on && on.scrollIntoView) on.scrollIntoView({ inline: "center", block: "nearest" });
    switch (name) {
      case "search": V.search(el, r.params); break;
      case "surah": V.surah(el, p[1], p[2]); break;
      case "bible": V.bible(el, p[1], p[2], p[3]); break;
      case "topics": V.topics(el, r.params); break;
      case "topic": if (!BQ.$("#tlist")) V.topics(el, {}); V.openTopic(p[1]); break;
      case "books": V.books(el); break;
      case "compare": V.compare(el, r.params); break;
      case "notes": V.notes(el); break;
      case "quiz": V.quiz(el, r.params); break;
      case "print": V.print(el); break;
      case "sync": V.sync(el); break;
      default: V.home(el);
    }
    if (name !== "topic") W.scrollTo(0, 0);
  }

  document.addEventListener("click", function (e) {
    var act = e.target.closest("[data-act]");
    if (act) {
      var a = act.getAttribute("data-act"), ref = act.getAttribute("data-ref");
      e.preventDefault();
      if (a === "reveal") return V.reveal(act);
      if (a === "note") return V.noteDialog(ref || "");
      if (a === "editnote") { var n = BQ.store.data.notes.filter(function (x) { return x.id === act.dataset.id; })[0]; if (n) V.noteDialog(n.ref, n); return; }
      if (a === "bm") {
        var ex = BQ.store.data.bookmarks.filter(function (b) { return b.ref === ref; })[0];
        if (ex) {
          var rec = BQ.store.remove("bookmarks", ex.id);
          BQ.$$('[data-act="bm"]').forEach(function (b) { if (b.getAttribute("data-ref") === ref) b.textContent = "☆ Bookmark"; });
          BQ.toast("Bookmark removed", "Undo", function () { BQ.store.restore("bookmarks", rec); BQ.$$('[data-act="bm"]').forEach(function (b) { if (b.getAttribute("data-ref") === ref) b.textContent = "★ Bookmarked"; }); });
        } else {
          BQ.store.add("bookmarks", { ref: ref });
          BQ.$$('[data-act="bm"]').forEach(function (b) { if (b.getAttribute("data-ref") === ref) b.textContent = "★ Bookmarked"; });
          BQ.toast("Bookmarked");
        }
        return;
      }
      if (a === "del") {
        var kind = act.dataset.kind, r2 = BQ.store.remove(kind, act.dataset.id);
        if (!r2) return;
        V.notes(BQ.$("#view"));
        BQ.toast({ notes: "Note deleted", bookmarks: "Bookmark removed", custom: "Point deleted" }[kind], "Undo", function () { BQ.store.restore(kind, r2); V.notes(BQ.$("#view")); });
        return;
      }
      if (a === "addprint") {
        var s = JSON.parse(localStorage.getItem("bq-print") || "[]"), id = act.dataset.id;
        if (s.indexOf(id) < 0) { s.push(id); localStorage.setItem("bq-print", JSON.stringify(s)); BQ.toast("Added to study sheet", "Open", function () { location.hash = "#/print"; }); }
        else BQ.toast("Already on the study sheet");
        return;
      }
    }
    var t = e.target.closest("[data-topic]");
    if (t && !e.target.closest("a[href]:not([data-topic])")) { e.preventDefault(); V.openTopic(t.getAttribute("data-topic")); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.classList && e.target.classList.contains("topic")) V.openTopic(e.target.getAttribute("data-topic"));
  });

  BQ.loadQuran().then(function () {
    W.addEventListener("hashchange", route); route();
    BQ.loadBible(); // warm the KJV in the background
  }).catch(function () { BQ.$("#view").innerHTML = '<p class="warn">Could not load the Quran text. Check your connection and reload.</p>'; });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    W.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () { }); });
  }
})(window);
