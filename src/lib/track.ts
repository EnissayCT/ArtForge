"use client";

/**
 * First-party, cookie-free funnel counters (shown in /admin) + optional Meta pixel.
 * Nothing personal is sent: just the event name, the page and the traffic source.
 */

export type TrackEvent = "view" | "product" | "add" | "checkout" | "order";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const SRC_KEY = "af-src";

/** Traffic source of this visit: utm_source, else the referring site, else "direct". */
export function visitSource(): string {
  try {
    const saved = sessionStorage.getItem(SRC_KEY);
    if (saved) return saved;
    const params = new URLSearchParams(location.search);
    let src = params.get("utm_source") || (params.has("fbclid") ? "facebook" : "");
    if (!src && document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host && host !== location.hostname) src = host;
    }
    src = (src || "direct").toLowerCase().slice(0, 40);
    if (/instagram|^ig$/.test(src)) src = "instagram";
    else if (/facebook|^fb$|fb\.com/.test(src)) src = "facebook";
    else if (/google\./.test(src)) src = "google";
    sessionStorage.setItem(SRC_KEY, src);
    return src;
  } catch {
    return "direct";
  }
}

let firstView = true;

export function track(event: TrackEvent, data: { value?: number; slug?: string } = {}) {
  try {
    const landing = event === "view" && firstView && !sessionStorage.getItem("af-landed");
    if (event === "view") firstView = false;
    if (landing) sessionStorage.setItem("af-landed", "1");
    const body = JSON.stringify({ e: event, p: location.pathname, s: visitSource(), l: landing ? 1 : 0, ...data });
    if (event !== "order") {
      if (!navigator.sendBeacon?.("/api/t", new Blob([body], { type: "application/json" }))) {
        fetch("/api/t", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
      }
    }
    const fbq = window.fbq;
    if (fbq) {
      if (event === "product") fbq("track", "ViewContent", { content_ids: data.slug ? [data.slug] : undefined, currency: "MAD", value: data.value });
      if (event === "add") fbq("track", "AddToCart", { currency: "MAD", value: data.value });
      if (event === "checkout") fbq("track", "InitiateCheckout", { currency: "MAD", value: data.value });
      if (event === "order") fbq("track", "Purchase", { currency: "MAD", value: data.value });
    }
  } catch {
    /* tracking must never break the shop */
  }
}
