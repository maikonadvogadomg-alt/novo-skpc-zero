// SK Code Editor — Service Worker
// Faz duas coisas:
//   1) Cache offline básico (PWA / APK)
//   2) Adiciona headers COOP+COEP em respostas SAME-ORIGIN pra habilitar
//      cross-origin isolation (necessário pro WebContainer / Terminal Real).
//      Padrão "coi-serviceworker" — funciona em qualquer host, inclusive
//      hospedagem estática que não permite configurar headers HTTP.

const CACHE = "sk-editor-v22";
const ASSETS = [
  "./",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon.svg",
];

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ──────────────────────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()).then(() => {
      // Após ativação, recarrega clientes pra que peguem o COOP/COEP
      // (sem reload, a primeira aba não fica cross-origin isolated)
      return self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
          if ("navigate" in client && client.url) {
            try { client.navigate(client.url); } catch {}
          }
        });
      });
    })
  );
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.cache === "only-if-cached" && e.request.mode !== "same-origin") return;

  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;

  // ── Não interfere em: /api/ (chamadas do backend, podem ter streams),
  //    cross-origin (deixa o navegador lidar), e endpoints específicos.
  //    Apenas same-origin vira candidato a injeção de COOP/COEP + cache.
  if (!sameOrigin || url.pathname.startsWith("/api/")) return;

  e.respondWith((async () => {
    // ── 1) Tenta cache primeiro ──
    const cached = await caches.match(e.request);
    if (cached) {
      // Atualiza em background
      fetchAndCache(e.request).catch(() => {});
      return await addCOIHeaders(cached);
    }

    // ── 2) Busca da rede ──
    try {
      const netRes = await fetch(e.request);
      if (netRes && netRes.status === 200 && netRes.type === "basic") {
        try {
          const clone = netRes.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone)).catch(() => {});
        } catch {}
      }
      return await addCOIHeaders(netRes);
    } catch (err) {
      const fallback = await caches.match(e.request);
      if (fallback) return await addCOIHeaders(fallback);
      throw err;
    }
  })());
});

async function fetchAndCache(req) {
  const res = await fetch(req);
  if (res && res.status === 200 && res.type === "basic") {
    const clone = res.clone();
    const cache = await caches.open(CACHE);
    await cache.put(req, clone);
  }
  return res;
}

// Adiciona headers Cross-Origin-Embedder-Policy + Cross-Origin-Opener-Policy.
// IMPORTANTE: só re-empacota respostas same-origin "basic" / "default" / "cors".
// Respostas opaque/opaqueredirect/error não dá pra clonar com novo status, então
// devolvemos como vieram pra não quebrar nada.
async function addCOIHeaders(response) {
  if (!response) return response;
  const t = response.type;
  if (t === "opaque" || t === "opaqueredirect" || t === "error") return response;

  try {
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
    if (!newHeaders.has("Cross-Origin-Resource-Policy")) {
      newHeaders.set("Cross-Origin-Resource-Policy", "same-origin");
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch {
    return response;
  }
}
