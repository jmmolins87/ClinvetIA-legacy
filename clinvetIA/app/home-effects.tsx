"use client";

import * as React from "react";
import { animate, set, stagger } from "animejs";

import { useLenis } from "@/components/providers/lenis-provider";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HomeEffects(): React.JSX.Element | null {
  const { lenis } = useLenis();
  const lenisRef = React.useRef<typeof lenis>(null);

  React.useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  React.useLayoutEffect(() => {
    const reduced = prefersReducedMotion();

    const isInView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      return r.bottom > 0 && r.top < vh * 0.9;
    };

    const formatCount = (value: number, decimals: number) => {
      if (decimals <= 0) return String(Math.round(value));
      return value.toFixed(decimals);
    };

    const getHeaderOffsetPx = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--site-header-h")
        .trim();
      const parsed = Number.parseFloat(raw);
      return Number.isFinite(parsed) ? parsed : 64;
    };

    const onAnchorClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const a = target?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;

      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;

      const el = document.querySelector(hash) as HTMLElement | null;
      if (!el) return;

      event.preventDefault();

      if (reduced) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }

      const isHomeSection = el.classList.contains("home-section");
      const headerOffset = getHeaderOffsetPx();

      const l = lenisRef.current;
      if (l) {
        l.scrollTo(el, { offset: isHomeSection ? 0 : -headerOffset });
        return;
      }

      const top = el.getBoundingClientRect().top + window.scrollY + (isHomeSection ? 0 : -headerOffset);
      window.scrollTo({ top, behavior: "smooth" });
    };

    document.addEventListener("click", onAnchorClick, true);

    // CTA micro-interactions.
    const onPointerEnter = (event: Event) => {
      if (reduced) return;
      const target = event.target as Element | null;
      const el = target?.closest?.("[data-cta-anim]") as HTMLElement | null;
      if (!el) return;
      animate(el, { scale: 1.02, duration: 220, easing: "easeOutCubic" });
    };

    const onPointerLeave = (event: Event) => {
      if (reduced) return;
      const target = event.target as Element | null;
      const el = target?.closest?.("[data-cta-anim]") as HTMLElement | null;
      if (!el) return;
      animate(el, { scale: 1, duration: 260, easing: "easeOutCubic" });
    };

    document.addEventListener("pointerenter", onPointerEnter, true);
    document.addEventListener("pointerleave", onPointerLeave, true);

    // Scroll parallax for background layers.
    const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const sectionParallaxEls = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".home-section.home-reflections, .home-reflections.home-section"
      )
    );
    const updateParallax = () => {
      if (reduced) return;
      const vh = Math.max(1, window.innerHeight || 1);

      const apply = (el: HTMLElement, fallbackSpeed: number, baseAmp: number) => {
        const speed = Number.parseFloat(el.dataset.parallaxSpeed ?? String(fallbackSpeed));
        const s = Number.isFinite(speed) ? speed : fallbackSpeed;
        const rect = el.getBoundingClientRect();
        const progress = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
        const amp = baseAmp * s;
        const y = -progress * amp;
        el.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
      };

      for (const el of parallaxEls) apply(el, 0.6, 28);
      for (const el of sectionParallaxEls) apply(el, 0.35, 22);
    };

    let parallaxRaf = 0;
    let parallaxTicking = false;
    const scheduleParallax = () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      parallaxRaf = window.requestAnimationFrame(() => {
        parallaxTicking = false;
        updateParallax();
      });
    };

    const lParallax = lenisRef.current;
    if (!reduced && (parallaxEls.length > 0 || sectionParallaxEls.length > 0)) {
      updateParallax();
      window.addEventListener("resize", scheduleParallax, { passive: true });
      if (lParallax) {
        lParallax.on("scroll", scheduleParallax);
      } else {
        window.addEventListener("scroll", scheduleParallax, { passive: true });
      }
    }

    // Reveal-on-view animations.
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const allItems: HTMLElement[] = [];

    for (const el of revealTargets) {
      const items = el.hasAttribute("data-reveal-children")
        ? Array.from(el.querySelectorAll<HTMLElement>("[data-reveal-item]"))
        : [el];
      allItems.push(...items);
    }

    // Only hide items that start out of view. Keep above-the-fold content visible.
    if (!reduced) {
      const hidden: HTMLElement[] = [];

      for (const target of revealTargets) {
        const items = target.hasAttribute("data-reveal-children")
          ? Array.from(target.querySelectorAll<HTMLElement>("[data-reveal-item]"))
          : [target];
        if (items.length === 0) continue;

        const inView = isInView(target);
        if (inView) {
          target.dataset.revealed = "true";
          set(items, { opacity: 1, translateY: 0, scale: 1 });
        } else {
          hidden.push(...items);
        }
      }

      if (hidden.length > 0) {
        set(hidden, { opacity: 0, translateY: 22, scale: 0.99 });
      }
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (el.dataset.revealed === "true") continue;
          el.dataset.revealed = "true";

          const items = el.hasAttribute("data-reveal-children")
            ? Array.from(el.querySelectorAll<HTMLElement>("[data-reveal-item]"))
            : [el];

          if (items.length === 0) continue;

          if (reduced) {
            continue;
          }

          set(items, { opacity: 0, translateY: 22, scale: 0.99 });

          animate(items, {
            opacity: [0, 1],
            translateY: [22, 0],
            scale: [0.99, 1],
            easing: "easeOutCubic",
            duration: 750,
            delay: stagger(90),
          });
        }
      },
      { threshold: 0.18 }
    );

    for (const el of revealTargets) io.observe(el);

    // Safety net: if anything stays hidden (IO/animations glitch), reveal all.
    const fallbackId = window.setTimeout(() => {
      if (reduced) return;
      set(allItems, { opacity: 1, translateY: 0, scale: 1 });
    }, 2200);

    // Signal that Home is visually ready (used by the page loader).
    document.documentElement.dataset.homeReady = "true";
    window.dispatchEvent(new Event("clinvetia:home-ready"));

    // ROI count-up (start when ROI section enters view).
    const roiSection = document.getElementById("roi-section");
    const countEls = roiSection
      ? Array.from(roiSection.querySelectorAll<HTMLElement>("[data-countup='true']"))
      : [];

    for (const el of countEls) {
      if (reduced) continue;
      if (el.dataset.countupReady === "true") continue;
      const prefix = el.dataset.countupPrefix ?? "";
      const suffix = el.dataset.countupSuffix ?? "";
      el.textContent = `${prefix}0${suffix}`;
      el.dataset.countupReady = "true";
    }

    let countRaf = 0;
    let countStarted = false;

    const startCountup = () => {
      if (countStarted) return;
      if (countEls.length === 0) return;
      if (reduced) return;
      countStarted = true;

      const items = countEls
        .map((el) => {
          const endRaw = el.dataset.countupEnd;
          const end = endRaw ? Number.parseFloat(endRaw) : Number.NaN;
          if (!Number.isFinite(end)) return null;
          const decimals = Number.parseInt(el.dataset.countupDecimals ?? "0", 10);
          const prefix = el.dataset.countupPrefix ?? "";
          const suffix = el.dataset.countupSuffix ?? "";
          return { el, end, decimals: Number.isFinite(decimals) ? decimals : 0, prefix, suffix };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const durationMs = 1100;
      const t0 = performance.now();

      const tick = (now: number) => {
        const p = Math.min(1, Math.max(0, (now - t0) / durationMs));
        const eased = 1 - Math.pow(1 - p, 3);

        for (const item of items) {
          const v = item.end * eased;
          item.el.textContent = `${item.prefix}${formatCount(v, item.decimals)}${item.suffix}`;
        }

        if (p < 1) {
          countRaf = window.requestAnimationFrame(tick);
        }
      };

      countRaf = window.requestAnimationFrame(tick);
    };

    const roiIo = roiSection
      ? new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) startCountup();
          },
          { threshold: 0.35 }
        )
      : null;

    if (roiSection && roiIo) roiIo.observe(roiSection);

    return () => {
      document.removeEventListener("click", onAnchorClick, true);
      document.removeEventListener("pointerenter", onPointerEnter, true);
      document.removeEventListener("pointerleave", onPointerLeave, true);
      window.removeEventListener("resize", scheduleParallax);
      if (lParallax) lParallax.off("scroll", scheduleParallax);
      window.removeEventListener("scroll", scheduleParallax);
      if (parallaxRaf) window.cancelAnimationFrame(parallaxRaf);
      io.disconnect();
      roiIo?.disconnect();
      if (countRaf) window.cancelAnimationFrame(countRaf);
      window.clearTimeout(fallbackId);
    };
  }, []);

  return null;
}
