/**
 * Kartu = catatan kerja. Semua diturunkan dari `lib/site.ts` (CV + repo publik).
 * Tidak ada catatan atau lubang yang dikarang.
 */
import { cases, numbers as numberStats, stack, track } from "@/lib/site";
import type { Case } from "@/lib/site";

export type EvidenceState = "live" | "record" | "shipped" | "public" | "doc" | "building" | "declared";

export const STATUS: Record<EvidenceState, { label: string; note: string }> = {
  live: { label: "berjalan di produksi", note: "Jalan sekarang dan mengambil pesanan sungguhan. Sumbernya privat, jadi produknya sendiri yang jadi bukti." },
  public: { label: "kode publik", note: "Kodenya bisa dibaca baris per baris; tidak ada yang perlu dipercaya begitu saja." },
  record: { label: "tercatat", note: "Dicatat pihak ketiga di lomba, jadi bisa diperiksa orang lain." },
  shipped: { label: "diserahkan", note: "Diserahkan saat penempatan kerja lalu dipakai." },
  doc: { label: "dokumen", note: "Nilai catatan ini ada di daftar kebutuhan yang ditulis sebelum ada kode." },
  building: { label: "masih dikerjakan", note: "Belum selesai, dan ditulis begitu. Menyebutnya selesai akan jadi klaim palsu." },
  declared: { label: "belum terbukti", note: "Terdaftar tanpa catatan kerja di belakangnya." },
};

export type Record_ = {
  id: string;
  no: string;
  title: string;
  kind: string;
  year: string;
  stack: string;
  where: string | null;
  state: EvidenceState;
  summary: string;
  problem: string;
  built: string[];
  evidence: string;
  href: string;
  external: { href: string; label: string } | null;
  image: string;
  imageNote: string;
  badge?: string;
};

/** Kekuatan bukti ditetapkan dari isi data aslinya. */
const STATE_OF: Record<string, EvidenceState> = {
  mafiablox: "live",
  pixwatch: "public",
  buildplan: "building",
  "aplikasi-solusi-bisnis": "record",
  rollerskool: "doc",
  "tasty-food": "shipped",
  "website-sekolah": "shipped",
};

export const records: Record_[] = cases.map((c: Case) => ({
  id: c.slug,
  no: c.no,
  title: c.title,
  kind: c.kind,
  year: c.year,
  stack: c.stack,
  where: c.where ?? null,
  state: STATE_OF[c.slug] ?? "declared",
  summary: c.summary,
  problem: c.problem,
  built: c.did,
  evidence: c.result,
  href: `/karya/${c.slug}/`,
  external: c.link ?? null,
  image: c.image,
  imageNote: c.imageNote,
  badge: c.badge,
}));

export const recordById = (id: string) => records.find((r) => r.id === id);

/** Perkakas yang disebut di beranda tapi tidak punya kartu yang membuktikannya. */
const TERKARTU = new Set(
  [["Laravel"], ["PHP"], ["Frontend (HTML/CSS/JS)"], ["Fullstack"], ["Node.js"], ["Discord bots"], ["Desktop applications"], ["Mobile applications"], ["BRD"], ["System maintenance"]].flat(),
);
export const declaredTools: string[] = stack
  .flatMap((g: { items: { name: string }[] }) => g.items.map((i) => i.name))
  .filter((n: string) => !TERKARTU.has(n));

export const traceStats = {
  records: records.length,
  capabilities: stack.reduce((n: number, g: { items: unknown[] }) => n + g.items.length, 0),
  gaps: declaredTools.length,
  live: records.filter((r) => r.state === "live").length,
};

export const numbers = numberStats;
export const timeline = track;
