"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { records } from "@/lib/trace";

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

  /** Form ini tidak mengirim apa pun ke server. Ia menyusun email di perangkat
   *  pengunjung lalu menyerahkannya ke aplikasi mail — tidak ada yang disimpan. */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Project enquiry from ${form.name || "website"}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nContact: ${form.reach}\n\nHow the work runs today:\n${form.brief}\n`,
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <div className="pageHero__meta mono">
            <span>Sheet 05 / 05 · Contact</span>
            <span>Reply within one business day</span>
          </div>
          <h1 className="pageHero__t">
            Start with <em>one message</em> describing how the work runs today.
          </h1>
          <p className="pageHero__s">
            No discovery-call funnel, no form that disappears into a database. You describe the current flow, I read it,
            and the first reply says whether software is even the right answer.
          </p>
        </div>
      </section>

      <section className="wrap contactGrid">
        <div data-rv>
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="field">
              <label htmlFor="reach">Email or WhatsApp</label>
              <input
                id="reach"
                required
                value={form.reach}
                onChange={(e) => setForm({ ...form, reach: e.target.value })}
                placeholder="so I can reply"
              />
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
            <button className="btn btn--fill form__go" type="submit">
              Compose email →
            </button>
            <p className="form__hint">
              {sent
                ? "Your mail app is open with the message filled in. Press send."
                : "This form stores nothing on a server. It composes the email on your device."}
            </p>
          </form>
        </div>

        <aside>
          <figure className="aboutPhoto">
                        <img
              src="/github/arkan-avatar-680.webp"
              alt={`Portrait of ${site.name}`}
              width={340}
              height={340}
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>
              <span>{site.name}</span>
              <span>{site.place}</span>
            </figcaption>
          </figure>

          <div className="contactRows" style={{ marginTop: 18 }}>
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
              <span className="contactRow__k">Records</span>
              <a className="contactRow__v" href="/karya">
                {records.length} work records with evidence status
              </a>
              <span />
            </div>
          </div>

          <div className="contactNote">
            <p className="contactNote__k">Not sure yet?</p>
            <p className="contactNote__d">
              Asking a question first is fine. I am happy to talk through a workflow without you committing to any work.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}