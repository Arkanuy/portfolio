import Catalog from "@/components/browse/catalog";
import { site, stack, numbers } from "@/lib/site";
import { records, traceStats } from "@/lib/records";

export default function Home() {
  return (
    <>
      {/* Strip ringkas di atas katalog — bukan hero, cuma header daftar. */}
      <div className="wrap" style={{ paddingTop: "clamp(18px,3vw,34px)" }}>
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "baseline",
            paddingBottom: 14,
            borderBottom: "1px solid var(--line)",
          }}
        >
          <p className="k">
            Katalog <span className="sig">/</span> {records.length} catatan kerja
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-2)", maxWidth: "62ch" }}>
            {site.name} — {site.role}. Tiap catatan punya halaman seperti halaman komponen: spesifikasi, pratinjau,
            diagram, dan cara pakainya.
          </p>
          <p className="k" style={{ marginLeft: "auto" }}>
            {traceStats.live} berjalan · {traceStats.gaps} celah dilaporkan
          </p>
        </div>
      </div>

      <Catalog />

      {/* Ringkasan bawah: perkakas + angka, dalam bahasa lembar spesifikasi. */}
      <section className="wrap" style={{ paddingBottom: "clamp(30px,5vw,64px)" }}>
        <div className="spec" style={{ marginTop: 0 }}>
          <div className="spec__ti">
            <span className="k" style={{ color: "var(--ink-2)" }}>
              Indeks perkakas
            </span>
            <span>{stack.reduce((n, g) => n + g.items.length, 0)} terdaftar</span>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th scope="col">Kelompok</th>
                <th scope="col">Tipe</th>
                <th scope="col">Dipakai untuk</th>
              </tr>
            </thead>
            <tbody>
              {stack.map((g) => (
                <tr key={g.group}>
                  <td className="tbl__f">{g.group}</td>
                  <td className="tbl__ty">tools[{g.items.length}]</td>
                  <td className="tbl__v">{g.items.map((it) => `${it.name} — ${it.evidence}`).join(" · ")}</td>
                </tr>
              ))}
              {numbers.map((n) => (
                <tr key={n.label}>
                  <td className="tbl__f">{n.value}</td>
                  <td className="tbl__ty">counter</td>
                  <td className="tbl__v">
                    {n.label}
                    {n.note ? ` — ${n.note}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {traceStats.gaps > 0 && (
          <p style={{ marginTop: 14, fontSize: 13, color: "var(--ink-2)" }}>
            <span className="sig">catatan:</span> {traceStats.gaps} perkakas disebut tanpa catatan kerja yang
            membuktikannya. Itu dilaporkan di sini, bukan disembunyikan.
          </p>
        )}
      </section>
    </>
  );
}
