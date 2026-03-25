"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type BlurPreset = "none" | "sm" | "md" | "lg";

export function DnaBackground({
  className,
  intensity = 0.75,
  speed = 0.35,
  blur = "md",
  ...props
}: {
  className?: string;
  intensity?: number; // 0..1
  speed?: number; // 0..1
  blur?: BlurPreset;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">): React.JSX.Element {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDark = document.documentElement.classList.contains("dark");

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let w = 0;
    let h = 0;
    let visible = true;
    let running = !reduceMotion;

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const I = clamp01(intensity);
    const S = clamp01(speed);

    // Colors: tuned for visibility in both themes.
    // Light theme favors more saturation since we don't rely on blend modes.
    const colA = isDark ? "rgba(70, 255, 220," : "rgba(0, 170, 210,";
    const colB = isDark ? "rgba(130, 150, 255," : "rgba(10, 110, 255,";
    const rung = isDark ? "rgba(90, 240, 255," : "rgba(0, 120, 210,";

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.setAttribute("width", String(canvas.width));
      canvas.setAttribute("height", String(canvas.height));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(true);
    };

    const drawFrame = (forceStatic = false) => {
      ctx.clearRect(0, 0, w, h);

       // Subtle vignette to keep center readable.
       const vignette = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.75);
       vignette.addColorStop(0, "rgba(0,0,0,0)");
       vignette.addColorStop(1, isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.38)");

       // Particles / bokeh.
       const particleCount = w < 640 ? 12 : 18;
       const seed = 1337;
       for (let i = 0; i < particleCount; i += 1) {
         const drift = forceStatic ? 0 : t * (0.10 + 0.35 * S);
         const x = (Math.sin(seed + i * 12.7 + drift * 0.9) * 0.5 + 0.5) * w;
         const y = (Math.cos(seed + i * 9.9 + drift * 0.7) * 0.5 + 0.5) * h;
         const r = (w < 640 ? 10 : 14) + (i % 5) * 6;
         const a = (isDark ? 0.08 : 0.06) * I;
         ctx.beginPath();
         ctx.fillStyle = (i % 2 === 0 ? colA : colB) + a + ")";
        ctx.filter = "blur(10px)";
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.filter = "none";

       const amp = (w < 640 ? 130 : 220) * (0.75 + 0.7 * I);
       const freq = 0.014;
       const step = w < 640 ? 12 : 10;
       const driftX = forceStatic ? 0 : Math.sin(t * 0.22) * w * 0.055 * (0.35 + 0.65 * I);
       const centerX = w * 0.5 + driftX;
       const yShift = forceStatic ? 0 : ((t * 58 * (0.25 + 0.95 * S)) % (step * 10)) - step * 5;
       const tilt = Math.sin(t * 0.45) * 0.08;

      // Collect points.
      const pts1: Array<{ x: number; y: number; z: number }> = [];
      const pts2: Array<{ x: number; y: number; z: number }> = [];

       for (let y = -80; y <= h + 80; y += step) {
         const yPos = y + yShift;
         const phase = (forceStatic ? 0.7 : t) * (0.85 + 1.25 * S) + yPos * freq;
         const twist = Math.sin(phase);
         const z = 0.5 + 0.5 * Math.cos(phase);
         const perspective = 0.72 + 0.28 * z;
         const sway = twist * amp * perspective;
         const tiltX = (yPos - h * 0.5) * tilt;

        const x1 = centerX + sway + tiltX;
        const x2 = centerX - sway + tiltX;
         pts1.push({ x: x1, y: yPos, z });
         pts2.push({ x: x2, y: yPos, z });
       }

      const drawStrand = (pts: Array<{ x: number; y: number; z: number }>, base: string) => {
        // Glow pass.
        ctx.beginPath();
        for (let i = 0; i < pts.length; i += 1) {
          const p = pts[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
         ctx.strokeStyle = base + (isDark ? 0.20 : 0.26) * I + ")";
         ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.filter = "blur(8px)";
        ctx.stroke();

        // Core pass.
        ctx.filter = "none";
         ctx.strokeStyle = base + (isDark ? 0.45 : 0.55) * I + ")";
         ctx.lineWidth = 3.1;
         ctx.stroke();
      };

      drawStrand(pts1, colA);
      drawStrand(pts2, colB);

      // Rungs.
       const rungEvery = w < 640 ? 4 : 3;
       for (let i = 0; i < pts1.length; i += 1) {
         if (i % rungEvery !== 0) continue;
         const a = (0.08 + 0.22 * pts1[i].z) * I;

        ctx.beginPath();
        ctx.moveTo(pts1[i].x, pts1[i].y);
        ctx.lineTo(pts2[i].x, pts2[i].y);
        ctx.strokeStyle = rung + a + ")";
         ctx.lineWidth = 1.5;
         ctx.filter = "blur(1px)";
         ctx.stroke();
         ctx.filter = "none";
       }

      // Nodes.
       for (let i = 0; i < pts1.length; i += 3) {
         const r = 2.9 + 2.5 * pts1[i].z;
         const a = (isDark ? 0.58 : 0.56) * I;

        ctx.beginPath();
        ctx.fillStyle = colA + a + ")";
        ctx.filter = "blur(1px)";
        ctx.arc(pts1[i].x, pts1[i].y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = colB + (a * 0.9) + ")";
        ctx.arc(pts2[i].x, pts2[i].y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = "none";
      }

      // Vignette overlay.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    };

    const tick = () => {
      if (!running || !visible || document.hidden) return;
      t += 0.012;
      drawFrame(false);
      raf = window.requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrapper);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (!reduceMotion) {
          running = visible && !document.hidden;
          if (running && !raf) raf = window.requestAnimationFrame(tick);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(wrapper);

    const onVis = () => {
      if (reduceMotion) return;
      running = !document.hidden && visible;
      if (running && !raf) raf = window.requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVis);

    resize();
    if (!reduceMotion) raf = window.requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      ro.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [blur, intensity, speed]);

  const blurClass =
    blur === "none"
      ? ""
      : blur === "sm"
        ? "blur-sm"
        : blur === "lg"
          ? "blur-2xl"
          : "blur-xl";

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      {...props}
      className={cn(
        "pointer-events-none !absolute inset-0 z-0 overflow-hidden",
        blurClass,
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "h-full w-full opacity-90 dark:opacity-95",
          "mix-blend-normal dark:mix-blend-screen"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-b from-background/0 via-background/0 to-background/10",
          "dark:to-background/30"
        )}
      />
    </div>
  );
}
