"use client";

import { useEffect, useRef, useState } from "react";

/**
 * WordFlow — judul masuk kata per kata.
 *
 * Kenapa diganti dari efek sebelumnya:
 *   - teks per kata dengan penggalan per HURUF membuat spasi terjepit di dalam
 *     elemen inline-block, dan browser membuang spasi di ujungnya (bug "kata menempel");
 *   - kilau bergerak pada teks berkedip setiap frame dan membuat judul terbaca
 *     tidak stabil.
 *
 * Cara ini: satu elemen per KATA (bukan per huruf), spasi tetap sebagai teks di
 * luar elemen, dan gerakannya naik + membesar sedikit. Kata bertanda `~` jadi
 * kata aksen: berwarna aksen, dan garis bawahnya tumbuh setelah kata-kata selesai
 * masuk. Tidak ada kliping, jadi tidak ada huruf yang bisa terpotong.
 */
export function WordFlow({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const obs = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            setOn(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = text.split(/\s+/).filter(Boolean);
  let i = 0;

  return (
    <span ref={ref} className={`wf ${className}`} data-on={on ? "true" : "false"}>
      {words.map((w, k) => {
        const accent = w.startsWith("~");
        const clean = accent ? w.slice(1) : w;
        const idx = i++;
        return (
          <span key={`${w}-${k}`}>
            {k > 0 ? " " : null}
            <span
              className={`wf__w${accent ? " wf__w--a" : ""}`}
              style={{ "--i": idx } as React.CSSProperties}
            >
              {clean}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default WordFlow;
