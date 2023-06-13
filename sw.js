const CacheStatic = "estatico-1";
const CacheDinamic = "dinamico-1";
const CacheInmutable = "inmutable-1";

function LimpiarCache(cacheName, items) {
	caches.open(cacheName).then((cache) => {
		return cache.keys().then((keys) => {
			console.log(keys);
			if (keys.lenght > items) {
				cache.delete(keys[0]).then(LimpiarCache(cacheName, items));
			}
		});
	});
}

self.addEventListener("install", (event) => {
	const cacheStatic = caches.open(CacheStatic).then((cache) => {
		cache.addAll([
			"/",
			"/index.html",
			"/js/app.js",
			"/js/base.js",
			"/style/base.css",
			"/style/bg.png",
		]);
	});
	const cacheInmutable = caches.open(CacheInmutable).then((cache) => {
		cache.add("/js/pouchdb.js");
	});
	event.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
	self.skipWaiting();
});

//INTERNET CON RESPALDO
self.addEventListener("fetch", (event) => {
	const respuesta = fetch(event.request)
		.then((res) => {
			if (!res) {
				return caches.match(event.request.url);
			} else {
				caches.match(event.request.url).then((recurso) => {
					if (!recurso) {
						caches.open(CacheDinamic).then((cache) => {
							cache.add(event.request.url);
							LimpiarCache(CacheDinamic, 100);
						});
					}
				});
				return res;
			}
		})
		.catch((error) => {
			return caches.match(event.request.url);
		});
	event.respondWith(respuesta);
});