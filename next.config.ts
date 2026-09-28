import type { NextConfig } from "next";

/**
 * Ekspor statis untuk Cloudflare Pages.
 *
 * Kenapa statis: situs ini tidak punya API route, form server, atau data dinamis
 * — semuanya sudah jadi halaman tetap. Jadi ekspor statis paling sederhana,
 * paling murah, dan paling cepat (tanpa server sama sekali).
 *
 * `unoptimized` pada gambar: pengoptimal gambar Next butuh server; kalau tidak
 * dimatikan, ekspor statis gagal. Semua gambar di sini sudah berukuran pas
 * (avatar 680×680, poster proyek sudah di-resize), jadi tidak ada yang hilang.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
