import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/h2h-logistic").titre };

export default function Page() {
  return <PageRubrique chemin="/h2h-logistic" animation="car" />;
}
