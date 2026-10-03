/**
 * MEDAN — lapisan paling bawah yang tidak pernah diam.
 *
 * Tiga cahaya bergerak (coral hangat, cyan dingin) + satu lapisan grain.
 * Semuanya murni CSS: tidak ada satu pun listener di sini, tidak ada biaya JS.
 *
 * PENTING soal biaya: setiap lapisan di sini menutupi SELURUH layar, jadi
 * biayanya sebanding luas, bukan jumlah elemen. Versi pertama memakai lima
 * lapisan raksasa (dua grain, kisi beranimasi seluas 2x viewport, orb 64vw)
 * dengan `filter: blur(70px)`. Di mesin tanpa akselerasi GPU itu terukur
 * p95 116ms (~9fps). Sekarang: orb lebih kecil tanpa blur, kisi statis,
 * satu grain dengan animasi ber-`steps()`.
 */
export default function Field() {
  return (
    <div className="field" aria-hidden="true">
      <span className="field__grid" />
      <span className="field__orb field__orb--a" />
      <span className="field__orb field__orb--b" />
      <span className="field__orb field__orb--c" />
      <span className="field__grain" />
    </div>
  );
}
