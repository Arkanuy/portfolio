/**
 * TRACE — peta keterlacakan klaim.
 *
 * Setiap klaim di situs ini (angka, kemampuan, hasil kerja) punya SIMPUL SUMBER:
 * catatan kerja nyata yang membuktikannya. Semua simpul di sini DITURUNKAN dari
 * `lib/data.ts` + `lib/site.ts` (CV + repo publik). Tidak ada simpul karangan.
 *
 * Kalau sebuah klaim tidak punya sumber yang bisa ditunjuk, itu ditandai
 * `declared` — bukan disembunyikan. Justru itu inti konsepnya: sistem ini
 * memeriksa klaim, termasuk klaim yang belum punya bukti.
 */

import { cases, numbers, stack, skills as marqueeSkills, track } from "@/lib/site";
import type { Case } from "@/lib/site";

/** Daftar kata perkakas dari situs (untuk laporan celah). */
const marquee: string[] = marqueeSkills;

/** Kekuatan bukti di balik sebuah klaim. Ditampilkan sebagai label + pola arsir. */
export type EvidenceState =
  | "live" /* jalan di produksi */
  | "record" /* catatan resmi: penghargaan, penempatan kerja */
  | "shipped" /* dikerjakan & diserahkan */
  | "public" /* kodenya publik */
  | "doc" /* dokumen: BRD, analisis */
  | "building" /* masih dikerjakan */
  | "declared"; /* disebut tanpa catatan tertaut — celah yang jujur */

export const STATE_LABEL: Record<EvidenceState, string> = {
  live: "LIVE",
  record: "RECORD",
  shipped: "SHIPPED",
  public: "PUBLIC",
  doc: "DOCUMENT",
  building: "BUILDING",
  declared: "NO RECORD",
};

export const STATE_NOTE: Record<EvidenceState, string> = {
  live: "Running in production right now.",
  record: "Recorded on the CV: award or placement.",
  shipped: "Delivered as part of an internship or project.",
  public: "Source code is public and can be read.",
  doc: "Exists as a document (requirements / analysis).",
  building: "Not finished yet — deliberately marked as such.",
  declared: "Listed in the tool list, with no linked work record.",
};

/** Satu catatan kerja. Dibuat dari `cases` — tidak ada field tambahan yang dikarang. */
export type WorkRecord = {
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
  badge?: string;
  image: string;
  imageNote: string;
};

/** Kekuatan bukti per catatan, ditetapkan dari isi `result`/status di data asli. */
const RECORD_STATE: Record<string, EvidenceState> = {
  mafiablox: "live", // "Running in production with daily customers."
  pixwatch: "public", // "Source is public."
  buildplan: "building", // "Still in progress."
  "aplikasi-solusi-bisnis": "record", // "Third place, twice."
  rollerskool: "doc", // dokumen BRD
  "tasty-food": "shipped", // "Delivered as the internship product."
  "website-sekolah": "shipped", // "The site stayed up throughout the internship."
};

const caseToRecord = (c: Case): WorkRecord => ({
  id: c.slug,
  no: c.no,
  title: c.title,
  kind: c.kind,
  year: c.year,
  stack: c.stack,
  where: c.where ?? null,
  state: RECORD_STATE[c.slug] ?? "declared",
  summary: c.summary,
  problem: c.problem,
  built: c.did,
  evidence: c.result,
  href: `/karya/${c.slug}/`,
  external: c.link ?? null,
  badge: c.badge,
  image: c.image,
  imageNote: c.imageNote,
});

/** Label + catatan per status. Dipakai tabel kerja dan halaman kasus. */
export const STATUS: Record<EvidenceState, { label: string; note: string }> = {
  live: { label: "in production", note: "Running now, taking real orders. Source is private, so the product is the proof." },
  public: { label: "source public", note: "The code can be read line by line; nothing needs to be taken on trust." },
  record: { label: "awarded", note: "Recorded by a third party in a competition, so it is externally checkable." },
  shipped: { label: "delivered", note: "Handed over during a placement and used afterwards." },
  doc: { label: "document", note: "A requirements baseline written before any code, not an application." },
  building: { label: "in progress", note: "Not finished, and labelled that way. Calling it shipped would be a false claim." },
  declared: { label: "unproven", note: "Listed without a work record behind it." },
};

export const STATUS_LINE: Record<EvidenceState, string> = {
  live: "In production with daily customers.",
  record: "Recorded on the CV: award or placement.",
  shipped: "Delivered during a placement.",
  public: "Source code is public.",
  doc: "Exists as a requirements document.",
  building: "Still in progress — marked as such.",
  declared: "No linked work record yet.",
};

/** Alias tipe: `Record` adalah tipe bawaan TypeScript, jadi dipakai `Record_`. */
export type Record_ = WorkRecord;

export const records: WorkRecord[] = cases.map(caseToRecord);
export const recordById = (id: string) => records.find((r) => r.id === id);

/** Simpul yang bisa ditunjuk oleh sebuah klaim. */
export type SourceNode =
  | { kind: "record"; id: string; label: string; href: string; state: EvidenceState }
  | { kind: "history"; id: string; label: string; href: string; state: EvidenceState }
  | { kind: "tool"; id: string; label: string; href: string; state: EvidenceState };

const rec = (id: string): SourceNode => {
  const r = recordById(id);
  return {
    kind: "record",
    id,
    label: r ? `${r.no} · ${r.title}` : id,
    href: r ? r.href : "/karya/",
    state: r ? r.state : "declared",
  };
};

const hist = (index: number): SourceNode => {
  const t = track[index];
  return {
    kind: "history",
    id: `hist-${index}`,
    label: t ? `${t.date} · ${t.org}` : `history ${index}`,
    href: "/riwayat/",
    state: "record",
  };
};

/** Satu klaim yang bisa diaudit pengunjung. */
export type Claim = {
  id: string;
  value: string;
  label: string;
  detail: string;
  sources: SourceNode[];
};

/** Tiga klaim pembuka di lembar depan. Semuanya bisa ditelusuri. */
export const headlineClaims: Claim[] = [
  {
    id: "klaim-produksi",
    value: "1",
    label: "Product running in production",
    detail:
      "Mafia Blox takes orders and QRIS payments from daily customers. The repository is private; the product is public, so the proof is the live site.",
    sources: [rec("mafiablox")],
  },
  {
    id: "klaim-penghargaan",
    value: "2×",
    label: "Third place, Bandung Regency skills contest",
    detail:
      "Two builds of one business solution had to run on desktop and mobile within a set time limit, in 2024 and again in 2025.",
    sources: [rec("aplikasi-solusi-bisnis"), hist(0), hist(3)],
  },
  {
    id: "klaim-penempatan",
    value: "3",
    label: "Industry placements",
    detail:
      "Two placements: an existing school website kept running plus a requirements document written at PT. Fath Synergy Group, and a Laravel landing page built at Cyberlabs.",
    sources: [hist(1), hist(2), rec("rollerskool"), rec("tasty-food")],
  },
];

/** Klaim angka lain, dari `numbers` apa adanya. */
export const numberClaims: Claim[] = numbers.map((s, i) => ({
  id: `angka-${i}`,
  value: s.value,
  label: s.label,
  detail: s.note,
  sources: i === 2 ? [hist(0), hist(3)] : i === 3 ? [] : [hist(1), hist(2)],
}));

/** Kemampuan → bukti → simpul. Diambil dari `stack` (skillGroups). */
export type Capability = {
  id: string;
  name: string;
  group: string;
  evidence: string;
  sources: SourceNode[];
};

/** Peta kemampuan → catatan. Hanya kemampuan yang punya catatan nyata yang dapat simpul. */
const CAP_SOURCES: Record<string, string[]> = {
  Laravel: ["tasty-food"],
  PHP: ["tasty-food"],
  "Frontend (HTML/CSS/JS)": ["tasty-food"],
  Fullstack: ["rollerskool", "website-sekolah"],
  "Node.js": ["pixwatch", "buildplan"],
  "Discord bots": ["buildplan", "pixwatch"],
  "Desktop applications": ["aplikasi-solusi-bisnis"],
  "Mobile applications": ["aplikasi-solusi-bisnis"],
  BRD: ["rollerskool"],
  "System maintenance": ["website-sekolah"],
};

/**
 * Perkakas yang disebut di daftar beranda tetapi tidak punya catatan kerja.
 * Ini bukan penghapusan klaim — ini laporan celah. Sistem yang memeriksa klaim
 * harus ikut melaporkan yang belum bisa dibuktikan.
 */
const CAP_NAMES = new Set(stack.flatMap((g) => g.items.map((i) => i.name)));
export const unsourcedTools: string[] = marquee.filter((m) => !CAP_NAMES.has(m));

/**
 * Perkakas tanpa catatan DIMASUKKAN ke tabel yang sama sebagai baris `declared`,
 * bukan ditaruh di daftar terpisah. Alasannya: hatching harus terlihat di
 * tempat ia relevan. Kalau celahnya dikumpulkan di bagian lain, tabelnya
 * kembali terlihat sempurna — dan itu justru berbohong.
 */
const declaredTools: Capability[] = unsourcedTools.map((t, i) => ({
  id: `decl-${i}`,
  name: t,
  group: "Declared, not yet traceable",
  evidence: "Named in the home-page tool strip. No work record on this site proves it yet.",
  sources: [],
}));

const tracedCapabilities: Capability[] = stack.flatMap((g, gi) =>
  g.items.map((it, ii) => ({
    id: `cap-${gi}-${ii}`,
    name: it.name,
    group: g.group,
    evidence: it.evidence,
    sources: (CAP_SOURCES[it.name] ?? []).map(rec),
  })),
);

export const capabilities: Capability[] = [...tracedCapabilities, ...declaredTools];

/** Semua klaim, untuk dihitung dan ditampilkan sebagai satu neraca. */
export const allClaims: Claim[] = [...headlineClaims, ...numberClaims];

export const traceStats = {
  claims: allClaims.length,
  capabilities: capabilities.length,
  sourced: capabilities.filter((c) => c.sources.length > 0).length,
  gaps: capabilities.length - capabilities.filter((c) => c.sources.length > 0).length,
  records: records.length,
  live: records.filter((r) => r.state === "live").length,
  states: Object.keys(STATE_LABEL) as EvidenceState[],
};