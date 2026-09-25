import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/tableau-de-bord").titre };

export default function Page() {
  return <PageRubrique chemin="/tableau-de-bord" animation="coin" />;
}
