import type { Metadata } from "next";
import { AVenir } from "@/components/bo/AVenir";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/a-traiter");

export const metadata: Metadata = { title: rubrique.titre };

export default function Page() {
  return <AVenir rubrique={rubrique} animation="siren" />;
}
