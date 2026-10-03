"use client";

import { KageLandingPage } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

/**
 * PEMBUNGKUS CLIENT untuk KageLandingPage.
 *
 * Kenapa dipisah: `KageLandingPage` memakai `useState`/`useEffect` di dalamnya
 * (lihat `LandingPageFrame.tsx` — ia menyimpan state `ready` dan memasang
 * efek untuk menyuntik tipografi ke iframe). Di Next App Router, komponen
 * ber-hook HARUS berada di client boundary. Ketika diimpor langsung dari
 * server component, prerender gagal dengan:
 *   TypeError: (0, c.useState) is not a function
 *
 * Jadi: file ini yang menjadi batas client-nya, dan `page.tsx` tetap server
 * supaya bisa mengekspor metadata.
 *
 * Props di bawah persis seperti usage yang dikonfigurasi ThreeUI.
 */
export default function KageScene() {
  return (
    <div className="shader-frame">
      <KageLandingPage
        headingFont="onest"
        bodyFont="onest"
        headingWeight="400"
        bodyWeight="300"
        primaryColor="#e0231c"
        headingSize={46}
        bodySize={17}
        headingLetterSpacing={-0.012}
      />
    </div>
  );
}
