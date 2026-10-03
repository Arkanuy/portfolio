import { Fragment, type ReactNode } from "react";

/**
 * KOMPONEN GERAK — kosakata "typesetting".
 * Semuanya server component: markup-nya statis, geraknya dijalankan CSS di
 * bawah `html[data-anim="on"]` dan dijadwalkan oleh `Motion`. Jadi tidak ada
 * JS per elemen, dan kalau JS mati kontennya tetap terbaca penuh.
 */

/** Judul yang TERPASANG baris demi baris (per kata, bukan per huruf:
 *  memecah per huruf membuat browser memotong baris di tengah kata dan
 *  spasi ikut hilang — bug nyata dari versi sebelumnya). */
export function SetType({
  text,
  as: Tag = "h2",
  className = "",
  accentLast = false,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  accentLast?: boolean;
}) {
  const words = text.split(" ");
  return (
    <Tag className={`serif ${className}`} data-set data-on-enter>
      {words.map((w, i) => (
        /* SPASI ADA DI LUAR <span>, sebagai text node milik elemen induk.
         * Kalau spasi ditaruh DI DALAM elemen ber-clip, browser membuangnya
         * saat menghitung dan kata-katanya menempel — terukur sebagai
         * "Softwarethatgetsused,notjustshipped." saat JS mati. Ini struktur
         * yang sudah terbukti aman; jangan disederhanakan jadi satu span. */
        <Fragment key={`${w}-${i}`}>
          <span style={accentLast && i === words.length - 1 ? { color: "var(--accent)" } : undefined}>{w}</span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Judul dari node (untuk teks yang sudah berisi markup). */
export function SetNode({ children, className = "", onEnter = true }: { children: ReactNode; className?: string; onEnter?: boolean }) {
  return (
    <div className={className} data-wipe {...(onEnter ? { "data-on-enter": "" } : {})}>
      {children}
    </div>
  );
}

/** Ruang kata: menjaga SPASI sebagai teks di luar elemen inline-block.
 *  Kalau spasi ikut masuk ke dalam elemen ber-clip, browser membuangnya dan
 *  kata-katanya menempel — bug nyata pada versi tanpa JS. */
export function gap(i: number, total: number) {
  return i < total - 1 ? " " : "";
}

/** Aturan yang TERTARIK dari kiri. Satu garis, satu kali. */
export function DrawRule({ className = "", onEnter = true, tone = "ink" }: { className?: string; onEnter?: boolean; tone?: "ink" | "accent" | "rule" }) {
  const bg = tone === "accent" ? "var(--accent)" : tone === "rule" ? "var(--rule-2)" : "var(--ink)";
  return (
    <span className={className} data-draw {...(onEnter ? { "data-on-enter": "" } : {})} aria-hidden="true" style={{ display: "block" }}>
      <i style={{ background: bg, height: tone === "accent" ? 2 : 1 }} />
    </span>
  );
}

/** Elemen yang naik masuk saat bagiannya terlihat. */
export function Rise({ children, className = "", onEnter = true }: { children: ReactNode; className?: string; onEnter?: boolean }) {
  return (
    <div className={className} data-rise {...(onEnter ? { "data-on-enter": "" } : {})}>
      {children}
    </div>
  );
}

/** Angka yang menghitung naik, mendarat tepat di nilai aslinya. */
export function Count({ value, suffix = "", pad = 0, className = "" }: { value: number; suffix?: string; pad?: number; className?: string }) {
  return (
    <span
      className={className}
      data-count={value}
      data-suffix={suffix}
      data-pad={pad || undefined}
      data-on-enter
    >
      {pad ? String(value).padStart(pad, "0") : String(value)}
      {suffix}
    </span>
  );
}
