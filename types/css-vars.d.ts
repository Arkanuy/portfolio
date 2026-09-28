/**
 * Properti CSS kustom (--nama) dipakai lewat atribut style di beberapa
 * komponen (indeks animasi, progres scroll). TypeScript belum mengenalinya,
 * jadi tipe-nya diperluas di sini.
 */
import "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
