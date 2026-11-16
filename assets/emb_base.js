/* Base de l'API de mesure et de paiement (générée par ops/beacon_watch.py).
 * Doit rester PUBLIQUE : une page embrun.store ne peut pas appeler l'adresse
 * Tailscale 100.x (blocage Local Network Access de Chrome).
 *
 * Script classique, autonome : Git Pages sert ce fichier avec max-age=14400, donc
 * la base codée ici peut être périmée jusqu'à 4 h. emb_base.json (no-store) donne
 * la base courante ; embCandidates() ordonne les bases à essayer, embPost() fait
 * le POST sur la première qui répond, navigator.sendBeacon est ré-aiguillé dessus. */
window.EMB_BASE = "https://garlic-pads-pepper-combines.trycloudflare.com";
(function () {
  var NS = "emb_base_last";

  function lsGet() {
    try { return localStorage.getItem(NS) || ""; } catch (e) { return ""; }
  }
  function lsSet(v) {
    try { localStorage.setItem(NS, v); } catch (e) {}
  }
  function clean(v) {
    return typeof v === "string" ? v.trim().replace(/\/+$/, "") : "";
  }

  window.embCandidates = function () {
    var out = [], list = [window.embFresh, window.EMB_BASE, lsGet()];
    for (var i = 0; i < list.length; i++) {
      var b = clean(list[i]);
      if (b && out.indexOf(b) < 0) out.push(b);
    }
    return out;
  };

  function toBody(data) {
    if (data === undefined || data === null) return "";
    return data;
  }

  window.embPost = function (path, body) {
    var bases = window.embCandidates();
    var i = 0;
    function next() {
      if (i >= bases.length) return false;
      var b = bases[i++];
      return fetch(b + path, { method: "POST", body: toBody(body), keepalive: true })
        .then(function (r) {
          if (r.ok || r.status === 204) {
            lsSet(b);
            return true;
          }
          return next();
        }, function () { return next(); });
    }
    try {
      return Promise.resolve(next()).then(function (ok) { return ok === true; }, function () { return false; });
    } catch (e) {
      return Promise.resolve(false);
    }
  };

  /* sendBeacon vers une base candidate -> via embPost (qui essaie les autres bases) ;
   * on renvoie true car embPost ne rejette pas. Une autre URL part telle quelle. */
  try {
    var proto = window.Navigator && Navigator.prototype;
    if (proto && typeof proto.sendBeacon === "function") {
      var orig = proto.sendBeacon;
      proto.sendBeacon = function (url, data) {
        try {
          var s = String(url);
          var bases = window.embCandidates();
          for (var k = 0; k < bases.length; k++) {
            var b = bases[k];
            if (s === b || s.indexOf(b + "/") === 0 || s.indexOf(b + "?") === 0) {
              window.embPost(s.slice(b.length), data);
              return true;
            }
          }
        } catch (e) {}
        return orig.apply(this, arguments);
      };
    }
  } catch (e) {}

  /* Base courante, sans bloquer la page. */
  try {
    fetch("/assets/emb_base.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var b = clean(j && j.base);
        if (b) { window.embFresh = b; lsSet(b); }
      })
      .catch(function () {});
  } catch (e) {}
})();
