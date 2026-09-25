import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/classement-et-pepites").titre };

export default function Page() {
  return <PageRubrique chemin="/classement-et-pepites" animation="Diamond" />;
}
