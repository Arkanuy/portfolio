"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { records } from "@/lib/records";

const rows = [
  { k: "email", v: site.email, href: `mailto:${site.email}`, copy: site.email },
  { k: "github", v: `github.com/${site.github.user}`, href: site.github.url, copy: `https://github.com/${site.github.user}` },
  { k: "instagram", v: site.handle, href: site.instagram, copy: site.handle },
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
      setCopied("gagal");
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
    <article className="page">
      <p className="k">Kontak</p>
      <h1 className="h1" style={{ marginTop: 10 }}>
        Mulai dari satu pesan.
      </h1>
      <p className="lede">
        Ceritakan bagaimana kerjanya berjalan hari ini — siapa mengerjakan apa, dan bagian mana yang paling
        menyakitkan. Biasanya saya balas dalam satu hari kerja, dan balasan pertama itu menyebut apakah perangkat lunak
        memang jawabannya.
      </p>

      <div className="two" style={{ marginTop: 28 }}>
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
          <button className="btn btn--sig" type="submit">
            Susun email <span aria-hidden="true">→</span>
          </button>
          <p className="k" style={{ textTransform: "none", letterSpacing: "0.02em" }}>
            {sent
              ? "Aplikasi email kamu sudah terbuka dengan isinya. Tinggal kirim."
              : "Form ini tidak menyimpan apa pun di server. Emailnya disusun di perangkatmu."}
          </p>
        </form>

        <aside className="sticky">
          <div className="spec" style={{ marginTop: 0 }}>
            <div className="spec__ti">
              <span className="k" style={{ color: "var(--ink-2)" }}>
                Kontak langsung
              </span>
            </div>
            <table className="tbl">
              <tbody>
                {rows.map((r) => (
                  <tr key={r.k}>
                    <td className="tbl__f">{r.k}</td>
                    <td className="tbl__v">
                      <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                        {r.v}
                      </a>
                    </td>
                    <td style={{ width: 60 }}>
                      <button type="button" className="btn" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => copy(r.copy)}>
                        {copied === r.copy ? "tersalin" : "salin"}
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="tbl__f">cv.pdf</td>
                  <td className="tbl__v">dokumen</td>
                  <td>
                    <a className="btn" style={{ padding: "4px 8px", fontSize: 11 }} href={site.cv} download>
                      unduh
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="tbl__f">katalog</td>
                  <td className="tbl__v">
                    <a href="/karya">{records.length} catatan</a>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <p className="p" style={{ marginTop: 14, fontSize: 13 }}>
            Belum yakin? Boleh tanya dulu. Saya senang membahas alur kerja tanpa kamu harus memutuskan apa pun.
          </p>
        </aside>
      </div>
    </article>
  );
}
