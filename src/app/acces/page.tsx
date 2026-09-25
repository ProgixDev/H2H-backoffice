import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { EcranAcces } from "@/components/bo/EcranAcces";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { chargerMoi } from "@/lib/equipe/moi";
import type { Moi } from "@/lib/equipe/types";

export const metadata: Metadata = { title: "Accès" };
export const dynamic = "force-dynamic";

/** Pourquoi ce compte n'entre pas (encore) au back-office — et quoi faire. */
export default async function Acces() {
  let moi: Moi;
  try {
    moi = await chargerMoi();
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <LectureEchouee titre="Le back-office ne répond pas" />
      </main>
    );
  }
  if (moi.membre) redirect("/");

  const utilisateur = await currentUser();
  return (
    <EcranAcces
      raison={moi.raison}
      invitation={moi.invitation}
      equipier={moi.equipier}
      email={utilisateur?.primaryEmailAddress?.emailAddress ?? null}
    />
  );
}
