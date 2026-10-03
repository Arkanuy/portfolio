"use client";

import { useState } from "react";
import { SetType, DrawRule } from "@/components/edition/type";
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
      setCopied("copy failed");
    }
  }

  /** Form ini tidak menyimpan apa pun di server: ia menyusun email di perangkat
   *  pengunjung lalu menyerahkannya ke aplikasi mail. */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Project enquiry from ${form.name || "website"}`);
    const body = encodeURIComponent(`Name: ${form.name}\nContact: ${form.reach}\n\nHow the work runs today:\n${form.brief}\n`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="kicker">Contact</p>
          <SetType as="h1" className="page__h" text="Start with one message." accentLast />
          <p className="page__s dek">
            Describe how the work runs today — who does what, and which part hurts most. I usually reply within one
            business day, and the first reply says whether software is even the right answer.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <form className="form" onSubmit={submit}>
            <div className="f">
              <label htmlFor="name">Name</label>
              <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="f">
              <label htmlFor="reach">Email or WhatsApp</label>
              <input id="reach" required value={form.reach} onChange={(e) => setForm({ ...form, reach: e.target.value })} placeholder="so I can reply" />
            </div>
            <div className="f">
              <label htmlFor="brief">How the work runs today</label>
              <textarea
                id="brief"
                required
                rows={7}
                value={form.brief}
                onChange={(e) => setForm({ ...form, brief: e.target.value })}
                placeholder="Who does what, and which part is the most painful"
              />
            </div>
            <button className="btn" type="submit">
              Compose email <i aria-hidden="true">→</i>
            </button>
            <p className="meta">
              {sent
                ? "Your mail app is open with the message filled in. Press send."
                : "This form stores nothing on a server. It composes the email on your device."}
            </p>
          </form>

          <aside className="sticky">
            <div className="dl">
              {rows.map((r) => (
                <div className="dl__row" key={r.k}>
                  <span className="dl__k">{r.k}</span>
                  <a
                    className="dl__v"
                    href={r.href}
                    target={r.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  >
                    {r.v}
                  </a>
                  <button type="button" className="dl__b" onClick={() => copy(r.copy)}>
                    {copied === r.copy ? "copied" : "copy"}
                  </button>
                </div>
              ))}
              <div className="dl__row">
                <span className="dl__k">CV</span>
                <span className="dl__v">PDF document</span>
                <a className="dl__b" href={site.cv} download>
                  download
                </a>
              </div>
              <div className="dl__row">
                <span className="dl__k">Work</span>
                <a className="dl__v" href="/karya">
                  {records.length} records
                </a>
                <span />
              </div>
            </div>
            <div className="rail" style={{ marginTop: 22 }}>
              <div className="rail__g">
                <p className="rail__k">Not sure yet?</p>
                <p className="rail__v">
                  Asking a question first is fine. I am happy to talk through a workflow without you committing to any
                  work.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
