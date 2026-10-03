import type { Metadata } from "next";
import Deck from "@/components/punch/deck";
import { records, traceStats } from "@/lib/records";

export const metadata: Metadata = {
  title: "Kartu",
  description: "Tujuh catatan kerja sebagai kartu punch 80 kolom — lubangnya adalah datanya.",
};

export default function CardsPage() {
  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="stamp stamp--accent">Kartu · {records.length} dalam tumpukan</p>
          <h1 className="page__h">Tiap kartu, dan seberapa jauh pekerjaannya berjalan.</h1>
          <p className="page__s">
            Lubang di setiap kartu bukan hiasan: kolom 1 menyimpan zona status, kolom 2–5 tahun, kolom 6–7 berapa
            bagian yang dibangun, kolom 8–13 huruf judul, dan kolom 14–79 pola periksa. Angkat satu kartu — area cetak
            di bawah mesin menjelaskan tiap lubangnya.
          </p>
        </div>
      </section>
      <Deck />
      <section className="sec">
        <div className="wrap art">
          <header className="head">
            <span className="head__r" />
            <h2 className="sec__h">Arti tiap zona</h2>
          </header>
          <ul>
            <li>
              <b className="mono">zona 12</b> — berjalan di produksi, mengambil pesanan sungguhan hari ini.
            </li>
            <li>
              <b className="mono">zona 11</b> — masih dikerjakan. Mengatakannya "selesai" akan jadi klaim palsu.
            </li>
            <li>
              <b className="mono">digit 1</b> — kode publik; bisa dibaca baris per baris.
            </li>
            <li>
              <b className="mono">digit 2</b> — tercatat pihak ketiga (lomba), jadi bisa diperiksa orang lain.
            </li>
            <li>
              <b className="mono">digit 3</b> — ada sebagai dokumen kebutuhan, bukan aplikasi.
            </li>
            <li>
              <b className="mono">digit 0</b> — diserahkan saat penempatan kerja lalu dipakai.
            </li>
          </ul>
          <p className="sec__n">
            {traceStats.capabilities} kemampuan terdaftar di situs ini; {traceStats.gaps} di antaranya belum punya kartu
            yang membuktikannya. Itu dilaporkan, bukan disembunyikan.
          </p>
        </div>
      </section>
    </>
  );
}
