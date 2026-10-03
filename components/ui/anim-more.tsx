"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================================
   ANIMASI TAMBAHAN
   Pola dari koleksi referensi: ScrambleText, InfiniteMovingCards, Marquee,
   Dock, NumberTicker, AnimatedGradientText, TextReveal.
   Kuncinya: yang mahal TIDAK dijalankan selamanya — semua berhenti saat keluar
   dari layar, dan hanya satu rAF untuk semua elemen yang ikut kursor.
   ============================================================================ */

/** Teks yang "didekripsi": karakter acak lalu mengendap jadi kata asli. */
export function ScrambleText({ text, className = "", speed = 22 }: { text: string; className?: string; speed?: number }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      setOut(text);
      return;
    }
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-/<>";
    let timer = 0;
    let raf = 0;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || done.current) return;
          done.current = true;
          const total = text.length;
          let frame = 0;
          const run = () => {
            frame += 1;
            const settled = Math.floor(frame / 2);
            let next = "";
            for (let i = 0; i < total; i++) {
              if (i < settled) next += text[i];
              else if (text[i] === " ") next += " ";
              else next += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            setOut(next);
            if (settled < total) raf = requestAnimationFrame(run);
            else {
              setOut(text);
              window.clearTimeout(timer);
            }
          };
          raf = requestAnimationFrame(run);
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [text]);

  return (
    <span ref={ref} className={`scr ${className}`}>
      {out}
    </span>
  );
}

/** Deretan kartu berjalan tanpa henti, berhenti saat disorot.
 *  Dipakai untuk galeri logo/kata — bukan teks kalimat. */
export function MovingCards({
  items,
  reverse = false,
  duration = 30,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.run = reduced() ? "off" : "on";
  }, []);

  return (
    <div className="mcards" ref={ref} aria-hidden="true">
      <div className={`mcards__row${reverse ? " mcards__row--rev" : ""}`} style={{ animationDuration: `${duration}s` }}>
        {[...items, ...items].map((t, i) => (
          <span key={`${t}-${i}`} className="mcards__i">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Angka yang bergulir naik (varian lebih tegas dari Counter). */
export function NumberTicker({ value, duration = 1200, className = "" }: { value: string; duration?: number; className?: string }) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^(\D*?)(\d+)([\s\S]*)$/);
    if (!m || reduced()) return;
    const [, pre, digits, post] = m;
    const target = Number(digits);
    const pad = digits.length;
    let raf = 0;
    let safety = 0;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || done.current) return;
          done.current = true;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 4);
            setText(pre + String(Math.round(target * eased)).padStart(pad, "0") + post);
            if (p < 1) raf = requestAnimationFrame(tick);
            else setText(value);
          };
          raf = requestAnimationFrame(tick);
          // jaring kedua: pastikan mendarat di nilai asli
          safety = window.setTimeout(() => {
            cancelAnimationFrame(raf);
            setText(value);
          }, duration + 500);
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/** Judul dengan gradasi yang bergerak pelan. */
export function GradientText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`gtext ${className}`}>{children}</span>;
}

/** Kartu yang menempel di dasar layar dan membesar saat disorot (pola Dock). */
export function Dock({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const kids = Array.from(el.children) as HTMLElement[];
    const onMove = (e: PointerEvent) => {
      for (const k of kids) {
        const r = k.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        const near = Math.max(0, 1 - d / 170);
        k.style.setProperty("--dock", (1 + near * 0.35).toFixed(3));
      }
    };
    const onLeave = () => kids.forEach((k) => k.style.setProperty("--dock", "1"));
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={`dock ${className}`}>
      {children}
    </div>
  );
}

/** Judul yang huruf-hurufnya masuk satu per satu dari bawah. */
export function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.on = reduced() ? "true" : "false";
    if (reduced()) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.on = "true";
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className={`treveal ${className}`}>
      {text.split("").map((c, i) =>
        c === " " ? (
          /* Spasi jadi elemen terpisah yang TIDAK inline-block. Bentuk lama
             ("\u00a0" di dalam inline-block) membuat pemenggalan baris rusak:
             tiap kata jadi satu blok panjang dan browser menggeser seluruh
             baris, sehingga spasinya terlihat hilang. */
          <span key={i} className="treveal__sp">
            {" "}
          </span>
        ) : (
          <span key={i} className="treveal__c" style={{ "--i": i }}>
            {c}
          </span>
        ),
      )}
    </span>
  );
}
