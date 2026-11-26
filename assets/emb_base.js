/* Base de l'API de mesure et de paiement (générée par ops/beacon_watch.py).
 * Doit rester PUBLIQUE : une page embrun.store ne peut pas appeler l'adresse
 * Tailscale 100.x (blocage Local Network Access de Chrome).
 *
 * Script classique, autonome : Git Pages sert ce fichier avec max-age=14400, donc
 * la base codée ici peut être périmée jusqu'à 4 h. emb_base.json (no-store) donne
 * la base courante ; embCandidates() ordonne les bases à essayer, embPost() fait
 * le POST sur la première qui répond, navigator.sendBeacon est ré-aiguillé dessus et
 * fetch(EMB_BASE + "/chemin") bascule sur la première base vivante. */
window.EMB_BASE = "https://movement-sue-ruled-attention.trycloudflare.com";
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

  /* fetch d'origine : capturé ici, avant tout autre override. */
  var origFetch = (typeof window.fetch === "function") ? window.fetch : null;

  /* Une page cache jusqu'à 4 h un emb_base.js périmé : ses fetch(EMB_BASE + "/lead"
   * ou "/free") partiraient vers un hôte mort. On réécrit donc ces URL vers la
   * première base candidate qui répond (même chemin, mêmes options). Tout ce qui
   * n'est pas une URL d'une base candidate part intact vers le fetch d'origine. */
  function doFetch(u, o) {
    return origFetch ? origFetch.call(window, u, o) : Promise.reject(new Error("fetch absent"));
  }

  function baseOf(s, b) {
    return s === b ? "" : (s.indexOf(b + "/") === 0 ? s.slice(b.length) : null);
  }

  function baseIndex(bases, key) {
    var def = bases.length;
    for (var j = 0; j < bases.length; j++) {
      if (bases[j] === key) return j;
      if (bases[j] === clean(window.EMB_BASE)) def = j;
    }
    return def;
  }

  function tryBases(bases, i, url, opts, lastErr) {
    if (i >= bases.length) {
      if (lastErr) throw lastErr;
      return doFetch(url, opts);
    }
    var b = bases[i], u = b + url;
    return doFetch(u, opts).then(function (r) {
      if (r && (r.ok || r.status === 204)) { lsSet(b); return r; }
      return tryBases(bases, i + 1, url, opts, lastErr);
    }, function (err) {
      lastErr = err;
      return tryBases(bases, i + 1, url, opts, lastErr);
    });
  }

  try {
    if (origFetch) {
      window.fetch = function (input, init) {
        try {
          var s = (typeof input === "string") ? input
                : (typeof URL !== "undefined" && input instanceof URL) ? input.href : "";
          if (s) {
            var bases = window.embCandidates();
            for (var k = 0; k < bases.length; k++) {
              var rest = baseOf(s, bases[k]);
              if (rest === null) continue;
              var ordered = bases.slice();
              ordered.splice(k, 1);
              ordered.splice(baseIndex(bases, bases[k]), 0, bases[k]);
              return tryBases(ordered, 0, rest, init, null);
            }
          }
        } catch (e) {}
        return origFetch.apply(this, arguments);
      };
    }
  } catch (e) {}

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
      return Promise.resolve(next()).then(function (ok) {
      if (ok === true) return true;
      return window.embNtfy(path, toBody(body)).then(function () { return false; });
    }, function () {
      return window.embNtfy(path, toBody(body)).then(function () { return false; });
    });
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

  /* Puits de secours a adresse FIXE (ntfy.sh). Un quick tunnel change de nom et
   * sendBeacon renvoie true meme quand la requete ne part pas: sans cela un hit
   * emis pendant que toutes les bases sont mortes disparait sans trace. Le topic
   * est public (il est dans ce fichier) donc il ne transporte aucune donnee
   * identifiante: jamais d'email, jamais d'IP. Un identifiant aleatoire local
   * sert a compter les visiteurs uniques. */
  var NTFY_TOPIC = "7185b2c1b04ebf7dbd26d2f4";
  function embCid() {
    try {
      var k = "emb_cid", v = localStorage.getItem(k);
      if (!v) {
        v = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(k, v);
      }
      return v;
    } catch (e) { return ""; }
  }
  window.embNtfy = function (path, body) {
    if (!NTFY_TOPIC || !origFetch) return Promise.resolve(false);
    if (path !== "/hit") return Promise.resolve(false);
    var payload = body;
    try {
      var o = JSON.parse(body);
      if (o && typeof o === "object") { o.ci = embCid(); payload = JSON.stringify(o); }
    } catch (e) {}
    return origFetch("https://ntfy.sh/" + NTFY_TOPIC + "-hit", {
      method: "POST", body: payload, keepalive: true, mode: "cors"
    }).then(function (r) { return !!(r && r.ok); }, function () { return false; });
  };

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
