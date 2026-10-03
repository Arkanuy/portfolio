"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================================
   KUMPULAN ANIMASI
   Semua ditulis sendiri, tanpa dependensi baru. Pola diambil dari komponen
   yang sudah terbukti di koleksi referensi:
     BlurText      — judul pecah per kata, dari buram lalu tajam
     ShinyText     — kilau menyapu melintasi teks
     RotatingText  — teks berganti berputar di dalam satu baris
     Spotlight     — sinar lembut mengikuti kursor
     TiltCard      — kartu miring 3D mengikuti kursor
     GlareCard     — kilau mengikuti kursor di atas permukaan kartu
     BorderBeam    — cahaya berjalan di garis tepi kartu
     ClickSpark    — percikan garis saat diklik
     ShimmerButton — kilau menyapu tombol utama

   Aturan performa: yang mengikuti kursor hanya menulis CSS variable lewat satu
   rAF. Yang murni animasi memakai CSS saja. Semua mati saat reduced-motion.
   ============================================================================ */

/** Judul pecah per kata: mulai buram + bergeser, lalu tajam. */
export function BlurText({
  text,
  as: Tag = "h1",
  className = "",
  delay = 0,
  blur = 10,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  blur?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) {
      el?.setAttribute("data-on", "true");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).setAttribute("data-on", "true");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");
  return (
    // @ts-expect-error Tag adalah union literal yang valid
    <Tag ref={ref} className={`blurTxt ${className}`} style={{ "--blur": `${blur}px`, "--delay": `${delay}ms` }}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className="blurTxt__w" style={{ "--i": i }}>
            {w}
          </span>
          {/* Spasi HARUS di luar inline-block: browser membuang spasi di ujung
              elemen inline-block, dan itu yang membuat kata-kata menempel. */}
          {i < words.length - 1 ? <span className="blurTxt__sp"> </span> : null}
        </span>
      ))}
    </Tag>
  );
}

/** Kilau menyapu melintasi teks, berulang. */
export function ShinyText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`shiny ${className}`}>{children}</span>;
}

/** Teks berganti satu per satu di dalam satu baris. */
export function RotatingText({ items, className = "" }: { items: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced()) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % items.length), 2600);
    return () => window.clearInterval(id);
  }, [items.length]);
  return (
    <span className={`rotTxt ${className}`} aria-live="polite">
      <span className="rotTxt__inner" key={i}>
        {items[i]}
      </span>
    </span>
  );
}

/** Sinar lembut yang mengikuti kursor di dalam wadahnya. */
export function Spotlight({ className = "", color = "accent" }: { className?: string; color?: "accent" | "soft" }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let nx = 0.5;
    let ny = 0.3;
    let queued = false;
    const paint = () => {
      queued = false;
      el.style.setProperty("--sx", `${(nx * 100).toFixed(2)}%`);
      el.style.setProperty("--sy", `${(ny * 100).toFixed(2)}%`);
    };
    const onMove = (e: PointerEvent) => {
      const host = el.parentElement;
      if (!host) return;
      const r = host.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width;
      ny = (e.clientY - r.top) / r.height;
      if (!queued) {
        queued = true;
        raf.current = requestAnimationFrame(paint);
      }
    };
    const host = el.parentElement;
    host?.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      host?.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return <div ref={ref} className={`spot spot--${color} ${className}`} aria-hidden="true" />;
}

/** Kartu miring 3D mengikuti kursor. */
export function TiltCard({
  children,
  className = "",
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let queued = false;
    let nx = 0;
    let ny = 0;
    const paint = () => {
      queued = false;
      el.style.setProperty("--tx", `${(ny * max).toFixed(2)}deg`);
      el.style.setProperty("--ty", `${(-nx * max).toFixed(2)}deg`);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };
    const onLeave = () => {
      el.style.setProperty("--tx", "0deg");
      el.style.setProperty("--ty", "0deg");
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
    </div>
  );
}

/** Kilau mengikuti kursor di permukaan kartu. */
export function GlareCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let queued = false;
    let x = 50;
    let y = 0;
    const paint = () => {
      queued = false;
      el.style.setProperty("--gx", `${x}%`);
      el.style.setProperty("--gy", `${y}%`);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 100;
      y = ((e.clientY - r.top) / r.height) * 100;
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, []);
  return (
    <div ref={ref} className={`glare ${className}`}>
      <span className="glare__light" aria-hidden="true" />
      {children}
    </div>
  );
}

/** Cahaya berjalan di garis tepi. */
export function BorderBeam({ className = "", size = 120, duration = 4 }: { className?: string; size?: number; duration?: number }) {
  return (
    <span
      className={`beam ${className}`}
      aria-hidden="true"
      style={{ "--beam-size": `${size}px`, "--beam-dur": `${duration}s` }}
    />
  );
}

/** Percikan garis saat diklik di mana saja. */
export function ClickSpark() {
  useEffect(() => {
    if (reduced()) return;
    const onDown = (e: PointerEvent) => {
      const host = document.createElement("span");
      host.className = "spark";
      host.style.left = `${e.clientX}px`;
      host.style.top = `${e.clientY}px`;
      for (let i = 0; i < 8; i++) {
        const s = document.createElement("i");
        s.style.setProperty("--a", `${i * 45}deg`);
        host.appendChild(s);
      }
      document.body.appendChild(host);
      window.setTimeout(() => host.remove(), 620);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}

/** Tombol dengan kilau menyapu. */
export function ShimmerButton({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a className={`shimmerBtn ${className}`} href={href}>
      <span className="shimmerBtn__sheen" aria-hidden="true" />
      <span className="shimmerBtn__label">{children}</span>
    </a>
  );
}
