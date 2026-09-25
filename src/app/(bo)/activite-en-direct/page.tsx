import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/activite-en-direct").titre };

export default function Page() {
  return <PageRubrique chemin="/activite-en-direct" animation="handoff" />;
}
