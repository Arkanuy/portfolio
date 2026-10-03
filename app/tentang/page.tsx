import type { Metadata } from "next";
import { site, stack, numbers, school, offHours } from "@/lib/site";
import { records, traceStats } from "@/lib/records";

export const metadata: Metadata = {
  title: "Metode",
  description: "Latar belakang, cara kerja, dan perkakas Arkan Mustofa.",
};

export default function AboutPage() {
  return (
    <article className="page">
      <p className="k">Metode</p>
      <h1 className="h1" style={{ marginTop: 10 }}>
        Proses dulu, kode kemudian.
      </h1>
      <p className="lede">{site.bio}</p>
      <p className="p">{site.bioLong}</p>

      <div className="two" style={{ marginTop: 30 }}>
        <div>
          <h2 className="h2" style={{ marginTop: 0 }}>
            Fakta
          </h2>
          <section className="spec" style={{ marginTop: 12 }}>
            <table className="tbl">
              <tbody>
                <tr>
                  <td className="tbl__f">lahir</td>
                  <td className="tbl__ty">string</td>
                  <td className="tbl__v">{site.born}</td>
                </tr>
                <tr>
                  <td className="tbl__f">berbasis</td>
                  <td className="tbl__ty">string</td>
                  <td className="tbl__v">{site.place}</td>
                </tr>
                <tr>
                  <td className="tbl__f">status</td>
                  <td className="tbl__ty">enum</td>
                  <td className="tbl__v">{site.status}</td>
                </tr>
                {school.map((s: { period: string; title: string; org?: string }) => (
                  <tr key={s.title}>
                    <td className="tbl__f">{s.period}</td>
                    <td className="tbl__ty">education</td>
                    <td className="tbl__v">
                      {s.title}
                      {s.org ? ` — ${s.org}` : ""}
                    </td>
                  </tr>
                ))}
                {offHours.map((h: { name: string; note: string }) => (
                  <tr key={h.name}>
                    <td className="tbl__f">{h.name}</td>
                    <td className="tbl__ty">outside</td>
                    <td className="tbl__v">{h.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <h2 className="h2">Perkakas</h2>
          <section className="spec" style={{ marginTop: 12 }}>
            <table className="tbl">
              <tbody>
                {stack.map((g) => (
                  <tr key={g.group}>
                    <td className="tbl__f">{g.group}</td>
                    <td className="tbl__ty">tools[{g.items.length}]</td>
                    <td className="tbl__v">{g.items.map((it) => `${it.name} — ${it.evidence}`).join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <p className="p" style={{ fontSize: 13 }}>
            <span className="sig">catatan:</span> {traceStats.capabilities} kemampuan terdaftar; {traceStats.gaps} belum
            punya catatan yang membuktikannya.
          </p>

          <h2 className="h2">Angka</h2>
          <section className="spec" style={{ marginTop: 12 }}>
            <table className="tbl">
              <tbody>
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
          </section>
        </div>

        <aside className="sticky">
          <figure className="fig">
            <img src="/github/arkan-avatar-2x.png" alt={`Foto ${site.name}`} width={340} height={340} fetchPriority="high" decoding="async" />
          </figure>
          <p className="figcap">
            {site.name} · {site.handle}
          </p>
          <div className="rail" style={{ marginTop: 14 }}>
            <div className="rail__g">
              <p className="k">Catatan</p>
              <p className="rail__v">{records.length} dengan bukti</p>
            </div>
            <div className="rail__g">
              <p className="k">CV</p>
              <p className="rail__v">
                <a href={site.cv} download>
                  Unduh PDF
                </a>
              </p>
            </div>
            <div className="rail__g">
              <p className="k">Kontak</p>
              <p className="rail__v">
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
