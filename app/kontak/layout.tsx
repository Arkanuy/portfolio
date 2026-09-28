import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Arkan Mustofa about business systems, web apps, analysis, or automation.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
