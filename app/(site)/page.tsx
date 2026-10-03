import { Section, CTABand } from "@/components/ui/section";
import CaseCard from "@/components/ui/case-card";
import Counter from "@/components/ui/counter";
import { BlurText, RotatingText, Spotlight, TiltCard, GlareCard, BorderBeam, ShimmerButton } from "@/components/ui/anim";
import { ScrambleText, MovingCards } from "@/components/ui/anim-more";
import WordFlow from "@/components/ui/word-flow";
import { site, services, cases, numbers, process } from "@/lib/site";

export default function Home() {
  const featured = cases.slice(0, 4);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero" id="beranda">
        {/* pola latar bergerak: digeser lewat background-position, jadi selalu
            terpotong oleh kotaknya sendiri dan tidak pernah merusak tata letak */}
        <div className="hero__bg" data-bg="0.16" aria-hidden="true" />
        <div className="wrap hero__in">
          <div className="hero__text">
            <Spotlight />
            <p className="pill">
              <span className="pill__dot" aria-hidden="true" />
              <ScrambleText text={`${site.badge} · ${site.place}`} />
            </p>

            <BlurText as="h1" className="hero__h1" text="Software that gets used," delay={120} />
            <BlurText as="h1" className="hero__h1 hero__h1--second" text="not just shipped." delay={420} />

            <p className="hero__lede" data-fx data-fx-delay="1">
              {site.bio}
            </p>

            <div className="hero__rot">
              <span className="hero__rotK">Currently building</span>
              <RotatingText items={["business systems", "web apps", "Discord bots", "admin panels"]} />
            </div>

            <div className="hero__actions" data-fx data-fx-delay="2">
              <ShimmerButton href="/kontak">Start a project</ShimmerButton>
              <a className="btn btn--ghost" href="/karya">
                See the work
              </a>
            </div>

            <ul className="hero__proof">
              {[
                { v: numbers[0].value, l: numbers[0].label },
                { v: numbers[1].value, l: numbers[1].label },
                { v: "1", l: "Product running in production" },
              ].map((x, i) => (
                <li key={x.l} data-fx data-fx-delay={String(i + 1)}>
                  <span className="hero__proofV">{x.v}</span>
                  <span>{x.l}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* --- FOTO ---
              Bingkai punya overflow: hidden SENDIRI, dan gambar diperbesar 8%
              lalu digeser di dalamnya. Kliping disengaja → tidak mungkin
              terlihat sebagai bug, dan tidak ada elemen lain yang menutupinya. */}
          <div className="shotFrame">
            <TiltCard className="shotFrame__tilt" max={5}>
              <div className="shotFrame__inner">
                <img
                  className="shotFrame__img"
                  data-inner="0.055"
                  src="/github/arkan-avatar-2x.png"
                  alt={`Portrait of ${site.name}`}
                  width={680}
                  height={680}
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <BorderBeam duration={6} size={90} />
            </TiltCard>

            <div className="shotMeta">
              <p className="shotMeta__name">{site.name}</p>
              <p className="shotMeta__handle">{site.handle}</p>
              <p className="shotMeta__note">Portrait from GitHub</p>
            </div>
          </div>
        </div>

        <div className="wrap">
          <div data-x="0.35">
          <MovingCards
            items={["Laravel", "Next.js", "TypeScript", "Node.js", "Tailwind", "PHP", "MongoDB", "Prisma", "REST API", "Git"]}
            duration={34}
          />
          </div>
        </div>
      </section>

      {/* ================= PROBLEM ================= */}
      <Section
        eyebrow="The problem"
        titleText="Plenty of software ships. ~Far less gets used."
        sub="The cause is rarely the code. Usually the process is unclear: who does what, and where the work stalls."
        center
      >
        <div className="painGrid">
          {[
            { t: "The workflow is invisible", d: "Orders and stock live in chat threads, so there is no single place to see the real state." },
            { t: "Everything typed twice", d: "The same data gets entered in several places, and every copy can drift." },
            { t: "Customers wait for replies", d: "People have to ask for status even though the answer is already in the system." },
            { t: "Features nobody opens", d: "Built without clear requirements, they get abandoned by the people meant to use them." },
          ].map((p, i) => (
            <GlareCard key={p.t} className="pain">
              <span className="pain__n">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="pain__t">{p.t}</h3>
              <p className="pain__d">{p.d}</p>
            </GlareCard>
          ))}
        </div>
      </Section>

      {/* ================= SERVICES ================= */}
      <Section
        eyebrow="Services"
        titleText="Four things I ~actually do."
        sub="Every one of them comes from work already in the case studies, not a sales list."
      >
        <div className="svcGrid">
          {services.map((s) => (
            <GlareCard key={s.slug} className="svc">
              <a href={`/layanan/${s.slug}`} className="svc__link">
                <span className="svc__no">{s.no}</span>
                <span className="svc__name">{s.name}</span>
                <span className="svc__tag">{s.tagline}</span>
                <span className="svc__for">{s.for}</span>
                <span className="svc__go">
                  Read more
                  <i aria-hidden="true">→</i>
                </span>
              </a>
            </GlareCard>
          ))}
        </div>
      </Section>

      {/* ================= WORK ================= */}
      <Section
        eyebrow="Selected work"
        titleText="Already ~running."
        sub="Each case has its own page: the problem, what I built, and the outcome."
      >
        <div className="ccGrid">
          {featured.map((c, i) => (
            <CaseCard key={c.slug} item={c} priority={i < 2} />
          ))}
        </div>
        <div className="secMore">
          <a className="btn btn--ghost" href="/karya">
            All work ({cases.length})
          </a>
        </div>
      </Section>

      {/* ================= PROCESS ================= */}
      <Section
        eyebrow="How I work"
        titleText="Four steps, ~in order."
        tint
      >
        <ol className="stepsRow">
          {process.map((p) => (
            <GlareCard key={p.no} className="stepCard">
              <span className="stepCard__n">{p.no}</span>
              <h3 className="stepCard__t">{p.title}</h3>
              <p className="stepCard__d">{p.body}</p>
            </GlareCard>
          ))}
        </ol>
      </Section>

      {/* ================= NUMBERS ================= */}
      <Section eyebrow="Track record" titleText="Numbers ~you can check.">
        <div className="numGrid">
          {numbers.map((n) => (
            <GlareCard key={n.label} className="num">
              <Counter value={n.value} className="num__v" />
              <span className="num__l">{n.label}</span>
              <span className="num__n">{n.note}</span>
            </GlareCard>
          ))}
        </div>
      </Section>

      {/* ================= QUOTE ================= */}
      <Section>
        <div className="quote">
          {/* WordFlow, BUKAN TextReveal: TextReveal memecah teks per HURUF dengan
              display:inline-block, dan browser boleh memotong baris di antara dua
              kotak inline-block — jadi kata terpotong di tengah ("fir" / "st,").
              WordFlow memakai satu elemen per KATA, jadi pemotongan hanya terjadi
              di spasi. Gerakannya sama: masuk per kata + garis aksen tumbuh. */}
          <h2 className="quote__t">
            <WordFlow text="I map the ~workflow first, then write the code." />
          </h2>
          <p className="quote__src">
            {site.name} · {site.place}
          </p>
        </div>
      </Section>

      {/* ================= KAGE =================
          Halaman terpisah: dokumen yang diautor ThreeUI (WebGL, lima bab).
          Ditempatkan di rutenya sendiri karena ia punya CSS dan runtime
          sendiri, dan tidak boleh bercampur dengan katalog. */}
      <section className="sec">
        <div className="wrap">
          <div className="glass" style={{ padding: "clamp(20px,3vw,36px)", display: "grid", gap: 14 }}>
            <p className="eyebrow">Scene</p>
            <h2 className="h2" style={{ maxWidth: "30ch" }}>
              Kage — jalan malam lima bab melewati kuil gunung di Kyoto.
            </h2>
            <p className="lead" style={{ maxWidth: "62ch" }}>
              Satu halaman WebGL yang dirender langsung di browser: cypress terbakar, cahaya lentera, dan bulan
              vermilion. Dibuka di rutenya sendiri.
            </p>
            <div>
              <a className="btn btn--dark" href="/kage">
                Buka scene <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
