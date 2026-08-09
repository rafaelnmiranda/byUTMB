/*
 * Service worker do Paraty Brazil by UTMB.
 *
 * Motivação: o sinal na serra de Paraty é ruim, e o app iOS não tinha cache
 * nenhum — sem rede, a programação virava "Erro ao carregar". Aqui o atleta
 * continua vendo a última versão que baixou.
 *
 * Escrito à mão de propósito: a superfície é pequena e o controle sobre o que
 * fica em cache importa mais do que a conveniência de uma biblioteca.
 */

const VERSION = "v3";
const SHELL_CACHE = `shell-${VERSION}`;
const PAGES_CACHE = `pages-${VERSION}`;
const ASSETS_CACHE = `assets-${VERSION}`;

const SHELL_URLS = [
  "/",
  "/programacao",
  "/mapa",
  "/onde-comer",
  "/informacoes",
  "/offline",
  "/api/partners/redeemable",
  "/images/maps/mapa-evento-2026.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // `reload` evita gravar no cache uma resposta que já veio do cache HTTP.
      .then((cache) => cache.addAll(SHELL_URLS.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL_CACHE, PAGES_CACHE, ASSETS_CACHE]);

  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Catálogo enxuto de ativação: network-first (útil sem sinal na hora da conta).
  if (url.pathname === "/api/partners/redeemable") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Demais APIs (.ics, ativações) não devem ser servidas de cache.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (/\.(?:png|jpg|jpeg|svg|webp|avif|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // JS/CSS do Next têm hash no nome: quando existem em cache, são imutáveis.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
  }
});

/**
 * Páginas: tenta a rede, cai para o cache.
 *
 * É o que garante o "stale-while-revalidate" percebido — o atleta sempre vê algo,
 * e a página carimba na tela o horário da última atualização para ele saber se o
 * dado é fresco.
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = (await caches.match(request)) ?? (await caches.match("/offline"));
    return cached ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(ASSETS_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    return Response.error();
  }
}
