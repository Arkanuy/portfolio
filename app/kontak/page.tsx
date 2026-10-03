"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { records } from "@/lib/records";

const rows = [
  { k: "Email", v: site.email, href: `mailto:${site.email}`, copy: site.email },
  { k: "GitHub", v: `github.com/${site.github.user}`, href: site.github.url, copy: `https://github.com/${site.github.user}` },
  { k: "Instagram", v: site.handle, href: site.instagram, copy: site.handle },
];

export default function ContactPage() {
  const [copied, setCopied] = useState("");
  const [form, setForm] = useState({ name: "", reach: "", brief: "" });
  const [sent, setSent] = useState(false);

  async function copy(v: string) {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(v);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("gagal menyalin");
    }
  }

  /** Form ini tidak menyimpan apa pun di server: ia menyusun email di perangkat
   *  pengunjung lalu menyerahkannya ke aplikasi mail. */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Pertanyaan proyek dari ${form.name || "website"}`);
    const body = encodeURIComponent(`Nama: ${form.name}\nKontak: ${form.reach}\n\nBagaimana kerjanya berjalan hari ini:\n${form.brief}\n`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="stamp stamp--accent">Kontak</p>
          <h1 className="page__h">Mulai dari satu pesan.</h1>
          <p className="page__s">
            Ceritakan bagaimana kerjanya berjalan hari ini — siapa mengerjakan apa, dan bagian mana yang paling
            menyakitkan. Biasanya saya balas dalam satu hari kerja, dan balasan pertama itu menyebut apakah perangkat
            lunak memang jawabannya.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap split">
          <form className="form" onSubmit={submit}>
            <div className="f">
              <label htmlFor="name">Nama</label>
              <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama kamu" />
            </div>
            <div className="f">
              <label htmlFor="reach">Email atau WhatsApp</label>
              <input id="reach" required value={form.reach} onChange={(e) => setForm({ ...form, reach: e.target.value })} placeholder="supaya bisa saya balas" />
            </div>
            <div className="f">
              <label htmlFor="brief">Bagaimana kerjanya berjalan hari ini</label>
              <textarea id="brief" required rows={7} value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} placeholder="Siapa mengerjakan apa, dan bagian mana yang paling menyakitkan" />
            </div>
            <button className="btn" type="submit">
              Susun email <i aria-hidden="true">→</i>
            </button>
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
              {sent
                ? "Aplikasi email kamu sudah terbuka dengan isinya. Tinggal kirim."
                : "Form ini tidak menyimpan apa pun di server. Emailnya disusun di perangkatmu."}
            </p>
          </form>

          <aside className="sticky">
            <div className="dl">
              {rows.map((r) => (
                <div className="dl__r" key={r.k}>
                  <span className="dl__k">{r.k}</span>
                  <a className="dl__v" href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                    {r.v}
                  </a>
                  <button type="button" className="dl__b" onClick={() => copy(r.copy)}>
                    {copied === r.copy ? "tersalin" : "salin"}
                  </button>
                </div>
              ))}
              <div className="dl__r">
                <span className="dl__k">CV</span>
                <span className="dl__v">Dokumen PDF</span>
                <a className="dl__b" href={site.cv} download>
                  unduh
                </a>
              </div>
              <div className="dl__r">
                <span className="dl__k">Kartu</span>
                <a className="dl__v" href="/karya">
                  {records.length} catatan
                </a>
                <span />
              </div>
            </div>
            <p style={{ marginTop: 20, fontSize: 14, color: "var(--ink-2)" }}>
              Belum yakin? Boleh tanya dulu. Saya senang membahas alur kerja tanpa kamu harus memutuskan apa pun.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
