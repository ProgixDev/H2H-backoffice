import { redirect } from "next/navigation";

// L'accueil est le poste de supervision : c'est là que le cahier place la vue
// immédiate de la situation (« instruction centrale au développeur »).
export default function Accueil() {
  redirect("/activite-en-direct");
}
