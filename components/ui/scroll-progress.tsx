"use client";

import { useEffect, useState } from "react";

/** Bilah kemajuan baca di paling atas. */
export default function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="prog" aria-hidden="true">
      <span className="prog__bar" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}
