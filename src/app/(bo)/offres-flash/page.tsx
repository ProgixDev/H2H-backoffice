import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/offres-flash").titre };

export default function Page() {
  return <PageRubrique chemin="/offres-flash" animation="flash" />;
}
