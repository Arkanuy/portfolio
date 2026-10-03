import { profile, stats, skillGroups, experiences, education, hobbies, contact, github, cvFile, marquee } from "@/lib/data";

export const site = {
  name: profile.name,
  first: profile.name.split(" ")[0],
  last: profile.name.split(" ")[1],
  role: "Information Systems student — web, bots, and business software",
  place: profile.locationShort,
  born: `${profile.bornPlace}, ${profile.born}`,
  status: "Open to internships, freelance work, and collaboration",
  badge: "Available for work",
  handle: profile.handle,
  email: contact.email,
  instagram: profile.instagram,
  bio: "I study Information Systems in Bandung, Indonesia. I started coding before university, building Discord bots, and now I build and maintain web apps and business software.",
  bioLong:
    "At vocational school I learned to build apps. While working on real projects, I found that the problem is rarely the code — it is the process: who does what, and where the work gets stuck. So I map the workflow first, then write code.",
  portrait: github.avatar,
  github,
  cv: cvFile,
};

export const skills = marquee;

export type Service = {
  no: string;
  slug: string;
  name: string;
  tagline: string;
  for: string;
  includes: string[];
  proof: string;
  from: string;
};

export const services: Service[] = [
  {
    no: "01",
    slug: "business-systems",
    name: "Business Systems",
    tagline: "Turning manual work into a system people actually use daily.",
    for: "Businesses still tracking orders or stock in chat threads and spreadsheets.",
    includes: [
      "Mapping the workflow as it runs today, including where it gets stuck.",
      "Writing the requirement list before any code is written.",
      "Building the system: data, admin interface, and order flow.",
      "Testing it against real working conditions, not just the smooth path.",
    ],
    proof: "Mafia Blox runs in production; the Rollerskool BRD was used as the development baseline.",
    from: "orders and stock first",
  },
  {
    no: "02",
    slug: "web",
    name: "Web & Landing Pages",
    tagline: "A website whose content you can edit yourself.",
    for: "Anyone who needs an online presence without calling a developer for every text change.",
    includes: [
      "Designing the interface from scratch, shaped by your content — not an off-the-shelf template.",
      "Building frontend and backend together.",
      "Adding an admin panel so content can be updated in-house.",
      "Keeping it fast and readable on phones.",
    ],
    proof: "The Tasty Food landing page and admin panel, built with Laravel during an internship at Cyberlabs.",
    from: "a single page",
  },
  {
    no: "03",
    slug: "analysis",
    name: "Analysis & Documentation",
    tagline: "Writing down the requirements before they become expensive.",
    for: "Teams that keep adding features nobody ends up using.",
    includes: [
      "Interviewing users and mapping the current process.",
      "Writing a functional requirements document (BRD).",
      "Setting priorities: what ships first, and why.",
      "Handing over a document a development team can work from directly.",
    ],
    proof: "The Rollerskool system BRD at PT. Fath Synergy Group.",
    from: "process mapping",
  },
  {
    no: "04",
    slug: "automation",
    name: "Bots & Automation",
    tagline: "Taking over repetitive work so nobody does it by hand.",
    for: "Work that repeats the same steps every day.",
    includes: [
      "Finding which steps are worth automating — and which are not.",
      "Building the bot or script that takes them over.",
      "Connecting it to the services you already use.",
      "Handing over notes on how to run it and fix it.",
    ],
    proof: "Discord bots and automation scripts, built since before university.",
    from: "one workflow",
  },
];

export const process = [
  { no: "01", title: "Read the process first", body: "Who does what, where the work moves, and where it gets stuck." },
  { no: "02", title: "Write the requirements", body: "The outcome to reach comes first; the feature list follows." },
  { no: "03", title: "Build and test it yourself", body: "Everything gets used by me before anyone else touches it." },
  { no: "04", title: "Hand over with notes", body: "Including how to run it, so you are not dependent on me." },
];

export type Case = {
  no: string;
  slug: string;
  title: string;
  kind: string;
  year: string;
  stack: string;
  where?: string;
  summary: string;
  problem: string;
  did: string[];
  result: string;
  image: string;
  imageAlt?: string;
  imageNote: string;
  link?: { href: string; label: string } | null;
  live?: string;
  badge?: string;
};

export const cases: Case[] = [
  {
    no: "01",
    slug: "mafiablox",
    title: "Mafia Blox",
    kind: "Business system · live product",
    year: "2026",
    stack: "Next.js · TypeScript · QRIS payments · admin panel",
    where: "mafiablox.com",
    summary: "A Robux top-up store. Customers pick a package, pay via QRIS, and track their own order status.",
    problem:
      "Top-up orders usually run through chat: the customer asks for a price, transfers, then waits for a reply. Staff log everything by hand, so it is slow and easy to get wrong.",
    did: [
      "Built a catalogue of Robux packages, game passes, and items customers can browse themselves.",
      "Connected QRIS payments so orders arrive without staff involvement.",
      "Built an admin panel and a scheduler that closes orders automatically once the time limit passes.",
      "Added an order-tracking page so customers never have to ask for status.",
    ],
    result: "Running in production with daily customers. Source code is kept in a private repository.",
    image: "/projects/mafiablox-desktop.webp",
    imageAlt: "/projects/mafiablox-mobile.webp",
    imageNote: "Screenshot taken directly from the live site.",
    link: { href: "https://mafiablox.com", label: "mafiablox.com" },
  },
  {
    no: "02",
    slug: "pixwatch",
    title: "PixWatch",
    kind: "Web · interface",
    year: "2026",
    stack: "Next.js 16 · React 19 · Tailwind v4 · Cheerio",
    summary: "An Indonesian-subtitle streaming site with a pixel-art interface, pulling its catalogue from several sources.",
    problem: "Streaming sources are scattered across sites with dated interfaces, and any one of them can go down.",
    did: [
      "Scraped anime, movie, and series catalogues from several sources server-side, cached for 30 minutes.",
      "Built a release schedule with a countdown matched against the catalogue.",
      "Chained several player servers so one dead source does not break playback.",
      "Added levels, EXP, daily quests, and badges; some episodes unlock with a key.",
    ],
    result: "Pixel-art neumorphic interface with light and dark mode. Source is public.",
    image: "/projects/pixwatch.webp",
    imageNote: "Plate built from the pixel-art icons in its own repository.",
    link: { href: "https://github.com/Arkanuy/pixwatch", label: "Open repository" },
  },
  {
    no: "03",
    slug: "buildplan",
    title: "BuildPlan",
    kind: "Web · AI",
    year: "2026",
    stack: "Next.js 16 · React 19 · Tailwind v4 · shadcn/ui",
    summary: "Turns a product idea into a requirements document through conversation, not a long form.",
    problem: "Writing a PRD is tedious: people have to fill in a long template while the idea is still half-formed.",
    did: [
      "Built multi-session chat, each session with its own context and an automatic title.",
      "Made the AI ask structured questions so the user only picks options or types freely.",
      "Added reference-URL extraction to enrich the PRD context.",
      "Used the user's own API key, stored in the browser and never sent to a server.",
    ],
    result: "Still in progress. Source is public.",
    image: "/projects/buildplan.webp",
    imageNote: "Design plate, not an application screenshot.",
    link: { href: "https://github.com/Arkanuy/buildplan", label: "Open repository" },
    badge: "in progress",
  },
  {
    no: "04",
    slug: "aplikasi-solusi-bisnis",
    title: "Business Solution App",
    kind: "Business system · competition",
    year: "2024—2025",
    stack: "Desktop & mobile application",
    summary: "Two builds from one idea, entered in the Bandung Regency vocational skills competition.",
    problem: "Competitors had to build a business solution that runs on two platforms within a tight time limit.",
    did: ["Built the desktop build of the business solution.", "Built the mobile build on the same flow."],
    result: "Third place, twice: 2024 and 2025. Source is public.",
    image: "/projects/aplikasi-solusi-bisnis.webp",
    imageNote: "Design plate, not an application screenshot.",
    link: { href: "https://github.com/Arkanuy/lks_mart", label: "Open repository" },
  },
  {
    no: "05",
    slug: "rollerskool",
    title: "Rollerskool",
    kind: "Analysis · documentation",
    year: "2024—2025",
    stack: "BRD · process mapping",
    where: "PT. Fath Synergy Group",
    summary: "The requirements document, written before a single line of code.",
    problem: "Building without a requirements document means features get invented midway, and the result goes unused.",
    did: [
      "Wrote the functional requirements list.",
      "Mapped the processes the system had to support.",
      "Made it the development baseline before coding started.",
    ],
    result: "Used as the reference for the Rollerskool system build.",
    image: "/projects/rollerskool.webp",
    imageNote: "Design plate, not an application screenshot.",
    link: null,
  },
  {
    no: "06",
    slug: "tasty-food",
    title: "Tasty Food",
    kind: "Web · landing page",
    year: "2024",
    stack: "Laravel · PHP · frontend + backend",
    where: "Internship at Cyberlabs",
    summary: "A food landing page with an admin panel for managing the menu and content.",
    problem: "The owner needed to update the page themselves instead of calling a developer for every menu change.",
    did: ["Built the landing page as the product's front door.", "Built an admin panel so content can be edited in-house."],
    result: "Delivered as the internship product at Cyberlabs.",
    image: "/projects/tasty-food.webp",
    imageNote: "Design plate, not an application screenshot.",
    link: null,
  },
  {
    no: "07",
    slug: "website-sekolah",
    title: "School Management Site",
    kind: "Web · maintenance",
    year: "2024—2025",
    stack: "Web operations",
    where: "PT. Fath Synergy Group",
    summary: "An existing school website. My job was to keep it running.",
    problem: "A system already in use needs someone to handle issues as they appear, not after they grow.",
    did: ["Ran day-to-day operations for the school website.", "Handled recurring fixes to keep it stable."],
    result: "The site stayed up throughout the internship.",
    image: "/projects/website-manajemen-sekolah.webp",
    imageNote: "Design plate, not an application screenshot.",
    link: null,
  },
];

export const caseBySlug = (slug: string) => cases.find((c) => c.slug === slug);
export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);

export const numbers = stats;
export const stack = skillGroups;
export const track = experiences;
export const school = education;
export { education, hobbies };
export const offHours = hobbies;

/** Label panggung hero. */
export const heroLines = ["Software that", "gets used,", "not just shipped."];
