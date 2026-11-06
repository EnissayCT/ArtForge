"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/track";
import { useShop } from "@/components/providers/ShopProvider";

/** Counts page views (first-party) and, when a pixel id is set in the admin, loads the Meta pixel. */
export function Tracker() {
  const pathname = usePathname();
  const { pixelId } = useShop();
  const last = useRef<string | null>(null);
  const pixel = /^\d{6,20}$/.test(pixelId) ? pixelId : "";

  useEffect(() => {
    if (last.current === pathname) return;
    const first = last.current === null;
    last.current = pathname;
    track("view");
    // the pixel snippet sends the first PageView itself
    if (!first) window.fbq?.("track", "PageView");
  }, [pathname]);

  if (!pixel) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
    </Script>
  );
}
