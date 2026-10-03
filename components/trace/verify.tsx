"use client";

import { useState } from "react";
import {
  capabilities,
  records,
  unsourcedTools,
  traceStats,
  STATE_LABEL,
  STATE_NOTE,
  type EvidenceState,
} from "@/lib/trace";

/** Label status bukti — dipakai di seluruh situs. */
export function StatusPill({ state }: { state: EvidenceState }) {
  return (
    <span className={`st st--${state}`} title={STATE_NOTE[state]}>
      {STATE_LABEL[state]}
    </span>
  );
}

/**
 * MEJA PERIKSA — tabel catatan.
 *
 * Ini pengganti "grid kartu proyek". Bentuknya lembar periksa: satu baris per
 * catatan, kolom tetap, tanpa bayangan. Setiap baris menampilkan kekuatan
 * buktinya apa adanya.
 */
export function RecordLedger() {
  return (
    <div>
      <div className="bench__head" aria-hidden="true">
        <span>#</span>
        <span>Record</span>
        <span>Evidence</span>
        <span>What was built</span>
        <span>Open</span>
      </div>
      {records.map((r) => (
        <div className="bench__row" key={r.id}>
          <span className="bench__no">{r.no}</span>
          <div>
            <div className="bench__t">{r.title}</div>
            <div className="bench__m">
              {r.kind} · {r.year}
              {r.where ? ` · ${r.where}` : ""}
            </div>
          </div>
          <div>
            <StatusPill state={r.state} />
            <p className="bench__e" style={{ marginTop: 8 }}>
              {r.evidence}
            </p>
          </div>
          <div>
            <p className="bench__cap">{r.built[0]}</p>
            {r.built[1] && <p className="bench__capM">{r.built[1]}</p>}
            {r.built.length > 2 && <p className="bench__capM">+{r.built.length - 2} more in the case study</p>}
          </div>
          <div className="bench__act">
            <a className="btn btn--sm btn--wide" href={r.href}>
              Case study
            </a>
            {r.external && (
              <a className="btn btn--sm btn--ghost btn--wide" href={r.external.href} target="_blank" rel="noopener noreferrer">
                {r.external.label}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * INDEKS KEMAMPUAN — setiap kemampuan menunjuk catatan yang membuktikannya.
 *
 * Tombol TRACE menyala/mati. Saat menyala, baris tanpa catatan DIARSIR dan
 * jumlah celah muncul. Saat mati, pengunjung melihat apa yang biasanya
 * ditampilkan portfolio lain: daftar kemampuan tanpa bukti.
 *
 * Itu inti konsepnya — bukan sekadar halaman "skills", tapi perbandingan
 * antara klaim dan bukti.
 */
export function CapabilityIndex() {
  const [trace, setTrace] = useState(true);

  return (
    <div className="bench" data-trace={trace ? "on" : "off"}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <button
          type="button"
          className="traceOnBtn"
          data-on={trace}
          aria-pressed={trace}
          onClick={() => setTrace((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setTrace((v) => !v);
            }
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              border: "1px solid currentColor",
              background: trace ? "currentColor" : "transparent",
              display: "inline-block",
            }}
          />
          {trace ? "Trace on" : "Trace off"}
        </button>
        <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
          {trace
            ? `${traceStats.sourced} of ${traceStats.capabilities} capabilities link to a work record · ${traceStats.gaps} unsourced, shown hatched`
            : "Trace off — capability list as it appears without verification"}
        </span>
      </div>

      <div className="cap">
        <div className="cap__side">
          <p className="cap__group">{trace ? "Verified + gaps" : "Claims only"}</p>
        </div>
        <div className="cap__rows">
          {capabilities.map((c, i) => {
            const gap = c.sources.length === 0;
            return (
              <div className="capRow" key={c.id} data-src={trace && !gap} data-gap={trace && gap}>
                <span className="capRow__tick" aria-hidden="true">
                  <i />
                </span>
                <div>
                  <div className="capRow__n">{c.name}</div>
                  <div className="capRow__e">{c.group}</div>
                </div>
                <div>
                  <p className="capRow__e" style={{ color: "var(--ink-2)" }}>
                    {c.evidence}
                  </p>
                  <div className="capRow__src">
                    {c.sources.map((s) => (
                      <a className="chip" key={s.id} href={s.href}>
                        <span className="mono" style={{ color: "var(--mark-ink)" }}>
                          {s.kind === "record" ? "rec" : "log"}
                        </span>
                        {s.label}
                      </a>
                    ))}
                    {gap && <span className="chip chip--none">no work record linked</span>}
                  </div>
                </div>
                <div className="capRow__go">
                  <span className="bench__test" data-i={i}>
                    {trace ? (gap ? "[ GAP ]" : `[ ${c.sources.length} src ]`) : "[ — ]"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Laporan celah: perkakas yang disebut tapi belum punya catatan kerja. */
export function GapReport() {
  return (
    <>
      <p className="traceNote">
        <b>
          {unsourcedTools.length} tools ({Math.round((unsourcedTools.length / Math.max(1, traceStats.capabilities)) * 100)}% of
          the list)
        </b>{" "}
        appear in the home-page tool strip without a linked work record on this site. They are listed here rather than
        quietly removed. A gap is information; hiding it is not.
      </p>
      <div className="gaps">
        {unsourcedTools.map((t) => (
          <span className="gap" key={t}>
            {t}
          </span>
        ))}
      </div>
    </>
  );
}
