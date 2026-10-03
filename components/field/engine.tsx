"use client";

import { useEffect } from "react";

/**
 * ENGINE GERAK — mekanisme yang sama dengan referensi, tanpa pustaka.
 *
 * Referensi yang dibaca:
 *   landonorris.com            Lenis smooth scroll · sticky-item · horizontal pin
 *                              · css-split-type · 1 keyframe saja (sisanya scroll-driven)
 *   bluemarinefoundation.com   GSAP ScrollTrigger · heroBanner sticky ·
 *                              stickyPanels__leftInner · keyframe 'draw' · marquee
 *
 * Yang saya tiru MEKANISME-nya, bukan tampilannya:
 *
 *   1. SMOOTH SCROLL (lerp). Ini penyumbang terbesar rasa "mahal" di kedua
 *      situs. Implementasinya TIDAK memakai transform pada pembungkus (itu yang
 *      dulu merusak anchor, sticky, dan IntersectionObserver). Caranya sama
 *      seperti Lenis: tahan event wheel, lalu `window.scrollTo` dengan nilai
 *      yang di-lerp. Aliran dokumen tetap asli.
 *   2. PINNED SECTION. Bagian dipatok (`position: sticky`) sementara isinya
 *      berganti mengikuti progres gulir. Dipakai di bagian kerja.
 *   3. SPLIT TEXT. Judul dipecah per kata; tiap kata masuk dengan jeda sendiri.
 *      Per KATA, bukan per huruf: memecah per huruf membuat browser memotong
 *      baris di tengah kata dan spasinya hilang.
 *   4. SCRUB. Progres 0..1 dari posisi tiap bagian ditulis ke `--p`; CSS yang
 *      memakainya untuk menggeser/menskalakan isi. Jadi animasinya MENGIKUTI
 *      jari, bukan memicu sekali lalu selesai.
 *   5. MARQUEE. Baris berjalan, dua arah, dua kecepatan.
 *
 * KESELAMATAN (bug nyata dari versi-versi sebelumnya):
 *   - `html[data-motion="on"]` hanya dipasang di sini. Semua CSS yang
 *     menyembunyikan konten bergantung padanya, jadi JS mati = konten utuh.
 *   - reduced-motion: tidak memasang apa pun; smooth scroll dilewati.
 *   - Ponsel: smooth scroll TIDAK dipakai (wheel diserahkan ke browser);
 *     scrub dan split tetap jalan. Menahan sentuhan bikin gulir terasa rusak.
 */
export default function Field() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduce.matches) return;

    root.dataset.motion = "on";

    /* ---------------- indeks jeda per kata ---------------- */
    const indexSplit = () => {
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        if (el.dataset.idx === "1") return;
        el.dataset.idx = "1";
        el.querySelectorAll<HTMLElement>(":scope > span > span").forEach((s, i) => {
          s.style.setProperty("--i", String(i));
        });
      });
    };

    /* ---------------- scrub: tulis progres tiap bagian ---------------- */
    type Sec = { el: HTMLElement; top: number; height: number; last: number };
    let secs: Sec[] = [];
    const measure = () => {
      const y = window.scrollY;
      secs = Array.from(document.querySelectorAll<HTMLElement>("[data-scrub]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { el, top: r.top + y, height: r.height, last: -1 };
      });
    };

    const applyScrub = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      for (const s of secs) {
        const top = s.top - y;
        if (top > vh || top + s.height < 0) continue;
        /* 0 saat bagian mulai masuk dari bawah, 1 saat tepi atasnya lewat atas */
        const p = Math.max(0, Math.min(1, (vh - top) / (vh + s.height)));
        if (Math.abs(p - s.last) < 0.004) continue;
        s.last = p;
        s.el.style.setProperty("--p", p.toFixed(4));
      }
      syncPanels();
    };

    /* ---------------- smooth scroll (lerp) ---------------- */
    let target = window.scrollY;
    let current = window.scrollY;
    let raf = 0;
    let animating = false;
    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const loop = () => {
      current += (target - current) * 0.115;
      if (Math.abs(target - current) < 0.4) {
        current = target;
        animating = false;
      } else {
        animating = true;
      }
      window.scrollTo(0, current);
      applyScrub();
      raf = animating ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return; /* biarkan zoom */
      e.preventDefault();
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY));
      kick();
    };

    /* Kalau pengguna menggulir dengan cara lain (keyboard, scrollbar, anchor),
       kita harus menyelaraskan target — kalau tidak, posisinya akan "melompat
       kembali" ke target lama. */
    const onScroll = () => {
      if (animating) return;
      target = window.scrollY;
      current = window.scrollY;
      applyScrub();
    };

    /* ---------------- observer: bagian yang masuk layar ---------------- */
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) (e.target as HTMLElement).dataset.in = "true";
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const observe = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal],[data-split]").forEach((el) => {
        if (el.dataset.bound === "1") return;
        el.dataset.bound = "1";
        io.observe(el);
      });

    /* ---------------- panel pada seksi dipatok ----------------
     * Aktifkan panel ke-N sesuai progres. Mekanisme yang sama dengan
     * `stickyPanels__leftInner` dan daftar layanan di sebelahnya. */
    const syncPanels = () => {
      for (const wrap of Array.from(document.querySelectorAll<HTMLElement>("[data-scrub]"))) {
        const items = Array.from(wrap.querySelectorAll<HTMLElement>(".scrub__item"));
        if (!items.length) continue;
        const raw = parseFloat(getComputedStyle(wrap).getPropertyValue("--p")) || 0;
        /* Bagian dipatok mulai saat tepi atasnya mencapai puncak; progres
         * efektif 0..1 dipetakan ke jumlah panel. */
        const r = wrap.getBoundingClientRect();
        const travel = Math.max(1, r.height - window.innerHeight);
        const done = Math.max(0, Math.min(1, -r.top / travel));
        const idx = Math.min(items.length - 1, Math.floor(done * items.length));
        items.forEach((el, k) => el.dataset.on = k === idx ? "true" : "false");
        const panels = Array.from(wrap.querySelectorAll<HTMLElement>(".scrub__panel"));
        panels.forEach((el, k) => el.dataset.on = k === idx ? "true" : "false");
        const fill = wrap.querySelector<HTMLElement>(".scrub__progFill");
        if (fill) fill.style.setProperty("--p", done.toFixed(3));
      }
    };

    /* ---------------- garis progres ---------------- */
    const bar = document.getElementById("read-bar");

    const tick = () => {
      if (bar) {
        const h = maxScroll();
        bar.style.transform = `scaleX(${h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0})`;
      }
    };

    let rt = 0;
    const onResize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(() => {
        measure();
        applyScrub();
        tick();
      }, 160);
    };

    const mo = new MutationObserver(() => {
      indexSplit();
      observe();
      measure();
    });

    indexSplit();
    observe();
    measure();
    applyScrub();
    tick();

    window.addEventListener("scroll", () => {
      tick();
      onScroll();
    }, { passive: true });
    window.addEventListener("resize", onResize);
    if (fine.matches) window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pageshow", onResize);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pageshow", onResize);
    };
  }, []);

  return null;
}
