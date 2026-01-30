import { useEffect } from "preact/hooks";

export default function SwRegistration() {
  useEffect(() => {
    if (import.meta.env.DEV) return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js");

    // On first install the SW activates after assets have already been fetched,
    // so they miss the cache. A single reload lets the SW intercept and cache
    // all requests (JS, CSS, fonts) for offline use.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      globalThis.location.reload();
    });
  }, []);

  return null;
}
