import type { ReactNode } from "react";
import { WordFlow } from "./word-flow";

/**
 * SEC — satu bagian medan.
 *
 * Judulnya masuk kata per kata; isinya bagian yang menyusun diri
 * (`data-as` + jeda berjenjang lewat `--as-d`).
 */
export function Sec({
  eyebrow,
  title,
  sub,
  children,
  id,
}: {
  eyebrow: string;
  title: string;
  sub?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="sec" id={id}>
      <div className="wrap">
        <header className="secHead">
          <p className="eyebrow" data-as>
            {eyebrow}
          </p>
          <h2 className="secHead__t">
            <WordFlow text={title} />
          </h2>
          {sub && (
            <p className="secHead__s" data-as style={{ ["--as-d" as string]: "160ms" }}>
              {sub}
            </p>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}

/** Ajakan penutup. */
export function CTA() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="cta" data-as data-dp="-0.1" data-drift data-drift-x="6" data-drift-y="10">
          <span className="field__orb field__orb--b" style={{ opacity: 0.4 }} aria-hidden="true" />
          <p className="eyebrow" data-as>
            Ready when you are
          </p>
          <h2 className="cta__t" data-as style={{ ["--as-d" as string]: "90ms" }}>
            Tell <em>me</em> how the work runs today.
          </h2>
          <p className="cta__s" data-as style={{ ["--as-d" as string]: "180ms" }}>
            If a new app turns out not to be the answer, I will say so. Not every problem needs software — and saying
            that early is cheaper than building the wrong thing.
          </p>
          <div className="cta__actions" data-as style={{ ["--as-d" as string]: "260ms" }}>
            <a className="btn btn--go" href="mailto:arkanmustofabe@gmail.com">
              Send an email →
            </a>
            <a className="btn btn--ghost" href="/kontak">
              Contact page
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
