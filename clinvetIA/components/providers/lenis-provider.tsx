"use client";

import * as React from "react";
import Lenis from "lenis";

type LenisContextValue = {
  lenis: Lenis | null;
  isEnabled: boolean;
};

const LenisContext = React.createContext<LenisContextValue>({
  lenis: null,
  isEnabled: false,
});

export function useLenis(): LenisContextValue {
  return React.useContext(LenisContext);
}

export function LenisProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}): React.JSX.Element {
  const [lenis, setLenis] = React.useState<Lenis | null>(null);
  const [isEnabled, setIsEnabled] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setIsEnabled(false);
      setLenis((prev) => {
        prev?.destroy();
        return null;
      });
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIsEnabled(false);
      return;
    }

    const instance = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: true,
    });

    setLenis(instance);
    setIsEnabled(true);

    let raf = 0;
    const loop = (time: number) => {
      instance.raf(time);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      instance.destroy();
      setLenis(null);
      setIsEnabled(false);
    };
  }, [enabled]);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsEnabled(false);
        lenis?.stop();
      } else if (enabled) {
        setIsEnabled(true);
        lenis?.start();
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [enabled, lenis]);

  return (
    <LenisContext.Provider value={{ lenis, isEnabled }}>
      {children}
    </LenisContext.Provider>
  );
}
