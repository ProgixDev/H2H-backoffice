import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/live-shopping").titre };

export default function Page() {
  return <PageRubrique chemin="/live-shopping" animation="live" />;
}
