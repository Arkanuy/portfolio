"use client";

import { useEffect, useRef } from "react";

/**
 * ENGINE GERAK
 * ============
 * Semua gerak di sini adalah kosakata halaman cetak — huruf yang TERPASANG,
 * garis yang TERTARIK, angka yang MENGHITUNG. Tidak ada orb, tidak ada glow,
 * tidak ada partikel. Itu bedanya dengan versi yang ditolak: yang dulu
 * bergerak adalah cahaya; yang sekarang bergerak adalah tipe dan tata letak.
 *
 * KONTRAK KESELAMATAN (dari bug nyata di konsep sebelumnya):
 *   `html[data-anim="on"]` HANYA dipasang oleh komponen ini, yaitu saat React
 *   benar-benar berjalan. Semua CSS yang menyembunyikan konten berada di bawah
 *   selektor itu. Jadi kalau JS mati atau reduced-motion, atributnya tidak ada
 *   dan konten tidak mungkin tersembunyi. "Animasi penuh" tidak boleh berarti
 *   "kosong kalau JS gagal".
 *
 * Satu listener scroll, satu rAF, satu MutationObserver.
 */
export default function Motion() {
  const counters = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const runCounters = () => {
      for (const el of counters.current) {
        if (el.dataset.counted === "1") continue;
        const target = Number(el.dataset.count || 0);
        const suffix = el.dataset.suffix || "";
        const pad = el.dataset.pad ? Number(el.dataset.pad) : 0;
        if (!Number.isFinite(target) || target === 0) continue;
        el.dataset.counted = "1";
        const t0 = performance.now();
        const dur = 900;
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          const v = Math.round(target * eased);
          el.textContent = (pad ? String(v).padStart(pad, "0") : String(v)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = (pad ? String(target).padStart(pad, "0") : String(target)) + suffix;
        };
        requestAnimationFrame(tick);
        /* jaring kedua: rAF bisa berhenti kalau tab tidak aktif. Nilai akhir
         * WAJIB mendarat di angka aslinya, bukan angka antara. */
        window.setTimeout(() => {
          el.textContent = (pad ? String(target).padStart(pad, "0") : String(target)) + suffix;
        }, dur + 700);
      }
    };

    if (reduce.matches) {
      /* jalur non-gerak: tidak memasang data-anim sama sekali */
      runCounters();
      return;
    }

    root.dataset.anim = "on";

    /* reveal per bagian: bagian yang masuk layar dapat giliran menjalankan
     * animasinya (animation-play-state dijaga di CSS). */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = "true";
          runCounters();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    const observe = () =>
      /* `[data-draw]` ikut diamati: garis hanya boleh tertarik setelah bagiannya
       * terlihat, jadi ia perlu punya state `data-in` sendiri. */
      document.querySelectorAll<HTMLElement>("[data-on-enter], [data-draw]").forEach((el) => {
        if (el.dataset.bound === "1") return;
        el.dataset.bound = "1";
        io.observe(el);
      });

    /* indeks animasi: dipasang di sini, bukan di markup, supaya satu blok bisa
     * menambah/ menghapus elemen tanpa menghitung --i manual. */
    const indexStagger = () => {
      document.querySelectorAll<HTMLElement>("[data-set]").forEach((el) => {
        if (el.dataset.indexed === "1") return;
        el.dataset.indexed = "1";
        el.querySelectorAll<HTMLElement>(":scope > span").forEach((s, i) => {
          s.style.setProperty("--i", String(i));
        });
      });
      document.querySelectorAll<HTMLElement>("[data-draw]").forEach((el) => {
        if (el.dataset.indexed === "1") return;
        el.dataset.indexed = "1";
        el.querySelectorAll<HTMLElement>(":scope > i").forEach((s, i) => {
          s.style.setProperty("--i", String(i));
        });
      });
      document.querySelectorAll<HTMLElement>("[data-rise], [data-wipe]").forEach((el, i) => {
        if (el.dataset.indexed === "1") return;
        el.dataset.indexed = "1";
        el.style.setProperty("--i", String(i % 4));
      });
    };

    /* garis progres baca */
    const bar = document.getElementById("read-progress");
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = `scaleX(${h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0})`;
      });
    };

    counters.current = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    indexStagger();
    observe();
    runCounters();
    onScroll();

    const mo = new MutationObserver(() => {
      indexStagger();
      observe();
      counters.current = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
