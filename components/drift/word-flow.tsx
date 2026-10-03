"use client";

import { useEffect, useRef, useState } from "react";

/**
 * WordFlow — judul masuk PER KATA, tiap kata datang dari sudut sendiri.
 *
 * Dipertahankan dari versi sebelumnya karena alasan teknis yang sudah
 * terbukti: teks per HURUF dengan `display: inline-block` bikin browser
 * memotong baris di tengah kata dan spasinya hilang ("kata menempel").
 * Satu elemen per KATA aman.
 *
 * Kata bertanda `~` jadi kata aksen (gradien).
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
      { threshold: 0.14, rootMargin: "0px 0px -5% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <span ref={ref} className={`wf ${className}`} data-on={on ? "true" : "false"}>
      {words.map((w, k) => {
        const accent = w.startsWith("~");
        const clean = accent ? w.slice(1) : w;
        return (
          <span key={`${w}-${k}`}>
            {k > 0 ? " " : null}
            <span
              className="wf__w"
              style={{ ["--i" as string]: k, ["--r" as string]: k % 2 === 0 ? -1.2 : 1.2 }}
            >
              {accent ? <em style={{ fontStyle: "normal" }}>{clean}</em> : clean}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default WordFlow;
