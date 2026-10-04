"use client";

import { useEffect, useRef } from "react";
import KageScene from "@/app/kage/KageScene";

/**
 * HERO 3D — scene Kage sebagai latar beranda.
 *
 * Kenapa perlu penanganan gulir sendiri (bukan hanya CSS):
 *
 * Dokumen Kage BISA menggulir sendiri — isinya lima bab setinggi ~5400px, dan
 * <body>-nya di-set `overflow: hidden auto`. Akibatnya, roda gulir yang jatuh
 * di atas scene menggulir DOKUMEN KAGE, bukan portfolio. Terukur: setelah satu
 * kali roda di atas scene, posisi gulir halaman tetap 0 — pengunjung melihat
 * hero yang "tidak mau turun".
 *
 * pointer-events: none, lapisan pelindung transparan, dan `overscroll-behavior`
 * semuanya TIDAK cukup, karena event roda tetap dikirim ke dokumen di dalam
 * frame. Jadi di sini rodanya ditangkap lebih dulu (passive: false), lalu
 * digulirkan ke halaman ini. Sentuhan ditangani sama untuk perangkat sentuh.
 *
 * Dua hal lain yang juga diselesaikan di sini:
 *   · pointer-events: none + aria-hidden — scene murni visual; yang bermakna
 *     adalah kalimat portfolio di atasnya, jadi pembaca layar tidak dibebani
 *     lima bab Kage.
 *   · Efek ini hanya menangkap gulir VERTIKAL; klik tetap menembus (di hero
 *     tidak ada kontrol di area scene), dan tidak ada tombol yang terhalang.
 */
export default function KageHero() {
  const guard = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = guard.current;
    if (!el) return;

    const alihkan = (dy: number) => {
      /* behavior "instant": halaman ini punya scroll-behavior: smooth, dan
         kalau tiap event roda ikut dianimasikan, gulirnya jadi tersendat. */
      window.scrollBy({ top: dy, behavior: "instant" as ScrollBehavior });
    };

    const onWheel = (e: WheelEvent) => {
      /* deltaMode 1 = baris, 2 = halaman. Disamakan ke piksel dulu. */
      const skala = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const dy = e.deltaY * skala;
      if (dy === 0) return;
      e.preventDefault();
      alihkan(dy);
    };

    let sentuhAkhir = 0;
    const onTouchStart = (e: TouchEvent) => {
      sentuhAkhir = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      const dy = sentuhAkhir - y;
      sentuhAkhir = y;
      if (dy === 0) return;
      e.preventDefault();
      alihkan(dy);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <>
      <div className="hero__scene" aria-hidden="true">
        <KageScene />
      </div>
      <div className="hero__sceneGuard" ref={guard} aria-hidden="true" />
    </>
  );
}
