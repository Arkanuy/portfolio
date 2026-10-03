import type { ReactNode } from "react";
import Spotlight from "@/components/ui/anim-spotlight";
import { ShimmerButton } from "@/components/ui/anim";
import WordFlow from "@/components/ui/word-flow";

export function Section({
  eyebrow,
  title,
  titleText,
  sub,
  children,
  id,
  center = false,
  tint = false,
}: {
  eyebrow?: string;
  title?: ReactNode;
  /** Kalau diisi, judul masuk kata per kata (~ di depan kata = beraksen). */
  titleText?: string;
  sub?: ReactNode;
  children: ReactNode;
  id?: string;
  center?: boolean;
  tint?: boolean;
}) {
  return (
    <section className={`sec${tint ? " sec--tint" : ""}`} id={id}>
      <div className="wrap">
        {(eyebrow || title || titleText) && (
          <header className={`secHead${center ? " secHead--c" : ""}`} data-fx>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {titleText ? (
              <h2 className="secHead__t">
                <WordFlow text={titleText} />
              </h2>
            ) : (
              title && <h2 className="secHead__t">{title}</h2>
            )}
            {sub && <p className="secHead__s">{sub}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export function CTABand() {
  return (
    <section className="band">
      <Spotlight color="soft" />
      <div className="band__grid" data-bg="0.10" aria-hidden="true" />
      <div className="wrap band__in" data-inner="0.04">
        <div>
          <p className="eyebrow eyebrow--on">Ready when you are</p>
          <h2 className="band__t">
            <WordFlow text="Tell ~me how the work runs ~today." />
          </h2>
          <p className="band__s">
            If it turns out a new app is not the answer, I will say so. Not every problem needs software.
          </p>
        </div>
        <div className="band__actions">
          <a className="btn btn--light" href="mailto:arkanmustofabe@gmail.com">
            Send an email
            <span aria-hidden="true">→</span>
          </a>
          <a className="btn btn--outlineLight" href="/kontak">
            Contact page
          </a>
        </div>
      </div>
    </section>
  );
}

export { ShimmerButton };
