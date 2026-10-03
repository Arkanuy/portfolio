"use client";

import { useEffect, useState } from "react";

/**
 * NARASI BERLANGKAH — mekanisme "Let's Begin" dari referensi
 * (bluemarinefoundation.com/the-sea-we-breathe/).
 *
 * ATURAN YANG TIDAK BISA DITAWAR: keempat langkah SELALU dirender, sejak
 * HTML pertama. Tidak ada render bersyarat. Percobaan sebelumnya merender
 * langkah-nya hanya setelah tombol diklik, dan hasilnya: tanpa JS isi
 * halaman ini hilang sama sekali.
 *
 * Cara kerjanya sekarang:
 *   · sebelum dimulai → keempat langkah tampil bertumpuk sebagai daftar,
 *     dengan panel "mulai" di atasnya
 *   · setelah dimulai  → satu langkah penuh di tengah, sisanya disembunyikan
 *     lewat CSS (bukan dilepas dari DOM)
 */
const STEPS = [
  { n: "01", t: "Read the process first", d: "Who does what, where the work moves, and where it gets stuck." },
  { n: "02", t: "Write the requirements", d: "The outcome to reach comes first; the feature list follows." },
  { n: "03", t: "Build and test it yourself", d: "Everything gets used by me before anyone else touches it." },
  { n: "04", t: "Hand over with notes", d: "Including how to run it, so you are not dependent on me." },
];

export default function Begin() {
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onKey = (e: KeyboardEvent) => {
      if (!started) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setI((v) => Math.min(STEPS.length - 1, v + 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started]);

  return (
    <section className="begin" data-started={started ? "true" : "false"} aria-label="How the work runs">
      <div className="wrap begin__stage">
        <div className="begin__intro">
          <p className="kicker" style={{ color: "var(--accent-on-ink)" }}>
            The method · four steps
          </p>
          <h2 className="serif begin__introT">Where do you want to start?</h2>
          <button className="begin__start" type="button" onClick={() => setStarted(true)}>
            Let&rsquo;s begin <i aria-hidden="true">→</i>
          </button>
        </div>

        {/* KEEMPAT langkah selalu ada — tidak ada render bersyarat */}
        {STEPS.map((s, k) => (
          <div className="begin__step" key={s.n} data-on={k === i ? "true" : "false"}>
            <p className="kicker" style={{ color: "var(--accent-on-ink)", marginBottom: 14 }}>
              Step {s.n}
            </p>
            <p>
              <b>{s.t}.</b> {s.d}
            </p>
          </div>
        ))}

        <div className="begin__ctrl">
          <div className="begin__dots" aria-hidden="true">
            {STEPS.map((s, k) => (
              <span className="begin__dot" key={s.n} data-on={k === i ? "true" : "false"} />
            ))}
          </div>
          <button
            className="begin__start"
            type="button"
            onClick={() => setI((v) => (v >= STEPS.length - 1 ? 0 : v + 1))}
          >
            {i >= STEPS.length - 1 ? "Start again" : "Next step"} <i aria-hidden="true">→</i>
          </button>
        </div>
      </div>
    </section>
  );
}
