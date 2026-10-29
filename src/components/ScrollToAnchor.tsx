"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolls to the element matching `window.location.hash` after the page mounts.
 * Needed because Next.js App Router doesn't reliably handle cross-page hash navigation.
 */
export function ScrollToAnchor() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.slice(1); // strip leading #
    if (!hash) return;

    // Small delay to allow the page to fully paint before scrolling
    const timer = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
