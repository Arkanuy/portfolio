import Image from "next/image";
import type { Case } from "@/lib/site";

export default function CaseCard({ item, priority = false }: { item: Case; priority?: boolean }) {
  return (
    <a className="cc" href={`/karya/${item.slug}`}>
      <span className="cc__media">
        <Image
          src={item.image}
          alt={`${item.title} — interface preview`}
          width={1200}
          height={751}
          priority={priority}
          sizes="(max-width: 760px) 100vw, 50vw"
        />
        {item.badge && <span className="cc__badge">{item.badge}</span>}
      </span>
      <span className="cc__body">
        <span className="cc__kind">
          {item.no} · {item.kind}
        </span>
        <span className="cc__title">{item.title}</span>
        <span className="cc__sum">{item.summary}</span>
        <span className="cc__go">
          View case study
          <i aria-hidden="true">→</i>
        </span>
      </span>
    </a>
  );
}
