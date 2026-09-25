import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/paiements-et-comptabilite").titre };

export default function Page() {
  return <PageRubrique chemin="/paiements-et-comptabilite" animation="coin" />;
}
