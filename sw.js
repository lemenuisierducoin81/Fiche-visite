/* Service worker de la fiche de visite.
   Stratégie : on va voir le réseau d'abord, et on se rabat sur la copie
   locale dès qu'il manque. Ainsi la tablette a toujours la dernière
   version quand elle est connectée, et fonctionne quand elle ne l'est pas. */
var VERSION = "2026-11-09c";
var CACHE = "fiche-visite-" + VERSION;
var FICHIERS = ["./", "./index.html", "./manifest.webmanifest",
                "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FICHIERS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(noms){
    return Promise.all(noms.map(function(n){ if(n!==CACHE) return caches.delete(n); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  if(e.request.method!=="GET") return;
  if(new URL(e.request.url).origin !== self.location.origin) return;  /* rien d'extérieur */
  e.respondWith(
    fetch(e.request).then(function(rep){
      var copie=rep.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copie); }).catch(function(){});
      return rep;
    }).catch(function(){
      return caches.match(e.request).then(function(r){
        return r || caches.match("./index.html");
      });
    })
  );
});
