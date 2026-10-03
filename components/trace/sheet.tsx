import type { ReactNode } from "react";
import { WordFlow } from "./word-flow";

/**
 * SEC — baris ledger.
 *
 * Setiap seksi punya "kunci" (kode kolom) di kiri, judul di kanan. Label
 * kecil ini setara nomor baris di lembar catatan: berguna, bukan hiasan.
 */
export function Sheet({
  k,
  title,
  sub,
  children,
  id,
  tight = false,
  extra,
}: {
  k: string;
  title: string;
  sub?: ReactNode;
  children: ReactNode;
  id?: string;
  tight?: boolean;
  extra?: ReactNode;
}) {
  return (
    <section className={`sec${tight ? " sec--tight" : ""}`} id={id}>
      <div className="wrap">
        <header className="secHead" data-rv>
          <p className="secHead__k mono">{k}</p>
          <div>
            <h2 className="secHead__t">
              <WordFlow text={title} />
            </h2>
            {sub && <p className="secHead__s">{sub}</p>}
            {extra && <div style={{ marginTop: 14 }}>{extra}</div>}
          </div>
        </header>
        {children}
      </div>
    </section>
  );
}

/** Lembar tanda tangan di akhir tiap halaman. */
export function SignOff() {
  return (
    <section className="band">
      <div className="wrap band__in">
        <div>
          <p className="tag-line" style={{ marginBottom: 6 }}>
            Ready when you are
          </p>
          <h2 className="band__t">
            Tell <em>me</em> how the work runs today.
          </h2>
          <p className="band__s">
            If a new app turns out not to be the answer, I will say so. Not every problem needs software — and saying
            that early is cheaper than building the wrong thing.
          </p>
        </div>
        <div className="band__actions">
          <a className="btn btn--fill" href="mailto:arkanmustofabe@gmail.com">
            Send an email →
          </a>
          <a className="btn btn--ghost" href="/kontak">
            Contact page
          </a>
        </div>
      </div>
    </section>
  );
}