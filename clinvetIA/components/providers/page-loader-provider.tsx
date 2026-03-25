"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { Loader } from "@/components/loader";

export function PageLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Skip loader for 404 page
  if (pathname === "/404") {
    return <>{children}</>;
  }

  return <PageLoader key={pathname} pathname={pathname}>{children}</PageLoader>;
}

function PageLoader({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const rafRef = React.useRef<number | null>(null);
  const timerRef = React.useRef<number | null>(null);
  const loadedRef = React.useRef(false);

  const clearPending = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    loadedRef.current = document.readyState === "complete";
    const onLoad = () => {
      loadedRef.current = true;
    };
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  React.useEffect(() => {
    clearPending();

    const MIN_MS = 650;
    const MAX_HASH_WAIT_MS = 900;
    const MAX_READY_WAIT_MS = 8000;
    const startedAt = performance.now();

    setIsLoading(true);

    const hash = window.location.hash;
    const targetId = hash.startsWith("#") ? hash.slice(1) : "";

    const tryScrollToHash = () => {
      if (!targetId) return true;

      const el = document.getElementById(targetId);
      if (!el) return false;

      el.scrollIntoView({ behavior: "auto", block: "start" });
      return true;
    };

    const waitForHashThenHide = () => {
      const hashDone = tryScrollToHash();
      const elapsed = performance.now() - startedAt;

      if (hashDone || elapsed >= MAX_HASH_WAIT_MS) return;

      rafRef.current = requestAnimationFrame(waitForHashThenHide);
    };

    rafRef.current = requestAnimationFrame(waitForHashThenHide);

    const waitForWindowLoad = () => {
      if (loadedRef.current) return Promise.resolve();
      return new Promise<void>((resolve) => {
        window.addEventListener("load", () => resolve(), { once: true });
      });
    };

    const waitForFonts = async () => {
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      if (!fonts?.ready) return;
      try {
        await Promise.race([
          fonts.ready,
          new Promise<void>((resolve) => {
            timerRef.current = window.setTimeout(resolve, 1800);
          }),
        ]);
      } catch {
        // ignore
      }
    };

    const waitForHomeReady = () => {
      if (document.documentElement.dataset.homeReady === "true") return Promise.resolve();

      return new Promise<void>((resolve) => {
        const onReady = () => resolve();
        window.addEventListener("clinvetia:home-ready", onReady, { once: true });
        timerRef.current = window.setTimeout(resolve, 2500);
      });
    };

    const finish = async () => {
      await Promise.race([
        (async () => {
          await waitForWindowLoad();
          await waitForFonts();
          await waitForHomeReady();
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        })(),
        new Promise<void>((resolve) => {
          timerRef.current = window.setTimeout(resolve, MAX_READY_WAIT_MS);
        }),
      ]);

      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_MS - elapsed);
      timerRef.current = window.setTimeout(() => {
        setIsLoading(false);
      }, remaining);
    };

    void finish();

    return () => {
      clearPending();
    };
  }, [clearPending]);

  return (
    <>
      {isLoading && <Loader />}
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
