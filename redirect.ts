const NEW_ORIGIN = "https://dinkum-save-editor.pages.dev";

/**
 * Served at /sw.js so browsers that still have the old service worker
 * installed pick up this update, drop their caches, and unregister. Without
 * this the old worker keeps intercepting the old origin, follows the
 * redirect, and stays alive on a dying host.
 */
const SW_UNREGISTER = `self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
    })(),
  );
});
`;

export default {
  fetch(request: Request): Response {
    const url = new URL(request.url);

    if (url.pathname === "/sw.js") {
      return new Response(SW_UNREGISTER, {
        headers: {
          "content-type": "application/javascript",
          "cache-control": "no-store",
        },
      });
    }

    const target = NEW_ORIGIN + url.pathname + url.search;
    return new Response(null, {
      status: 301,
      headers: {
        location: target,
        "cache-control": "no-store",
      },
    });
  },
};
