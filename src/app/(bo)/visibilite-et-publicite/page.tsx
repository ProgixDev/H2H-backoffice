import type { Metadata } from "next";
import { PageRubrique } from "@/components/bo/PageRubrique";
import { rubriqueObligatoire } from "@/lib/navigation";

export const metadata: Metadata = { title: rubriqueObligatoire("/visibilite-et-publicite").titre };

export default function Page() {
  return <PageRubrique chemin="/visibilite-et-publicite" animation="fire" />;
}
