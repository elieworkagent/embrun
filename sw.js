/* Service worker Embrun : app shell hors ligne pour /entrainement.html.
   Regles :
   - navigation : reseau d'abord, copie en cache seulement en cas d'echec
   - le reste : cache d'abord puis reseau (reponses valides uniquement)
   - jamais de mise en cache des reponses d'audience (8443/hit) ni des reponses non-OK
*/
"use strict";

const VERSION = "embrun-v2";
const PAGE = "/entrainement.html";
const PRECACHE = [PAGE, "/assets/icon-192.png"];
const CACHE_PREFIX = "embrun-";

function isAudienceHit(url) {
  return url.indexOf("/hit") !== -1;
}

/* Base publique de mesure : jamais en cache, sinon un changement de tunnel resterait
   collé chez les visiteurs qui ont installé l'application. */
function isVolatile(url) {
  return url.indexOf("/assets/emb_base.js") !== -1;
}

function isCacheable(request, response) {
  return (
    response &&
    response.status === 200 &&
    response.type === "basic" &&
    request.method === "GET" &&
    !isAudienceHit(request.url) &&
    !isAudienceHit(response.url)
  );
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(VERSION)
      .then(function (cache) { return cache.addAll(PRECACHE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (names) {
        return Promise.all(
          names
            .filter(function (name) {
              return name.indexOf(CACHE_PREFIX) === 0 && name !== VERSION;
            })
            .map(function (name) { return caches.delete(name); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;
  if (isAudienceHit(request.url)) return;
  if (isVolatile(request.url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match(PAGE);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (isCacheable(request, response)) {
          const copy = response.clone();
          caches.open(VERSION).then(function (cache) {
            cache.put(request, copy).catch(function () {});
          });
        }
        return response;
      });
    })
  );
});
