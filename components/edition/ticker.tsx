import { records } from "@/lib/records";

/**
 * TICKER — band "terbaru" di bawah masthead, seperti ticker berita.
 * Dua baris, arah BERLAWANAN, kecepatan berbeda (42s vs 74s). Satu baris
 * berjalan sendiri terbaca sebagai band datar; dua baris berlawanan terbaca
 * sebagai sistem yang memantau sesuatu.
 *
 * Berhenti saat disorot supaya bisa dibaca. Data asli dari records — tidak
 * ada berita karangan.
 */
export default function Ticker() {
  const items = records.map((r) => ({
    kicker: r.state === "live" ? "LIVE" : r.state === "building" ? "IN PROGRESS" : "RECORD",
    text: `${r.title} — ${r.kind.split("·")[0].trim()}`,
    href: r.href,
    year: r.year,
  }));
  const seq = [...items, ...items];

  return (
    <div className="tick" aria-label="Latest records">
      <div className="tick__row">
        {seq.map((it, i) => (
          <a className="tick__i" key={`a${i}`} href={it.href} tabIndex={-1} aria-hidden="true">
            <b>{it.kicker}</b>
            {it.text}
            <span style={{ opacity: 0.5 }}>{it.year}</span>
          </a>
        ))}
      </div>
      <div className="tick__row tick__row--rev">
        {seq.map((it, i) => (
          <a className="tick__i" key={`b${i}`} href={it.href} tabIndex={-1} aria-hidden="true">
            <b>{it.kicker}</b>
            {it.text}
            <span style={{ opacity: 0.5 }}>{it.year}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
