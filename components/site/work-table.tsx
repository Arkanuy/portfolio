import { records, STATUS } from "@/lib/records";

/**
 * TABEL KERJA — pengganti grid kartu.
 *
 * Tujuh catatan dengan status buktinya, disajikan sebagai tabel: nomor, tahun,
 * nama, jenis, status, tautan. Angka rata (tabular-nums), pemisah 1px, tanpa
 * bayangan, tanpa radius. Di ponsel tabelnya jadi baris berlabel — bukan
 * ditumpuk jadi kartu.
 *
 * Ini sekaligus cara menjawab "jangan dump skill sebagai daftar": bukti
 * ditampilkan sebagai data yang bisa dibandingkan, bukan lencana.
 */
export default function WorkTable() {
  return (
    <table className="work">
      <caption>Seven records, newest first. Status is the strongest thing that can be pointed at.</caption>
      <thead>
        <tr>
          <th scope="col" className="work__no">
            No
          </th>
          <th scope="col" className="work__yr">
            Year
          </th>
          <th scope="col">Record</th>
          <th scope="col">Kind</th>
          <th scope="col" className="work__st">
            Status
          </th>
          <th scope="col" className="work__go">
            <span className="sr">Open</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => (
          <tr key={r.id}>
            <td className="work__no mono">{r.no}</td>
            <td className="work__yr mono">{r.year}</td>
            <td className="work__name">
              <a href={r.href}>{r.title}</a>
            </td>
            <td className="work__kind">{r.kind}</td>
            <td className="work__st">
              <span className="st" data-s={r.state}>
                {STATUS[r.state].label}
              </span>
            </td>
            <td className="work__go">
              <a href={r.href}>
                Case study <span aria-hidden="true">→</span>
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
