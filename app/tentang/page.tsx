import type { Metadata } from "next";
import Image from "next/image";
import { BlurText } from "@/components/ui/anim";
import { Section, CTABand } from "@/components/ui/section";
import { site, process, stack, numbers } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Background, working process, and tooling of Arkan Mustofa.",
};

export default function TentangPage() {
  return (
    <>
      <section className="aboutHero">
        <div className="wrap aboutHero__in">
          <div className="aboutHero__text">
            <p className="eyebrow">About</p>
            <BlurText as="h1" className="aboutHero__t" text="I am Arkan. Process first, code second." />
            <p className="aboutHero__p">{site.bio}</p>
            <p className="aboutHero__p">{site.bioLong}</p>
            <dl className="aboutFacts">
              <div>
                <dt>Born</dt>
                <dd>{site.born}</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{site.place}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{site.status}</dd>
              </div>
            </dl>
          </div>

          <div className="aboutHero__media">
            <figure className="aboutPhoto">
              <Image src="/github/arkan-avatar-2x.png" alt={`Portrait of ${site.name}`} width={680} height={680} priority sizes="(max-width: 940px) 92vw, 470px" />
              <figcaption>
                <strong>{site.name}</strong>
                <span>{site.handle}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <Section
        eyebrow="How I work"
        titleText="Four steps, ~in order."
        sub="This sequence is what makes the result get used, not merely finished."
      >
        <ol className="stepsRow">
          {process.map((p, i) => (
            <div data-fx className="stepCard" key={p.no} >
              <span className="stepCard__n">{p.no}</span>
              <h3 className="stepCard__t">{p.title}</h3>
              <p className="stepCard__d">{p.body}</p>
            </div>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Tooling" titleText="What I use, with the ~evidence." tint>
        <div className="kitGrid">
          {stack.map((g, i) => (
            <div data-fx className="kit" key={g.group} >
              <h3 className="kit__t">{g.group}</h3>
              <ul>
                {g.items.map((it) => (
                  <li key={it.name}>
                    <span className="kit__n">{it.name}</span>
                    <span className="kit__e">{it.evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Numbers" titleText="What ~you can verify.">
        <div className="numGrid">
          {numbers.map((n, i) => (
            <div data-fx className="num" key={n.label} >
              <span className="num__v">{n.value}</span>
              <span className="num__l">{n.label}</span>
              <span className="num__n">{n.note}</span>
            </div>
          ))}
        </div>
      </Section>

      <CTABand />
    </>
  );
}
