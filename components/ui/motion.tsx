"use client";

import { useEffect } from "react";

/**
 * Mesin gerak.
 *
 * ATURAN YANG MEMBUATNYA AMAN (pelajaran dari bug "konten terpotong"):
 *   Parallax hanya boleh menggeser hal yang MEMANG dikurung:
 *     a. `background-position`  → selalu dipotong oleh kotak elemennya sendiri
 *     b. isi bingkai ber-`overflow: hidden` (gambar sudah diperbesar dulu)
 *     c. baris berjalan di dalam wadah ber-`overflow: hidden`
 *   Elemen yang bergeser bebas TIDAK dipakai, karena itu yang dulu terpotong.
 *
 * Tipe yang ditangani:
 *   [data-bg="0.12"]    → background-position-y bergeser (pola latar)
 *   [data-inner="0.05"] → isi bingkai digeser di dalam bingkainya
 *   [data-x="0.06"]     → baris digeser mendatar di dalam wadah berbatas
 *   [data-fx]           → reveal: opacity + 22px
 *   [data-zoom]         → skala 1 → 1.05 mengikuti kemajuan
 */
export default function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const off = () => reduce.matches;
    const root = document.documentElement;

    const setOff = () => {
      root.dataset.motion = "off";
      document.querySelectorAll<HTMLElement>("[data-fx]").forEach((el) => (el.dataset.on = "true"));
      document.querySelectorAll<HTMLElement>("[data-bg],[data-inner],[data-x],[data-zoom]").forEach((el) => {
        el.style.setProperty("--bg-y", "0px");
        el.style.setProperty("--in-y", "0px");
        el.style.setProperty("--x", "0px");
        el.style.setProperty("--zoom", "1");
      });
    };

    if (off()) {
      setOff();
      return;
    }
    root.dataset.motion = "on";

    /* ---------- reveal ---------- */
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.on = "true";
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    const wireReveal = () => {
      document.querySelectorAll<HTMLElement>("[data-fx]:not([data-bound])").forEach((el) => {
        el.dataset.bound = "1";
        revealObs.observe(el);
      });
    };
    wireReveal();

    /* ---------- parallax ---------- */
    type Item = {
      el: HTMLElement;
      kind: "bg" | "inner" | "x" | "zoom";
      speed: number;
      top: number;
      h: number;
      last: number | null;
    };
    let items: Item[] = [];

    const measure = () => {
      const scroll = window.scrollY;
      const list: Item[] = [];
      const push = (sel: string, kind: Item["kind"], attr: string) => {
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          const raw = el.getAttribute(attr);
          if (raw === null) return;
          list.push({
            el,
            kind,
            speed: Number(raw) || 0,
            top: el.getBoundingClientRect().top + scroll,
            h: el.offsetHeight || 1,
            last: null,
          });
        });
      };
      push("[data-bg]", "bg", "data-bg");
      push("[data-inner]", "inner", "data-inner");
      push("[data-x]", "x", "data-x");
      push("[data-zoom]", "zoom", "data-zoom");
      items = list;
    };

    let queued = false;
    const paint = () => {
      queued = false;
      const vh = window.innerHeight;
      for (const it of items) {
        const top = it.top - window.scrollY;
        if (top + it.h < -vh * 0.5 || top > vh * 1.6) continue;
        // -1 (baru masuk) .. +1 (sudah lewat)
        const prog = Math.max(-1, Math.min(1, (vh / 2 - (top + it.h / 2)) / (vh / 2)));

        if (it.kind === "bg") {
          // pola latar: geser maksimum 90px, selalu terpotong kotaknya sendiri
          const y = prog * it.speed * 90;
          if (it.last === null || Math.abs(y - it.last) > 0.4) {
            it.el.style.setProperty("--bg-y", `${y.toFixed(2)}px`);
            it.last = y;
          }
        } else if (it.kind === "inner") {
          // isi bingkai: gambar sudah diperbesar, jadi aman digeser
          const y = prog * it.speed * 100;
          if (it.last === null || Math.abs(y - it.last) > 0.2) {
            it.el.style.setProperty("--in-y", `${y.toFixed(2)}px`);
            it.last = y;
          }
        } else if (it.kind === "x") {
          const x = prog * it.speed * 120;
          if (it.last === null || Math.abs(x - it.last) > 0.5) {
            it.el.style.setProperty("--x", `${x.toFixed(2)}px`);
            it.last = x;
          }
        } else {
          const p = Math.max(0, Math.min(1, (vh - top) / (vh + it.h)));
          const z = 1 + p * it.speed;
          if (it.last === null || Math.abs(z - it.last) > 0.001) {
            it.el.style.setProperty("--zoom", z.toFixed(4));
            it.last = z;
          }
        }
      }
    };
    const schedule = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };

    measure();
    paint();
    window.addEventListener("scroll", schedule, { passive: true });

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        measure();
        schedule();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    const remeasure = () => {
      measure();
      schedule();
    };
    window.addEventListener("load", remeasure);
    if (document.fonts?.ready) document.fonts.ready.then(remeasure).catch(() => {});
    document.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", remeasure, { once: true });
    });

    const mo = new MutationObserver(() => {
      wireReveal();
      measure();
      schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const onChange = () => {
      if (off()) setOff();
      else {
        root.dataset.motion = "on";
        remeasure();
      }
    };
    reduce.addEventListener("change", onChange);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", remeasure);
      window.clearTimeout(rt);
      reduce.removeEventListener("change", onChange);
      revealObs.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
