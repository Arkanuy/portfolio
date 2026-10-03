"use client";

import { useEffect, useMemo, useState } from "react";
import { records, STATUS, type EvidenceState, type Record_ } from "@/lib/records";

/**
 * KATALOG — struktur dari referensi threeui.com.
 *
 * Di sana: sidebar daftar komponen di kiri, dan di kanan panel per komponen —
 * nama, deskripsi, dua tombol (salin prompt / buka pratinjau), bilah demo
 * dengan penghitung dan pemilih varian, tabel spesifikasi Field | Type | Value,
 * langkah instalasi bernomor, dan kartu integritas.
 *
 * Di sini: struktur yang sama, isinya catatan kerja. Tiap catatan jadi satu
 * "komponen" yang bisa dibuka, punya spesifikasi, dan punya cara pakai.
 * Datanya tetap dari lib/site.ts — tidak ada field yang dikarang.
 */

const GROUP_ORDER: { key: string; label: string; test: (s: EvidenceState) => boolean }[] = [
  { key: "live", label: "Berjalan", test: (s) => s === "live" },
  { key: "shipped", label: "Diserahkan & publik", test: (s) => s === "shipped" || s === "public" },
  { key: "record", label: "Tercatat & dokumen", test: (s) => s === "record" || s === "doc" },
  { key: "building", label: "Masih dikerjakan", test: (s) => s === "building" || s === "declared" },
];

/** Karakteristik yang dihitung dari data, bukan dikarang. */
function charOf(r: Record_) {
  return [
    { name: "status", type: "enum", value: STATUS[r.state].label, note: r.state },
    { name: "year", type: "number", value: r.year, note: "tahun pengerjaan" },
    { name: "kind", type: "string", value: r.kind, note: "jenis pekerjaan" },
    { name: "stack", type: "string", value: r.stack, note: "perkakas yang dipakai" },
    ...(r.where ? [{ name: "context", type: "string", value: r.where, note: "tempat kerja" }] : []),
    { name: "parts", type: "array", value: `${r.built.length} bagian`, note: "yang dibangun" },
    { name: "evidence", type: "record", value: r.evidence, note: "hasil tercatat" },
  ];
}

export default function Catalog() {
  const [picked, setPicked] = useState<string>(records[0]?.id ?? "");
  const [view, setView] = useState<"preview" | "blueprint">("preview");
  const [copied, setCopied] = useState(false);

  const active = useMemo(() => records.find((r) => r.id === picked) ?? records[0], [picked]);
  const chars = useMemo(() => (active ? charOf(active) : []), [active]);

  /* tombol angka memilih catatan, seperti daftar bernomor */
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

  /* animasi masuk panel saat catatan berganti */
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.dataset.motion = "on";
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-rv]"));
    let i = 0;
    for (const el of els) {
      el.dataset.in = "false";
      el.style.setProperty("--d", `${Math.min(i++ * 26, 260)}ms`);
    }
    const raf = requestAnimationFrame(() => {
      for (const el of els) el.dataset.in = "true";
    });
    return () => cancelAnimationFrame(raf);
  }, [picked]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${active.href}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (!active) return null;
  const st = STATUS[active.state];

  return (
    <div className="cat">
      {/* ---------------- SIDEBAR: daftar catatan ---------------- */}
      <aside className="side">
        <div className="side__in">
          {GROUP_ORDER.map((g) => {
            const items = records.filter((r) => g.test(r.state));
            if (!items.length) return null;
            return (
              <div className="side__grp" key={g.key}>
                <div className="side__h">
                  <span className="k">{g.label}</span>
                  <span className="side__count">{items.length}</span>
                </div>
                {items.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="nav-item"
                    data-on={r.id === picked}
                    aria-pressed={r.id === picked}
                    onClick={() => setPicked(r.id)}
                  >
                    <span className="nav-item__n">{r.no}</span>
                    <span className="nav-item__t">{r.title}</span>
                    <span className="nav-item__s">{r.year.slice(-2)}</span>
                  </button>
                ))}
              </div>
            );
          })}

          <div className="side__grp">
            <p className="k">Pintasan</p>
            <p className="side__count" style={{ marginTop: 6 }}>
              Tekan 1–{records.length} untuk pindah catatan
            </p>
          </div>
        </div>
      </aside>

      {/* ---------------- PANEL: halaman catatan ---------------- */}
      <div className="doc">
        <header className="intro">
          <div style={{ minWidth: 0 }}>
            <p className="k" data-rv>
              {active.kind} · {active.year}
            </p>
            <h1 className="intro__t" data-rv style={{ marginTop: 8 }}>
              {active.title}
            </h1>
            <p className="intro__s" data-rv>
              {active.summary}
            </p>
          </div>
          <div className="intro__acts" data-rv>
            <button type="button" className="btn" onClick={copyLink}>
              {copied ? "Tersalin" : "Salin tautan"}
            </button>
            <a className="btn btn--sig" href={active.href}>
              Buka studi kasus <i aria-hidden="true">→</i>
            </a>
          </div>
        </header>

        <div className="chips" data-rv>
          <span className="chip chip--sig">
            <span style={{ width: 6, height: 6, background: "currentColor", display: "block" }} />
            {st.label}
          </span>
          {active.external && <span className="chip chip--sig2">artefak publik</span>}
          {active.where && <span className="chip">{active.where}</span>}
          <span className="chip">{active.built.length} bagian</span>
        </div>

        {/* ---------- PRATINJAU ---------- */}
        <section className="demo" data-rv>
          <div className="demo__bar">
            <span className="demo__live">
              <span className="demo__pulse" aria-hidden="true" />
              {active.state === "live" ? "live" : active.state === "building" ? "wip" : "arsip"}
            </span>
            <span>{chars.length} properti</span>
            <span>{active.built.length} langkah</span>
            <span className="demo__right">
              <span className="demo__seg" role="group" aria-label="Tampilan">
                <button type="button" data-on={view === "preview"} onClick={() => setView("preview")}>
                  Pratinjau
                </button>
                <button type="button" data-on={view === "blueprint"} onClick={() => setView("blueprint")}>
                  Diagram
                </button>
              </span>
            </span>
          </div>

          <div className="demo__body">
            {view === "preview" ? (
              <>
                <img
                  className="demo__shot"
                  src={active.image}
                  alt={`Pratinjau ${active.title}`}
                  width={1200}
                  height={750}
                  fetchPriority="high"
                  decoding="async"
                />
                <span className="frame" aria-hidden="true" />
              </>
            ) : (
              <div className="blueprint">
                <div className="bp__row">
                  <span className="bp__k">Masalah</span>
                  <span className="bp__v">{active.problem}</span>
                </div>
                <div className="bp__flow">
                  {active.built.map((b, i) => (
                    <div className="bp__node" key={b}>
                      <span className="bp__n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="bp__t">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ---------- SPESIFIKASI ---------- */}
        <section className="spec" data-rv>
          <div className="spec__ti">
            <span className="k" style={{ color: "var(--ink-2)" }}>
              Spesifikasi
            </span>
            <span>{chars.length} properti · semua dari data catatan</span>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th scope="col">Properti</th>
                <th scope="col">Tipe</th>
                <th scope="col">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {chars.map((c) => (
                <tr key={c.name}>
                  <td className="tbl__f">{c.name}</td>
                  <td className="tbl__ty">{c.type}</td>
                  <td className="tbl__v">
                    {c.value}
                    <span style={{ color: "var(--ink-3)" }}> — {c.note}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ---------- CARA PAKAI ---------- */}
        <section style={{ marginTop: 26 }} data-rv>
          <p className="k">Cara pekerjaan ini dijalankan</p>
          <ol className="steps">
            {active.built.map((b, i) => (
              <li className="step" key={b}>
                <span className="step__n">{i + 1}</span>
                <div>
                  <p className="step__t">{b}</p>
                  {i === 0 && (
                    <p className="step__c">
                      <b>→</b> hasil: {active.evidence}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- INTEGRITAS ---------- */}
        <section className="keep" data-rv>
          <svg className="keep__i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <div>
            <p className="keep__t">Kekuatan bukti catatan ini</p>
            <p className="keep__d">{st.note}</p>
          </div>
        </section>

        <section className="keep" data-rv>
          <svg className="keep__i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v4h1" />
          </svg>
          <div>
            <p className="keep__t">Sumber</p>
            <p className="keep__d">
              CV dan repo publik <span className="sig2">github.com/Arkanuy</span>. Tidak ada metrik, tangkapan layar,
              atau kredensial yang dikarang.
            </p>
          </div>
        </section>

        <p style={{ marginTop: 22, display: "flex", gap: 8, flexWrap: "wrap" }} data-rv>
          <a className="btn btn--sig" href="/kontak">
            Bicarakan pekerjaan seperti ini <i aria-hidden="true">→</i>
          </a>
          <a className="btn" href={`mailto:arkanmustofabe@gmail.com`}>
            Kirim email
          </a>
        </p>
      </div>
    </div>
  );
}
