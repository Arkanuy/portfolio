import type { Metadata } from "next";
import { site, stack, numbers, school, offHours } from "@/lib/site";
import { records, traceStats } from "@/lib/records";

export const metadata: Metadata = {
  title: "Metode",
  description: "Latar belakang, cara kerja, dan perkakas Arkan Mustofa.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="stamp stamp--accent">Metode</p>
          <h1 className="page__h">Proses dulu, kode kemudian.</h1>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap split">
          <div className="art">
            <p style={{ fontSize: 18 }}>{site.bio}</p>
            <p>{site.bioLong}</p>

            <header className="head" style={{ marginTop: 34 }}>
              <span className="head__r" />
              <h2 className="sec__h">Cara saya bekerja</h2>
            </header>
            <p>
              Urutannya adalah metodenya. Kalau langkah kedua tidak menghasilkan dokumen, daftar fiturnya ditemukan
              sambil menulis kode — dan itu yang membuat orang meninggalkan perangkat lunaknya.
            </p>

            <header className="head" style={{ marginTop: 34 }}>
              <span className="head__r" />
              <h2 className="sec__h">Fakta</h2>
            </header>
            <ul>
              <li>
                <b>Lahir</b> — {site.born}
              </li>
              <li>
                <b>Berbasis di</b> — {site.place}
              </li>
              <li>
                <b>Status</b> — {site.status}
              </li>
              {school.map((e: { period: string; title: string; org?: string }) => (
                <li key={e.title}>
                  <b>{e.period}</b> — {e.title}
                  {e.org ? `, ${e.org}` : ""}
                </li>
              ))}
              {numbers.map((n) => (
                <li key={n.label}>
                  <b>{n.value}</b> — {n.label}
                  {n.note ? ` (${n.note})` : ""}
                </li>
              ))}
            </ul>

            <header className="head" style={{ marginTop: 34 }}>
              <span className="head__r" />
              <h2 className="sec__h">Perkakas</h2>
            </header>
            <ul>
              {stack.map((g) => (
                <li key={g.group}>
                  <b>{g.group}</b> — {g.items.map((it) => `${it.name} (${it.evidence})`).join("; ")}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 14, fontSize: 14, color: "var(--ink-3)" }}>
              {traceStats.capabilities} kemampuan terdaftar; {traceStats.gaps} belum punya kartu yang membuktikannya.
            </p>

            <header className="head" style={{ marginTop: 34 }}>
              <span className="head__r" />
              <h2 className="sec__h">Di luar jam kelas</h2>
            </header>
            <ul>
              {offHours.map((h: { name: string; note: string }) => (
                <li key={h.name}>
                  <b>{h.name}</b> — {h.note}
                </li>
              ))}
            </ul>
          </div>

          <aside className="sticky">
            <figure className="fig">
              <img src="/github/arkan-avatar-2x.png" alt={`Foto ${site.name}`} width={340} height={340} fetchPriority="high" decoding="async" />
            </figure>
            <p className="figcap mono">
              {site.name} · {site.handle}
            </p>
            <div className="rail" style={{ marginTop: 22 }}>
              <div className="rail__g">
                <p className="rail__k">Kartu</p>
                <p className="rail__v">{records.length} dengan bukti</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Kelompok perkakas</p>
                <p className="rail__v">
                  {stack.length} · {stack.reduce((n, g) => n + g.items.length, 0)} perkakas
                </p>
              </div>
              <div className="rail__g">
                <p className="rail__k">CV</p>
                <p className="rail__v">
                  <a href={site.cv} download>
                    Unduh PDF
                  </a>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
