"use client";

import { useEffect, useRef } from "react";

/**
 * DRIFT ENGINE
 * ============
 *
 * JEBAKAN YANG SUDAH DITEMUKAN: flag induk dulu ditulis sebagai
 * `root.dataset.drift = "on"` — dan itu menaruh atribut `data-drift` di <html>,
 * yang langsung COCOK dengan selektor per-elemen `[data-drift]`. Akibatnya
 * seluruh dokumen dapat transform ambient dan bergeser 6px dari tepi, yang
 * muncul sebagai "overflow horizontal di semua viewport" sekaligus membuat
 * semua pengukuran posisi meleset. Sekarang flag induk bernama `data-motion`,
 * terpisah dari atribut opt-in per elemen.
 * Satu listener scroll, satu rAF, satu MutationObserver. Semuanya ditulis ke
 * CSS custom property; CSS yang memiliki transform-nya.
 *
 * KANVAS TIGA LAPIS — inilah "kehidupan" situs ini:
 *
 *   LAPIS 1 · DRIFT      [data-dp="0.45"]
 *     Parallax berlapis. Yang fokus paling cepat, latar BELAKANG bergerak
 *     BERLAWANAN arah. Arah berlawanan itu yang dibaca mata sebagai kedalaman —
 *     satu kecepatan seragam cuma terlihat seperti kertas yang tergeser.
 *     Amplitudo (AMP) adalah satu-satunya knop besarnya gerak. Pelajaran mahal:
 *     kanvas pernah "lolos tes" dengan gerak 2-18px per layar, dan itu tidak
 *     terlihat sama sekali oleh manusia. Ambangnya 40px, bukan 1px.
 *
 *   LAPIS 2 · ASSEMBLE   [data-as]
 *     Konten tidak "fade in". Konten MENYUSUN DIRI: beberapa bagian meluncur
 *     masuk dengan arah dan jeda berbeda, jadi tiap bagian terasa dipasang,
 *     bukan muncul.
 *
 *   LAPIS 3 · AMBIENT    [data-drift]
 *     Tidak ada yang benar-benar diam. Setiap elemen ber-data-drift terus
 *     bergerak pelan mengikuti kursor/waktu/scroll — termasuk saat tidak ada
 *     interaksi. Ini yang membuat halaman tidak pernah terasa beku.
 *
 * ATURAN KERAS: semuanya `transform` + `opacity`. Tidak ada yang menggerakkan
 * layout. Semua nilai ukur di-cache di luar loop (getBoundingClientRect di
 * dalam scroll handler = layout thrash, pernah terbukti bikin p95 16.8 → 50ms).
 *
 * `contain: layout paint` di setiap bagian supaya perubahan di dalam satu
 * bagian tidak bisa meng-invalidate layout seluruh halaman.
 */
export default function DriftEngine() {
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    /** Jalur non-gerak: konten harus benar-benar terbaca, bukan cuma "diam". */
    const off = () => {
      root.dataset.motion = "off";
      document
        .querySelectorAll<HTMLElement>("[data-dp],[data-as],[data-drift],[data-bar]")
        .forEach((el) => el.style.setProperty("--dp", "0px"));
      document.querySelectorAll<HTMLElement>("[data-as]").forEach((el) => {
        el.dataset.as = "in";
        el.dataset.asDone = "true";
      });
    };

    if (reduce.matches) {
      off();
      window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .addEventListener("change", (e) => (e.matches ? off() : location.reload()));
      return;
    }
    root.dataset.motion = "on";

    /* Lebar presisi (tanpa scrollbar) untuk lapisan medan. */
    const field = document.querySelector<HTMLElement>(".field");
    const sizeField = () => {
      if (!field) return;
      const de = document.documentElement;
      field.style.setProperty("--vw", `${de.clientWidth}px`);
      field.style.setProperty("--vh", `${de.clientHeight}px`);
      field.dataset.sized = "true";
    };
    sizeField();

    const AMP = 400; // knop amplitudo — lihat catatan di atas

    type Item = {
      el: HTMLElement;
      speed: number;
      scale: number;
      rot: number;
      top: number;
      height: number;
      lastV: number | null;
      lastP: number | null;
    };

    let items: Item[] = [];
    let ambient: { el: HTMLElement; ax: number; ay: number; last: string }[] = [];

    const collect = () => {
      const scroll = window.scrollY;
      items = Array.from(document.querySelectorAll<HTMLElement>("[data-dp]")).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          speed: Number(el.dataset.dp || 0),
          scale: Number(el.dataset.dpScale || 0),
          rot: Number(el.dataset.dpRot || 0),
          top: r.top + scroll, // posisi absolut — dibaca SEKALI
          height: r.height,
          lastV: null,
          lastP: null,
        };
      });
      ambient = Array.from(document.querySelectorAll<HTMLElement>("[data-drift]")).map((el) => ({
        el,
        ax: Number(el.dataset.driftX || 8),
        ay: Number(el.dataset.driftY || 8),
        last: "",
      }));
    };

    let queued = false;
    const apply = () => {
      queued = false;
      const vh = window.innerHeight;
      const scroll = window.scrollY;

      for (const it of items) {
        const top = it.top - scroll; // aritmetika saja
        if (top + it.height < -vh * 0.6 || top > vh * 1.7) continue;
        const center = top + it.height / 2;
        const prog = Math.max(-1, Math.min(1, (vh / 2 - center) / (vh / 2)));
        const p = Math.max(0, Math.min(1, (vh - top) / (vh + it.height)));
        const v = it.speed ? prog * it.speed * AMP : 0;

        if (it.speed && (it.lastV === null || Math.abs(v - it.lastV) > 0.01)) {
          it.el.style.setProperty("--dp", `${v.toFixed(2)}px`);
          it.lastV = v;
        }
        if (it.lastP === null || Math.abs(p - it.lastP) > 0.002) {
          it.el.style.setProperty("--dpp", p.toFixed(4));
          it.lastP = p;
        }
        if (it.scale) it.el.style.setProperty("--dps", (1 + p * it.scale).toFixed(4));
        if (it.rot) it.el.style.setProperty("--dpr", `${(prog * it.rot).toFixed(3)}deg`);
      }

      /* ambient: seluruh medan bernapas. Selalu ada gerak, bahkan tanpa
       * interaksi — ini yang bikin halaman tidak pernah terasa beku. */
      const t = performance.now() / 1000;
      for (const a of ambient) {
        const bx = Math.sin(t * 0.45 + a.ax) * a.ax;
        const by = Math.cos(t * 0.33 + a.ay) * a.ay;
        const key = (bx + by).toFixed(2);
        if (key === a.last) continue;
        a.last = key;
        a.el.style.setProperty("--ax", `${bx.toFixed(2)}px`);
        a.el.style.setProperty("--ay", `${by.toFixed(2)}px`);
      }

      /* kursor: dorongan halus pada elemen ber-data-drift-x */
      const { x, y } = pointer.current;
      document.querySelectorAll<HTMLElement>("[data-drip]").forEach((el) => {
        el.style.setProperty("--mx", `${(x * Number(el.dataset.drip)).toFixed(2)}px`);
        el.style.setProperty("--my", `${(y * Number(el.dataset.drip)).toFixed(2)}px`);
      });
    };

    const schedule = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(apply);
      }
    };

    collect();
    apply();

    /* ambient harus tetap jalan walau tidak ada scroll */
    const beat = window.setInterval(schedule, 120);

    const onScroll = () => schedule();

    /* kursor: dinormalisasi -1..1, dihaluskan, lalu ditulis sekali per frame */
    let rafP = 0;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      const s = pointer.current;
      s.tx = nx;
      s.ty = ny;
      if (rafP) return;
      rafP = requestAnimationFrame(() => {
        rafP = 0;
        const c = pointer.current;
        c.x += (c.tx - c.x) * 0.08;
        c.y += (c.ty - c.y) * 0.08;
        schedule();
      });
    };

    /* assemble: observer sekali jalan, tidak unobserve — kalau konten baru
     * muncul (filter), bagian itu tetap dapat giliran menyusun diri */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.dataset.as = "in";
          /* Setelah transisi perakitan selesai, lepas transisi transform.
           * Kalau tidak, gerak ambient (-–ax/--ay, ~8x/detik) tidak akan
           * pernah terlihat: browser terus menginterpolasi ke target yang
           * bergerak, jadi elemen tampak DIAM padahal nilainya berubah.
           * Ini bug yang lolos dari pemeriksaan nilai dan baru ketahuan
           * saat mengukur pergerakan nyata dari waktu ke waktu. */
          const done = (ev: TransitionEvent) => {
            if (ev.propertyName !== "transform") return;
            el.dataset.asDone = "true";
            el.removeEventListener("transitionend", done);
          };
          el.addEventListener("transitionend", done);
          // jaring kedua: kalau transitionend tidak pernah datang (mis. elemen
          // keluar layar di tengah animasi), tetap tandai selesai.
          window.setTimeout(() => {
            el.dataset.asDone = "true";
          }, 1600);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const observe = () =>
      document.querySelectorAll<HTMLElement>("[data-as]").forEach((el) => {
        if (el.dataset.asBound === "1") return;
        el.dataset.asBound = "1";
        io.observe(el);
      });
    observe();

    let rt = 0;
    const onResize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(() => {
        sizeField();
        collect();
        schedule();
      }, 150);
    };

    const mo = new MutationObserver(() => {
      observe();
      collect();
      schedule();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    mo.observe(document.body, { childList: true, subtree: true });

    /* navigasi internal (situs ini pakai <a> biasa) — ukur ulang setelah pindah */
    window.addEventListener("pageshow", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pageshow", onResize);
      window.clearInterval(beat);
      clearTimeout(rt);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
