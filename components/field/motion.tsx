import { Fragment, type ReactNode } from "react";

/** Judul dipecah per KATA. Spasi duduk di luar span (pelajaran lama: kalau
 *  spasi masuk ke elemen ber-clip, browser membuangnya dan kata menempel). */
export function Split({
  text,
  as: Tag = "h2",
  className = "",
  accentLast = false,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  accentLast?: boolean;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} data-split data-reveal>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="w">
            <span style={accentLast && i === words.length - 1 ? { color: "var(--accent)" } : undefined}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Blok yang naik masuk saat bagiannya terlihat. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div className={className} data-reveal style={delay ? { ["--d" as string]: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

/**
 * BAGIAN YANG DIPATOK.
 * Bagian ini `position: sticky` selama satu blok tinggi; isinya berganti
 * mengikuti `--p` (progres gulir 0..1) yang ditulis engine. Ini mekanisme
 * `stickyPanels__leftInner` (Blue Marine) dan `sticky-item` (Lando).
 */
export function Scrub({ children, className = "", height = "260vh" }: { children: ReactNode; className?: string; height?: string }) {
  return (
    <div className={`scrub ${className}`} data-scrub style={{ height }}>
      <div className="scrub__pin">{children}</div>
    </div>
  );
}
