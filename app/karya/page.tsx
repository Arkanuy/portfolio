import type { Metadata } from "next";
import Catalog from "@/components/browse/catalog";
import { records } from "@/lib/records";

export const metadata: Metadata = {
  title: "Kartu",
  description: "Katalog catatan kerja: spesifikasi, pratinjau, diagram, dan cara pakainya.",
};

export default function CardsPage() {
  return <Catalog />;
}
