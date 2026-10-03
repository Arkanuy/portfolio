"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { STATUS_LINE, type Record_ } from "@/lib/trace";
import { StatusPill } from "./verify";

/**
 * BARIS CATATAN — pengganti kartu proyek.
 *
 * Portfolio lain menampilkan kotak dengan gambar di atas dan judul di bawah.
 * Di sini: satu baris lembar periksa. Nomor, judul, status bukti, hasil, dan
 * dua aksi. Gambar tetap ada, tapi kecil, tidak berwarna sampai kamu
 * menyorotnya — karena tangkapan layar bukan bukti, status buktinya itu.
 *
 * Angka "rail" di kiri menyala saat barisnya aktif, sama seperti penanda
 * ukur di panel klaim. Satu bahasa visual untuk seluruh situs.
 */
export default function RecordCard({ item, priority = false }: { item: Record_; priority?: boolean }) {
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            setOn(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <article className="cc" data-on={on} ref={ref as never}>
      <span className="cc__no mono">{item.no}</span>

      <a className="cc__main" href={item.href} style={{ display: "block" }}>
        <span className="cc__title" style={{ display: "block" }}>
          {item.title}
        </span>
        <span className="cc__kind" style={{ display: "block" }}>
          {item.kind} · {item.year}
          {item.where ? ` · ${item.where}` : ""}
        </span>
        <span className="cc__sum" style={{ display: "block" }}>
          {item.summary}
        </span>
        <span style={{ display: "block", marginTop: 10 }}>
          <StatusPill state={item.state} />
        </span>
        <span className="cc__ev" style={{ display: "block", marginTop: 9 }}>
          {STATUS_LINE[item.state]}
        </span>
      </a>

      <span className="cc__media">
        <Image
          src={item.image}
          alt={`${item.title} — interface preview`}
          width={1200}
          height={751}
          priority={priority}
          sizes="(max-width: 1050px) 100vw, 300px"
        />
      </span>

      <span className="cc__act">
        <a className="btn btn--sm btn--wide" href={item.href}>
          Case study
        </a>
        {item.external && (
          <a
            className="btn btn--sm btn--ghost btn--wide"
            href={item.external.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.external.label}
          </a>
        )}
        {!item.external && <span className="mono tiny">source not public</span>}
      </span>
    </article>
  );
}