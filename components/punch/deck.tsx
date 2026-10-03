"use client";

import { useEffect, useMemo, useState } from "react";
import PunchCard from "./card";
import { encode } from "@/lib/punch";
import { records, STATUS } from "@/lib/records";

/**
 * TUMPUKAN + AREA CETAK
 *
 * Tanda tangan interaksinya: memilih satu kartu MENGANGKATNYA dari tumpukan,
 * dan area cetak di bawah mesin menampilkan data kartu itu — termasuk legenda
 * pengkodeannya, supaya setiap lubang bisa dipertanggungjawabkan.
 *
 * Kartu yang tidak dipilih tetap terlihat, jadi perbandingan antar catatan
 * masih bisa dilakukan sekilas.
 */
export default function Deck() {
  const [picked, setPicked] = useState<string>(records[0]?.id ?? "");
  const active = useMemo(() => records.find((r) => r.id === picked) ?? records[0], [picked]);
  const code = useMemo(
    () =>
      active
        ? encode({ slug: active.id, title: active.title, year: active.year, state: active.state, built: active.built.length })
        : null,
    [active],
  );

  /* tombol angka 1..7 memilih kartu — mesin punya tombol angka */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!n || n < 1 || n > records.length) return;
      const t = records[n - 1];
      if (t) setPicked(t.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!active) return null;
  const st = STATUS[active.state];

  return (
    <>
      <div className="deck">
        {records.map((r) => (
          <PunchCard key={r.id} item={r} lifted={r.id === picked} onPick={() => setPicked(r.id)} />
        ))}
      </div>

      <section className="print" aria-live="polite">
        <div className="wrap print__in">
          <div>
            <p className="print__k">
              Cetakan · kartu {active.no} · {active.year}
            </p>
            <h2 className="print__t">{active.title}</h2>
            <p className="print__p">{active.summary}</p>

            <p className="print__k" style={{ marginTop: 22 }}>
              Yang dibangun
            </p>
            <ul className="print__list">
              {active.built.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <p className="print__k" style={{ marginTop: 22 }}>
              Hasil tercatat
            </p>
            <p className="print__p">{active.evidence}</p>

            <p style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a className="btn" href={active.href}>
                Studi kasus lengkap <i aria-hidden="true">→</i>
              </a>
              {active.external && (
                <a className="btn btn--line" href={active.external.href} target="_blank" rel="noopener noreferrer">
                  {active.external.label}
                </a>
              )}
            </p>
          </div>

          <aside>
            <div className="spec">
              <div className="spec__g">
                <p className="spec__k">Status bukti</p>
                <p className="spec__v">{st.label}</p>
              </div>
              <div className="spec__g">
                <p className="spec__k">Jenis</p>
                <p className="spec__v">{active.kind}</p>
              </div>
              <div className="spec__g">
                <p className="spec__k">Stack</p>
                <p className="spec__v">{active.stack}</p>
              </div>
              {active.where && (
                <div className="spec__g">
                  <p className="spec__k">Konteks</p>
                  <p className="spec__v">{active.where}</p>
                </div>
              )}
              <div className="spec__g">
                <p className="spec__k">Catatan</p>
                <p className="spec__v">{st.note}</p>
              </div>
            </div>

            <div className="code">
              <p className="spec__k">Cara membaca kartu ini</p>
              {code?.legend.map((l) => (
                <p className="code__r" key={`${l.col}:${l.row}`}>
                  <span className="code__c">
                    k{l.col}/b{l.row}
                  </span>
                  <span>{l.text}</span>
                </p>
              ))}
              <p className="code__r">
                <span className="code__c">k14–79</span>
                <span>pola periksa, dihitung dari isi kartu</span>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
