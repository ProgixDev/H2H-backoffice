import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/documents-et-parametres").titre };

export default function Page() {
  return <PageRubrique chemin="/documents-et-parametres" animation="vault-shield" />;
}
