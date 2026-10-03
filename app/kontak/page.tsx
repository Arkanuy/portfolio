"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { records } from "@/lib/records";

const rows = [
  { k: "Email", v: site.email, href: `mailto:${site.email}`, copy: site.email },
  { k: "GitHub", v: `github.com/${site.github.user}`, href: site.github.url, copy: `https://github.com/${site.github.user}` },
  { k: "Instagram", v: site.handle, href: site.instagram, copy: site.handle },
];

export default function KontakPage() {
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
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow" data-as>
            Contact
          </p>
          <h1 className="pageHero__t">
            <span data-as data-dp="0.15" style={{ display: "block" }}>
              Start with
            </span>
            <span data-as data-dp="-0.12" style={{ display: "block" }}>
              <em>one message.</em>
            </span>
          </h1>
          <p className="pageHero__s" data-as style={{ ["--as-d" as string]: "280ms" }}>
            Describe how the work runs today — who does what, and which part hurts most. I usually reply within one
            business day, and the first reply says whether software is even the right answer.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap contact">
          <div data-as>
            <form className="form" onSubmit={submit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="field">
                <label htmlFor="reach">Email or WhatsApp</label>
                <input id="reach" required value={form.reach} onChange={(e) => setForm({ ...form, reach: e.target.value })} placeholder="so I can reply" />
              </div>
              <div className="field">
                <label htmlFor="brief">How the work runs today</label>
                <textarea
                  id="brief"
                  required
                  rows={6}
                  value={form.brief}
                  onChange={(e) => setForm({ ...form, brief: e.target.value })}
                  placeholder="Who does what, and which part is the most painful"
                />
              </div>
              <button className="btn btn--go" type="submit">
                Compose email →
              </button>
              <p className="form__hint">
                {sent
                  ? "Your mail app is open with the message filled in. Press send."
                  : "This form stores nothing on a server. It composes the email on your device."}
              </p>
            </form>
          </div>

          <aside data-as style={{ ["--as-d" as string]: "140ms" }} data-dp="0.09">
            <div className="portrait__frame" style={{ width: "100%" }}>
              <img
                className="portrait__img"
                src="/github/arkan-avatar-680.webp"
                alt={`Portrait of ${site.name}`}
                width={340}
                height={340}
                decoding="async"
              />
            </div>

            <div className="contactRows" style={{ marginTop: 20 }}>
              {rows.map((r) => (
                <div key={r.k} className="contactRow">
                  <span className="contactRow__k">{r.k}</span>
                  <a
                    className="contactRow__v"
                    href={r.href}
                    target={r.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  >
                    {r.v}
                  </a>
                  <button type="button" className="contactRow__b" onClick={() => copy(r.copy)}>
                    {copied === r.copy ? "copied" : "copy"}
                  </button>
                </div>
              ))}
              <div className="contactRow">
                <span className="contactRow__k">CV</span>
                <span className="contactRow__v">PDF document</span>
                <a className="contactRow__b" href={site.cv} download>
                  download
                </a>
              </div>
              <div className="contactRow">
                <span className="contactRow__k">Work</span>
                <a className="contactRow__v" href="/karya">
                  {records.length} records
                </a>
                <span />
              </div>
            </div>

            <p className="capnote">
              <b>Not sure yet?</b> Asking a question first is fine. I am happy to talk through a workflow without you
              committing to any work.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}