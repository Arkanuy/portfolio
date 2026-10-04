import type { Metadata } from "next";
import CaseCard from "@/components/ui/case-card";
import KageScene from "./KageScene";
import { cases, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kage — the night chapter",
  description:
    "A night chapter of the portfolio: a five-part WebGL scene, framed by the work it belongs to.",
};

/**
 * /kage — BAB MALAM PORTFOLIO, bukan halaman terpisah.
 *
 * Alur bacaannya sengaja dibolak-balik:
 *
 *   01  halaman ini dibuka dalam gelap — header dan footer situs ikut malam
 *       karena token warnanya di-remap (.kageNight), bukan karena komponennya
 *       disalin
 *   02  SCENE — dokumen Kage yang diautor ThreeUI, lima bab, dipakai apa adanya
 *   03  halaman ini membaca kembali seperti katalog kerja yang gelap; tujuh
 *       kartu karya yang SAMA dengan /karya, tanpa digandakan
 *   04  malam berakhir, token dikembalikan, halaman berikutnya kembali terang
 *
 * Isi scene-nya tidak diubah sama sekali. Yang disesuaikan hanya tipografi dan
 * warna aksennya (lihat KageScene.tsx), lewat props publik komponennya.
 */
export default function KagePage() {
  return (
    <>
      {/* ---------- 01 · pembuka bab ---------- */}
      <section className="wrap knight">
        <p className="eyebrow">Chapter · night</p>
        <h1 className="knight__h">
          A five-part night walk, <em>and the work it belongs to</em>.
        </h1>
        <p className="knight__lead">
          Kage is a scene I brought into this portfolio from ThreeUI — a Kyoto mountain temple in five parts, rendered
          live in WebGL. It sits here rather than on its own island, so the portfolio reads as one place: it gets dark
          for this chapter, then light again.
        </p>
        <div className="knight__meta">
          <span>{site.name}</span>
          <span>{site.place}</span>
          <span>{site.status}</span>
        </div>
      </section>

      {/* ---------- 02 · penanda bab + scene ---------- */}
      <section className="wrap knight__chap">
        <h2 className="knight__h2">
          The scene · <em>five parts, one gate left open</em>
        </h2>
        <p className="knight__note">
          Scroll through it below. Everything inside the frame is the original authored document — the five chapters,
          the three.js runtime, and all fourteen WebGL assets are untouched. Only the typography and the accent colour
          are fitted to this site.
        </p>
      </section>

      <KageScene />

      {/* ---------- 03 · portfolio terbaca kembali, dalam gelap ---------- */}
      <section className="wrap knight">
        <p className="eyebrow">Chapter · 01 of 07</p>
        <h2 className="knight__h2">
          The same seven, <em>read in the dark</em>.
        </h2>
        <p className="knight__note">
          The night chapter does not get its own version of the work. These are the same seven case studies from{" "}
          <a href="/karya">Work</a>, presented with the same cards — the page has simply gone dark.
        </p>
        <div className="ccGrid" style={{ marginTop: "clamp(28px, 4vh, 44px)" }}>
          {cases.map((c) => (
            <CaseCard key={c.slug} item={c} />
          ))}
        </div>
      </section>

      {/* ---------- 04 · malam berakhir ---------- */}
      <section className="wrap knight__dawn">
        <p className="eyebrow">Chapter · end</p>
        <h2 className="knight__h2">
          Back to the light — <em>which is where the portfolio lives</em>.
        </h2>
        <div className="hero__actions" style={{ marginTop: 24 }}>
          <a className="btn btn--dark" href="/karya">
            All work <span aria-hidden="true">→</span>
          </a>
          <a className="btn btn--ghost" href="/kontak">
            Start a project
          </a>
        </div>
        <p className="knight__credit">
          Scene credits: <b>Kage — Hidden Realms of Kyoto</b>, authored by ThreeUI. Favicon and fonts via{" "}
          <b>DesignCode</b>. The document and its assets are served byte-for-byte as published; only typography and
          accent colour were fitted to this portfolio.
        </p>
      </section>
    </>
  );
}
