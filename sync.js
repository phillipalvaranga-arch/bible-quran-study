/* Bible & Quran Study — private GitHub Gist sync.
   Uses only the gist-scope token YOU paste on this device. It is stored in this browser's
   localStorage, never exported, never logged, and sent only to api.github.com. */
(function (root) {
  "use strict";
  var API = "https://api.github.com", DESC = "Bible Quran Study Sync", FILE = "bq-data.json";
  var TOKEN_KEY = "bq-sync-token", GIST_KEY = "bq-sync-gist-id", LAST_KEY = "bq-sync-last";
  var LISTS = ["notes", "bookmarks", "custom"];

  function stamp(x) { return (x && (x.updatedAt || x.createdAt)) || ""; }
  function mergeTombs(a, b) {
    var o = {}; Object.keys(a || {}).forEach(function (k) { o[k] = a[k]; });
    Object.keys(b || {}).forEach(function (k) { if (!o[k] || b[k] > o[k]) o[k] = b[k]; });
    return o;
  }
  function mergeById(l, r, lt, rt) {
    var tombs = mergeTombs(lt, rt), map = {};
    (l || []).concat(r || []).forEach(function (it) {
      if (!it || !it.id) return;
      if (!map[it.id] || stamp(it) > stamp(map[it.id])) map[it.id] = it;
    });
    var list = [];
    Object.keys(map).forEach(function (id) {
      var t = tombs[id] || "";
      if (t && t >= stamp(map[id])) return;
      list.push(map[id]);
    });
    list.sort(function (a, b) { return stamp(b) < stamp(a) ? -1 : 1; });
    return { list: list, tombs: tombs };
  }
  function merge(local, remote) {
    var out = { version: 1, tomb: {} };
    LISTS.forEach(function (k) {
      var m = mergeById(local[k], remote[k], (local.tomb || {})[k], (remote.tomb || {})[k]);
      out[k] = m.list; out.tomb[k] = m.tombs;
    });
    out.updatedAt = new Date().toISOString();
    return out;
  }
  function token() { return localStorage.getItem(TOKEN_KEY) || ""; }
  function headers() {
    return { "Authorization": "token " + token(), "Accept": "application/vnd.github+json", "Content-Type": "application/json" };
  }
  function req(method, path, body) {
    return fetch(API + path, { method: method, headers: headers(), body: body ? JSON.stringify(body) : undefined })
      .then(function (r) {
        if (!r.ok) return r.text().then(function () {
          var msg = r.status === 401 ? "Token rejected (401). Check that it is valid and has the gist scope." :
                    r.status === 404 ? "Gist not found (404)." : "GitHub error " + r.status;
          throw new Error(msg);
        });
        return r.json();
      });
  }
  function findGist() {
    var id = localStorage.getItem(GIST_KEY);
    if (id) return req("GET", "/gists/" + id).catch(function () { localStorage.removeItem(GIST_KEY); return findGist(); });
    return req("GET", "/gists?per_page=100").then(function (list) {
      var g = (list || []).filter(function (x) { return x.description === DESC && x.files && x.files[FILE]; })[0];
      if (!g) return null;
      localStorage.setItem(GIST_KEY, g.id);
      return req("GET", "/gists/" + g.id);
    });
  }
  function readGist(g) {
    var f = g && g.files && g.files[FILE];
    if (!f) return Promise.resolve({});
    if (f.truncated && f.raw_url) return fetch(f.raw_url).then(function (r) { return r.json(); });
    try { return Promise.resolve(JSON.parse(f.content || "{}")); } catch (e) { return Promise.resolve({}); }
  }
  function syncNow(getLocal, setLocal) {
    if (!token()) return Promise.reject(new Error("Paste your gist-scope token first."));
    return findGist().then(function (g) {
      if (!g) {
        var data = merge(getLocal(), {});
        var files = {}; files[FILE] = { content: JSON.stringify(data) };
        return req("POST", "/gists", { description: DESC, public: false, files: files }).then(function (ng) {
          localStorage.setItem(GIST_KEY, ng.id); setLocal(data); return "Created private gist and uploaded.";
        });
      }
      return readGist(g).then(function (remote) {
        var data = merge(getLocal(), remote || {});
        var files = {}; files[FILE] = { content: JSON.stringify(data) };
        return req("PATCH", "/gists/" + g.id, { files: files }).then(function () { setLocal(data); return "Synced."; });
      });
    }).then(function (msg) { localStorage.setItem(LAST_KEY, new Date().toISOString()); return msg; });
  }
  root.BQSync = {
    syncNow: syncNow, merge: merge,
    hasToken: function () { return !!token(); },
    setToken: function (t) { localStorage.setItem(TOKEN_KEY, String(t || "").trim()); },
    forget: function () { [TOKEN_KEY, GIST_KEY, LAST_KEY].forEach(function (k) { localStorage.removeItem(k); }); },
    last: function () { return localStorage.getItem(LAST_KEY) || ""; },
    gistId: function () { return localStorage.getItem(GIST_KEY) || ""; }
  };
})(window);
