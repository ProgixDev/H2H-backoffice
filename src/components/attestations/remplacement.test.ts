// QUAND « DEMANDER LE REMPLACEMENT » RESTE GRISÉ — et ce que le bouton en dit.
//
// 🔴 PAS APRÈS LE PRÉPAIEMENT (hand-to-hand `20261016008000`). Une vente prépayée garde sa version signée :
// l'application refuse le remplacement aux parties, et la base refuse la demande de l'équipe. Le bouton le dit
// avant que la base ait à le faire.
import { describe, expect, it, vi } from "vitest";
import { remplacementBloque } from "./GestesAttestation";
import type { AttestationLigne } from "@/lib/attestations/types";

vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/attestations/actions", () => ({ demanderRemplacement: vi.fn(), relancerAttestation: vi.fn() }));

const signee = (o: Partial<AttestationLigne> = {}): AttestationLigne => ({
  commande_id: "c0000000-0000-4000-a000-000000000001",
  numero: "HTH-2026-000001",
  statut_commande: "pending",
  attestation_id: "a0000000-0000-4000-a000-000000000001",
  version: 1,
  versions: 1,
  statut: "final_available",
  libelle: "Signée",
  erreur: null,
  attendu: null,
  acheteur: "acheteur",
  vendeur: "vendeur",
  ouverte_le: "2026-10-16T10:00:00Z",
  maj_le: "2026-10-16T10:00:00Z",
  document: true,
  derniere_relance_le: null,
  derniere_relance: null,
  remplacement_demande_le: null,
  historique: [],
  relances: [],
  est_test: false,
  ...o,
});

describe("« Demander le remplacement »", () => {
  it("✅ reste permis pour une version signée dont la vente attend son prépaiement", () => {
    expect(remplacementBloque(signee())).toBeNull();
    expect(remplacementBloque(signee({ statut: "signed_by_both" }))).toBeNull();
  });

  it("🔴 se grise dès que le prépaiement est engagé — à chaque étape qui suit", () => {
    for (const statut_commande of ["awaiting_seller", "confirmed", "picked_up", "in_transit", "delivered"] as const) {
      expect(remplacementBloque(signee({ statut_commande }))).toMatch(/prépaiement de cette vente est engagé/);
    }
  });

  it("⚠️ et une vente annulée le dit autrement : il n’y a plus rien à refaire", () => {
    expect(remplacementBloque(signee({ statut_commande: "cancelled" }))).toMatch(/annulée/);
    expect(remplacementBloque(signee({ statut_commande: "refunded" }))).toMatch(/annulée/);
  });

  it("garde ses deux refus d’avant : la version non signée, la demande déjà faite", () => {
    expect(remplacementBloque(signee({ statut: "awaiting_buyer_decision" }))).toMatch(/signée des deux côtés/);
    expect(remplacementBloque(signee({ remplacement_demande_le: "2026-10-16T11:00:00Z" }))).toMatch(/déjà demandé/);
  });
});
