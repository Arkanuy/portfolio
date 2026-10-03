"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { site } from "@/lib/site";

const rows = [
  { k: "Email", v: site.email, href: `mailto:${site.email}`, copy: site.email },
  { k: "GitHub", v: `github.com/${site.github.user}`, href: site.github.url, copy: `https://github.com/${site.github.user}` },
  { k: "Instagram", v: site.handle, href: site.instagram, copy: site.handle },
];

export default function KontakPage() {
  const [copied, setCopied] = useState("");
  const [form, setForm] = useState({ nama: "", kontak: "", pesan: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(""), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function copy(v: string) {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(v);
    } catch {
      setCopied("copy failed");
    }
  }

  /** This form does not post to a server. It builds a ready-to-send email and
   *  hands it to the visitor's mail client, so nothing gets lost or stored. */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Project enquiry from ${form.nama || "website"}`);
    const body = encodeURIComponent(
      `Name: ${form.nama}\nContact: ${form.kontak}\n\nHow the work runs today:\n${form.pesan}\n`,
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow">Contact</p>
          <h1 className="pageHero__t">
            Start with <em>one message</em>.
          </h1>
          <p className="pageHero__s">
            Describe how the work runs today. I usually reply within one business day.
          </p>
        </div>
      </section>

      <section className="wrap contactGrid">
        <div className="contactFormWrap" data-fx>
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="nama">Name</label>
              <input
                id="nama"
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="field">
              <label htmlFor="kontak">Email or WhatsApp</label>
              <input
                id="kontak"
                required
                value={form.kontak}
                onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                placeholder="so I can reply"
              />
            </div>
            <div className="field">
              <label htmlFor="pesan">How the work runs today</label>
              <textarea
                id="pesan"
                required
                rows={6}
                value={form.pesan}
                onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                placeholder="Who does what, and which part is the most painful"
              />
            </div>
            <button className="btn btn--dark form__go" type="submit">
              Compose email
              <span aria-hidden="true">→</span>
            </button>
            <p className="form__hint">
              {sent
                ? "Your mail app is open with the message filled in. Just press send."
                : "This form stores nothing on a server. It composes the email on your device."}
            </p>
          </form>
        </div>

        <aside className="contactSide">
          <figure className="contactPhoto">
            <Image src="/github/arkan-avatar-2x.png" alt={`Portrait of ${site.name}`} width={680} height={680} sizes="(max-width: 900px) 92vw, 420px" />
            <figcaption>
              <strong>{site.name}</strong>
              <span>{site.place}</span>
            </figcaption>
          </figure>

          <div className="contactRows">
            {rows.map((r) => (
              <div key={r.k} className="contactRow">
                <span className="contactRow__k">{r.k}</span>
                <a className="contactRow__v" href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {r.v}
                </a>
                <button type="button" className="contactRow__b" onClick={() => copy(r.copy)}>
                  {copied === r.copy ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
            <div className="contactRow">
              <span className="contactRow__k">CV</span>
              <span className="contactRow__v">PDF document</span>
              <a className="contactRow__b" href={site.cv} download>
                Download
              </a>
            </div>
          </div>

          <div className="contactNote">
            <p className="contactNote__k">Not sure yet?</p>
            <p className="contactNote__d">
              Asking a question first is fine. I am happy to talk about a workflow without you committing to any
              work.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
