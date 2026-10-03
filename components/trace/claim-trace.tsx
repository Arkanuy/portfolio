"use client";

import { useEffect, useRef, useState } from "react";
import { headlineClaims, numberClaims, STATE_LABEL, STATE_NOTE, type Claim } from "@/lib/trace";

/**
 * CLAIM TRACE — tanda tangan interaksi situs ini.
 *
 * Pengunjung memilih satu KLAIM (angka + namanya). Lalu:
 *   1. kolom bukti berganti isi — catatan yang membuktikan klaim itu,
 *   2. penanda ukur merah pindah ke baris tersebut,
 *   3. baris itu dicap waktu pembukaan.
 *
 * Kenapa ini berbeda dari portfolio lain: kamu tidak sedang dilihati. Kamu
 * sedang MENGUJI. Kalau klaim tidak punya catatan, panelnya mengatakannya.
 *
 * Teknis:
 *   - keyboard penuh (radio-group: panah atas/bawah, focus = pilih)
 *   - penanda ukur diukur dari getBoundingClientRect, jadi benar-benar menunjuk
 *   - orientasi penanda mengikuti tata letak: rel vertikal di layar lebar,
 *     garis horizontal di layar sempit (kolom menumpuk)
 *   - hanya opacity/transform yang dianimasikan
 */
export default function ClaimTrace() {
  const all: Claim[] = [...headlineClaims, ...numberClaims.slice(3)];
  const [active, setActive] = useState<string>(all[0]?.id ?? "");
  const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0, vertical: true });
  const panelRef = useRef<HTMLDivElement | null>(null);
  const helixRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const measure = () => {
      const panel = panelRef.current;
      /* Baris yang ditunjuk = baris pertama di kolom bukti (kelas --tip).
       * Diukur dari DOM, bukan dari state, supaya nilainya selalu geometri
       * yang benar-benar dirender. */
      const row = helixRef.current?.querySelector<HTMLElement>(".helix__node--tip");
      if (!panel || !row) {
        setRect({ x: 0, y: 0, w: 0, h: 0, vertical: true });
        return;
      }
      const p = panel.getBoundingClientRect();
      const r = row.getBoundingClientRect();
      const vertical = window.innerWidth > 900;
      setRect({
        x: r.left - p.left,
        y: r.top - p.top,
        w: r.width,
        h: r.height,
        vertical,
      });
    };
    measure();
    const t1 = window.setTimeout(measure, 60);
    const t2 = window.setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [active]);

  const claim = all.find((c) => c.id === active) ?? all[0];
  const nodes = claim?.sources ?? [];

  /* Stempel waktu: waktu pengunjung membuka baris ini di perangkatnya.
   * Nilainya berubah tiap kali klaim berganti, jadi jelas ini catatan
   * tindakan pengunjung — bukan klaim tentang server. */
  const [stamp, setStamp] = useState("");
  useEffect(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    setStamp(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`);
  }, [active]);

  const onKey = (e: React.KeyboardEvent) => {
    const i = all.findIndex((c) => c.id === active);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActive(all[(i + 1) % all.length].id);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive(all[(i - 1 + all.length) % all.length].id);
    }
  };

  if (!claim) return null;

  const has = rect.h > 0;

  return (
    <div className="tracePanel" ref={panelRef}>
      <div className="tracePanel__bar">
        <b>Source panel</b>
        <span>Select a claim — the rule moves to the record that proves it</span>
        <span className="sig" data-on="true" style={{ marginLeft: "auto" }}>
          {claim.id} opened {stamp} your time
        </span>
      </div>

      <div className="tracePanel__body">
        {/* ---- kolom klaim: radio-group, keyboard-ready ---- */}
        <div className="claims" role="radiogroup" aria-label="Claims" onKeyDown={onKey}>
          {all.map((c) => {
            const on = c.id === active;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                className="claim"
                onClick={() => setActive(c.id)}
                onFocus={() => setActive(c.id)}
              >
                <span className="claim__row">
                  <span className="claim__v">{c.value}</span>
                  <span className="claim__l">{c.label}</span>
                </span>
                <span className="claim__n">
                  {c.sources.length} record{c.sources.length === 1 ? "" : "s"} linked
                  <i aria-hidden="true">→</i>
                </span>
              </button>
            );
          })}
        </div>

        {/* ---- kolom bukti ---- */}
        <div className="traceView">
          <div className="traceView__head">
            <span className="traceView__cnt">
              Claim {claim.value} · {nodes.length} source{nodes.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="traceView__detail">{claim.detail}</p>

          {nodes.length > 0 ? (
            <div className="helix" data-on="true" ref={helixRef}>
              <span className="helix__lead" aria-hidden="true" />
              {nodes.map((n, i) => (
                <a
                  key={n.id}
                  className={`helix__node${i === 0 ? " helix__node--tip" : ""}`}
                  href={n.href}
                  style={{ ["--i" as string]: i }}
                  title={STATE_NOTE[n.state]}
                >
                  <span className="helix__k">{n.kind}</span>
                  <span className="helix__l">{n.label}</span>
                  <span className={`st st--${n.state}`}>{STATE_LABEL[n.state]}</span>
                  <span className="helix__go">open →</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="traceEmpty">
              No linked record. This claim is printed on the site but cannot be traced to a work record yet.
            </div>
          )}
        </div>
      </div>

      {/* penanda ukur — digambar dari geometri baris yang benar-benar dirender */}
      {has && (
        <span
          className={`panelBar ${rect.vertical ? "panelBar--v" : "panelBar--h"}`}
          aria-hidden="true"
          style={
            rect.vertical
              ? { transform: `translateY(${rect.y}px)`, height: rect.h }
              : { transform: `translateY(${rect.y}px)`, width: rect.w }
          }
        />
      )}
    </div>
  );
}