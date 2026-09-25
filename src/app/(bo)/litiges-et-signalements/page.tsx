import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/litiges-et-signalements").titre };

export default function Page() {
  return <PageRubrique chemin="/litiges-et-signalements" animation="vault-shield" />;
}
