"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader } from "@/components/loader";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const prevKey = React.useRef(`${pathname}?${searchParams.toString()}`);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const newKey = `${pathname}?${searchParams.toString()}`;
    if (prevKey.current !== newKey) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevKey.current = newKey;
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(false);
    }
  }, [pathname, searchParams]);

  return (
    <>
      {(!mounted || isTransitioning) && (
        <Loader mode="fullscreen" lockScroll={false} />
      )}
      {children}
    </>
  );
}
