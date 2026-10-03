import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kage",
  description:
    "Kage — Where stillness reveals the unseen. A five-chapter night walk through a Kyoto mountain temple, rendered live in WebGL.",
};

/**
 * LAYOUT /kage — sengaja hampir kosong.
 *
 * Halaman ini menampilkan dokumen yang diautor ThreeUI di dalam iframe, jadi ia
 * tidak boleh mewarisi chrome situs maupun latar katalog. Yang tersisa hanya
 * latar dokumennya (#080808), supaya tidak ada kedipan putih sebelum iframe
 * selesai memuat.
 */
export default function KageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "#080808",
      }}
    >
      {children}
    </div>
  );
}
