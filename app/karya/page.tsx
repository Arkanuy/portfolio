import type { Metadata } from "next";
import CaseCard from "@/components/ui/case-card";
import { CTABand } from "@/components/ui/section";
import { cases } from "@/lib/site";

export const metadata: Metadata = {
  title: "Work",
  description: "Seven case studies: production systems, web, analysis, and competition work.",
};

export default function KaryaPage() {
  return (
    <>
      <section className="pageHero">
        <div className="wrap">
          <p className="eyebrow">Work</p>
          <h1 className="pageHero__t">
            Seven <em>case studies</em>.
          </h1>
          <p className="pageHero__s">
            Newest first. Each page covers the problem, what I built, and the outcome.
          </p>
        </div>
      </section>

      <section className="wrap">
        <div className="ccGrid">
          {cases.map((c, i) => (
            <CaseCard key={c.slug} item={c} priority={i < 2} />
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
