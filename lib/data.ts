/**
 * Sumber data: CV "Arkan_Mustofa.pdf" + akun GitHub `Arkanuy`.
 * Teks yang diturunkan dari bio (bukan tertulis eksplisit di CV) ditandai
 * di komentar masing-masing — tidak ada yang dikarang.
 */

export const profile = {
  name: "Arkan Mustofa",
  initials: "AM",
  role: "Information Systems student: web, bots, and business software",
  handle: "@arkanmp",
  email: "arkanmustofabe@gmail.com",
  instagram: "https://instagram.com/arkanmp",
  location: "Kp. Mekarsari Rt 06 Rw 023, Bandung, West Java",
  locationShort: "Bandung, Indonesia",
  born: "9 December 2006",
  bornPlace: "Bandung",
  status: "Open to internships, freelance work, and collaboration",
  badge: "Available for work",
  bio: "I study Information Systems in Bandung. I started coding before university, beginning with Discord bots. Today I build and maintain web apps and business software.",
  bioLong:
    "At vocational school I learned to build applications. While working on real projects I found the problem is rarely the code — it is the flow: who does what, and where the work stalls. So I map the process first, then write code.",
} as const;

export const stats = [
  { value: "2×", label: "Third place, Bandung Regency skills contest", note: "IT Software Solution for Business" },
  { value: "3", label: "Industry placements", note: "Internship and fieldwork" },
  { value: "2025", label: "Graduated vocational school", note: "SMK BPPI Baleendah" },
  { value: "S1", label: "Information Systems degree", note: "In progress" },
] as const;

export type Experience = {
  date: string;
  title: string;
  org: string;
  desc: string;
  points: string[];
  tags: string[];
  badge?: string;
};

export const experiences: Experience[] = [
  {
    date: "29 April 2025",
    title: "Third place — Bandung Regency skills contest",
    org: "IT Software Solution for Business",
    desc: "The vocational skills contest for Bandung Regency. I built a business solution that had to run on desktop and mobile from the same core idea.",
    points: [
      "Desktop build of the business solution.",
      "Mobile build on the same flow.",
    ],
    tags: ["Desktop", "Mobile", "Product"],
    badge: "Third place twice (2024 & 2025)",
  },
  {
    date: "December 2024 — March 2025",
    title: "Internship",
    org: "PT. Fath Synergy Group",
    desc: "Ran an existing school management website while writing the requirements document for the Rollerskool system, before anyone wrote its code.",
    points: [
      "Kept the live school website running, including the issues that appeared without warning.",
      "Wrote the Rollerskool BRD: functional requirements and process flows, before development started.",
      "Worked on the fullstack side of the supporting application.",
    ],
    tags: ["Analysis", "Web", "Fullstack"],
  },
  {
    date: "September — November 2024",
    title: "Fieldwork placement",
    org: "Cyberlabs",
    desc: "Built the Tasty Food landing page and its admin panel with Laravel, from design through to the backend.",
    points: [
      "Tasty Food landing page plus the admin panel for managing its content.",
      "Frontend and backend, both built by me.",
    ],
    tags: ["Web", "Laravel", "Frontend"],
  },
  {
    date: "29 April 2024",
    title: "Third place — Bandung Regency skills contest",
    org: "IT Software Solution for Business",
    desc: "My first year entering the contest. I designed and built a business solution application, and placed third.",
    points: ["Contest for designing and building a business solution application."],
    tags: ["Product", "Competition"],
  },
];

export type SkillGroup = {
  group: string;
  items: { name: string; evidence: string }[];
};

export const skillGroups: SkillGroup[] = [
  {
    group: "Web",
    items: [
      { name: "Laravel", evidence: "Tasty Food landing page and admin panel, during fieldwork at Cyberlabs" },
      { name: "PHP", evidence: "Backend for the Tasty Food admin panel" },
      { name: "Frontend (HTML/CSS/JS)", evidence: "Tasty Food landing page, from design to production" },
      { name: "Fullstack", evidence: "Supporting application at PT. Fath Synergy Group" },
    ],
  },
  {
    group: "Bots & Automation",
    items: [
      { name: "Node.js", evidence: "Discord bots and automation scripts" },
      { name: "Discord bots", evidence: "Building bots since before university" },
    ],
  },
  {
    group: "Business software",
    items: [
      { name: "Desktop applications", evidence: "The contest project, third place twice" },
      { name: "Mobile applications", evidence: "Mobile build of the same contest project" },
    ],
  },
  {
    group: "Analysis & documentation",
    items: [
      { name: "BRD", evidence: "Wrote the requirements document for the Rollerskool system" },
      { name: "System maintenance", evidence: "School management website already in use" },
    ],
  },
];

/** Flat skill list (name + evidence). */
export const skills: { name: string; evidence: string; group: string }[] = skillGroups.flatMap((g) =>
  g.items.map((it) => ({ name: it.name, evidence: it.evidence, group: g.group })),
);

/** Words shown as a technology list. */
export const marquee = [
  "Laravel",
  "Node.js",
  "Discord Bot",
  "BRD",
  "Next.js",
  "TypeScript",
  "Tailwind",
  "PHP",
  "REST API",
  "Git",
];

export const education = [
  {
    period: "2025 — present",
    title: "Information Systems (S1)",
    org: "Currently enrolled",
    note: "",
  },
  {
    period: "2022 — 2025",
    title: "SMK BPPI Baleendah",
    org: "Software Engineering programme (PPLG)",
    note: "",
  },
];

/** Diturunkan dari bio CV ("web, bot Discord, game"). */
export const hobbies = [
  { name: "Coding", note: "Been at it since before university" },
  { name: "Games", note: "Playing and building them" },
  { name: "Discord bots", note: "Automating repetitive work" },
];



export const contact = {
  email: "arkanmustofabe@gmail.com",
  whatsapp: "",
  github: "https://github.com/Arkanuy",
  linkedin: "",
} as const;

/** Foto profil: diunduh dari akun GitHub Arkanuy (uid 111991385).
 *  Angka `repos` diambil dari GitHub API saat pengerjaan — bukan tebakan. */
export const github = {
  user: "Arkanuy",
  url: "https://github.com/Arkanuy",
  avatar: "/github/arkan-avatar.png",
  repos: 20,
} as const;

export const cvFile = "/arkan-mustofa-cv.pdf";

/**
 * Foto profil: avatar dari akun GitHub Arkanuy (uid 111991385).
 * Kalau ada foto resolusi lebih tinggi, timpa public/github/arkan-avatar.png
 * (persegi, wajah di tengah-atas).
 */
export const photo = {
  src: "/github/arkan-avatar.png",
  alt: "Foto Arkan Mustofa",
} as const;
