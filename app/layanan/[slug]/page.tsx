import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Split, Reveal } from "@/components/field/motion";
import { services } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return { title: "Service not found" };
  return { title: s.name, description: s.tagline };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== slug);

  return (
    <>
      <section className="page">
        <div className="wrap">
          <p className="kicker" data-reveal>
            Service {s.no}
          </p>
          <Split as="h1" className="serif page__h" text={s.name} />
          <p className="page__s lead" data-reveal style={{ ["--d" as string]: "160ms" }}>
            {s.tagline}
          </p>
        </div>
      </section>

      <section className="sec sec--tight">
        <div className="wrap split">
          <div className="art">
            <Reveal>
              <Split as="h2" className="serif" text="Who it is for" style={{ fontSize: "clamp(22px,3vw,38px)" }} />
              <p style={{ marginTop: 12 }}>{s.for}</p>
            </Reveal>
            <Reveal delay={80}>
              <Split as="h2" className="serif" text="What is included" style={{ fontSize: "clamp(22px,3vw,38px)" }} />
              <ul>
                {s.includes.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={140}>
              <Split as="h2" className="serif" text="Evidence" style={{ fontSize: "clamp(22px,3vw,38px)" }} />
              <p style={{ marginTop: 12 }}>{s.proof}</p>
              <p style={{ marginTop: 22 }}>
                <a className="btn" href="/kontak">
                  <span className="btn__fill" aria-hidden="true" />
                  Tell me about the project <i aria-hidden="true">→</i>
                </a>
              </p>
            </Reveal>
          </div>

          <aside className="sticky">
            <div className="rail">
              <div className="rail__g">
                <p className="rail__k">Number</p>
                <p className="rail__v mono">{s.no}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Starting point</p>
                <p className="rail__v">{s.from}</p>
              </div>
              <div className="rail__g">
                <p className="rail__k">Other services</p>
                <ul style={{ display: "grid", gap: 7, marginTop: 6 }}>
                  {others.map((o) => (
                    <li key={o.slug}>
                      <a className="rail__v" style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent)" }} href={`/layanan/${o.slug}`}>
                        {o.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
