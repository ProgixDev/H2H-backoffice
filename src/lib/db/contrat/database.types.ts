// Copie de hand-to-hand@e51a6f7 : supabase/types/database.types.ts. Ne pas modifier : npm run sync:contrat.
// Types de la base, générés depuis la production par `npm run types`. Ne pas modifier à la main.
// Base : 20260926006000_les_operations_automatiques_se_voient.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string | null
          commune_code: string | null
          country: string
          created_at: string
          geo: unknown
          id: string
          is_default: boolean
          label: string
          line1: string
          postal_code: string | null
          profile_id: string
          region: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          commune_code?: string | null
          country?: string
          created_at?: string
          geo?: unknown
          id?: string
          is_default?: boolean
          label?: string
          line1: string
          postal_code?: string | null
          profile_id: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          commune_code?: string | null
          country?: string
          created_at?: string
          geo?: unknown
          id?: string
          is_default?: boolean
          label?: string
          line1?: string
          postal_code?: string | null
          profile_id?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      attestation_photos: {
        Row: {
          attestation_id: string
          captured_at: string
          created_at: string
          id: string
          in_app: boolean
          legibility_confirmed: boolean
          slot: string
          storage_path: string
        }
        Insert: {
          attestation_id: string
          captured_at: string
          created_at?: string
          id?: string
          in_app: boolean
          legibility_confirmed?: boolean
          slot: string
          storage_path: string
        }
        Update: {
          attestation_id?: string
          captured_at?: string
          created_at?: string
          id?: string
          in_app?: boolean
          legibility_confirmed?: boolean
          slot?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "attestation_photos_attestation_id_fkey"
            columns: ["attestation_id"]
            isOneToOne: false
            referencedRelation: "attestations"
            referencedColumns: ["id"]
          },
        ]
      }
      attestations: {
        Row: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        Insert: {
          buyer_address?: string | null
          buyer_decision?: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name?: string | null
          buyer_pseudonym?: string | null
          buyer_signed_at?: string | null
          confirmed_items?: Json
          created_at?: string
          document_path?: string | null
          frozen_at?: string | null
          id?: string
          integrity_hash?: string | null
          order_id?: string | null
          proof_file_path?: string | null
          seller_address?: string | null
          seller_declarations?: Json
          seller_id: string
          seller_legal_name?: string | null
          seller_pseudonym?: string | null
          seller_signed_at?: string | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at?: string
          version_number: number
        }
        Update: {
          buyer_address?: string | null
          buyer_decision?: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id?: string
          buyer_legal_name?: string | null
          buyer_pseudonym?: string | null
          buyer_signed_at?: string | null
          confirmed_items?: Json
          created_at?: string
          document_path?: string | null
          frozen_at?: string | null
          id?: string
          integrity_hash?: string | null
          order_id?: string | null
          proof_file_path?: string | null
          seller_address?: string | null
          seller_declarations?: Json
          seller_id?: string
          seller_legal_name?: string | null
          seller_pseudonym?: string | null
          seller_signed_at?: string | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["attestation_status"]
          transaction_ref?: string
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "attestations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_documents: {
        Row: {
          amount_cents: number | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["cancellation_kind"]
          occurred_at: string
          order_id: string
          ref_number: string
          snapshot: Json
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["cancellation_kind"]
          occurred_at: string
          order_id: string
          ref_number: string
          snapshot?: Json
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["cancellation_kind"]
          occurred_at?: string
          order_id?: string
          ref_number?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_settlements: {
        Row: {
          amount_cents: number
          carrier: Database["public"]["Enums"]["shipping_method"]
          created_at: string
          id: string
          orders_count: number
          recorded_by: string
          reference: string
          txn_group_id: string
        }
        Insert: {
          amount_cents: number
          carrier: Database["public"]["Enums"]["shipping_method"]
          created_at?: string
          id?: string
          orders_count: number
          recorded_by: string
          reference: string
          txn_group_id: string
        }
        Update: {
          amount_cents?: number
          carrier?: Database["public"]["Enums"]["shipping_method"]
          created_at?: string
          id?: string
          orders_count?: number
          recorded_by?: string
          reference?: string
          txn_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrier_settlements_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_settlements_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          added_at: string
          product_id: string
          profile_id: string
          quantity: number
        }
        Insert: {
          added_at?: string
          product_id: string
          profile_id: string
          quantity: number
        }
        Update: {
          added_at?: string
          product_id?: string
          profile_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          contact_only: boolean
          emoji: string | null
          family_id: string | null
          icon: string | null
          id: string
          label_en: string | null
          label_fr: string
          sort_order: number | null
          xxl_only: boolean
        }
        Insert: {
          contact_only?: boolean
          emoji?: string | null
          family_id?: string | null
          icon?: string | null
          id: string
          label_en?: string | null
          label_fr: string
          sort_order?: number | null
          xxl_only?: boolean
        }
        Update: {
          contact_only?: boolean
          emoji?: string | null
          family_id?: string | null
          icon?: string | null
          id?: string
          label_en?: string | null
          label_fr?: string
          sort_order?: number | null
          xxl_only?: boolean
        }
        Relationships: []
      }
      chargebacks: {
        Row: {
          amount_cents: number
          closed_at: string | null
          evidence_due_by: string | null
          fee_cents: number
          funds_reinstated_at: string | null
          funds_withdrawn_at: string | null
          id: string
          opened_at: string
          order_id: string
          outcome: string | null
          reason: string | null
          status: string | null
          stripe_charge_id: string | null
          stripe_dispute_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          closed_at?: string | null
          evidence_due_by?: string | null
          fee_cents?: number
          funds_reinstated_at?: string | null
          funds_withdrawn_at?: string | null
          id?: string
          opened_at?: string
          order_id: string
          outcome?: string | null
          reason?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_dispute_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          closed_at?: string | null
          evidence_due_by?: string | null
          fee_cents?: number
          funds_reinstated_at?: string | null
          funds_withdrawn_at?: string | null
          id?: string
          opened_at?: string
          order_id?: string
          outcome?: string | null
          reason?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_dispute_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chargebacks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chargebacks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chargebacks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_observations: {
        Row: {
          author: Database["public"]["Enums"]["claim_party"]
          claim_id: string
          created_at: string
          id: string
          text: string
        }
        Insert: {
          author: Database["public"]["Enums"]["claim_party"]
          claim_id: string
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          author?: Database["public"]["Enums"]["claim_party"]
          claim_id?: string
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_observations_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "order_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_proofs: {
        Row: {
          author: Database["public"]["Enums"]["claim_party"]
          captured_at: string
          claim_id: string
          complementary: boolean
          created_at: string
          id: string
          in_app: boolean
          kind: Database["public"]["Enums"]["claim_proof_kind"]
          storage_path: string
          subtype: string
        }
        Insert: {
          author: Database["public"]["Enums"]["claim_party"]
          captured_at: string
          claim_id: string
          complementary?: boolean
          created_at?: string
          id?: string
          in_app?: boolean
          kind: Database["public"]["Enums"]["claim_proof_kind"]
          storage_path: string
          subtype: string
        }
        Update: {
          author?: Database["public"]["Enums"]["claim_party"]
          captured_at?: string
          claim_id?: string
          complementary?: boolean
          created_at?: string
          id?: string
          in_app?: boolean
          kind?: Database["public"]["Enums"]["claim_proof_kind"]
          storage_path?: string
          subtype?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_proofs_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "order_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_returns: {
        Row: {
          carrier: string
          claim_id: string
          contestation_note: string | null
          contestation_reason: string | null
          created_at: string
          id: string
          packaging_conditions: string | null
          received_at: string | null
          return_address: string
          ship_date: string | null
          tracking_mode: Database["public"]["Enums"]["return_tracking_mode"]
          tracking_number: string | null
        }
        Insert: {
          carrier: string
          claim_id: string
          contestation_note?: string | null
          contestation_reason?: string | null
          created_at?: string
          id?: string
          packaging_conditions?: string | null
          received_at?: string | null
          return_address: string
          ship_date?: string | null
          tracking_mode: Database["public"]["Enums"]["return_tracking_mode"]
          tracking_number?: string | null
        }
        Update: {
          carrier?: string
          claim_id?: string
          contestation_note?: string | null
          contestation_reason?: string | null
          created_at?: string
          id?: string
          packaging_conditions?: string | null
          received_at?: string | null
          return_address?: string
          ship_date?: string | null
          tracking_mode?: Database["public"]["Enums"]["return_tracking_mode"]
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_returns_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: true
            referencedRelation: "order_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_seller_responses: {
        Row: {
          authenticity_answer: string | null
          claim_id: string
          conformity_answer: string | null
          consult_authorized: boolean
          good_faith: boolean
          id: string
          observations: string
          partial_amount_cents: number | null
          partial_reason: string | null
          proposal: string
          responded_at: string
          return_address: string | null
          return_carrier: string | null
          return_comment: string | null
          return_recipient: string | null
        }
        Insert: {
          authenticity_answer?: string | null
          claim_id: string
          conformity_answer?: string | null
          consult_authorized: boolean
          good_faith: boolean
          id?: string
          observations: string
          partial_amount_cents?: number | null
          partial_reason?: string | null
          proposal: string
          responded_at?: string
          return_address?: string | null
          return_carrier?: string | null
          return_comment?: string | null
          return_recipient?: string | null
        }
        Update: {
          authenticity_answer?: string | null
          claim_id?: string
          conformity_answer?: string | null
          consult_authorized?: boolean
          good_faith?: boolean
          id?: string
          observations?: string
          partial_amount_cents?: number | null
          partial_reason?: string | null
          proposal?: string
          responded_at?: string
          return_address?: string | null
          return_carrier?: string | null
          return_comment?: string | null
          return_recipient?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_seller_responses_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: true
            referencedRelation: "order_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      convention_acceptances: {
        Row: {
          accepted_at: string
          debit_authorized: boolean
          iban_tail: string | null
          id: string
          locale: string
          profile_id: string
          representative: string
          scope: Database["public"]["Enums"]["app_role"]
          signature_path: string
          siret: string | null
          stripe_external_account_id: string | null
          version: string
        }
        Insert: {
          accepted_at?: string
          debit_authorized?: boolean
          iban_tail?: string | null
          id?: string
          locale?: string
          profile_id: string
          representative: string
          scope: Database["public"]["Enums"]["app_role"]
          signature_path: string
          siret?: string | null
          stripe_external_account_id?: string | null
          version: string
        }
        Update: {
          accepted_at?: string
          debit_authorized?: boolean
          iban_tail?: string | null
          id?: string
          locale?: string
          profile_id?: string
          representative?: string
          scope?: Database["public"]["Enums"]["app_role"]
          signature_path?: string
          siret?: string | null
          stripe_external_account_id?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "convention_acceptances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convention_acceptances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          last_read_at: string | null
          profile_id: string
          role: string | null
          unread_count: number
        }
        Insert: {
          conversation_id: string
          last_read_at?: string | null
          profile_id: string
          role?: string | null
          unread_count?: number
        }
        Update: {
          conversation_id?: string
          last_read_at?: string | null
          profile_id?: string
          role?: string | null
          unread_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          dm_key: string | null
          id: string
          kind: Database["public"]["Enums"]["conversation_kind"]
          order_id: string | null
          product_id: string | null
          shipment_id: string | null
          shipping_method: Database["public"]["Enums"]["shipping_method"] | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dm_key?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["conversation_kind"]
          order_id?: string | null
          product_id?: string | null
          shipment_id?: string | null
          shipping_method?:
            | Database["public"]["Enums"]["shipping_method"]
            | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dm_key?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["conversation_kind"]
          order_id?: string | null
          product_id?: string | null
          shipment_id?: string | null
          shipping_method?:
            | Database["public"]["Enums"]["shipping_method"]
            | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_profiles: {
        Row: {
          created_at: string
          documents_verified: boolean
          is_online: boolean
          profile_id: string
          rating: number | null
          total_deliveries: number
          transport_types: Database["public"]["Enums"]["transport_mode"][]
          updated_at: string
          vehicle_info: string | null
          vehicle_plate: string | null
        }
        Insert: {
          created_at?: string
          documents_verified?: boolean
          is_online?: boolean
          profile_id: string
          rating?: number | null
          total_deliveries?: number
          transport_types?: Database["public"]["Enums"]["transport_mode"][]
          updated_at?: string
          vehicle_info?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          created_at?: string
          documents_verified?: boolean
          is_online?: boolean
          profile_id?: string
          rating?: number | null
          total_deliveries?: number
          transport_types?: Database["public"]["Enums"]["transport_mode"][]
          updated_at?: string
          vehicle_info?: string | null
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courier_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courier_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      courtage_listings: {
        Row: {
          created_at: string
          exclu_attempts: number
          flash_wave_count: number
          id: string
          product_id: string
          propositions_ends_at: string
          rechoice_ends_at: string | null
          selection_mode:
            | Database["public"]["Enums"]["courtage_selection_mode"]
            | null
          seller_choice_ends_at: string | null
          sold_to_buyer_id: string | null
          status: Database["public"]["Enums"]["courtage_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          exclu_attempts?: number
          flash_wave_count?: number
          id?: string
          product_id: string
          propositions_ends_at: string
          rechoice_ends_at?: string | null
          selection_mode?:
            | Database["public"]["Enums"]["courtage_selection_mode"]
            | null
          seller_choice_ends_at?: string | null
          sold_to_buyer_id?: string | null
          status?: Database["public"]["Enums"]["courtage_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          exclu_attempts?: number
          flash_wave_count?: number
          id?: string
          product_id?: string
          propositions_ends_at?: string
          rechoice_ends_at?: string | null
          selection_mode?:
            | Database["public"]["Enums"]["courtage_selection_mode"]
            | null
          seller_choice_ends_at?: string | null
          sold_to_buyer_id?: string | null
          status?: Database["public"]["Enums"]["courtage_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courtage_listings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courtage_listings_sold_to_buyer_id_fkey"
            columns: ["sold_to_buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courtage_listings_sold_to_buyer_id_fkey"
            columns: ["sold_to_buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      courtage_propositions: {
        Row: {
          amount_cents: number
          anonymized: boolean
          buyer_id: string
          created_at: string
          h2h_logistic_compatible: boolean | null
          hidden: boolean
          id: string
          listing_id: string
          message: string | null
          preferred_handover:
            | Database["public"]["Enums"]["courtage_handover"]
            | null
          updated_at: string
          withdrawn: boolean
        }
        Insert: {
          amount_cents: number
          anonymized?: boolean
          buyer_id: string
          created_at?: string
          h2h_logistic_compatible?: boolean | null
          hidden?: boolean
          id?: string
          listing_id: string
          message?: string | null
          preferred_handover?:
            | Database["public"]["Enums"]["courtage_handover"]
            | null
          updated_at?: string
          withdrawn?: boolean
        }
        Update: {
          amount_cents?: number
          anonymized?: boolean
          buyer_id?: string
          created_at?: string
          h2h_logistic_compatible?: boolean | null
          hidden?: boolean
          id?: string
          listing_id?: string
          message?: string | null
          preferred_handover?:
            | Database["public"]["Enums"]["courtage_handover"]
            | null
          updated_at?: string
          withdrawn?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "courtage_propositions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courtage_propositions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courtage_propositions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "courtage_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      courtage_purchase_accesses: {
        Row: {
          buyer_id: string
          created_at: string
          expires_at: string
          granted_at: string
          id: string
          listing_id: string
          mode: Database["public"]["Enums"]["courtage_selection_mode"]
          status: Database["public"]["Enums"]["purchase_access_status"]
          wave_index: number | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          expires_at: string
          granted_at?: string
          id?: string
          listing_id: string
          mode: Database["public"]["Enums"]["courtage_selection_mode"]
          status?: Database["public"]["Enums"]["purchase_access_status"]
          wave_index?: number | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          expires_at?: string
          granted_at?: string
          id?: string
          listing_id?: string
          mode?: Database["public"]["Enums"]["courtage_selection_mode"]
          status?: Database["public"]["Enums"]["purchase_access_status"]
          wave_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courtage_purchase_accesses_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courtage_purchase_accesses_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courtage_purchase_accesses_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "courtage_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_attempts: {
        Row: {
          attempt_number: number
          completed_at: string | null
          created_at: string
          failure_note: string | null
          failure_reason:
            | Database["public"]["Enums"]["delivery_failure_reason"]
            | null
          hub_id: string | null
          id: string
          mission_id: string
          scheduled_at: string | null
          status: Database["public"]["Enums"]["attempt_status"]
          transporter_id: string | null
        }
        Insert: {
          attempt_number: number
          completed_at?: string | null
          created_at?: string
          failure_note?: string | null
          failure_reason?:
            | Database["public"]["Enums"]["delivery_failure_reason"]
            | null
          hub_id?: string | null
          id?: string
          mission_id: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["attempt_status"]
          transporter_id?: string | null
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          failure_note?: string | null
          failure_reason?:
            | Database["public"]["Enums"]["delivery_failure_reason"]
            | null
          hub_id?: string | null
          id?: string
          mission_id?: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["attempt_status"]
          transporter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_attempts_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_attempts_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_attempts_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_attempts_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_attempts_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      demandes_hors_hub: {
        Row: {
          adresse_proposee: string
          created_at: string
          decide_le: string | null
          decideur_id: string
          demandeur_id: string
          etape: Database["public"]["Enums"]["hub_etape"]
          expire_le: string
          frais_cents: number | null
          id: string
          mission_id: string
          motif: string | null
          motif_refus: string | null
          statut: Database["public"]["Enums"]["hors_hub_statut"]
          updated_at: string
        }
        Insert: {
          adresse_proposee: string
          created_at?: string
          decide_le?: string | null
          decideur_id: string
          demandeur_id: string
          etape: Database["public"]["Enums"]["hub_etape"]
          expire_le: string
          frais_cents?: number | null
          id?: string
          mission_id: string
          motif?: string | null
          motif_refus?: string | null
          statut?: Database["public"]["Enums"]["hors_hub_statut"]
          updated_at?: string
        }
        Update: {
          adresse_proposee?: string
          created_at?: string
          decide_le?: string | null
          decideur_id?: string
          demandeur_id?: string
          etape?: Database["public"]["Enums"]["hub_etape"]
          expire_le?: string
          frais_cents?: number | null
          id?: string
          mission_id?: string
          motif?: string | null
          motif_refus?: string | null
          statut?: Database["public"]["Enums"]["hors_hub_statut"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demandes_hors_hub_decideur_id_fkey"
            columns: ["decideur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_hors_hub_decideur_id_fkey"
            columns: ["decideur_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_hors_hub_demandeur_id_fkey"
            columns: ["demandeur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_hors_hub_demandeur_id_fkey"
            columns: ["demandeur_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_hors_hub_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_hors_hub_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          app: string
          created_at: string
          expo_push_token: string
          id: string
          last_seen_at: string
          platform: string | null
          profile_id: string
        }
        Insert: {
          app: string
          created_at?: string
          expo_push_token: string
          id?: string
          last_seen_at?: string
          platform?: string | null
          profile_id: string
        }
        Update: {
          app?: string
          created_at?: string
          expo_push_token?: string
          id?: string
          last_seen_at?: string
          platform?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_impact: {
        Row: {
          deliveries_all_time: number
          kg_saved_last_month: number
          total_kg_saved_all_time: number
          total_kg_saved_month: number
          transporter_id: string
          updated_at: string
        }
        Insert: {
          deliveries_all_time?: number
          kg_saved_last_month?: number
          total_kg_saved_all_time?: number
          total_kg_saved_month?: number
          transporter_id: string
          updated_at?: string
        }
        Update: {
          deliveries_all_time?: number
          kg_saved_last_month?: number
          total_kg_saved_all_time?: number
          total_kg_saved_month?: number
          transporter_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eco_impact_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eco_impact_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: true
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_impact_month: {
        Row: {
          deliveries: number
          kg_saved: number
          month: string
          transporter_id: string
        }
        Insert: {
          deliveries?: number
          kg_saved?: number
          month: string
          transporter_id: string
        }
        Update: {
          deliveries?: number
          kg_saved?: number
          month?: string
          transporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eco_impact_month_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eco_impact_month_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_propositions: {
        Row: {
          cash_adjustment_cents: number
          created_at: string
          id: string
          logistics: Database["public"]["Enums"]["exchange_logistics"]
          message: string | null
          proposed_product_ids: string[]
          proposer_id: string
          resulting_order_id: string | null
          status: Database["public"]["Enums"]["exchange_status"]
          target_product_id: string
          updated_at: string
        }
        Insert: {
          cash_adjustment_cents?: number
          created_at?: string
          id?: string
          logistics?: Database["public"]["Enums"]["exchange_logistics"]
          message?: string | null
          proposed_product_ids?: string[]
          proposer_id: string
          resulting_order_id?: string | null
          status?: Database["public"]["Enums"]["exchange_status"]
          target_product_id: string
          updated_at?: string
        }
        Update: {
          cash_adjustment_cents?: number
          created_at?: string
          id?: string
          logistics?: Database["public"]["Enums"]["exchange_logistics"]
          message?: string | null
          proposed_product_ids?: string[]
          proposer_id?: string
          resulting_order_id?: string | null
          status?: Database["public"]["Enums"]["exchange_status"]
          target_product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_propositions_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchange_propositions_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchange_propositions_target_product_id_fkey"
            columns: ["target_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchange_resulting_order_fk"
            columns: ["resulting_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchange_resulting_order_fk"
            columns: ["resulting_order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchange_resulting_order_fk"
            columns: ["resulting_order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_hubs: {
        Row: {
          created_at: string
          hub_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          hub_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          hub_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_hubs_hub_fk"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_hubs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_hubs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_transporters: {
        Row: {
          created_at: string
          profile_id: string
          transporter_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          transporter_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          transporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_transporters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_transporters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_transporters_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_transporters_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      fiche_colis: {
        Row: {
          doc_path: string | null
          external_tracking_ref: string | null
          generated_at: string
          id: string
          method: Database["public"]["Enums"]["shipping_method"]
          order_id: string
          shipment_id: string
          tracking_number: string
        }
        Insert: {
          doc_path?: string | null
          external_tracking_ref?: string | null
          generated_at?: string
          id?: string
          method: Database["public"]["Enums"]["shipping_method"]
          order_id: string
          shipment_id: string
          tracking_number: string
        }
        Update: {
          doc_path?: string | null
          external_tracking_ref?: string | null
          generated_at?: string
          id?: string
          method?: Database["public"]["Enums"]["shipping_method"]
          order_id?: string
          shipment_id?: string
          tracking_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiche_colis_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiche_colis_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiche_colis_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiche_colis_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: true
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_applications: {
        Row: {
          address: string
          applicant_id: string
          business_id: string | null
          capacity: number
          category: Database["public"]["Enums"]["business_category"]
          city: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          hub_id: string | null
          id: string
          latitude: number
          longitude: number
          message: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          region: string | null
          status: Database["public"]["Enums"]["hub_application_status"]
          updated_at: string
        }
        Insert: {
          address: string
          applicant_id: string
          business_id?: string | null
          capacity: number
          category?: Database["public"]["Enums"]["business_category"]
          city: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          hub_id?: string | null
          id?: string
          latitude: number
          longitude: number
          message?: string | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["hub_application_status"]
          updated_at?: string
        }
        Update: {
          address?: string
          applicant_id?: string
          business_id?: string | null
          capacity?: number
          category?: Database["public"]["Enums"]["business_category"]
          city?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          hub_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          message?: string | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["hub_application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_applications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "relais_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_applications_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_applications_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_applications_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_presence: {
        Row: {
          accuracy_m: number | null
          attempts: number
          created_at: string
          declared_at: string
          distance_m: number
          etape: Database["public"]["Enums"]["hub_etape"]
          hub_id: string
          id: string
          in_zone: boolean
          late_minutes: number | null
          latitude: number
          longitude: number
          mission_id: string
          partie: Database["public"]["Enums"]["hub_partie"]
          profile_id: string
          rendezvous_at: string | null
          updated_at: string
          validated_at: string | null
          zone_radius_m: number
        }
        Insert: {
          accuracy_m?: number | null
          attempts?: number
          created_at?: string
          declared_at?: string
          distance_m: number
          etape: Database["public"]["Enums"]["hub_etape"]
          hub_id: string
          id?: string
          in_zone: boolean
          late_minutes?: number | null
          latitude: number
          longitude: number
          mission_id: string
          partie: Database["public"]["Enums"]["hub_partie"]
          profile_id: string
          rendezvous_at?: string | null
          updated_at?: string
          validated_at?: string | null
          zone_radius_m: number
        }
        Update: {
          accuracy_m?: number | null
          attempts?: number
          created_at?: string
          declared_at?: string
          distance_m?: number
          etape?: Database["public"]["Enums"]["hub_etape"]
          hub_id?: string
          id?: string
          in_zone?: boolean
          late_minutes?: number | null
          latitude?: number
          longitude?: number
          mission_id?: string
          partie?: Database["public"]["Enums"]["hub_partie"]
          profile_id?: string
          rendezvous_at?: string | null
          updated_at?: string
          validated_at?: string | null
          zone_radius_m?: number
        }
        Relationships: [
          {
            foreignKeyName: "hub_presence_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_presence_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_presence_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_presence_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_presence_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_reports: {
        Row: {
          created_at: string
          explanation: string | null
          hub_id: string | null
          hub_snapshot: Json
          id: string
          mission_id: string | null
          proofs: Json
          reason: Database["public"]["Enums"]["hub_report_reason"]
          reporter_id: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          hub_id?: string | null
          hub_snapshot: Json
          id?: string
          mission_id?: string | null
          proofs?: Json
          reason: Database["public"]["Enums"]["hub_report_reason"]
          reporter_id: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          hub_id?: string | null
          hub_snapshot?: Json
          id?: string
          mission_id?: string | null
          proofs?: Json
          reason?: Database["public"]["Enums"]["hub_report_reason"]
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_reports_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      hubs: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          detail_affiche: string
          geo: unknown
          id: string
          landmark: string
          latitude: number
          longitude: number
          map_point_validated_at: string | null
          map_point_validated_by: string | null
          name: string
          photos: string[]
          place_type: Database["public"]["Enums"]["hub_place_type"]
          region: string | null
          status: Database["public"]["Enums"]["hub_status"]
          updated_at: string
          zone_radius_m: number
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          detail_affiche: string
          geo: unknown
          id?: string
          landmark: string
          latitude: number
          longitude: number
          map_point_validated_at?: string | null
          map_point_validated_by?: string | null
          name?: string
          photos?: string[]
          place_type: Database["public"]["Enums"]["hub_place_type"]
          region?: string | null
          status?: Database["public"]["Enums"]["hub_status"]
          updated_at?: string
          zone_radius_m?: number
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          detail_affiche?: string
          geo?: unknown
          id?: string
          landmark?: string
          latitude?: number
          longitude?: number
          map_point_validated_at?: string | null
          map_point_validated_by?: string | null
          name?: string
          photos?: string[]
          place_type?: Database["public"]["Enums"]["hub_place_type"]
          region?: string | null
          status?: Database["public"]["Enums"]["hub_status"]
          updated_at?: string
          zone_radius_m?: number
        }
        Relationships: [
          {
            foreignKeyName: "hubs_map_point_validated_by_fkey"
            columns: ["map_point_validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubs_map_point_validated_by_fkey"
            columns: ["map_point_validated_by"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_declarations: {
        Row: {
          accuracy_confirmed: boolean
          answers: Json
          comment: string | null
          contestation_deadline: string | null
          contests_id: string | null
          created_at: string
          declarant_id: string
          declarant_role: Database["public"]["Enums"]["declarant_role"]
          declared_at: string
          geo: unknown
          hub_id: string | null
          id: string
          mission_id: string | null
          mission_status: Database["public"]["Enums"]["mission_form_status"]
          outcome: string | null
          proof_uris: string[]
          reason: string | null
          rendezvous_at: string
          shipment_id: string | null
          type: Database["public"]["Enums"]["incident_form_type"]
        }
        Insert: {
          accuracy_confirmed: boolean
          answers?: Json
          comment?: string | null
          contestation_deadline?: string | null
          contests_id?: string | null
          created_at?: string
          declarant_id: string
          declarant_role: Database["public"]["Enums"]["declarant_role"]
          declared_at?: string
          geo?: unknown
          hub_id?: string | null
          id?: string
          mission_id?: string | null
          mission_status?: Database["public"]["Enums"]["mission_form_status"]
          outcome?: string | null
          proof_uris?: string[]
          reason?: string | null
          rendezvous_at: string
          shipment_id?: string | null
          type: Database["public"]["Enums"]["incident_form_type"]
        }
        Update: {
          accuracy_confirmed?: boolean
          answers?: Json
          comment?: string | null
          contestation_deadline?: string | null
          contests_id?: string | null
          created_at?: string
          declarant_id?: string
          declarant_role?: Database["public"]["Enums"]["declarant_role"]
          declared_at?: string
          geo?: unknown
          hub_id?: string | null
          id?: string
          mission_id?: string | null
          mission_status?: Database["public"]["Enums"]["mission_form_status"]
          outcome?: string | null
          proof_uris?: string[]
          reason?: string | null
          rendezvous_at?: string
          shipment_id?: string | null
          type?: Database["public"]["Enums"]["incident_form_type"]
        }
        Relationships: [
          {
            foreignKeyName: "incident_declarations_contests_id_fkey"
            columns: ["contests_id"]
            isOneToOne: false
            referencedRelation: "incident_declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_declarations_declarant_id_fkey"
            columns: ["declarant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_declarations_declarant_id_fkey"
            columns: ["declarant_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_declarations_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_declarations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_declarations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_declarations_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          amount_cents: number | null
          created_at: string
          deadline_at: string | null
          decision_note: string | null
          id: string
          mission_id: string | null
          resolved: boolean
          responsible:
            | Database["public"]["Enums"]["incident_responsible"]
            | null
          scenario: string
          shipment_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          deadline_at?: string | null
          decision_note?: string | null
          id?: string
          mission_id?: string | null
          resolved?: boolean
          responsible?:
            | Database["public"]["Enums"]["incident_responsible"]
            | null
          scenario: string
          shipment_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          deadline_at?: string | null
          decision_note?: string | null
          id?: string
          mission_id?: string | null
          resolved?: boolean
          responsible?:
            | Database["public"]["Enums"]["incident_responsible"]
            | null
          scenario?: string
          shipment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_shipment_fk"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          claim_type: Database["public"]["Enums"]["claim_type"]
          claimant_id: string
          coverage_cents: number
          created_at: string
          description: string
          handoff_event_id: string | null
          id: string
          insurance_tier: Database["public"]["Enums"]["insurance_tier"]
          order_id: string
          photos: string[]
          refund_cents: number | null
          resolved_at: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["claim_status"]
        }
        Insert: {
          claim_type: Database["public"]["Enums"]["claim_type"]
          claimant_id: string
          coverage_cents?: number
          created_at?: string
          description: string
          handoff_event_id?: string | null
          id?: string
          insurance_tier?: Database["public"]["Enums"]["insurance_tier"]
          order_id: string
          photos?: string[]
          refund_cents?: number | null
          resolved_at?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
        }
        Update: {
          claim_type?: Database["public"]["Enums"]["claim_type"]
          claimant_id?: string
          coverage_cents?: number
          created_at?: string
          description?: string
          handoff_event_id?: string | null
          id?: string
          insurance_tier?: Database["public"]["Enums"]["insurance_tier"]
          order_id?: string
          photos?: string[]
          refund_cents?: number | null
          resolved_at?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_claimant_id_fkey"
            columns: ["claimant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_claimant_id_fkey"
            columns: ["claimant_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_policies: {
        Row: {
          coverage_cents: number
          created_at: string
          id: string
          included: boolean
          premium_cents: number
          shipment_id: string
          tier: Database["public"]["Enums"]["insurance_tier"]
        }
        Insert: {
          coverage_cents: number
          created_at?: string
          id?: string
          included?: boolean
          premium_cents?: number
          shipment_id: string
          tier?: Database["public"]["Enums"]["insurance_tier"]
        }
        Update: {
          coverage_cents?: number
          created_at?: string
          id?: string
          included?: boolean
          premium_cents?: number
          shipment_id?: string
          tier?: Database["public"]["Enums"]["insurance_tier"]
        }
        Relationships: [
          {
            foreignKeyName: "insurance_policies_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: true
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_counters: {
        Row: {
          annee: number
          dernier: number
        }
        Insert: {
          annee: number
          dernier?: number
        }
        Update: {
          annee?: number
          dernier?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          delivery_fee_cents: number
          id: string
          invoice_number: string
          issued_at: string
          order_id: string
          pdf_path: string | null
          service_fee_cents: number
          total_cents: number
        }
        Insert: {
          delivery_fee_cents?: number
          id?: string
          invoice_number: string
          issued_at?: string
          order_id: string
          pdf_path?: string | null
          service_fee_cents?: number
          total_cents: number
        }
        Update: {
          delivery_fee_cents?: number
          id?: string
          invoice_number?: string
          issued_at?: string
          order_id?: string
          pdf_path?: string | null
          service_fee_cents?: number
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
        ]
      }
      je_cherche_boosts: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          demande_id: string
          expires_at: string | null
          id: string
          option_id: Database["public"]["Enums"]["visibility_option"]
          payment_id: string | null
          price_cents: number
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          demande_id: string
          expires_at?: string | null
          id?: string
          option_id: Database["public"]["Enums"]["visibility_option"]
          payment_id?: string | null
          price_cents: number
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          demande_id?: string
          expires_at?: string | null
          id?: string
          option_id?: Database["public"]["Enums"]["visibility_option"]
          payment_id?: string | null
          price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "je_cherche_boosts_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "je_cherche_demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "je_cherche_boosts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      je_cherche_demandes: {
        Row: {
          budget_max_cents: number
          buyer_id: string
          category_id: string | null
          city: string | null
          created_at: string
          delivery_prefs: string[]
          description: string | null
          expires_at: string
          id: string
          job_availability: string | null
          job_contract: string | null
          like_count: number
          photo_pack: Database["public"]["Enums"]["photo_pack"] | null
          proposals_count: number
          status: Database["public"]["Enums"]["je_cherche_status"]
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["je_cherche_urgency"]
          urgent_badge_until: string | null
          view_count: number
          zones: string[]
        }
        Insert: {
          budget_max_cents: number
          buyer_id: string
          category_id?: string | null
          city?: string | null
          created_at?: string
          delivery_prefs?: string[]
          description?: string | null
          expires_at: string
          id?: string
          job_availability?: string | null
          job_contract?: string | null
          like_count?: number
          photo_pack?: Database["public"]["Enums"]["photo_pack"] | null
          proposals_count?: number
          status?: Database["public"]["Enums"]["je_cherche_status"]
          title: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["je_cherche_urgency"]
          urgent_badge_until?: string | null
          view_count?: number
          zones: string[]
        }
        Update: {
          budget_max_cents?: number
          buyer_id?: string
          category_id?: string | null
          city?: string | null
          created_at?: string
          delivery_prefs?: string[]
          description?: string | null
          expires_at?: string
          id?: string
          job_availability?: string | null
          job_contract?: string | null
          like_count?: number
          photo_pack?: Database["public"]["Enums"]["photo_pack"] | null
          proposals_count?: number
          status?: Database["public"]["Enums"]["je_cherche_status"]
          title?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["je_cherche_urgency"]
          urgent_badge_until?: string | null
          view_count?: number
          zones?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "je_cherche_demandes_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "je_cherche_demandes_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "je_cherche_demandes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      je_cherche_favorites: {
        Row: {
          created_at: string
          demande_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          demande_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          demande_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "je_cherche_favorites_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "je_cherche_demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "je_cherche_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "je_cherche_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      je_cherche_photos: {
        Row: {
          created_at: string
          demande_id: string
          id: string
          uri: string
        }
        Insert: {
          created_at?: string
          demande_id: string
          id?: string
          uri: string
        }
        Update: {
          created_at?: string
          demande_id?: string
          id?: string
          uri?: string
        }
        Relationships: [
          {
            foreignKeyName: "je_cherche_photos_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "je_cherche_demandes"
            referencedColumns: ["id"]
          },
        ]
      }
      je_cherche_propositions: {
        Row: {
          created_at: string
          demande_id: string
          id: string
          message: string | null
          product_id: string | null
          seller_id: string
          status: Database["public"]["Enums"]["proposition_status"]
        }
        Insert: {
          created_at?: string
          demande_id: string
          id?: string
          message?: string | null
          product_id?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["proposition_status"]
        }
        Update: {
          created_at?: string
          demande_id?: string
          id?: string
          message?: string | null
          product_id?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["proposition_status"]
        }
        Relationships: [
          {
            foreignKeyName: "je_cherche_propositions_demande_id_fkey"
            columns: ["demande_id"]
            isOneToOne: false
            referencedRelation: "je_cherche_demandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "je_cherche_propositions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "je_cherche_propositions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "je_cherche_propositions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          consentement_le: string | null
          dernier_rapport: string | null
          effacement_demande_le: string | null
          id: string
          id_document_type: string | null
          livemode: boolean
          nom_verifie: string | null
          prenom_verifie: string | null
          profile_id: string
          redigee_le: string | null
          rejection_reason: string | null
          selfie_exige: boolean
          status: Database["public"]["Enums"]["kyc_status"]
          statut_stripe: string | null
          stripe_identity_session_id: string | null
          submitted_at: string
          tentatives_echouees: number
          updated_at: string
          verified_at: string | null
          vu_par_app_le: string | null
          vu_par_webhook_le: string | null
        }
        Insert: {
          consentement_le?: string | null
          dernier_rapport?: string | null
          effacement_demande_le?: string | null
          id?: string
          id_document_type?: string | null
          livemode: boolean
          nom_verifie?: string | null
          prenom_verifie?: string | null
          profile_id: string
          redigee_le?: string | null
          rejection_reason?: string | null
          selfie_exige?: boolean
          status?: Database["public"]["Enums"]["kyc_status"]
          statut_stripe?: string | null
          stripe_identity_session_id?: string | null
          submitted_at?: string
          tentatives_echouees?: number
          updated_at?: string
          verified_at?: string | null
          vu_par_app_le?: string | null
          vu_par_webhook_le?: string | null
        }
        Update: {
          consentement_le?: string | null
          dernier_rapport?: string | null
          effacement_demande_le?: string | null
          id?: string
          id_document_type?: string | null
          livemode?: boolean
          nom_verifie?: string | null
          prenom_verifie?: string | null
          profile_id?: string
          redigee_le?: string | null
          rejection_reason?: string | null
          selfie_exige?: boolean
          status?: Database["public"]["Enums"]["kyc_status"]
          statut_stripe?: string | null
          stripe_identity_session_id?: string | null
          submitted_at?: string
          tentatives_echouees?: number
          updated_at?: string
          verified_at?: string | null
          vu_par_app_le?: string | null
          vu_par_webhook_le?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_accounts: {
        Row: {
          created_at: string
          currency: string
          id: string
          kind: Database["public"]["Enums"]["ledger_account_kind"]
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          kind: Database["public"]["Enums"]["ledger_account_kind"]
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          kind?: Database["public"]["Enums"]["ledger_account_kind"]
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          account_id: string
          amount_cents: number
          claim_id: string | null
          created_at: string
          direction: string
          event: Database["public"]["Enums"]["ledger_event"]
          id: number
          idempotency_key: string
          label: string | null
          metadata: Json
          mission_id: string | null
          order_id: string | null
          package_id: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["tx_status"]
          stripe_object_id: string | null
          txn_group_id: string
        }
        Insert: {
          account_id: string
          amount_cents: number
          claim_id?: string | null
          created_at?: string
          direction: string
          event: Database["public"]["Enums"]["ledger_event"]
          id?: never
          idempotency_key: string
          label?: string | null
          metadata?: Json
          mission_id?: string | null
          order_id?: string | null
          package_id?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          stripe_object_id?: string | null
          txn_group_id: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          claim_id?: string | null
          created_at?: string
          direction?: string
          event?: Database["public"]["Enums"]["ledger_event"]
          id?: never
          idempotency_key?: string
          label?: string | null
          metadata?: Json
          mission_id?: string | null
          order_id?: string | null
          package_id?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          stripe_object_id?: string | null
          txn_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_claim_fk"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "insurance_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_access_requests: {
        Row: {
          decided_at: string | null
          id: string
          product_id: string
          requested_at: string
          requester_id: string
          status: Database["public"]["Enums"]["access_request_status"]
        }
        Insert: {
          decided_at?: string | null
          id?: string
          product_id: string
          requested_at?: string
          requester_id: string
          status?: Database["public"]["Enums"]["access_request_status"]
        }
        Update: {
          decided_at?: string | null
          id?: string
          product_id?: string
          requested_at?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["access_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "listing_access_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_access_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_access_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_edits: {
        Row: {
          changed: Json
          created_at: string
          fee_cents: number
          id: string
          kind: string
          origin: Database["public"]["Enums"]["listing_edit_origin"]
          payment_id: string | null
          product_id: string
        }
        Insert: {
          changed?: Json
          created_at?: string
          fee_cents?: number
          id?: string
          kind?: string
          origin?: Database["public"]["Enums"]["listing_edit_origin"]
          payment_id?: string | null
          product_id: string
        }
        Update: {
          changed?: Json
          created_at?: string
          fee_cents?: number
          id?: string
          kind?: string
          origin?: Database["public"]["Enums"]["listing_edit_origin"]
          payment_id?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_edits_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_edits_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_option_purchases: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["listing_option_kind"]
          payment_id: string | null
          price_cents: number
          product_id: string
          value: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["listing_option_kind"]
          payment_id?: string | null
          price_cents: number
          product_id: string
          value: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["listing_option_kind"]
          payment_id?: string | null
          price_cents?: number
          product_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_option_purchases_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_option_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_reports: {
        Row: {
          created_at: string
          explanation: string
          good_faith: boolean
          id: string
          listing_id: string | null
          priority: Database["public"]["Enums"]["report_priority"]
          proofs: Json
          reason: Database["public"]["Enums"]["listing_report_reason"]
          reporter_id: string
          seller_id: string | null
          snapshot: Json
        }
        Insert: {
          created_at?: string
          explanation: string
          good_faith: boolean
          id?: string
          listing_id?: string | null
          priority?: Database["public"]["Enums"]["report_priority"]
          proofs?: Json
          reason: Database["public"]["Enums"]["listing_report_reason"]
          reporter_id: string
          seller_id?: string | null
          snapshot: Json
        }
        Update: {
          created_at?: string
          explanation?: string
          good_faith?: boolean
          id?: string
          listing_id?: string | null
          priority?: Database["public"]["Enums"]["report_priority"]
          proofs?: Json
          reason?: Database["public"]["Enums"]["listing_report_reason"]
          reporter_id?: string
          seller_id?: string | null
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "listing_reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_reports_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_reports_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      live_articles: {
        Row: {
          exclu_attempts: number
          flash_wave_count: number
          id: string
          outcome: Database["public"]["Enums"]["live_article_outcome"]
          phase: Database["public"]["Enums"]["live_article_phase"] | null
          phase_ends_at: string | null
          position: number
          product_id: string
          rallonge_count: number
          rallonge_presentation_seconds: number
          rallonge_propositions_seconds: number
          selection_mode:
            | Database["public"]["Enums"]["live_selection_mode"]
            | null
          session_id: string
          sold_at: string | null
          sold_to_buyer_id: string | null
        }
        Insert: {
          exclu_attempts?: number
          flash_wave_count?: number
          id?: string
          outcome?: Database["public"]["Enums"]["live_article_outcome"]
          phase?: Database["public"]["Enums"]["live_article_phase"] | null
          phase_ends_at?: string | null
          position: number
          product_id: string
          rallonge_count?: number
          rallonge_presentation_seconds?: number
          rallonge_propositions_seconds?: number
          selection_mode?:
            | Database["public"]["Enums"]["live_selection_mode"]
            | null
          session_id: string
          sold_at?: string | null
          sold_to_buyer_id?: string | null
        }
        Update: {
          exclu_attempts?: number
          flash_wave_count?: number
          id?: string
          outcome?: Database["public"]["Enums"]["live_article_outcome"]
          phase?: Database["public"]["Enums"]["live_article_phase"] | null
          phase_ends_at?: string | null
          position?: number
          product_id?: string
          rallonge_count?: number
          rallonge_presentation_seconds?: number
          rallonge_propositions_seconds?: number
          selection_mode?:
            | Database["public"]["Enums"]["live_selection_mode"]
            | null
          session_id?: string
          sold_at?: string | null
          sold_to_buyer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_articles_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_articles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_articles_sold_to_buyer_id_fkey"
            columns: ["sold_to_buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_articles_sold_to_buyer_id_fkey"
            columns: ["sold_to_buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      live_option_purchases: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["live_option_kind"]
          payment_id: string | null
          price_cents: number
          session_id: string
          value: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["live_option_kind"]
          payment_id?: string | null
          price_cents: number
          session_id: string
          value: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["live_option_kind"]
          payment_id?: string | null
          price_cents?: number
          session_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_option_purchases_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_option_purchases_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_propositions: {
        Row: {
          amount_cents: number
          article_id: string
          buyer_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["proposition_status"]
        }
        Insert: {
          amount_cents: number
          article_id: string
          buyer_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["proposition_status"]
        }
        Update: {
          amount_cents?: number
          article_id?: string
          buyer_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["proposition_status"]
        }
        Relationships: [
          {
            foreignKeyName: "live_propositions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "live_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_propositions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_propositions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      live_purchase_accesses: {
        Row: {
          article_id: string
          buyer_id: string
          created_at: string
          expires_at: string
          granted_at: string
          id: string
          mode: Database["public"]["Enums"]["live_selection_mode"]
          status: Database["public"]["Enums"]["purchase_access_status"]
          wave_index: number | null
        }
        Insert: {
          article_id: string
          buyer_id: string
          created_at?: string
          expires_at: string
          granted_at?: string
          id?: string
          mode: Database["public"]["Enums"]["live_selection_mode"]
          status?: Database["public"]["Enums"]["purchase_access_status"]
          wave_index?: number | null
        }
        Update: {
          article_id?: string
          buyer_id?: string
          created_at?: string
          expires_at?: string
          granted_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["live_selection_mode"]
          status?: Database["public"]["Enums"]["purchase_access_status"]
          wave_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_purchase_accesses_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "live_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_purchase_accesses_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_purchase_accesses_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      live_seats: {
        Row: {
          confirmed_at: string | null
          id: string
          last_seen_at: string | null
          lock_expires_at: string | null
          profile_id: string
          reexpiry_count: number
          released_at: string | null
          reserved_at: string
          role: Database["public"]["Enums"]["live_seat_role"]
          session_id: string
          state: Database["public"]["Enums"]["live_seat_state"]
        }
        Insert: {
          confirmed_at?: string | null
          id?: string
          last_seen_at?: string | null
          lock_expires_at?: string | null
          profile_id: string
          reexpiry_count?: number
          released_at?: string | null
          reserved_at?: string
          role?: Database["public"]["Enums"]["live_seat_role"]
          session_id: string
          state?: Database["public"]["Enums"]["live_seat_state"]
        }
        Update: {
          confirmed_at?: string | null
          id?: string
          last_seen_at?: string | null
          lock_expires_at?: string | null
          profile_id?: string
          reexpiry_count?: number
          released_at?: string | null
          reserved_at?: string
          role?: Database["public"]["Enums"]["live_seat_role"]
          session_id?: string
          state?: Database["public"]["Enums"]["live_seat_state"]
        }
        Relationships: [
          {
            foreignKeyName: "live_seats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_seats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_seats_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          article_total: number | null
          boost_window: Database["public"]["Enums"]["live_boost_window"] | null
          category_id: string | null
          created_at: string
          ended_at: string | null
          format: Database["public"]["Enums"]["live_format"]
          host_id: string
          id: string
          pack_id: Database["public"]["Enums"]["live_pack_id"] | null
          playback_url: string | null
          product_count: number
          product_ids: string[]
          rallonge_seconds_used: number
          replay_uid: string | null
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["live_status"]
          stream_state: Database["public"]["Enums"]["live_stream_state"]
          stream_uid: string | null
          tags: string[]
          thumbnail: string | null
          timer_added_seconds: number
          title: string
          total_seats: number | null
          updated_at: string
          viewer_count: number
          vip_buyer_seats: number | null
        }
        Insert: {
          article_total?: number | null
          boost_window?: Database["public"]["Enums"]["live_boost_window"] | null
          category_id?: string | null
          created_at?: string
          ended_at?: string | null
          format?: Database["public"]["Enums"]["live_format"]
          host_id: string
          id?: string
          pack_id?: Database["public"]["Enums"]["live_pack_id"] | null
          playback_url?: string | null
          product_count?: number
          product_ids?: string[]
          rallonge_seconds_used?: number
          replay_uid?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["live_status"]
          stream_state?: Database["public"]["Enums"]["live_stream_state"]
          stream_uid?: string | null
          tags?: string[]
          thumbnail?: string | null
          timer_added_seconds?: number
          title: string
          total_seats?: number | null
          updated_at?: string
          viewer_count?: number
          vip_buyer_seats?: number | null
        }
        Update: {
          article_total?: number | null
          boost_window?: Database["public"]["Enums"]["live_boost_window"] | null
          category_id?: string | null
          created_at?: string
          ended_at?: string | null
          format?: Database["public"]["Enums"]["live_format"]
          host_id?: string
          id?: string
          pack_id?: Database["public"]["Enums"]["live_pack_id"] | null
          playback_url?: string | null
          product_count?: number
          product_ids?: string[]
          rallonge_seconds_used?: number
          replay_uid?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["live_status"]
          stream_state?: Database["public"]["Enums"]["live_stream_state"]
          stream_uid?: string | null
          tags?: string[]
          thumbnail?: string | null
          timer_added_seconds?: number
          title?: string
          total_seats?: number | null
          updated_at?: string
          viewer_count?: number
          vip_buyer_seats?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_credentials: {
        Row: {
          created_at: string
          rtmps_url: string
          session_id: string
          stream_key: string
        }
        Insert: {
          created_at?: string
          rtmps_url: string
          session_id: string
          stream_key: string
        }
        Update: {
          created_at?: string
          rtmps_url?: string
          session_id?: string
          stream_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_credentials_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          call_duration: string | null
          conversation_id: string
          created_at: string
          delivered: boolean
          exchange_proposition_id: string | null
          id: string
          image_path: string | null
          je_cherche_proposition_id: string | null
          locked: boolean
          offer_amount_cents: number | null
          offer_status: Database["public"]["Enums"]["offer_status"] | null
          read: boolean
          receipt_id: string | null
          sender_id: string | null
          text: string | null
          type: Database["public"]["Enums"]["message_type"]
        }
        Insert: {
          call_duration?: string | null
          conversation_id: string
          created_at?: string
          delivered?: boolean
          exchange_proposition_id?: string | null
          id?: string
          image_path?: string | null
          je_cherche_proposition_id?: string | null
          locked?: boolean
          offer_amount_cents?: number | null
          offer_status?: Database["public"]["Enums"]["offer_status"] | null
          read?: boolean
          receipt_id?: string | null
          sender_id?: string | null
          text?: string | null
          type?: Database["public"]["Enums"]["message_type"]
        }
        Update: {
          call_duration?: string | null
          conversation_id?: string
          created_at?: string
          delivered?: boolean
          exchange_proposition_id?: string | null
          id?: string
          image_path?: string | null
          je_cherche_proposition_id?: string | null
          locked?: boolean
          offer_amount_cents?: number | null
          offer_status?: Database["public"]["Enums"]["offer_status"] | null
          read?: boolean
          receipt_id?: string | null
          sender_id?: string | null
          text?: string | null
          type?: Database["public"]["Enums"]["message_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_exchange_proposition_id_fkey"
            columns: ["exchange_proposition_id"]
            isOneToOne: false
            referencedRelation: "exchange_propositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_je_cherche_proposition_id_fkey"
            columns: ["je_cherche_proposition_id"]
            isOneToOne: false
            referencedRelation: "je_cherche_propositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_groups: {
        Row: {
          created_at: string
          id: string
          route_id: string
          total_earnings_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          route_id: string
          total_earnings_cents?: number
        }
        Update: {
          created_at?: string
          id?: string
          route_id?: string
          total_earnings_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "mission_groups_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "published_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_refusals: {
        Row: {
          mission_id: string
          reason: string | null
          refused_at: string
          route_id: string | null
          transporter_id: string
        }
        Insert: {
          mission_id: string
          reason?: string | null
          refused_at?: string
          route_id?: string | null
          transporter_id: string
        }
        Update: {
          mission_id?: string
          reason?: string | null
          refused_at?: string
          route_id?: string | null
          transporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_refusals_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_refusals_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_refusals_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "published_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_refusals_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_refusals_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          buyer_id: string
          buyer_qr_code: string | null
          cancellation_reason:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          created_at: string
          current_attempt: number
          delay_protocol_id: number
          delivery_hub_chosen_at: string | null
          delivery_hub_id: string | null
          delivery_scheduled_at: string | null
          delivery_validated_at: string | null
          group_id: string | null
          hors_hub_etapes: Database["public"]["Enums"]["hub_etape"][]
          id: string
          is_off_hub: boolean
          is_return: boolean
          max_attempts: number
          off_hub_address: string | null
          order_id: string | null
          package_description: string | null
          package_photo: string | null
          package_weight_kg: number | null
          parcel_format: Database["public"]["Enums"]["parcel_format"] | null
          pickup_hub_id: string | null
          pickup_scheduled_at: string | null
          pickup_validated_at: string | null
          platform_fee_cents: number
          price_cents: number
          proposal_expires_at: string | null
          route_id: string | null
          seller_id: string
          seller_qr_code: string | null
          seller_timer_end: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["mission_status"]
          tolerance_minutes: number
          tracking_number: string | null
          transporter_earning_cents: number
          transporter_id: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          buyer_qr_code?: string | null
          cancellation_reason?:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          created_at?: string
          current_attempt?: number
          delay_protocol_id: number
          delivery_hub_chosen_at?: string | null
          delivery_hub_id?: string | null
          delivery_scheduled_at?: string | null
          delivery_validated_at?: string | null
          group_id?: string | null
          hors_hub_etapes?: Database["public"]["Enums"]["hub_etape"][]
          id?: string
          is_off_hub?: boolean
          is_return?: boolean
          max_attempts?: number
          off_hub_address?: string | null
          order_id?: string | null
          package_description?: string | null
          package_photo?: string | null
          package_weight_kg?: number | null
          parcel_format?: Database["public"]["Enums"]["parcel_format"] | null
          pickup_hub_id?: string | null
          pickup_scheduled_at?: string | null
          pickup_validated_at?: string | null
          platform_fee_cents?: number
          price_cents?: number
          proposal_expires_at?: string | null
          route_id?: string | null
          seller_id: string
          seller_qr_code?: string | null
          seller_timer_end?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          tolerance_minutes?: number
          tracking_number?: string | null
          transporter_earning_cents?: number
          transporter_id?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          buyer_qr_code?: string | null
          cancellation_reason?:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          created_at?: string
          current_attempt?: number
          delay_protocol_id?: number
          delivery_hub_chosen_at?: string | null
          delivery_hub_id?: string | null
          delivery_scheduled_at?: string | null
          delivery_validated_at?: string | null
          group_id?: string | null
          hors_hub_etapes?: Database["public"]["Enums"]["hub_etape"][]
          id?: string
          is_off_hub?: boolean
          is_return?: boolean
          max_attempts?: number
          off_hub_address?: string | null
          order_id?: string | null
          package_description?: string | null
          package_photo?: string | null
          package_weight_kg?: number | null
          parcel_format?: Database["public"]["Enums"]["parcel_format"] | null
          pickup_hub_id?: string | null
          pickup_scheduled_at?: string | null
          pickup_validated_at?: string | null
          platform_fee_cents?: number
          price_cents?: number
          proposal_expires_at?: string | null
          route_id?: string | null
          seller_id?: string
          seller_qr_code?: string | null
          seller_timer_end?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          tolerance_minutes?: number
          tracking_number?: string | null
          transporter_earning_cents?: number
          transporter_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_delivery_hub_id_fkey"
            columns: ["delivery_hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "mission_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_pickup_hub_id_fkey"
            columns: ["pickup_hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "published_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          commandes: boolean
          incoming_package: boolean
          livraisons: boolean
          messages: boolean
          payout: boolean
          pickup_done: boolean
          profile_id: string
          promotions: boolean
          propositions: boolean
          rappels: boolean
          system: boolean
          updated_at: string
        }
        Insert: {
          commandes?: boolean
          incoming_package?: boolean
          livraisons?: boolean
          messages?: boolean
          payout?: boolean
          pickup_done?: boolean
          profile_id: string
          promotions?: boolean
          propositions?: boolean
          rappels?: boolean
          system?: boolean
          updated_at?: string
        }
        Update: {
          commandes?: boolean
          incoming_package?: boolean
          livraisons?: boolean
          messages?: boolean
          payout?: boolean
          pickup_done?: boolean
          profile_id?: string
          promotions?: boolean
          propositions?: boolean
          rappels?: boolean
          system?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_route: string | null
          body: string
          created_at: string
          id: string
          is_read: boolean
          params: Json
          pushed_at: string | null
          recipient_id: string
          target_id: string | null
          target_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          action_route?: string | null
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          params?: Json
          pushed_at?: string | null
          recipient_id: string
          target_id?: string | null
          target_type?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          action_route?: string | null
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          params?: Json
          pushed_at?: string | null
          recipient_id?: string
          target_id?: string | null
          target_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      order_claims: {
        Row: {
          agreed_solution:
            | Database["public"]["Enums"]["requested_solution"]
            | null
          amicable_deadline: string | null
          buyer_id: string
          closed_at: string | null
          consult_authorized: boolean
          conversation_id: string | null
          created_at: string
          damage_detail: string | null
          deadline: string
          decision: Database["public"]["Enums"]["support_decision"] | null
          decision_amount_cents: number | null
          description: string
          family: Database["public"]["Enums"]["claim_family"]
          good_faith: boolean
          id: string
          item_usage: string | null
          journey: Database["public"]["Enums"]["claim_journey"]
          order_id: string
          package_damages: string[]
          package_state: Database["public"]["Enums"]["package_state"]
          phase: Database["public"]["Enums"]["claim_phase"]
          reason: string
          requested_solution: Database["public"]["Enums"]["requested_solution"]
          return_fee_exception:
            | Database["public"]["Enums"]["return_fee_exception"]
            | null
          return_fee_payer: Database["public"]["Enums"]["return_fee_payer"]
          return_organize_deadline: string | null
          return_validation_deadline: string | null
          seller_id: string
          updated_at: string
          windows_id: number
        }
        Insert: {
          agreed_solution?:
            | Database["public"]["Enums"]["requested_solution"]
            | null
          amicable_deadline?: string | null
          buyer_id: string
          closed_at?: string | null
          consult_authorized: boolean
          conversation_id?: string | null
          created_at?: string
          damage_detail?: string | null
          deadline: string
          decision?: Database["public"]["Enums"]["support_decision"] | null
          decision_amount_cents?: number | null
          description: string
          family: Database["public"]["Enums"]["claim_family"]
          good_faith: boolean
          id?: string
          item_usage?: string | null
          journey?: Database["public"]["Enums"]["claim_journey"]
          order_id: string
          package_damages?: string[]
          package_state: Database["public"]["Enums"]["package_state"]
          phase?: Database["public"]["Enums"]["claim_phase"]
          reason: string
          requested_solution: Database["public"]["Enums"]["requested_solution"]
          return_fee_exception?:
            | Database["public"]["Enums"]["return_fee_exception"]
            | null
          return_fee_payer?: Database["public"]["Enums"]["return_fee_payer"]
          return_organize_deadline?: string | null
          return_validation_deadline?: string | null
          seller_id: string
          updated_at?: string
          windows_id: number
        }
        Update: {
          agreed_solution?:
            | Database["public"]["Enums"]["requested_solution"]
            | null
          amicable_deadline?: string | null
          buyer_id?: string
          closed_at?: string | null
          consult_authorized?: boolean
          conversation_id?: string | null
          created_at?: string
          damage_detail?: string | null
          deadline?: string
          decision?: Database["public"]["Enums"]["support_decision"] | null
          decision_amount_cents?: number | null
          description?: string
          family?: Database["public"]["Enums"]["claim_family"]
          good_faith?: boolean
          id?: string
          item_usage?: string | null
          journey?: Database["public"]["Enums"]["claim_journey"]
          order_id?: string
          package_damages?: string[]
          package_state?: Database["public"]["Enums"]["package_state"]
          phase?: Database["public"]["Enums"]["claim_phase"]
          reason?: string
          requested_solution?: Database["public"]["Enums"]["requested_solution"]
          return_fee_exception?:
            | Database["public"]["Enums"]["return_fee_exception"]
            | null
          return_fee_payer?: Database["public"]["Enums"]["return_fee_payer"]
          return_organize_deadline?: string | null
          return_validation_deadline?: string | null
          seller_id?: string
          updated_at?: string
          windows_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_claims_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_claims_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_claims_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_claims_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_claims_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_claims_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_title: string
          quantity: number
          total_price_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_title: string
          quantity: number
          total_price_cents: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_title?: string
          quantity?: number
          total_price_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          availability_confirmed_at: string | null
          availability_deadline: string | null
          availability_reminders: number
          buyer_id: string
          cancel_reason: string | null
          cancel_requested_at: string | null
          carrier_key: Database["public"]["Enums"]["carrier_key"] | null
          claim_windows_id: number
          created_at: string
          currency: string
          delivery_address: Json | null
          delivery_fee_cents: number
          delivery_seller_cents: number
          delivery_seller_pct: number
          delivery_total_cents: number
          est_test: boolean
          estimated_delivery: string | null
          fee_model: string
          hub_id: string | null
          id: string
          order_number: string
          platform_fee_cents: number
          seller_charge_cents: number
          seller_id: string
          seller_paid_at: string | null
          seller_payment_intent_id: string | null
          service_buyer_cents: number
          service_fee_cents: number
          service_seller_cents: number
          service_seller_pct: number
          shipment_id: string | null
          shipping_method: Database["public"]["Enums"]["shipping_method"]
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          tracking_number: string | null
          transporter_id: string | null
          updated_at: string
        }
        Insert: {
          availability_confirmed_at?: string | null
          availability_deadline?: string | null
          availability_reminders?: number
          buyer_id: string
          cancel_reason?: string | null
          cancel_requested_at?: string | null
          carrier_key?: Database["public"]["Enums"]["carrier_key"] | null
          claim_windows_id: number
          created_at?: string
          currency?: string
          delivery_address?: Json | null
          delivery_fee_cents?: number
          delivery_seller_cents?: number
          delivery_seller_pct?: number
          delivery_total_cents?: number
          est_test?: boolean
          estimated_delivery?: string | null
          fee_model?: string
          hub_id?: string | null
          id?: string
          order_number: string
          platform_fee_cents?: number
          seller_charge_cents?: number
          seller_id: string
          seller_paid_at?: string | null
          seller_payment_intent_id?: string | null
          service_buyer_cents?: number
          service_fee_cents?: number
          service_seller_cents?: number
          service_seller_pct?: number
          shipment_id?: string | null
          shipping_method: Database["public"]["Enums"]["shipping_method"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          tracking_number?: string | null
          transporter_id?: string | null
          updated_at?: string
        }
        Update: {
          availability_confirmed_at?: string | null
          availability_deadline?: string | null
          availability_reminders?: number
          buyer_id?: string
          cancel_reason?: string | null
          cancel_requested_at?: string | null
          carrier_key?: Database["public"]["Enums"]["carrier_key"] | null
          claim_windows_id?: number
          created_at?: string
          currency?: string
          delivery_address?: Json | null
          delivery_fee_cents?: number
          delivery_seller_cents?: number
          delivery_seller_pct?: number
          delivery_total_cents?: number
          est_test?: boolean
          estimated_delivery?: string | null
          fee_model?: string
          hub_id?: string | null
          id?: string
          order_number?: string
          platform_fee_cents?: number
          seller_charge_cents?: number
          seller_id?: string
          seller_paid_at?: string | null
          seller_payment_intent_id?: string | null
          service_buyer_cents?: number
          service_fee_cents?: number
          service_seller_cents?: number
          service_seller_pct?: number
          shipment_id?: string | null
          shipping_method?: Database["public"]["Enums"]["shipping_method"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          tracking_number?: string | null
          transporter_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          accrued_fee_cents: number
          business_id: string
          buyer_name: string | null
          buyer_phone_masked: string | null
          created_at: string
          eta_at: string | null
          id: string
          mission_id: string | null
          notes: string | null
          order_id: string | null
          parcel_format: Database["public"]["Enums"]["parcel_format"] | null
          picked_up_at: string | null
          pickup_code: string | null
          product_image: string | null
          product_title: string | null
          received_at: string | null
          reception_photo_path: string | null
          remise_photo_path: string | null
          return_deadline_at: string | null
          return_qr_code: string | null
          return_relay_id: string | null
          return_status: Database["public"]["Enums"]["return_status"] | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["package_status"]
          tracking_code: string
          transporter_name: string | null
          updated_at: string
        }
        Insert: {
          accrued_fee_cents?: number
          business_id: string
          buyer_name?: string | null
          buyer_phone_masked?: string | null
          created_at?: string
          eta_at?: string | null
          id?: string
          mission_id?: string | null
          notes?: string | null
          order_id?: string | null
          parcel_format?: Database["public"]["Enums"]["parcel_format"] | null
          picked_up_at?: string | null
          pickup_code?: string | null
          product_image?: string | null
          product_title?: string | null
          received_at?: string | null
          reception_photo_path?: string | null
          remise_photo_path?: string | null
          return_deadline_at?: string | null
          return_qr_code?: string | null
          return_relay_id?: string | null
          return_status?: Database["public"]["Enums"]["return_status"] | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["package_status"]
          tracking_code: string
          transporter_name?: string | null
          updated_at?: string
        }
        Update: {
          accrued_fee_cents?: number
          business_id?: string
          buyer_name?: string | null
          buyer_phone_masked?: string | null
          created_at?: string
          eta_at?: string | null
          id?: string
          mission_id?: string | null
          notes?: string | null
          order_id?: string | null
          parcel_format?: Database["public"]["Enums"]["parcel_format"] | null
          picked_up_at?: string | null
          pickup_code?: string | null
          product_image?: string | null
          product_title?: string | null
          received_at?: string | null
          reception_photo_path?: string | null
          remise_photo_path?: string | null
          return_deadline_at?: string | null
          return_qr_code?: string | null
          return_relay_id?: string | null
          return_status?: Database["public"]["Enums"]["return_status"] | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["package_status"]
          tracking_code?: string
          transporter_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "relais_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_return_relay_id_fkey"
            columns: ["return_relay_id"]
            isOneToOne: false
            referencedRelation: "return_relays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean
          last4: string | null
          profile_id: string
          stripe_payment_method_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          profile_id: string
          stripe_payment_method_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          profile_id?: string
          stripe_payment_method_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_methods_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          absence_step: string | null
          amount_cents: number
          buyer_id: string
          created_at: string
          currency: string
          id: string
          livemode: boolean
          order_id: string | null
          purpose: string
          shipment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          absence_step?: string | null
          amount_cents: number
          buyer_id: string
          created_at?: string
          currency?: string
          id?: string
          livemode?: boolean
          order_id?: string | null
          purpose?: string
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          absence_step?: string | null
          amount_cents?: number
          buyer_id?: string
          created_at?: string
          currency?: string
          id?: string
          livemode?: boolean
          order_id?: string | null
          purpose?: string
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_clawbacks: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          order_id: string
          reason: string | null
          refund_id: string | null
          reversal_id: string | null
          seller_id: string
          settled_at: string | null
          status: string
          transfer_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          order_id: string
          reason?: string | null
          refund_id?: string | null
          reversal_id?: string | null
          seller_id: string
          settled_at?: string | null
          status: string
          transfer_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          order_id?: string
          reason?: string | null
          refund_id?: string | null
          reversal_id?: string | null
          seller_id?: string
          settled_at?: string | null
          status?: string
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_clawbacks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_clawbacks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_clawbacks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_clawbacks_refund_id_fkey"
            columns: ["refund_id"]
            isOneToOne: false
            referencedRelation: "refunds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_clawbacks_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_clawbacks_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_cents: number
          business_id: string | null
          completed_at: string | null
          currency: string
          id: string
          method: Database["public"]["Enums"]["payout_method"]
          payee_id: string
          requested_at: string
          status: Database["public"]["Enums"]["payout_status"]
          stripe_payout_id: string | null
        }
        Insert: {
          amount_cents: number
          business_id?: string | null
          completed_at?: string | null
          currency?: string
          id?: string
          method: Database["public"]["Enums"]["payout_method"]
          payee_id: string
          requested_at?: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_payout_id?: string | null
        }
        Update: {
          amount_cents?: number
          business_id?: string | null
          completed_at?: string | null
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          payee_id?: string
          requested_at?: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_payout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "relais_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      pepite_scores: {
        Row: {
          computed_at: string
          product_id: string
          reasons: string[]
          rotation_key: string
          score: number
        }
        Insert: {
          computed_at?: string
          product_id: string
          reasons?: string[]
          rotation_key: string
          score: number
        }
        Update: {
          computed_at?: string
          product_id?: string
          reasons?: string[]
          rotation_key?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "pepite_scores_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_invoices: {
        Row: {
          currency: string
          id: string
          invoice_number: string
          issued_at: string
          kind: Database["public"]["Enums"]["platform_invoice_kind"]
          lines: Json
          profile_id: string
          related_ref: string | null
          stripe_payment_intent_id: string | null
          total_cents: number
          txn_group_id: string | null
          vat_cents: number | null
          vat_rate: number | null
        }
        Insert: {
          currency?: string
          id?: string
          invoice_number: string
          issued_at?: string
          kind: Database["public"]["Enums"]["platform_invoice_kind"]
          lines?: Json
          profile_id: string
          related_ref?: string | null
          stripe_payment_intent_id?: string | null
          total_cents: number
          txn_group_id?: string | null
          vat_cents?: number | null
          vat_rate?: number | null
        }
        Update: {
          currency?: string
          id?: string
          invoice_number?: string
          issued_at?: string
          kind?: Database["public"]["Enums"]["platform_invoice_kind"]
          lines?: Json
          profile_id?: string
          related_ref?: string | null
          stripe_payment_intent_id?: string | null
          total_cents?: number
          txn_group_id?: string | null
          vat_cents?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_invoices_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_invoices_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      product_boosts: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          option_id: Database["public"]["Enums"]["visibility_option"]
          payment_id: string | null
          price_cents: number
          product_id: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          option_id: Database["public"]["Enums"]["visibility_option"]
          payment_id?: string | null
          price_cents: number
          product_id: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          option_id?: Database["public"]["Enums"]["visibility_option"]
          payment_id?: string | null
          price_cents?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_boosts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_boosts_payment_fk"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_boosts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_favorites: {
        Row: {
          created_at: string
          product_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          position: number
          product_id: string
          thumbnail: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          product_id: string
          thumbnail?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          thumbnail?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          access_mode: Database["public"]["Enums"]["product_access_mode"]
          accessories_included: boolean
          buyer_commission_share: number
          category_id: string | null
          city: string | null
          condition: Database["public"]["Enums"]["product_condition"]
          created_at: string
          currency: string
          deal_score: number | null
          declared_defects: string | null
          description: string | null
          expires_at: string | null
          free_shipping: boolean
          geo: unknown
          id: string
          is_boosted: boolean
          like_count: number
          listing_type: Database["public"]["Enums"]["listing_type"]
          mode: Database["public"]["Enums"]["product_mode"]
          negotiable: boolean
          original_price_cents: number | null
          parcel_format: Database["public"]["Enums"]["parcel_format"] | null
          photo_pack: Database["public"]["Enums"]["photo_pack"] | null
          price_cents: number
          published_at: string | null
          region: string | null
          seller_delivery_share: number
          seller_id: string
          seller_service_share: number
          source_demande_id: string | null
          specs: Json
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          tags: string[]
          title: string
          updated_at: string
          urgent_badge_until: string | null
          video_count: number | null
          video_max_seconds: number | null
          view_count: number
          wanted_items: string[]
        }
        Insert: {
          access_mode?: Database["public"]["Enums"]["product_access_mode"]
          accessories_included?: boolean
          buyer_commission_share?: number
          category_id?: string | null
          city?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          currency?: string
          deal_score?: number | null
          declared_defects?: string | null
          description?: string | null
          expires_at?: string | null
          free_shipping?: boolean
          geo?: unknown
          id?: string
          is_boosted?: boolean
          like_count?: number
          listing_type?: Database["public"]["Enums"]["listing_type"]
          mode?: Database["public"]["Enums"]["product_mode"]
          negotiable?: boolean
          original_price_cents?: number | null
          parcel_format?: Database["public"]["Enums"]["parcel_format"] | null
          photo_pack?: Database["public"]["Enums"]["photo_pack"] | null
          price_cents?: number
          published_at?: string | null
          region?: string | null
          seller_delivery_share?: number
          seller_id: string
          seller_service_share?: number
          source_demande_id?: string | null
          specs?: Json
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          tags?: string[]
          title: string
          updated_at?: string
          urgent_badge_until?: string | null
          video_count?: number | null
          video_max_seconds?: number | null
          view_count?: number
          wanted_items?: string[]
        }
        Update: {
          access_mode?: Database["public"]["Enums"]["product_access_mode"]
          accessories_included?: boolean
          buyer_commission_share?: number
          category_id?: string | null
          city?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          currency?: string
          deal_score?: number | null
          declared_defects?: string | null
          description?: string | null
          expires_at?: string | null
          free_shipping?: boolean
          geo?: unknown
          id?: string
          is_boosted?: boolean
          like_count?: number
          listing_type?: Database["public"]["Enums"]["listing_type"]
          mode?: Database["public"]["Enums"]["product_mode"]
          negotiable?: boolean
          original_price_cents?: number | null
          parcel_format?: Database["public"]["Enums"]["parcel_format"] | null
          photo_pack?: Database["public"]["Enums"]["photo_pack"] | null
          price_cents?: number
          published_at?: string | null
          region?: string | null
          seller_delivery_share?: number
          seller_id?: string
          seller_service_share?: number
          source_demande_id?: string | null
          specs?: Json
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          tags?: string[]
          title?: string
          updated_at?: string
          urgent_badge_until?: string | null
          video_count?: number | null
          video_max_seconds?: number | null
          view_count?: number
          wanted_items?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_source_demande_fk"
            columns: ["source_demande_id"]
            isOneToOne: false
            referencedRelation: "je_cherche_demandes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          anonymized_at: string | null
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string | null
          est_test: boolean
          first_name: string
          geo: unknown
          id: string
          is_dark_mode: boolean
          is_demo: boolean
          is_verified_ecommerce: boolean
          joined_at: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_name: string
          locale: string
          phone: string | null
          provider: Database["public"]["Enums"]["auth_provider"] | null
          rating: number | null
          region: string | null
          review_count: number
          show_phone_on_listings: boolean
          total_purchases: number
          total_sales: number
          updated_at: string
          username: string | null
          username_authorized: boolean
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          anonymized_at?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          est_test?: boolean
          first_name?: string
          geo?: unknown
          id?: string
          is_dark_mode?: boolean
          is_demo?: boolean
          is_verified_ecommerce?: boolean
          joined_at?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_name?: string
          locale?: string
          phone?: string | null
          provider?: Database["public"]["Enums"]["auth_provider"] | null
          rating?: number | null
          region?: string | null
          review_count?: number
          show_phone_on_listings?: boolean
          total_purchases?: number
          total_sales?: number
          updated_at?: string
          username?: string | null
          username_authorized?: boolean
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          anonymized_at?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          est_test?: boolean
          first_name?: string
          geo?: unknown
          id?: string
          is_dark_mode?: boolean
          is_demo?: boolean
          is_verified_ecommerce?: boolean
          joined_at?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_name?: string
          locale?: string
          phone?: string | null
          provider?: Database["public"]["Enums"]["auth_provider"] | null
          rating?: number | null
          region?: string | null
          review_count?: number
          show_phone_on_listings?: boolean
          total_purchases?: number
          total_sales?: number
          updated_at?: string
          username?: string | null
          username_authorized?: boolean
        }
        Relationships: []
      }
      published_routes: {
        Row: {
          arrival_city: string
          created_at: string
          delivery_hub_ids: string[]
          departure_city: string
          departure_hub_id: string | null
          departure_time: string | null
          distance_km: number | null
          estimated_arrival: string | null
          id: string
          max_packages: number
          max_size: Database["public"]["Enums"]["parcel_format"]
          max_weight_kg: number
          missions_count: number
          off_hub_possible: boolean
          price_per_item_cents: number | null
          recurring_days: number[]
          status: Database["public"]["Enums"]["route_status"]
          transport_mode: Database["public"]["Enums"]["transport_mode"]
          transporter_id: string
          type: Database["public"]["Enums"]["route_type"]
          updated_at: string
        }
        Insert: {
          arrival_city: string
          created_at?: string
          delivery_hub_ids?: string[]
          departure_city: string
          departure_hub_id?: string | null
          departure_time?: string | null
          distance_km?: number | null
          estimated_arrival?: string | null
          id?: string
          max_packages?: number
          max_size?: Database["public"]["Enums"]["parcel_format"]
          max_weight_kg?: number
          missions_count?: number
          off_hub_possible?: boolean
          price_per_item_cents?: number | null
          recurring_days?: number[]
          status?: Database["public"]["Enums"]["route_status"]
          transport_mode?: Database["public"]["Enums"]["transport_mode"]
          transporter_id: string
          type: Database["public"]["Enums"]["route_type"]
          updated_at?: string
        }
        Update: {
          arrival_city?: string
          created_at?: string
          delivery_hub_ids?: string[]
          departure_city?: string
          departure_hub_id?: string | null
          departure_time?: string | null
          distance_km?: number | null
          estimated_arrival?: string | null
          id?: string
          max_packages?: number
          max_size?: Database["public"]["Enums"]["parcel_format"]
          max_weight_kg?: number
          missions_count?: number
          off_hub_possible?: boolean
          price_per_item_cents?: number | null
          recurring_days?: number[]
          status?: Database["public"]["Enums"]["route_status"]
          transport_mode?: Database["public"]["Enums"]["transport_mode"]
          transporter_id?: string
          type?: Database["public"]["Enums"]["route_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "published_routes_departure_hub_id_fkey"
            columns: ["departure_hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_routes_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_routes_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          buyer_protection_fee_cents: number
          colivraison_participation_cents: number | null
          created_at: string
          delivery_fee_cents: number
          delivery_kind:
            | Database["public"]["Enums"]["receipt_delivery_kind"]
            | null
          display_number: string | null
          finalized_at: string | null
          id: string
          item_price_cents: number
          mise_en_relation_fee_cents: number | null
          order_id: string
          other_fees_cents: number
          receipt_number: string
          replaced: boolean
          replaces_receipt_number: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["receipt_status"]
          total_cents: number
          transaction_date: string | null
          updated_at: string
        }
        Insert: {
          buyer_protection_fee_cents?: number
          colivraison_participation_cents?: number | null
          created_at?: string
          delivery_fee_cents?: number
          delivery_kind?:
            | Database["public"]["Enums"]["receipt_delivery_kind"]
            | null
          display_number?: string | null
          finalized_at?: string | null
          id?: string
          item_price_cents: number
          mise_en_relation_fee_cents?: number | null
          order_id: string
          other_fees_cents?: number
          receipt_number: string
          replaced?: boolean
          replaces_receipt_number?: string | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["receipt_status"]
          total_cents: number
          transaction_date?: string | null
          updated_at?: string
        }
        Update: {
          buyer_protection_fee_cents?: number
          colivraison_participation_cents?: number | null
          created_at?: string
          delivery_fee_cents?: number
          delivery_kind?:
            | Database["public"]["Enums"]["receipt_delivery_kind"]
            | null
          display_number?: string | null
          finalized_at?: string | null
          id?: string
          item_price_cents?: number
          mise_en_relation_fee_cents?: number | null
          order_id?: string
          other_fees_cents?: number
          receipt_number?: string
          replaced?: boolean
          replaces_receipt_number?: string | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["receipt_status"]
          total_cents?: number
          transaction_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount_cents: number
          claim_id: string | null
          created_at: string
          id: string
          issued_by: string | null
          order_id: string
          reason: string | null
          stripe_refund_id: string | null
        }
        Insert: {
          amount_cents: number
          claim_id?: string | null
          created_at?: string
          id?: string
          issued_by?: string | null
          order_id: string
          reason?: string | null
          stripe_refund_id?: string | null
        }
        Update: {
          amount_cents?: number
          claim_id?: string | null
          created_at?: string
          id?: string
          issued_by?: string | null
          order_id?: string
          reason?: string | null
          stripe_refund_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "order_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
        ]
      }
      relais_businesses: {
        Row: {
          address_line: string | null
          category: Database["public"]["Enums"]["business_category"]
          city: string | null
          created_at: string
          email: string | null
          geo: unknown
          id: string
          logo: string | null
          max_package_size: Database["public"]["Enums"]["parcel_format"]
          name: string
          owner_id: string
          paused: boolean
          payout_paypal_email: string | null
          phone: string | null
          postal_code: string | null
          representative: string | null
          return_relay: Json | null
          selected_payout: Json | null
          siret: string | null
          status: Database["public"]["Enums"]["business_status"]
          storage_capacity: number
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          address_line?: string | null
          category?: Database["public"]["Enums"]["business_category"]
          city?: string | null
          created_at?: string
          email?: string | null
          geo?: unknown
          id?: string
          logo?: string | null
          max_package_size?: Database["public"]["Enums"]["parcel_format"]
          name: string
          owner_id: string
          paused?: boolean
          payout_paypal_email?: string | null
          phone?: string | null
          postal_code?: string | null
          representative?: string | null
          return_relay?: Json | null
          selected_payout?: Json | null
          siret?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          storage_capacity?: number
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          address_line?: string | null
          category?: Database["public"]["Enums"]["business_category"]
          city?: string | null
          created_at?: string
          email?: string | null
          geo?: unknown
          id?: string
          logo?: string | null
          max_package_size?: Database["public"]["Enums"]["parcel_format"]
          name?: string
          owner_id?: string
          paused?: boolean
          payout_paypal_email?: string | null
          phone?: string | null
          postal_code?: string | null
          representative?: string | null
          return_relay?: Json | null
          selected_payout?: Json | null
          siret?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          storage_capacity?: number
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relais_businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relais_businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      relais_earnings: {
        Row: {
          amount_cents: number
          business_id: string
          created_at: string
          days_stored: number
          id: string
          package_id: string | null
          parcel_format: Database["public"]["Enums"]["parcel_format"] | null
          payout_id: string | null
          product_title: string | null
          status: Database["public"]["Enums"]["tx_status"]
        }
        Insert: {
          amount_cents: number
          business_id: string
          created_at?: string
          days_stored?: number
          id?: string
          package_id?: string | null
          parcel_format?: Database["public"]["Enums"]["parcel_format"] | null
          payout_id?: string | null
          product_title?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
        }
        Update: {
          amount_cents?: number
          business_id?: string
          created_at?: string
          days_stored?: number
          id?: string
          package_id?: string | null
          parcel_format?: Database["public"]["Enums"]["parcel_format"] | null
          payout_id?: string | null
          product_title?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
        }
        Relationships: [
          {
            foreignKeyName: "relais_earnings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "relais_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relais_earnings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relais_earnings_payout_fk"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      relais_hours: {
        Row: {
          business_id: string
          close_time: string | null
          closed: boolean
          open_time: string | null
          weekday: number
        }
        Insert: {
          business_id: string
          close_time?: string | null
          closed?: boolean
          open_time?: string | null
          weekday: number
        }
        Update: {
          business_id?: string
          close_time?: string | null
          closed?: boolean
          open_time?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "relais_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "relais_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          body: string
          business_id: string
          created_at: string
          decision_note: string | null
          id: string
          kind: Database["public"]["Enums"]["report_kind"]
          outcome: Database["public"]["Enums"]["report_outcome"] | null
          package_id: string | null
          reporter_id: string | null
          reporter_name: string | null
          resolved_at: string | null
          responded_at: string | null
          response_comment: string | null
          response_motif: string | null
          response_photos: string[]
          status: Database["public"]["Enums"]["report_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          business_id: string
          created_at?: string
          decision_note?: string | null
          id?: string
          kind: Database["public"]["Enums"]["report_kind"]
          outcome?: Database["public"]["Enums"]["report_outcome"] | null
          package_id?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          response_comment?: string | null
          response_motif?: string | null
          response_photos?: string[]
          status?: Database["public"]["Enums"]["report_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          business_id?: string
          created_at?: string
          decision_note?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["report_kind"]
          outcome?: Database["public"]["Enums"]["report_outcome"] | null
          package_id?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          response_comment?: string | null
          response_motif?: string | null
          response_photos?: string[]
          status?: Database["public"]["Enums"]["report_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "relais_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      return_relays: {
        Row: {
          address_line: string | null
          category: Database["public"]["Enums"]["business_category"] | null
          city: string | null
          created_at: string
          geo: unknown
          hours_summary: string | null
          id: string
          kind: Database["public"]["Enums"]["return_relay_kind"]
          name: string
          partner_business_id: string | null
          postal_code: string | null
        }
        Insert: {
          address_line?: string | null
          category?: Database["public"]["Enums"]["business_category"] | null
          city?: string | null
          created_at?: string
          geo: unknown
          hours_summary?: string | null
          id?: string
          kind: Database["public"]["Enums"]["return_relay_kind"]
          name: string
          partner_business_id?: string | null
          postal_code?: string | null
        }
        Update: {
          address_line?: string | null
          category?: Database["public"]["Enums"]["business_category"] | null
          city?: string | null
          created_at?: string
          geo?: unknown
          hours_summary?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["return_relay_kind"]
          name?: string
          partner_business_id?: string | null
          postal_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_relays_partner_business_id_fkey"
            columns: ["partner_business_id"]
            isOneToOne: false
            referencedRelation: "relais_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reports: {
        Row: {
          created_at: string
          explanation: string
          good_faith: boolean
          id: string
          reason: Database["public"]["Enums"]["review_report_reason"]
          reporter_id: string
          review_author_id: string | null
          review_id: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["review_report_status"]
        }
        Insert: {
          created_at?: string
          explanation: string
          good_faith: boolean
          id?: string
          reason: Database["public"]["Enums"]["review_report_reason"]
          reporter_id: string
          review_author_id?: string | null
          review_id?: string | null
          snapshot: Json
          status?: Database["public"]["Enums"]["review_report_status"]
        }
        Update: {
          created_at?: string
          explanation?: string
          good_faith?: boolean
          id?: string
          reason?: Database["public"]["Enums"]["review_report_reason"]
          reporter_id?: string
          review_author_id?: string | null
          review_id?: string | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["review_report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_review_author_id_fkey"
            columns: ["review_author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_review_author_id_fkey"
            columns: ["review_author_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          mission_id: string | null
          order_id: string | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          role: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          mission_id?: string | null
          order_id?: string | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          role: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          mission_id?: string | null
          order_id?: string | null
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          arrival_time: string | null
          city: string | null
          geo: unknown
          hub_id: string | null
          id: string
          position: number
          route_id: string
        }
        Insert: {
          arrival_time?: string | null
          city?: string | null
          geo?: unknown
          hub_id?: string | null
          id?: string
          position?: number
          route_id: string
        }
        Update: {
          arrival_time?: string | null
          city?: string | null
          geo?: unknown
          hub_id?: string | null
          id?: string
          position?: number
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "published_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_favorites: {
        Row: {
          created_at: string
          profile_id: string
          seller_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          seller_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_favorites_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_favorites_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_profiles: {
        Row: {
          created_at: string
          is_verified_ecommerce: boolean
          profile_id: string
          store_address: string | null
          store_hours: Json | null
          total_sales: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          is_verified_ecommerce?: boolean
          profile_id: string
          store_address?: string | null
          store_hours?: Json | null
          total_sales?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          is_verified_ecommerce?: boolean
          profile_id?: string
          store_address?: string | null
          store_hours?: Json | null
          total_sales?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_recaps: {
        Row: {
          ajustements_cents: number
          commission_cents: number
          created_at: string
          finalized_at: string
          id: string
          item_price_cents: number
          net_payout_cents: number
          order_id: string
          recap_number: string
          seller_id: string
          snapshot: Json
        }
        Insert: {
          ajustements_cents?: number
          commission_cents: number
          created_at?: string
          finalized_at: string
          id?: string
          item_price_cents: number
          net_payout_cents: number
          order_id: string
          recap_number: string
          seller_id: string
          snapshot?: Json
        }
        Update: {
          ajustements_cents?: number
          commission_cents?: number
          created_at?: string
          finalized_at?: string
          id?: string
          item_price_cents?: number
          net_payout_cents?: number
          order_id?: string
          recap_number?: string
          seller_id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "seller_recaps_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_recaps_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_recaps_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_recaps_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_recaps_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_lines: {
        Row: {
          amount_cents: number | null
          id: number
          kind: Database["public"]["Enums"]["settlement_kind"]
          label_fr: string
          party: Database["public"]["Enums"]["settlement_party"]
          settlement_id: string
          sort_order: number
        }
        Insert: {
          amount_cents?: number | null
          id?: never
          kind: Database["public"]["Enums"]["settlement_kind"]
          label_fr: string
          party: Database["public"]["Enums"]["settlement_party"]
          settlement_id: string
          sort_order?: number
        }
        Update: {
          amount_cents?: number | null
          id?: never
          kind?: Database["public"]["Enums"]["settlement_kind"]
          label_fr?: string
          party?: Database["public"]["Enums"]["settlement_party"]
          settlement_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "settlement_lines_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          created_at: string
          declaration_id: string
          id: string
          note_fr: string | null
          protocol_id: number
          title_fr: string
          txn_group_id: string | null
        }
        Insert: {
          created_at?: string
          declaration_id: string
          id?: string
          note_fr?: string | null
          protocol_id: number
          title_fr: string
          txn_group_id?: string | null
        }
        Update: {
          created_at?: string
          declaration_id?: string
          id?: string
          note_fr?: string | null
          protocol_id?: number
          title_fr?: string
          txn_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlements_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: true
            referencedRelation: "incident_declarations"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          absence_declared_at: string | null
          absence_declared_by: string | null
          absence_photo_path: string | null
          buyer_id: string
          buyer_qr_code: string | null
          created_at: string
          current_attempt: number
          delivered_at: string | null
          delivery_presumed_at: string | null
          delivery_scheduled_at: string | null
          destination_hub_id: string | null
          group_id: string | null
          id: string
          insurance_coverage_cents: number
          insurance_tier: Database["public"]["Enums"]["insurance_tier"]
          max_attempts: number
          mission_id: string | null
          order_id: string
          origin_hub_id: string | null
          package_id: string | null
          parcel_format: Database["public"]["Enums"]["parcel_format"]
          pickup_window_end: string | null
          pickup_window_start: string | null
          receipt_confirmed_at: string | null
          relay_business_id: string | null
          relay_pickup_code: string | null
          relay_received_at: string | null
          relay_return_deadline_at: string | null
          return_qr_code: string | null
          seller_id: string
          seller_qr_code: string | null
          shipped_at: string | null
          shipping_method: Database["public"]["Enums"]["shipping_method"]
          state: Database["public"]["Enums"]["shipment_state"]
          state_version: number
          tolerance_minutes: number
          tracking_number: string
          transporter_id: string | null
          updated_at: string
        }
        Insert: {
          absence_declared_at?: string | null
          absence_declared_by?: string | null
          absence_photo_path?: string | null
          buyer_id: string
          buyer_qr_code?: string | null
          created_at?: string
          current_attempt?: number
          delivered_at?: string | null
          delivery_presumed_at?: string | null
          delivery_scheduled_at?: string | null
          destination_hub_id?: string | null
          group_id?: string | null
          id?: string
          insurance_coverage_cents?: number
          insurance_tier?: Database["public"]["Enums"]["insurance_tier"]
          max_attempts?: number
          mission_id?: string | null
          order_id: string
          origin_hub_id?: string | null
          package_id?: string | null
          parcel_format: Database["public"]["Enums"]["parcel_format"]
          pickup_window_end?: string | null
          pickup_window_start?: string | null
          receipt_confirmed_at?: string | null
          relay_business_id?: string | null
          relay_pickup_code?: string | null
          relay_received_at?: string | null
          relay_return_deadline_at?: string | null
          return_qr_code?: string | null
          seller_id: string
          seller_qr_code?: string | null
          shipped_at?: string | null
          shipping_method: Database["public"]["Enums"]["shipping_method"]
          state?: Database["public"]["Enums"]["shipment_state"]
          state_version?: number
          tolerance_minutes?: number
          tracking_number: string
          transporter_id?: string | null
          updated_at?: string
        }
        Update: {
          absence_declared_at?: string | null
          absence_declared_by?: string | null
          absence_photo_path?: string | null
          buyer_id?: string
          buyer_qr_code?: string | null
          created_at?: string
          current_attempt?: number
          delivered_at?: string | null
          delivery_presumed_at?: string | null
          delivery_scheduled_at?: string | null
          destination_hub_id?: string | null
          group_id?: string | null
          id?: string
          insurance_coverage_cents?: number
          insurance_tier?: Database["public"]["Enums"]["insurance_tier"]
          max_attempts?: number
          mission_id?: string | null
          order_id?: string
          origin_hub_id?: string | null
          package_id?: string | null
          parcel_format?: Database["public"]["Enums"]["parcel_format"]
          pickup_window_end?: string | null
          pickup_window_start?: string | null
          receipt_confirmed_at?: string | null
          relay_business_id?: string | null
          relay_pickup_code?: string | null
          relay_received_at?: string | null
          relay_return_deadline_at?: string | null
          return_qr_code?: string | null
          seller_id?: string
          seller_qr_code?: string | null
          shipped_at?: string | null
          shipping_method?: Database["public"]["Enums"]["shipping_method"]
          state?: Database["public"]["Enums"]["shipment_state"]
          state_version?: number
          tolerance_minutes?: number
          tracking_number?: string
          transporter_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_absence_declared_by_fkey"
            columns: ["absence_declared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_absence_declared_by_fkey"
            columns: ["absence_declared_by"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_destination_hub_id_fkey"
            columns: ["destination_hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "mission_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_origin_hub_id_fkey"
            columns: ["origin_hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_package_fk"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_relay_business_id_fkey"
            columns: ["relay_business_id"]
            isOneToOne: false
            referencedRelation: "relais_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_accounts: {
        Row: {
          account_type: string
          charges_enabled: boolean
          created_at: string
          identite_lue_le: string | null
          livemode: boolean | null
          nom_legal: string | null
          payable_depuis: string | null
          payouts_enabled: boolean
          prenom_legal: string | null
          profile_id: string
          stripe_connect_account_id: string
          updated_at: string
        }
        Insert: {
          account_type?: string
          charges_enabled?: boolean
          created_at?: string
          identite_lue_le?: string | null
          livemode?: boolean | null
          nom_legal?: string | null
          payable_depuis?: string | null
          payouts_enabled?: boolean
          prenom_legal?: string | null
          profile_id: string
          stripe_connect_account_id: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          charges_enabled?: boolean
          created_at?: string
          identite_lue_le?: string | null
          livemode?: boolean | null
          nom_legal?: string | null
          payable_depuis?: string | null
          payouts_enabled?: boolean
          prenom_legal?: string | null
          profile_id?: string
          stripe_connect_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string
          livemode: boolean
          profile_id: string
          stripe_customer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          livemode?: boolean
          profile_id: string
          stripe_customer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          livemode?: boolean
          profile_id?: string
          stripe_customer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          source: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          source?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          block_after: boolean
          context_snapshot: Json | null
          conversation_id: string | null
          created_at: string
          explanation: string
          good_faith: boolean
          id: string
          priority: Database["public"]["Enums"]["report_priority"]
          proofs: Json
          reason: Database["public"]["Enums"]["user_report_reason"]
          reported_user_id: string | null
          reporter_id: string
        }
        Insert: {
          block_after?: boolean
          context_snapshot?: Json | null
          conversation_id?: string | null
          created_at?: string
          explanation: string
          good_faith: boolean
          id?: string
          priority?: Database["public"]["Enums"]["report_priority"]
          proofs?: Json
          reason: Database["public"]["Enums"]["user_report_reason"]
          reported_user_id?: string | null
          reporter_id: string
        }
        Update: {
          block_after?: boolean
          context_snapshot?: Json | null
          conversation_id?: string | null
          created_at?: string
          explanation?: string
          good_faith?: boolean
          id?: string
          priority?: Database["public"]["Enums"]["report_priority"]
          proofs?: Json
          reason?: Database["public"]["Enums"]["user_report_reason"]
          reported_user_id?: string | null
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          activated_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          granted_at: string
          id: string
          profile_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["role_status"]
        }
        Insert: {
          activated_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          granted_at?: string
          id?: string
          profile_id: string
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["role_status"]
        }
        Update: {
          activated_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          granted_at?: string
          id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["role_status"]
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          is_dark_mode: boolean
          language: string
          profile_id: string
          show_phone_on_listings: boolean
          updated_at: string
        }
        Insert: {
          is_dark_mode?: boolean
          language?: string
          profile_id: string
          show_phone_on_listings?: boolean
          updated_at?: string
        }
        Update: {
          is_dark_mode?: boolean
          language?: string
          profile_id?: string
          show_phone_on_listings?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          label: string
          mission_id: string | null
          product_id: string | null
          profile_id: string
          status: Database["public"]["Enums"]["tx_status"]
          subtitle: string | null
          type: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          label: string
          mission_id?: string | null
          product_id?: string | null
          profile_id: string
          status?: Database["public"]["Enums"]["tx_status"]
          subtitle?: string | null
          type: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          label?: string
          mission_id?: string | null
          product_id?: string | null
          profile_id?: string
          status?: Database["public"]["Enums"]["tx_status"]
          subtitle?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_transporter_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      courtage_propositions_public: {
        Row: {
          amount_cents: number | null
          anonymized: boolean | null
          created_at: string | null
          est_moi: boolean | null
          id: string | null
          listing_id: string | null
          proposer_label: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courtage_propositions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "courtage_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      live_propositions_public: {
        Row: {
          amount_cents: number | null
          article_id: string | null
          created_at: string | null
          est_moi: boolean | null
          id: string | null
          proposer_label: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_propositions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "live_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      missions_transporter_v: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          delivery_hub_id: string | null
          id: string | null
          order_id: string | null
          pickup_hub_id: string | null
          seller_id: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["mission_status"] | null
          tracking_number: string | null
          transporter_id: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          delivery_hub_id?: string | null
          id?: string | null
          order_id?: string | null
          pickup_hub_id?: string | null
          seller_id?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          tracking_number?: string | null
          transporter_id?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          delivery_hub_id?: string | null
          id?: string | null
          order_id?: string | null
          pickup_hub_id?: string | null
          seller_id?: string | null
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          tracking_number?: string | null
          transporter_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_delivery_hub_id_fkey"
            columns: ["delivery_hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_buyer_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_seller_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_pickup_hub_id_fkey"
            columns: ["pickup_hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_buyer_v: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          currency: string | null
          delivery_fee_cents: number | null
          id: string | null
          order_number: string | null
          seller_id: string | null
          shipping_method: Database["public"]["Enums"]["shipping_method"] | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal_cents: number | null
          total_cents: number | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_fee_cents?: number | null
          id?: string | null
          order_number?: string | null
          seller_id?: string | null
          shipping_method?:
            | Database["public"]["Enums"]["shipping_method"]
            | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal_cents?: number | null
          total_cents?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_fee_cents?: number | null
          id?: string | null
          order_number?: string | null
          seller_id?: string | null
          shipping_method?:
            | Database["public"]["Enums"]["shipping_method"]
            | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal_cents?: number | null
          total_cents?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_seller_v: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          currency: string | null
          delivery_fee_cents: number | null
          id: string | null
          order_number: string | null
          platform_fee_cents: number | null
          seller_id: string | null
          shipping_method: Database["public"]["Enums"]["shipping_method"] | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal_cents: number | null
          total_cents: number | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_fee_cents?: number | null
          id?: string | null
          order_number?: string | null
          platform_fee_cents?: number | null
          seller_id?: string | null
          shipping_method?:
            | Database["public"]["Enums"]["shipping_method"]
            | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal_cents?: number | null
          total_cents?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_fee_cents?: number | null
          id?: string | null
          order_number?: string | null
          platform_fee_cents?: number | null
          seller_id?: string | null
          shipping_method?:
            | Database["public"]["Enums"]["shipping_method"]
            | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal_cents?: number | null
          total_cents?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      profils_publics: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"] | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          est_anonymise: boolean | null
          est_demo: boolean | null
          id: string | null
          is_verified: boolean | null
          is_verified_ecommerce: boolean | null
          joined_at: string | null
          rating: number | null
          region: string | null
          review_count: number | null
          total_sales: number | null
          username: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: never
          bio?: never
          city?: never
          est_anonymise?: never
          est_demo?: boolean | null
          id?: string | null
          is_verified?: never
          is_verified_ecommerce?: boolean | null
          joined_at?: string | null
          rating?: number | null
          region?: never
          review_count?: number | null
          total_sales?: number | null
          username?: never
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: never
          bio?: never
          city?: never
          est_anonymise?: never
          est_demo?: boolean | null
          id?: string | null
          is_verified?: never
          is_verified_ecommerce?: boolean | null
          joined_at?: string | null
          rating?: number | null
          region?: never
          review_count?: number | null
          total_sales?: number | null
          username?: never
        }
        Relationships: []
      }
      wallet_balances: {
        Row: {
          available_cents: number | null
          pending_cents: number | null
          profile_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_accounts_owner_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_accounts_owner_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profils_publics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      absence_a_regler: {
        Args: { p_order_id: string }
        Returns: {
          devise: string
          etape: string
          intention: string
          montant_cents: number
          shipment_id: string
        }[]
      }
      accepter_mission: {
        Args: { p_mission_id: string }
        Returns: {
          buyer_id: string
          buyer_qr_code: string | null
          cancellation_reason:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          created_at: string
          current_attempt: number
          delay_protocol_id: number
          delivery_hub_chosen_at: string | null
          delivery_hub_id: string | null
          delivery_scheduled_at: string | null
          delivery_validated_at: string | null
          group_id: string | null
          hors_hub_etapes: Database["public"]["Enums"]["hub_etape"][]
          id: string
          is_off_hub: boolean
          is_return: boolean
          max_attempts: number
          off_hub_address: string | null
          order_id: string | null
          package_description: string | null
          package_photo: string | null
          package_weight_kg: number | null
          parcel_format: Database["public"]["Enums"]["parcel_format"] | null
          pickup_hub_id: string | null
          pickup_scheduled_at: string | null
          pickup_validated_at: string | null
          platform_fee_cents: number
          price_cents: number
          proposal_expires_at: string | null
          route_id: string | null
          seller_id: string
          seller_qr_code: string | null
          seller_timer_end: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["mission_status"]
          tolerance_minutes: number
          tracking_number: string | null
          transporter_earning_cents: number
          transporter_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "missions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      achat_engage: { Args: { p_cible: string }; Returns: boolean }
      attestation_confirmer_identites: {
        Args: { p_attestation_id: string }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attestation_decider: {
        Args: {
          p_attestation_id: string
          p_decision: Database["public"]["Enums"]["buyer_decision"]
        }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attestation_declarer: {
        Args: {
          p_attestation_id: string
          p_confirmed_items: Json
          p_declarations: Json
        }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attestation_deposer_document: {
        Args: { p_attestation_id: string; p_chemin: string }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attestation_ouvrir: {
        Args: { p_order_id: string }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attestation_photos_poser: {
        Args: { p_attestation_id: string; p_photos: Json }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attestation_remplacer: {
        Args: { p_attestation_id: string }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attestation_signer_acheteur: {
        Args: { p_attestation_id: string }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attestation_signer_vendeur: {
        Args: { p_attestation_id: string }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attestation_transmettre: {
        Args: { p_attestation_id: string }
        Returns: {
          buyer_address: string | null
          buyer_decision: Database["public"]["Enums"]["buyer_decision"] | null
          buyer_id: string
          buyer_legal_name: string | null
          buyer_pseudonym: string | null
          buyer_signed_at: string | null
          confirmed_items: Json
          created_at: string
          document_path: string | null
          frozen_at: string | null
          id: string
          integrity_hash: string | null
          order_id: string | null
          proof_file_path: string | null
          seller_address: string | null
          seller_declarations: Json
          seller_id: string
          seller_legal_name: string | null
          seller_pseudonym: string | null
          seller_signed_at: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["attestation_status"]
          transaction_ref: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "attestations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      basculer_en_ligne: { Args: { p_en_ligne: boolean }; Returns: boolean }
      bo_candidature_relais_trancher: {
        Args: {
          p_approuver: boolean
          p_cle: string
          p_id: string
          p_motif: string
        }
        Returns: Json
      }
      bo_candidatures_relais_lister: {
        Args: never
        Returns: {
          adresse: string
          candidat: string
          capacite: number
          categorie: string
          depose_le: string
          est_test: boolean
          horaires: string
          id: string
          latitude: number
          longitude: number
          message: string
          nom: string
          region: string
          telephone_masque: string
          ville: string
        }[]
      }
      bo_demande_de_role_trancher: {
        Args: {
          p_approuver: boolean
          p_cle: string
          p_id: string
          p_motif: string
        }
        Returns: Json
      }
      bo_demandes_de_role_lister: {
        Args: never
        Returns: {
          compte_versement: string
          compte_versement_mode_test: boolean
          convention_signee_le: string
          convention_version: string
          demande_le: string
          est_test: boolean
          id: string
          identite_methode: string
          identite_mode_test: boolean
          identite_verifiee: boolean
          profil_id: string
          pseudo: string
          role: string
          statut: string
          ville: string
        }[]
      }
      bo_equipe_demander: {
        Args: {
          p_attribuer: boolean
          p_cle: string
          p_motif: string
          p_profil: string
          p_role:
            | "direction"
            | "support"
            | "moderation"
            | "logistique"
            | "finance"
            | "publicite"
            | "analyste"
        }
        Returns: Json
      }
      bo_equipe_demander_reactivation: {
        Args: { p_cle: string; p_motif: string; p_profil: string }
        Returns: Json
      }
      bo_equipe_inviter: {
        Args: {
          p_cle: string
          p_email: string
          p_equipe?: string
          p_est_test?: boolean
          p_motif: string
          p_profils_personnels?: string[]
          p_roles: (
            | "direction"
            | "support"
            | "moderation"
            | "logistique"
            | "finance"
            | "publicite"
            | "analyste"
          )[]
        }
        Returns: Json
      }
      bo_equipe_lister: { Args: never; Returns: Json }
      bo_equipe_suspendre: {
        Args: { p_cle: string; p_motif: string; p_profil: string }
        Returns: Json
      }
      bo_evenements_lister: {
        Args: {
          p_avant?: number
          p_inclure_test?: boolean
          p_limite?: number
          p_objet_id?: string
        }
        Returns: {
          acteur: string
          acteur_type: string
          entite: string
          est_test: boolean
          id: number
          le: string
          libelle: string
          objet_id: string
          objet_table: string
          ref: string
          service: string
        }[]
      }
      bo_hub_retirer: {
        Args: { p_cle: string; p_hub_id: string; p_motif: string }
        Returns: Json
      }
      bo_hub_valider: {
        Args: {
          p_cle: string
          p_detail_affiche: string
          p_hub_id: string
          p_landmark: string
        }
        Returns: Json
      }
      bo_hubs_a_valider: {
        Args: never
        Returns: {
          cree_le: string
          detail_affiche: string
          id: string
          latitude: number
          longitude: number
          nom: string
          region: string
          repere: string
          statut: string
          type_lieu: string
          ville: string
        }[]
      }
      bo_journal_lister: {
        Args: { p_avant?: number; p_filtres?: Json; p_limite?: number }
        Returns: Json
      }
      bo_litige_decider: {
        Args: {
          p_claim_id: string
          p_cle: string
          p_decision: Database["public"]["Enums"]["support_decision"]
          p_montant_cents: number
          p_motif: string
          p_phase_attendue: string
        }
        Returns: Json
      }
      bo_litiges_lister: {
        Args: never
        Returns: {
          a_emettre_cents: number
          acheteur: string
          commande_id: string
          decision: string
          decision_cents: number
          deja_rendu_cents: number
          description: string
          est_test: boolean
          famille: string
          id: string
          motif: string
          numero_commande: string
          ouvert_le: string
          phase: string
          reservation_cents: number
          reservation_depuis: string
          restant_cents: number
          solution_demandee: string
          total_cents: number
          vendeur: string
        }[]
      }
      bo_moi: { Args: never; Returns: Json }
      bo_operations_compteurs: {
        Args: { p_inclure_test?: boolean }
        Returns: {
          calcule_le: string
          code: string
          description: string
          libelle: string
          nombre: number
        }[]
      }
      bo_operations_lister: {
        Args: {
          p_compteur?: string
          p_inclure_test?: boolean
          p_recherche?: string
          p_service?: string
          p_termines?: boolean
        }
        Returns: Database["public"]["CompositeTypes"]["bo_operation"][]
        SetofOptions: {
          from: "*"
          to: "bo_operation"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      bo_rejoindre: { Args: never; Returns: Json }
      bo_taches_automatiques: {
        Args: never
        Returns: {
          code: string
          dernier_passage: string
          dernier_succes: string
          derniere_erreur: string
          derniere_erreur_le: string
          description: string
          erreurs_24h: number
          etat: string
          executions_24h: number
          libelle: string
          periode_minutes: number
        }[]
      }
      bo_transporteur_regler: {
        Args: {
          p_cle: string
          p_commandes: string[]
          p_reference: string
          p_total_attendu_cents: number
          p_transporteur: string
        }
        Returns: Json
      }
      bo_transporteurs_a_regler: {
        Args: never
        Returns: {
          commande_id: string
          depuis: string
          du_cents: number
          est_test: boolean
          mode_envoi: string
          numero: string
          retour_inclus: boolean
        }[]
      }
      bo_validation_decider: {
        Args: {
          p_approuver: boolean
          p_cle: string
          p_motif: string
          p_validation: string
        }
        Returns: Json
      }
      bo_validations_lister: { Args: never; Returns: Json }
      candidater_relais: {
        Args: {
          p_address: string
          p_capacity: number
          p_category: Database["public"]["Enums"]["business_category"]
          p_city: string
          p_latitude: number
          p_longitude: number
          p_message?: string
          p_name: string
          p_operating_hours?: string
          p_phone?: string
          p_region?: string
        }
        Returns: {
          address: string
          applicant_id: string
          business_id: string | null
          capacity: number
          category: Database["public"]["Enums"]["business_category"]
          city: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          hub_id: string | null
          id: string
          latitude: number
          longitude: number
          message: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          region: string | null
          status: Database["public"]["Enums"]["hub_application_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hub_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      chercher_cotransporteurs: {
        Args: {
          p_product_id: string
          p_quand?: string
          p_ville_arrivee: string
        }
        Returns: {
          arrival_city: string
          avatar_url: string
          departure_city: string
          departure_hub_id: string
          departure_hub_name: string
          livraisons: number
          participation_cents: number
          passage_at: string
          places_restantes: number
          rating: number
          remise_at: string
          route_id: string
          transport_mode: Database["public"]["Enums"]["transport_mode"]
          transporter_id: string
          username: string
          vehicle_info: string
        }[]
      }
      choisir_hub_de_remise: {
        Args: { p_hub_id: string; p_mission_id: string }
        Returns: {
          buyer_id: string
          buyer_qr_code: string | null
          cancellation_reason:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          created_at: string
          current_attempt: number
          delay_protocol_id: number
          delivery_hub_chosen_at: string | null
          delivery_hub_id: string | null
          delivery_scheduled_at: string | null
          delivery_validated_at: string | null
          group_id: string | null
          hors_hub_etapes: Database["public"]["Enums"]["hub_etape"][]
          id: string
          is_off_hub: boolean
          is_return: boolean
          max_attempts: number
          off_hub_address: string | null
          order_id: string | null
          package_description: string | null
          package_photo: string | null
          package_weight_kg: number | null
          parcel_format: Database["public"]["Enums"]["parcel_format"] | null
          pickup_hub_id: string | null
          pickup_scheduled_at: string | null
          pickup_validated_at: string | null
          platform_fee_cents: number
          price_cents: number
          proposal_expires_at: string | null
          route_id: string | null
          seller_id: string
          seller_qr_code: string | null
          seller_timer_end: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["mission_status"]
          tolerance_minutes: number
          tracking_number: string | null
          transporter_earning_cents: number
          transporter_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "missions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_username: {
        Args: { p_username: string }
        Returns: {
          account_type: Database["public"]["Enums"]["account_type"]
          anonymized_at: string | null
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string | null
          est_test: boolean
          first_name: string
          geo: unknown
          id: string
          is_dark_mode: boolean
          is_demo: boolean
          is_verified_ecommerce: boolean
          joined_at: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_name: string
          locale: string
          phone: string | null
          provider: Database["public"]["Enums"]["auth_provider"] | null
          rating: number | null
          region: string | null
          review_count: number
          show_phone_on_listings: boolean
          total_purchases: number
          total_sales: number
          updated_at: string
          username: string | null
          username_authorized: boolean
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirmer_colivraison_vendeur: {
        Args: { p_shipment_id: string }
        Returns: {
          buyer_id: string
          buyer_qr_code: string | null
          cancellation_reason:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          created_at: string
          current_attempt: number
          delay_protocol_id: number
          delivery_hub_chosen_at: string | null
          delivery_hub_id: string | null
          delivery_scheduled_at: string | null
          delivery_validated_at: string | null
          group_id: string | null
          hors_hub_etapes: Database["public"]["Enums"]["hub_etape"][]
          id: string
          is_off_hub: boolean
          is_return: boolean
          max_attempts: number
          off_hub_address: string | null
          order_id: string | null
          package_description: string | null
          package_photo: string | null
          package_weight_kg: number | null
          parcel_format: Database["public"]["Enums"]["parcel_format"] | null
          pickup_hub_id: string | null
          pickup_scheduled_at: string | null
          pickup_validated_at: string | null
          platform_fee_cents: number
          price_cents: number
          proposal_expires_at: string | null
          route_id: string | null
          seller_id: string
          seller_qr_code: string | null
          seller_timer_end: string | null
          shipment_id: string | null
          status: Database["public"]["Enums"]["mission_status"]
          tolerance_minutes: number
          tracking_number: string | null
          transporter_earning_cents: number
          transporter_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "missions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirmer_place: {
        Args: { p_session_id: string }
        Returns: {
          confirmed_at: string | null
          id: string
          last_seen_at: string | null
          lock_expires_at: string | null
          profile_id: string
          reexpiry_count: number
          released_at: string | null
          reserved_at: string
          role: Database["public"]["Enums"]["live_seat_role"]
          session_id: string
          state: Database["public"]["Enums"]["live_seat_state"]
        }
        SetofOptions: {
          from: "*"
          to: "live_seats"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirmer_reception: { Args: { p_order_id: string }; Returns: string }
      constater_absence: {
        Args: { p_photo_path: string; p_shipment_id: string }
        Returns: string
      }
      courtage_annuler: {
        Args: { p_product_id: string }
        Returns: {
          created_at: string
          exclu_attempts: number
          flash_wave_count: number
          id: string
          product_id: string
          propositions_ends_at: string
          rechoice_ends_at: string | null
          selection_mode:
            | Database["public"]["Enums"]["courtage_selection_mode"]
            | null
          seller_choice_ends_at: string | null
          sold_to_buyer_id: string | null
          status: Database["public"]["Enums"]["courtage_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "courtage_listings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      courtage_faire_le_point: {
        Args: { p_product_id: string }
        Returns: {
          created_at: string
          exclu_attempts: number
          flash_wave_count: number
          id: string
          product_id: string
          propositions_ends_at: string
          rechoice_ends_at: string | null
          selection_mode:
            | Database["public"]["Enums"]["courtage_selection_mode"]
            | null
          seller_choice_ends_at: string | null
          sold_to_buyer_id: string | null
          status: Database["public"]["Enums"]["courtage_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "courtage_listings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      courtage_fermer_propositions: {
        Args: { p_product_id: string }
        Returns: {
          created_at: string
          exclu_attempts: number
          flash_wave_count: number
          id: string
          product_id: string
          propositions_ends_at: string
          rechoice_ends_at: string | null
          selection_mode:
            | Database["public"]["Enums"]["courtage_selection_mode"]
            | null
          seller_choice_ends_at: string | null
          sold_to_buyer_id: string | null
          status: Database["public"]["Enums"]["courtage_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "courtage_listings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      courtage_masquer_proposition: {
        Args: { p_hidden?: boolean; p_proposition_id: string }
        Returns: undefined
      }
      courtage_proposer: {
        Args: {
          p_amount_cents: number
          p_anonymized?: boolean
          p_h2h_compatible?: boolean
          p_handover?: Database["public"]["Enums"]["courtage_handover"]
          p_message?: string
          p_product_id: string
        }
        Returns: {
          amount_cents: number
          anonymized: boolean
          buyer_id: string
          created_at: string
          h2h_logistic_compatible: boolean | null
          hidden: boolean
          id: string
          listing_id: string
          message: string | null
          preferred_handover:
            | Database["public"]["Enums"]["courtage_handover"]
            | null
          updated_at: string
          withdrawn: boolean
        }
        SetofOptions: {
          from: "*"
          to: "courtage_propositions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      courtage_retirer_proposition: {
        Args: { p_proposition_id: string }
        Returns: undefined
      }
      courtage_selectionner: {
        Args: {
          p_buyer_ids: string[]
          p_mode: Database["public"]["Enums"]["courtage_selection_mode"]
          p_product_id: string
        }
        Returns: {
          created_at: string
          exclu_attempts: number
          flash_wave_count: number
          id: string
          product_id: string
          propositions_ends_at: string
          rechoice_ends_at: string | null
          selection_mode:
            | Database["public"]["Enums"]["courtage_selection_mode"]
            | null
          seller_choice_ends_at: string | null
          sold_to_buyer_id: string | null
          status: Database["public"]["Enums"]["courtage_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "courtage_listings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      creer_live_session: {
        Args: {
          p_article_total?: number
          p_articles: Json
          p_boost_window?: Database["public"]["Enums"]["live_boost_window"]
          p_categorie?: string
          p_format?: Database["public"]["Enums"]["live_format"]
          p_pack_id?: Database["public"]["Enums"]["live_pack_id"]
          p_scheduled_at?: string
          p_tags?: string[]
          p_thumbnail?: string
          p_timer_added?: number
          p_titre: string
          p_total_seats?: number
          p_vip_buyer_seats?: number
        }
        Returns: string
      }
      creer_proposition_echange: {
        Args: {
          p_cash_adjustment_cents?: number
          p_message?: string
          p_proposed_product_ids: string[]
          p_target_product_id: string
        }
        Returns: {
          cash_adjustment_cents: number
          created_at: string
          id: string
          logistics: Database["public"]["Enums"]["exchange_logistics"]
          message: string | null
          proposed_product_ids: string[]
          proposer_id: string
          resulting_order_id: string | null
          status: Database["public"]["Enums"]["exchange_status"]
          target_product_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "exchange_propositions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      decider_litige: {
        Args: {
          p_claim_id: string
          p_decision: Database["public"]["Enums"]["support_decision"]
          p_montant_cents?: number
        }
        Returns: {
          a_rembourser_cents: number
          claim_id: string
          order_id: string
        }[]
      }
      declarer_incident: {
        Args: {
          p_accuracy_confirmed: boolean
          p_answers?: Json
          p_comment?: string
          p_contests_id?: string
          p_latitude?: number
          p_longitude?: number
          p_mission_id: string
          p_proof_paths?: string[]
          p_reason?: string
          p_type: Database["public"]["Enums"]["incident_form_type"]
        }
        Returns: {
          declaration_id: string
          declaree_le: string
          fin_contestation: string
          rendez_vous_le: string
          role_declarant: Database["public"]["Enums"]["declarant_role"]
          statut_mission: Database["public"]["Enums"]["mission_form_status"]
        }[]
      }
      declarer_presence_hub: {
        Args: {
          p_accuracy_m?: number
          p_etape: Database["public"]["Enums"]["hub_etape"]
          p_latitude: number
          p_longitude: number
          p_mission_id: string
        }
        Returns: {
          dans_la_zone: boolean
          declaree_le: string
          distance_m: number
          rayon_m: number
          retard_minutes: number
          validee_le: string
        }[]
      }
      delete_my_account: {
        Args: never
        Returns: {
          account_type: Database["public"]["Enums"]["account_type"]
          anonymized_at: string | null
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string | null
          est_test: boolean
          first_name: string
          geo: unknown
          id: string
          is_dark_mode: boolean
          is_demo: boolean
          is_verified_ecommerce: boolean
          joined_at: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_name: string
          locale: string
          phone: string | null
          provider: Database["public"]["Enums"]["auth_provider"] | null
          rating: number | null
          region: string | null
          review_count: number
          show_phone_on_listings: boolean
          total_purchases: number
          total_sales: number
          updated_at: string
          username: string | null
          username_authorized: boolean
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      demander_acces_annonce: {
        Args: { p_product_id: string }
        Returns: {
          decided_at: string | null
          id: string
          product_id: string
          requested_at: string
          requester_id: string
          status: Database["public"]["Enums"]["access_request_status"]
        }
        SetofOptions: {
          from: "*"
          to: "listing_access_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      demander_hors_hub: {
        Args: {
          p_adresse: string
          p_etape: Database["public"]["Enums"]["hub_etape"]
          p_heures?: number
          p_mission_id: string
          p_motif?: string
        }
        Returns: {
          adresse_proposee: string
          created_at: string
          decide_le: string | null
          decideur_id: string
          demandeur_id: string
          etape: Database["public"]["Enums"]["hub_etape"]
          expire_le: string
          frais_cents: number | null
          id: string
          mission_id: string
          motif: string | null
          motif_refus: string | null
          statut: Database["public"]["Enums"]["hors_hub_statut"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "demandes_hors_hub"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deposer_avis: {
        Args: { p_commentaire?: string; p_note: number; p_order_id: string }
        Returns: string
      }
      enregistrer_vue: { Args: { p_product_id: string }; Returns: boolean }
      ensure_profile: {
        Args: never
        Returns: {
          account_type: Database["public"]["Enums"]["account_type"]
          anonymized_at: string | null
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string | null
          est_test: boolean
          first_name: string
          geo: unknown
          id: string
          is_dark_mode: boolean
          is_demo: boolean
          is_verified_ecommerce: boolean
          joined_at: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_name: string
          locale: string
          phone: string | null
          provider: Database["public"]["Enums"]["auth_provider"] | null
          rating: number | null
          region: string | null
          review_count: number
          show_phone_on_listings: boolean
          total_purchases: number
          total_sales: number
          updated_at: string
          username: string | null
          username_authorized: boolean
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      expirer_demandes_hors_hub: { Args: never; Returns: number }
      faire_le_point_places: { Args: { p_session_id: string }; Returns: number }
      frais_modification: { Args: { p_product_id: string }; Returns: number }
      horloge_autorisee: { Args: { p_jeton: string }; Returns: boolean }
      hubs_de_remise_proposes: {
        Args: { p_mission_id: string }
        Returns: {
          address: string
          city: string
          detail_affiche: string
          est_choisi: boolean
          id: string
          latitude: number
          longitude: number
          name: string
          passage_prevu: string
          place_type: Database["public"]["Enums"]["hub_place_type"]
          zone_radius_m: number
        }[]
      }
      jeton_appareil_perime: { Args: { p_jeton: string }; Returns: number }
      journal_expedition: {
        Args: { p_order_id: string }
        Returns: {
          acteur: string
          etat_apres: Database["public"]["Enums"]["shipment_state"]
          etat_avant: Database["public"]["Enums"]["shipment_state"]
          nature: Database["public"]["Enums"]["handoff_kind"]
          origine: Database["public"]["Enums"]["handoff_app"]
          rang: number
          resultat: Database["public"]["Enums"]["scan_result"]
          role_acteur: Database["public"]["Enums"]["handoff_role"]
          survenu_le: string
        }[]
      }
      liberer_place: { Args: { p_session_id: string }; Returns: undefined }
      live_annuler_article: {
        Args: { p_article_id: string }
        Returns: {
          exclu_attempts: number
          flash_wave_count: number
          id: string
          outcome: Database["public"]["Enums"]["live_article_outcome"]
          phase: Database["public"]["Enums"]["live_article_phase"] | null
          phase_ends_at: string | null
          position: number
          product_id: string
          rallonge_count: number
          rallonge_presentation_seconds: number
          rallonge_propositions_seconds: number
          selection_mode:
            | Database["public"]["Enums"]["live_selection_mode"]
            | null
          session_id: string
          sold_at: string | null
          sold_to_buyer_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "live_articles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      live_demarrer: {
        Args: { p_session_id: string }
        Returns: {
          article_total: number | null
          boost_window: Database["public"]["Enums"]["live_boost_window"] | null
          category_id: string | null
          created_at: string
          ended_at: string | null
          format: Database["public"]["Enums"]["live_format"]
          host_id: string
          id: string
          pack_id: Database["public"]["Enums"]["live_pack_id"] | null
          playback_url: string | null
          product_count: number
          product_ids: string[]
          rallonge_seconds_used: number
          replay_uid: string | null
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["live_status"]
          stream_state: Database["public"]["Enums"]["live_stream_state"]
          stream_uid: string | null
          tags: string[]
          thumbnail: string | null
          timer_added_seconds: number
          title: string
          total_seats: number | null
          updated_at: string
          viewer_count: number
          vip_buyer_seats: number | null
        }
        SetofOptions: {
          from: "*"
          to: "live_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      live_faire_le_point: {
        Args: { p_article_id: string }
        Returns: {
          exclu_attempts: number
          flash_wave_count: number
          id: string
          outcome: Database["public"]["Enums"]["live_article_outcome"]
          phase: Database["public"]["Enums"]["live_article_phase"] | null
          phase_ends_at: string | null
          position: number
          product_id: string
          rallonge_count: number
          rallonge_presentation_seconds: number
          rallonge_propositions_seconds: number
          selection_mode:
            | Database["public"]["Enums"]["live_selection_mode"]
            | null
          session_id: string
          sold_at: string | null
          sold_to_buyer_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "live_articles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      live_phase: {
        Args: { p_session_id: string }
        Returns: {
          article_id: string
          article_position: number
          etape: string
          phase: Database["public"]["Enums"]["live_article_phase"]
          phase_ends_at: string
        }[]
      }
      live_proposer: {
        Args: { p_amount_cents: number; p_article_id: string }
        Returns: {
          amount_cents: number
          article_id: string
          buyer_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["proposition_status"]
        }
        SetofOptions: {
          from: "*"
          to: "live_propositions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      live_rallonger: {
        Args: { p_article_id: string; p_phase: string }
        Returns: {
          exclu_attempts: number
          flash_wave_count: number
          id: string
          outcome: Database["public"]["Enums"]["live_article_outcome"]
          phase: Database["public"]["Enums"]["live_article_phase"] | null
          phase_ends_at: string | null
          position: number
          product_id: string
          rallonge_count: number
          rallonge_presentation_seconds: number
          rallonge_propositions_seconds: number
          selection_mode:
            | Database["public"]["Enums"]["live_selection_mode"]
            | null
          session_id: string
          sold_at: string | null
          sold_to_buyer_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "live_articles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      live_renoncer_acces: { Args: { p_access_id: string }; Returns: undefined }
      live_retirer_replay: { Args: { p_session_id: string }; Returns: boolean }
      live_selectionner: {
        Args: {
          p_article_id: string
          p_buyer_ids: string[]
          p_mode: Database["public"]["Enums"]["live_selection_mode"]
        }
        Returns: {
          exclu_attempts: number
          flash_wave_count: number
          id: string
          outcome: Database["public"]["Enums"]["live_article_outcome"]
          phase: Database["public"]["Enums"]["live_article_phase"] | null
          phase_ends_at: string | null
          position: number
          product_id: string
          rallonge_count: number
          rallonge_presentation_seconds: number
          rallonge_propositions_seconds: number
          selection_mode:
            | Database["public"]["Enums"]["live_selection_mode"]
            | null
          session_id: string
          sold_at: string | null
          sold_to_buyer_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "live_articles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      live_terminer: {
        Args: { p_session_id: string }
        Returns: {
          article_total: number | null
          boost_window: Database["public"]["Enums"]["live_boost_window"] | null
          category_id: string | null
          created_at: string
          ended_at: string | null
          format: Database["public"]["Enums"]["live_format"]
          host_id: string
          id: string
          pack_id: Database["public"]["Enums"]["live_pack_id"] | null
          playback_url: string | null
          product_count: number
          product_ids: string[]
          rallonge_seconds_used: number
          replay_uid: string | null
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["live_status"]
          stream_state: Database["public"]["Enums"]["live_stream_state"]
          stream_uid: string | null
          tags: string[]
          thumbnail: string | null
          timer_added_seconds: number
          title: string
          total_seats: number | null
          updated_at: string
          viewer_count: number
          vip_buyer_seats: number | null
        }
        SetofOptions: {
          from: "*"
          to: "live_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ma_vente: {
        Args: { p_product_id: string }
        Returns: {
          acheteur: string
          acheteur_id: string
          commission_cents: number
          etat: string
          frais_livraison_cents: number
          methode: string
          motif: string
          net_cents: number
          net_du_grand_livre: boolean
          numero: string
          order_id: string
          prix_cents: number
          vendu_le: string
          versable_le: string
          verse_le: string
        }[]
      }
      maj_profil_cotransporteur: {
        Args: {
          p_transport_types?: Database["public"]["Enums"]["transport_mode"][]
          p_vehicle_info?: string
          p_vehicle_plate?: string
        }
        Returns: undefined
      }
      marquer_expedie: {
        Args: { p_order_id: string; p_tracking?: string }
        Returns: undefined
      }
      marquer_lu: { Args: { p_conversation_id: string }; Returns: undefined }
      mes_factures: {
        Args: { p_limite?: number }
        Returns: {
          currency: string
          invoice_number: string
          issued_at: string
          kind: string
          lines: Json
          related_ref: string
          total_cents: number
          vat_cents: number
          vat_rate: number
        }[]
      }
      mes_participations: {
        Args: never
        Returns: {
          colivraisons: number
          en_attente_cents: number
          solde_cents: number
          versable_cents: number
          verse_cents: number
        }[]
      }
      mes_statistiques: { Args: never; Returns: Json }
      modele_frais_partage_actif: { Args: never; Returns: boolean }
      modifier_annonce: {
        Args: { p_changements: Json; p_product_id: string }
        Returns: {
          applique: boolean
          edit_id: string
          frais_cents: number
        }[]
      }
      modifier_partage_frais: {
        Args: {
          p_part_livraison: number
          p_part_service: number
          p_product_id: string
        }
        Returns: {
          part_livraison: number
          part_service: number
        }[]
      }
      mon_code_de_remise: {
        Args: { p_order_id: string }
        Returns: {
          code: string
          etat: Database["public"]["Enums"]["shipment_state"]
          role: string
          shipment_id: string
          tracking_number: string
        }[]
      }
      mon_compte_versement: {
        Args: never
        Returns: {
          a_un_compte: boolean
          du_cents: number
          peut_encaisser: boolean
          peut_etre_verse: boolean
        }[]
      }
      mon_identite: { Args: never; Returns: Json }
      mon_journal_participations: {
        Args: { p_limite?: number }
        Returns: {
          evenement: string
          libelle: string
          montant_cents: number
          order_id: string
          sens: string
          survenu_le: string
          tracking_number: string
        }[]
      }
      notifications_a_pousser: {
        Args: { p_limite?: number }
        Returns: {
          corps: string
          jeton: string
          notification_id: string
          route: string
          titre: string
          type_notif: string
        }[]
      }
      notifications_a_repousser: { Args: { p_ids: string[] }; Returns: number }
      open_order_claim: {
        Args: {
          p_consult_authorized: boolean
          p_description: string
          p_family: Database["public"]["Enums"]["claim_family"]
          p_good_faith: boolean
          p_order_id: string
          p_package_state: Database["public"]["Enums"]["package_state"]
          p_reason: string
          p_requested_solution: Database["public"]["Enums"]["requested_solution"]
        }
        Returns: {
          agreed_solution:
            | Database["public"]["Enums"]["requested_solution"]
            | null
          amicable_deadline: string | null
          buyer_id: string
          closed_at: string | null
          consult_authorized: boolean
          conversation_id: string | null
          created_at: string
          damage_detail: string | null
          deadline: string
          decision: Database["public"]["Enums"]["support_decision"] | null
          decision_amount_cents: number | null
          description: string
          family: Database["public"]["Enums"]["claim_family"]
          good_faith: boolean
          id: string
          item_usage: string | null
          journey: Database["public"]["Enums"]["claim_journey"]
          order_id: string
          package_damages: string[]
          package_state: Database["public"]["Enums"]["package_state"]
          phase: Database["public"]["Enums"]["claim_phase"]
          reason: string
          requested_solution: Database["public"]["Enums"]["requested_solution"]
          return_fee_exception:
            | Database["public"]["Enums"]["return_fee_exception"]
            | null
          return_fee_payer: Database["public"]["Enums"]["return_fee_payer"]
          return_organize_deadline: string | null
          return_validation_deadline: string | null
          seller_id: string
          updated_at: string
          windows_id: number
        }
        SetofOptions: {
          from: "*"
          to: "order_claims"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ouvrir_conversation: {
        Args: {
          p_exchange_proposition_id?: string
          p_je_cherche_proposition_id?: string
          p_order_id?: string
          p_product_id?: string
        }
        Returns: {
          created_at: string
          dm_key: string | null
          id: string
          kind: Database["public"]["Enums"]["conversation_kind"]
          order_id: string | null
          product_id: string | null
          shipment_id: string | null
          shipping_method: Database["public"]["Enums"]["shipping_method"] | null
          tracking_number: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "conversations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ouvrir_courtage: {
        Args: {
          p_boost?: boolean
          p_product_id: string
          p_total_hours?: number
        }
        Returns: {
          total_cents: number
        }[]
      }
      ouvrir_fil_colivraison: {
        Args: { p_avec: string; p_mission_id: string }
        Returns: {
          created_at: string
          dm_key: string | null
          id: string
          kind: Database["public"]["Enums"]["conversation_kind"]
          order_id: string | null
          product_id: string | null
          shipment_id: string | null
          shipping_method: Database["public"]["Enums"]["shipping_method"] | null
          tracking_number: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "conversations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      passer_commande: {
        Args: {
          p_delivery_address?: Json
          p_product_id: string
          p_shipping_method: Database["public"]["Enums"]["shipping_method"]
          p_transporter_id?: string
        }
        Returns: {
          delivery_fee_cents: number
          delivery_seller_pct: number
          delivery_total_cents: number
          fee_model: string
          id: string
          order_number: string
          service_buyer_cents: number
          service_fee_cents: number
          service_seller_pct: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
        }[]
      }
      peut_ecouter_live_public: {
        Args: { p_session: string }
        Returns: boolean
      }
      places_restantes: {
        Args: { p_session_id: string }
        Returns: {
          capacite: number
          restantes: number
          role: Database["public"]["Enums"]["live_seat_role"]
        }[]
      }
      prepaiements_en_cours: { Args: { p_product_id: string }; Returns: number }
      preparer_confirmation_disponibilite: {
        Args: { p_order_id: string }
        Returns: {
          availability_deadline: string
          order_number: string
          seller_charge_cents: number
          total_cents: number
        }[]
      }
      preparer_paiement: {
        Args: { p_order_id: string }
        Returns: {
          devise: string
          intention: string
          montant_cents: number
          numero: string
        }[]
      }
      preparer_paiement_option: {
        Args: { p_boost_id: string; p_kind: string }
        Returns: {
          devise: string
          intention: string
          libelle: string
          montant_cents: number
        }[]
      }
      preparer_verification_identite: {
        Args: { p_consentement: boolean; p_livemode: boolean }
        Returns: Json
      }
      presence_au_hub: {
        Args: {
          p_etape: Database["public"]["Enums"]["hub_etape"]
          p_mission_id: string
        }
        Returns: {
          a_declare: boolean
          dans_la_zone: boolean
          declaree_le: string
          distance_m: number
          est_moi: boolean
          gps_partage: boolean
          latitude: number
          longitude: number
          partie: Database["public"]["Enums"]["hub_partie"]
          rayon_m: number
          retard_minutes: number
        }[]
      }
      publier_trajet: {
        Args: {
          p_arrets: Json
          p_arrival_city: string
          p_departure_city: string
          p_departure_time?: string
          p_max_packages?: number
          p_max_size?: Database["public"]["Enums"]["parcel_format"]
          p_max_weight_kg?: number
          p_off_hub_possible?: boolean
          p_recurring_days?: number[]
          p_transport_mode?: Database["public"]["Enums"]["transport_mode"]
          p_type: Database["public"]["Enums"]["route_type"]
        }
        Returns: {
          arrival_city: string
          created_at: string
          delivery_hub_ids: string[]
          departure_city: string
          departure_hub_id: string | null
          departure_time: string | null
          distance_km: number | null
          estimated_arrival: string | null
          id: string
          max_packages: number
          max_size: Database["public"]["Enums"]["parcel_format"]
          max_weight_kg: number
          missions_count: number
          off_hub_possible: boolean
          price_per_item_cents: number | null
          recurring_days: number[]
          status: Database["public"]["Enums"]["route_status"]
          transport_mode: Database["public"]["Enums"]["transport_mode"]
          transporter_id: string
          type: Database["public"]["Enums"]["route_type"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "published_routes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_scan_event: {
        Args: {
          p_actor_role: Database["public"]["Enums"]["handoff_role"]
          p_app: Database["public"]["Enums"]["handoff_app"]
          p_client_event_id: string
          p_hub_id?: string
          p_kind: Database["public"]["Enums"]["handoff_kind"]
          p_photo_path?: string
          p_result: Database["public"]["Enums"]["scan_result"]
          p_scanned_code?: string
          p_shipment_id: string
          p_step?: number
          p_to_state?: Database["public"]["Enums"]["shipment_state"]
        }
        Returns: unknown
        SetofOptions: {
          from: "*"
          to: "handoff_events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      refuser_mission: {
        Args: { p_mission_id: string; p_motif?: string }
        Returns: undefined
      }
      regler_transporteur_tiers: {
        Args: {
          p_carrier: Database["public"]["Enums"]["shipping_method"]
          p_commandes: string[]
          p_reference: string
        }
        Returns: string
      }
      remboursement_a_emettre: {
        Args: { p_claim_id: string }
        Returns: {
          age_secondes: number
          montant_cents: number
          motif: string
          order_id: string
          payment_intent: string
          reprise: boolean
          reservation_id: string
        }[]
      }
      repondre_a_une_offre: {
        Args: { p_message_id: string; p_reponse: string }
        Returns: {
          call_duration: string | null
          conversation_id: string
          created_at: string
          delivered: boolean
          exchange_proposition_id: string | null
          id: string
          image_path: string | null
          je_cherche_proposition_id: string | null
          locked: boolean
          offer_amount_cents: number | null
          offer_status: Database["public"]["Enums"]["offer_status"] | null
          read: boolean
          receipt_id: string | null
          sender_id: string | null
          text: string | null
          type: Database["public"]["Enums"]["message_type"]
        }
        SetofOptions: {
          from: "*"
          to: "messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      repondre_demande_acces: {
        Args: {
          p_accorde: boolean
          p_product_id: string
          p_requester_id: string
        }
        Returns: {
          decided_at: string | null
          id: string
          product_id: string
          requested_at: string
          requester_id: string
          status: Database["public"]["Enums"]["access_request_status"]
        }
        SetofOptions: {
          from: "*"
          to: "listing_access_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      repondre_hors_hub: {
        Args: {
          p_accepter: boolean
          p_demande_id: string
          p_frais_cents?: number
          p_motif?: string
        }
        Returns: {
          adresse_proposee: string
          created_at: string
          decide_le: string | null
          decideur_id: string
          demandeur_id: string
          etape: Database["public"]["Enums"]["hub_etape"]
          expire_le: string
          frais_cents: number | null
          id: string
          mission_id: string
          motif: string | null
          motif_refus: string | null
          statut: Database["public"]["Enums"]["hors_hub_statut"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "demandes_hors_hub"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      repondre_litige: {
        Args: {
          p_authenticity_answer?: string
          p_claim_id: string
          p_conformity_answer?: string
          p_consult_authorized: boolean
          p_good_faith: boolean
          p_observations: string
          p_partial_amount_cents?: number
          p_partial_reason?: string
          p_proposal: string
          p_return_address?: string
          p_return_carrier?: string
          p_return_comment?: string
          p_return_recipient?: string
        }
        Returns: {
          agreed_solution:
            | Database["public"]["Enums"]["requested_solution"]
            | null
          amicable_deadline: string | null
          buyer_id: string
          closed_at: string | null
          consult_authorized: boolean
          conversation_id: string | null
          created_at: string
          damage_detail: string | null
          deadline: string
          decision: Database["public"]["Enums"]["support_decision"] | null
          decision_amount_cents: number | null
          description: string
          family: Database["public"]["Enums"]["claim_family"]
          good_faith: boolean
          id: string
          item_usage: string | null
          journey: Database["public"]["Enums"]["claim_journey"]
          order_id: string
          package_damages: string[]
          package_state: Database["public"]["Enums"]["package_state"]
          phase: Database["public"]["Enums"]["claim_phase"]
          reason: string
          requested_solution: Database["public"]["Enums"]["requested_solution"]
          return_fee_exception:
            | Database["public"]["Enums"]["return_fee_exception"]
            | null
          return_fee_payer: Database["public"]["Enums"]["return_fee_payer"]
          return_organize_deadline: string | null
          return_validation_deadline: string | null
          seller_id: string
          updated_at: string
          windows_id: number
        }
        SetofOptions: {
          from: "*"
          to: "order_claims"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      repondre_proposition_echange: {
        Args: {
          p_proposition_id: string
          p_reponse: Database["public"]["Enums"]["exchange_status"]
        }
        Returns: {
          cash_adjustment_cents: number
          created_at: string
          id: string
          logistics: Database["public"]["Enums"]["exchange_logistics"]
          message: string | null
          proposed_product_ids: string[]
          proposer_id: string
          resulting_order_id: string | null
          status: Database["public"]["Enums"]["exchange_status"]
          target_product_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "exchange_propositions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      request_role: {
        Args: { p_role: Database["public"]["Enums"]["app_role"] }
        Returns: {
          activated_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          granted_at: string
          id: string
          profile_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["role_status"]
        }
        SetofOptions: {
          from: "*"
          to: "user_roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reserve_live_seat: {
        Args: {
          p_role?: Database["public"]["Enums"]["live_seat_role"]
          p_session_id: string
        }
        Returns: {
          confirmed_at: string | null
          id: string
          last_seen_at: string | null
          lock_expires_at: string | null
          profile_id: string
          reexpiry_count: number
          released_at: string | null
          reserved_at: string
          role: Database["public"]["Enums"]["live_seat_role"]
          session_id: string
          state: Database["public"]["Enums"]["live_seat_state"]
        }
        SetofOptions: {
          from: "*"
          to: "live_seats"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reserver_option_demande: {
        Args: {
          p_demande_id: string
          p_option_id: Database["public"]["Enums"]["visibility_option"]
        }
        Returns: {
          active: boolean
          category_id: string | null
          created_at: string
          demande_id: string
          expires_at: string | null
          id: string
          option_id: Database["public"]["Enums"]["visibility_option"]
          payment_id: string | null
          price_cents: number
        }
        SetofOptions: {
          from: "*"
          to: "je_cherche_boosts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reserver_option_visibilite: {
        Args: {
          p_option_id: Database["public"]["Enums"]["visibility_option"]
          p_product_id: string
        }
        Returns: {
          active: boolean
          category_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          option_id: Database["public"]["Enums"]["visibility_option"]
          payment_id: string | null
          price_cents: number
          product_id: string
        }
        SetofOptions: {
          from: "*"
          to: "product_boosts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reserver_options_publication: {
        Args: {
          p_photo_pack?: string
          p_product_id: string
          p_video_count?: number
          p_video_seconds?: number
        }
        Returns: {
          total_cents: number
        }[]
      }
      restant_remboursable: { Args: { p_order_id: string }; Returns: number }
      retirer_candidature_hub: {
        Args: { p_id: string }
        Returns: {
          address: string
          applicant_id: string
          business_id: string | null
          capacity: number
          category: Database["public"]["Enums"]["business_category"]
          city: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          hub_id: string | null
          id: string
          latitude: number
          longitude: number
          message: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          region: string | null
          status: Database["public"]["Enums"]["hub_application_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hub_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      retirer_hub: {
        Args: { p_hub_id: string; p_motif: string }
        Returns: {
          address: string | null
          city: string | null
          created_at: string
          detail_affiche: string
          geo: unknown
          id: string
          landmark: string
          latitude: number
          longitude: number
          map_point_validated_at: string | null
          map_point_validated_by: string | null
          name: string
          photos: string[]
          place_type: Database["public"]["Enums"]["hub_place_type"]
          region: string | null
          status: Database["public"]["Enums"]["hub_status"]
          updated_at: string
          zone_radius_m: number
        }
        SetofOptions: {
          from: "*"
          to: "hubs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      retirer_proposition_echange: {
        Args: { p_proposition_id: string }
        Returns: {
          cash_adjustment_cents: number
          created_at: string
          id: string
          logistics: Database["public"]["Enums"]["exchange_logistics"]
          message: string | null
          proposed_product_ids: string[]
          proposer_id: string
          resulting_order_id: string | null
          status: Database["public"]["Enums"]["exchange_status"]
          target_product_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "exchange_propositions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      retirer_trajet: { Args: { p_id: string }; Returns: undefined }
      signaler_annonce: {
        Args: {
          p_explanation: string
          p_listing_id: string
          p_proofs?: Json
          p_reason: Database["public"]["Enums"]["listing_report_reason"]
        }
        Returns: {
          created_at: string
          explanation: string
          good_faith: boolean
          id: string
          listing_id: string | null
          priority: Database["public"]["Enums"]["report_priority"]
          proofs: Json
          reason: Database["public"]["Enums"]["listing_report_reason"]
          reporter_id: string
          seller_id: string | null
          snapshot: Json
        }
        SetofOptions: {
          from: "*"
          to: "listing_reports"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      signaler_avis: {
        Args: {
          p_explanation: string
          p_reason: Database["public"]["Enums"]["review_report_reason"]
          p_review_id: string
        }
        Returns: {
          created_at: string
          explanation: string
          good_faith: boolean
          id: string
          reason: Database["public"]["Enums"]["review_report_reason"]
          reporter_id: string
          review_author_id: string | null
          review_id: string | null
          snapshot: Json
          status: Database["public"]["Enums"]["review_report_status"]
        }
        SetofOptions: {
          from: "*"
          to: "review_reports"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      signaler_hub: {
        Args: {
          p_explanation?: string
          p_hub_id: string
          p_mission_id?: string
          p_proofs?: Json
          p_reason: Database["public"]["Enums"]["hub_report_reason"]
        }
        Returns: {
          created_at: string
          explanation: string | null
          hub_id: string | null
          hub_snapshot: Json
          id: string
          mission_id: string | null
          proofs: Json
          reason: Database["public"]["Enums"]["hub_report_reason"]
          reporter_id: string
        }
        SetofOptions: {
          from: "*"
          to: "hub_reports"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      signaler_presence: { Args: { p_session_id: string }; Returns: undefined }
      signaler_utilisateur: {
        Args: {
          p_block_after?: boolean
          p_conversation_id?: string
          p_explanation: string
          p_proofs?: Json
          p_reason: Database["public"]["Enums"]["user_report_reason"]
          p_reported_user_id: string
        }
        Returns: {
          block_after: boolean
          context_snapshot: Json | null
          conversation_id: string | null
          created_at: string
          explanation: string
          good_faith: boolean
          id: string
          priority: Database["public"]["Enums"]["report_priority"]
          proofs: Json
          reason: Database["public"]["Enums"]["user_report_reason"]
          reported_user_id: string | null
          reporter_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_reports"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      stats_je_cherche: { Args: never; Returns: Json }
      stripe_absence_a_regler: {
        Args: { p_etape: string; p_shipment_id: string }
        Returns: string
      }
      stripe_absences_a_facturer: {
        Args: { p_limite?: number; p_livemode?: boolean }
        Returns: {
          buyer_id: string
          devise: string
          etape: string
          order_id: string
          order_number: string
          shipment_id: string
          stripe_customer_id: string
          total_cents: number
        }[]
      }
      stripe_annulations_a_traiter: {
        Args: { p_limite?: number }
        Returns: {
          cancel_reason: string
          intention_acheteur: string
          intention_vendeur: string
          livemode: boolean
          order_id: string
          statut_acheteur: Database["public"]["Enums"]["payment_status"]
          statut_vendeur: Database["public"]["Enums"]["payment_status"]
        }[]
      }
      stripe_annuler_paiement: {
        Args: {
          p_event_id: string
          p_order_id: string
          p_payment_intent_id: string
          p_statut?: string
        }
        Returns: Json
      }
      stripe_autoriser_paiement: {
        Args: {
          p_amount_cents: number
          p_event_id: string
          p_order_id: string
          p_payment_intent_id: string
        }
        Returns: Json
      }
      stripe_demander_annulation: {
        Args: { p_order_id: string; p_raison: string }
        Returns: undefined
      }
      stripe_encaisser_absence: {
        Args: { p_event_id: string; p_payment_intent_id: string }
        Returns: Json
      }
      stripe_encaisser_paiement: {
        Args: {
          p_amount_cents: number
          p_event_id: string
          p_order_id: string
          p_payment_intent_id: string
        }
        Returns: Json
      }
      stripe_frais_a_relever: {
        Args: { p_limite?: number }
        Returns: {
          livemode: boolean
          order_id: string
          payment_intent_id: string
        }[]
      }
      stripe_identite_a_rediger: {
        Args: { p_limite: number }
        Returns: {
          kyc_id: string
          livemode: boolean
          session_id: string
        }[]
      }
      stripe_identite_appliquer: {
        Args: {
          p_code_erreur: string
          p_livemode: boolean
          p_nom: string
          p_plateforme_en_reel: boolean
          p_prenom: string
          p_rapport: string
          p_redigee: boolean
          p_session_id: string
          p_source: string
          p_statut: string
          p_type_document: string
        }
        Returns: Json
      }
      stripe_identite_enregistrer_session: {
        Args: {
          p_kyc_id: string
          p_livemode: boolean
          p_plateforme_en_reel: boolean
          p_session_id: string
        }
        Returns: boolean
      }
      stripe_identite_redaction_notee: {
        Args: { p_kyc_id: string }
        Returns: boolean
      }
      stripe_litige_bancaire: {
        Args: {
          p_amount_cents: number
          p_charge_id: string
          p_dispute_id: string
          p_event_created?: string
          p_event_id: string
          p_evidence_due_by: string
          p_fee_cents: number
          p_payment_intent: string
          p_reason: string
          p_status: string
          p_type: string
        }
        Returns: Json
      }
      stripe_maj_compte: {
        Args: {
          p_account_id: string
          p_charges_enabled: boolean
          p_payouts_enabled: boolean
        }
        Returns: boolean
      }
      stripe_maj_versement: {
        Args: {
          p_event_id: string
          p_payout_id: string
          p_statut: Database["public"]["Enums"]["payout_status"]
        }
        Returns: Json
      }
      stripe_noter_absence: {
        Args: {
          p_amount_cents: number
          p_etape: string
          p_livemode?: boolean
          p_payment_intent_id: string
          p_shipment_id: string
          p_statut?: Database["public"]["Enums"]["payment_status"]
        }
        Returns: string
      }
      stripe_noter_client: {
        Args: {
          p_customer_id: string
          p_livemode?: boolean
          p_profile_id: string
        }
        Returns: undefined
      }
      stripe_noter_compte: {
        Args: {
          p_account_id: string
          p_charges_enabled: boolean
          p_livemode?: boolean
          p_payouts_enabled: boolean
          p_profile_id: string
        }
        Returns: undefined
      }
      stripe_noter_dette_vendeur: {
        Args: {
          p_montant_cents: number
          p_motif: string
          p_order_id: string
          p_refund_id?: string
          p_transfer_id: string
        }
        Returns: string
      }
      stripe_noter_frais: {
        Args: {
          p_balance_txn: string
          p_event_id: string
          p_fee_cents: number
          p_payment_intent_id: string
        }
        Returns: Json
      }
      stripe_noter_identite_compte: {
        Args: {
          p_account_id: string
          p_livemode: boolean
          p_nom: string
          p_plateforme_en_reel: boolean
          p_prenom: string
        }
        Returns: boolean
      }
      stripe_noter_intention: {
        Args: {
          p_amount_cents: number
          p_livemode?: boolean
          p_order_id: string
          p_payment_intent_id: string
        }
        Returns: undefined
      }
      stripe_noter_intention_vendeur: {
        Args: {
          p_livemode: boolean
          p_order_id: string
          p_payment_intent_id: string
        }
        Returns: undefined
      }
      stripe_noter_paiement_option: {
        Args: {
          p_amount_cents: number
          p_boost_id: string
          p_buyer_id: string
          p_intent_id: string
          p_kind: string
          p_livemode: boolean
        }
        Returns: string
      }
      stripe_noter_remboursement: {
        Args: {
          p_claim_id: string
          p_montant_cents: number
          p_motif: string
          p_order_id: string
          p_par: string
          p_refund_id: string
        }
        Returns: boolean
      }
      stripe_noter_reprise: {
        Args: {
          p_montant_cents: number
          p_order_id: string
          p_refund_id?: string
          p_reversal_id: string
          p_transfer_id: string
        }
        Returns: string
      }
      stripe_noter_versement: {
        Args: {
          p_commandes: string[]
          p_seller_id: string
          p_transfer_id: string
        }
        Returns: string
      }
      stripe_noter_versement_cotransporteur: {
        Args: {
          p_commandes: string[]
          p_transfer_id: string
          p_transporter_id: string
        }
        Returns: string
      }
      stripe_objet_de_test: {
        Args: {
          p_account_id?: string
          p_order_id?: string
          p_payment_intent?: string
          p_payout_id?: string
          p_session_id?: string
          p_shipment_id?: string
        }
        Returns: boolean
      }
      stripe_option_encaissee: {
        Args: { p_boost_id: string; p_intent_id: string; p_kind: string }
        Returns: Json
      }
      stripe_options_a_activer: {
        Args: { p_limite?: number }
        Returns: {
          boost_id: string
          kind: string
          livemode: boolean
          payment_intent_id: string
        }[]
      }
      stripe_part_vendeur_encaissee: {
        Args: {
          p_amount_cents: number
          p_event_id: string
          p_order_id: string
          p_payment_intent_id: string
        }
        Returns: Json
      }
      stripe_preparer_remboursement: {
        Args: { p_montant_cents: number; p_order_id: string }
        Returns: {
          montant_cents: number
          payment_intent: string
          restant_cents: number
        }[]
      }
      stripe_preparer_versement: {
        Args: { p_livemode?: boolean; p_seller_id: string }
        Returns: {
          commandes: string[]
          compte: string
          montant_cents: number
          payable: boolean
        }[]
      }
      stripe_preparer_versement_cotransporteur: {
        Args: { p_livemode?: boolean; p_transporter_id: string }
        Returns: {
          commandes: string[]
          compte: string
          montant_cents: number
          payable: boolean
        }[]
      }
      stripe_remboursement_echoue: {
        Args: { p_erreur: string; p_reservation_id: string }
        Returns: boolean
      }
      stripe_rembourser_paiement:
        | { Args: { p_event_id: string; p_order_id: string }; Returns: Json }
        | {
            Args: {
              p_cumule_cents: number
              p_event_id: string
              p_order_id: string
            }
            Returns: Json
          }
      stripe_reprise_due: {
        Args: { p_order_id: string; p_refund_cents: number }
        Returns: {
          a_reprendre_cents: number
          transfer_id: string
          verse_cents: number
        }[]
      }
      trancher_candidature_relais: {
        Args: { p_approuver: boolean; p_id: string; p_motif?: string }
        Returns: {
          address: string
          applicant_id: string
          business_id: string | null
          capacity: number
          category: Database["public"]["Enums"]["business_category"]
          city: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          hub_id: string | null
          id: string
          latitude: number
          longitude: number
          message: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          region: string | null
          status: Database["public"]["Enums"]["hub_application_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hub_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      trancher_role: {
        Args: { p_approuver: boolean; p_id: string; p_motif?: string }
        Returns: {
          activated_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          granted_at: string
          id: string
          profile_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["role_status"]
        }
        SetofOptions: {
          from: "*"
          to: "user_roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      transporteurs_a_regler: {
        Args: never
        Returns: {
          depuis: string
          du_cents: number
          order_id: string
          order_number: string
          retour_inclus: boolean
          shipping_method: Database["public"]["Enums"]["shipping_method"]
        }[]
      }
      valider_point_hub: {
        Args: {
          p_detail_affiche: string
          p_hub_id: string
          p_landmark?: string
        }
        Returns: {
          address: string | null
          city: string | null
          created_at: string
          detail_affiche: string
          geo: unknown
          id: string
          landmark: string
          latitude: number
          longitude: number
          map_point_validated_at: string | null
          map_point_validated_by: string | null
          name: string
          photos: string[]
          place_type: Database["public"]["Enums"]["hub_place_type"]
          region: string | null
          status: Database["public"]["Enums"]["hub_status"]
          updated_at: string
          zone_radius_m: number
        }
        SetofOptions: {
          from: "*"
          to: "hubs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      access_request_status: "pending" | "granted" | "refused"
      account_type: "individual" | "ecommerce"
      app_role: "buyer" | "seller" | "transporter" | "relais" | "admin"
      attempt_status: "scheduled" | "in_progress" | "completed" | "failed"
      attestation_status:
        | "required"
        | "identities_to_verify"
        | "data_frozen"
        | "photos_required"
        | "seller_declarations"
        | "draft_generated"
        | "awaiting_seller_signature"
        | "signed_by_seller"
        | "awaiting_buyer_decision"
        | "refused_by_buyer"
        | "accepted_by_buyer"
        | "signed_by_both"
        | "final_available"
        | "cancelled_or_replaced"
      auth_provider: "apple" | "google" | "facebook" | "phone"
      boost_tier: "essentiel" | "premium" | "ultra"
      business_category:
        | "cafe"
        | "bakery"
        | "grocery"
        | "pharmacy"
        | "newsstand"
        | "florist"
        | "bookstore"
        | "tabac"
        | "restaurant"
        | "other"
        | "domicile"
      business_status: "pending" | "verified" | "rejected"
      buyer_decision: "accepted" | "refused"
      cancellation_kind: "cancellation" | "refund"
      cancellation_reason:
        | "seller_no_show"
        | "buyer_no_show"
        | "transporter_cancelled_before_pickup"
        | "transporter_cancelled_after_pickup"
        | "seller_timer_expired"
        | "other"
      carrier_key:
        | "colissimo_home"
        | "mondial_home"
        | "mondial_locker"
        | "chronopost_home"
        | "chronopost_shop2shop"
        | "ups"
      claim_family:
        | "not_received_damaged"
        | "received_non_conforme"
        | "authenticity"
        | "other"
      claim_journey: "support_direct" | "seller_response"
      claim_party: "buyer" | "seller"
      claim_phase:
        | "open"
        | "support_direct"
        | "seller_response"
        | "amicable"
        | "support_review"
        | "decided"
        | "return_pending"
        | "return_in_transit"
        | "return_validation"
        | "closed"
        | "rejected"
      claim_proof_kind: "photo" | "video"
      claim_status: "pending" | "under_review" | "approved" | "rejected"
      claim_type: "damage" | "loss" | "non_conformity" | "non_delivery"
      commission_tier: "low" | "standard" | "high"
      conversation_kind: "dm" | "mission_group" | "support" | "live"
      courtage_handover: "hand_to_hand" | "h2h_logistic" | "relay" | "postal"
      courtage_selection_mode: "exclu" | "flash"
      courtage_status:
        | "propositions_open"
        | "cap_reached"
        | "propositions_closed"
        | "seller_choosing"
        | "exclu_active"
        | "flash_active"
        | "payment_validated"
        | "sold"
        | "unsold"
        | "cancelled"
        | "disputed"
      declarant_role: "buyer" | "seller" | "transporter"
      delivery_failure_reason:
        | "buyer_no_show"
        | "transporter_no_show"
        | "package_damaged"
        | "wrong_hub"
        | "other"
      exchange_logistics: "pending" | "handoff" | "h2h_logistic"
      exchange_status:
        | "pending"
        | "accepted"
        | "declined"
        | "withdrawn"
        | "completed"
      handoff_app:
        | "marketplace"
        | "logistic"
        | "relais"
        | "system"
        | "backoffice"
      handoff_kind:
        | "tracking_qr"
        | "seller_qr"
        | "buyer_qr"
        | "buyer_otp"
        | "photo"
        | "return_qr"
        | "geo_presence"
        | "system"
        | "transporter_qr"
        | "relay_qr"
        | "package_qr"
      handoff_role: "seller" | "buyer" | "transporter" | "relay" | "platform"
      hors_hub_statut: "pending" | "accepted" | "rejected" | "expired"
      hub_application_status: "pending" | "approved" | "rejected" | "withdrawn"
      hub_etape: "recuperation" | "remise"
      hub_partie: "vendeur" | "acheteur" | "cotransporteur"
      hub_place_type:
        | "parking"
        | "gare"
        | "station"
        | "entree"
        | "rond_point"
        | "commerce"
        | "place"
        | "port"
        | "eglise"
        | "aire_covoiturage"
        | "arret"
      hub_report_reason:
        | "closed"
        | "wrong_address"
        | "saturated"
        | "security"
        | "partner_uncooperative"
        | "other"
      hub_status: "active" | "inactive" | "full"
      incident_form_type:
        | "common"
        | "buyer_absent"
        | "contest_buyer_absent"
        | "transporter_absent"
        | "contest_transporter_absent"
        | "hub_blocked"
        | "seller_absent"
        | "contest_seller_absent"
        | "cancel_seller"
        | "cancel_buyer"
        | "cancel_transporter"
        | "refuse_package"
        | "collect_absent"
        | "contest_decision"
      incident_responsible: "transporter" | "relay" | "shared"
      insurance_tier: "basic" | "premium"
      je_cherche_status:
        | "active"
        | "propositions_recues"
        | "en_discussion"
        | "trouve"
        | "expiree"
        | "annulee"
      je_cherche_urgency: "urgent" | "this_week" | "this_month"
      kyc_status: "none" | "pending" | "verified" | "rejected"
      ledger_account_kind:
        | "buyer_funds"
        | "platform_revenue"
        | "insurance_pool"
        | "refund_reserve"
        | "stripe_fee_expense"
        | "seller_payable"
        | "courier_payable"
        | "relais_payable"
        | "external_carrier"
        | "buyer_receivable"
        | "courier_pool"
        | "platform_cash"
      ledger_event:
        | "buyer_charge"
        | "platform_commission"
        | "insurance_contribution"
        | "stripe_fee"
        | "seller_payout"
        | "courier_participation"
        | "relais_participation"
        | "relay_deposit_commission"
        | "third_party_return_billing"
        | "external_carrier_cost"
        | "refund"
        | "insurance_claim_payout"
        | "reserve_funding"
        | "reserve_release"
        | "exchange_soulte"
        | "courier_payout"
        | "payout_reversal"
        | "external_carrier_settlement"
      listing_edit_origin: "seller" | "handtohand" | "moderation"
      listing_option_kind:
        | "photo_pack"
        | "video_count"
        | "video_duration"
        | "insertion_fee"
        | "edit_fee"
        | "courtage_duration"
        | "courtage_boost"
      listing_report_reason:
        | "fraud"
        | "prohibited"
        | "counterfeit"
        | "misleading"
        | "stolen_photos"
        | "wrong_category"
        | "already_sold"
        | "off_platform"
        | "inappropriate"
        | "impersonation"
        | "other"
      listing_type: "fixed" | "offer" | "flash"
      live_article_outcome:
        | "pending"
        | "exclu_active"
        | "flash_active"
        | "sold"
        | "unsold"
        | "cancelled"
      live_article_phase: "presentation" | "propositions" | "choix" | "pause"
      live_boost_window: "immediate" | "h24" | "d7" | "d14" | "d30"
      live_format: "classic" | "exclusive" | "vip"
      live_option_kind:
        | "pack"
        | "boost"
        | "timer_extension"
        | "article_extension"
        | "seats"
      live_pack_id: "live_plus" | "live_vip_premium"
      live_seat_role: "buyer" | "spectator"
      live_seat_state:
        | "reserved"
        | "confirmed"
        | "waitlisted"
        | "released"
        | "no_show"
      live_selection_mode: "exclu_live" | "flash_access"
      live_status: "upcoming" | "live" | "ended"
      live_stream_state: "idle" | "connecting" | "live" | "ended"
      message_type:
        | "text"
        | "image"
        | "offer"
        | "exchange"
        | "jecherche"
        | "system"
        | "call_summary"
      mission_form_status: "pending" | "closed" | "blocked" | "support_review"
      mission_status:
        | "proposal"
        | "accepted"
        | "seller_pending"
        | "group_created"
        | "pickup_pending"
        | "picked_up"
        | "in_transit"
        | "deposited"
        | "delivery_pending"
        | "delivered"
        | "completed"
        | "cancelled"
        | "expired"
      notification_type:
        | "message"
        | "order"
        | "proposition"
        | "delivery"
        | "boost"
        | "exchange"
        | "mission_proposal"
        | "pickup"
        | "payout"
        | "dispute"
        | "system"
        | "incoming_package"
        | "pickup_done"
        | "co_delivery"
        | "price_drop"
        | "access_request"
        | "seat_freed"
        | "seat_reminder"
        | "vip_live"
        | "correction_requested"
        | "purchase_access"
      offer_status: "pending" | "accepted" | "rejected"
      order_status:
        | "pending"
        | "awaiting_seller"
        | "confirmed"
        | "picked_up"
        | "in_transit"
        | "at_hub"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "refunded"
      package_state: "yes" | "no" | "unknown" | "not_received"
      package_status: "incoming" | "in_store" | "picked_up" | "returned"
      parcel_format: "XS" | "S" | "M" | "L" | "XL" | "XXL"
      payment_status:
        | "requires_action"
        | "pre_authorized"
        | "captured"
        | "released"
        | "refunded"
        | "failed"
        | "canceled"
      payout_method: "iban" | "paypal"
      payout_status: "processing" | "paid" | "failed"
      photo_pack: "pack5" | "pack10"
      platform_invoice_kind:
        | "listing_boost"
        | "listing_edit"
        | "listing_insertion"
        | "photo_pack"
        | "photo_pack_upgrade"
        | "video_options"
        | "video_duration_upgrade"
        | "publication_capacites"
        | "courtage_boost"
        | "courtage_duration"
        | "live_boost"
        | "live_pack"
        | "live_timer_extension"
        | "live_vip_seats"
        | "article_extension"
        | "other"
        | "live_options"
      product_access_mode: "public" | "controlled"
      product_condition: "new" | "like_new" | "good" | "fair" | "poor"
      product_mode: "sale" | "exchange"
      product_status: "draft" | "active" | "reserved" | "sold" | "expired"
      proposition_status: "pending" | "accepted" | "declined" | "withdrawn"
      purchase_access_status: "active" | "paid" | "expired"
      receipt_delivery_kind:
        | "co_livraison"
        | "mondial_relay"
        | "main_propre"
        | "autre"
      receipt_status:
        | "purchase_initiated"
        | "payment_in_progress"
        | "payment_secured"
        | "transaction_in_progress"
        | "transaction_finalized"
        | "receipt_generating"
        | "receipt_available"
        | "receipt_amended"
        | "transaction_cancelled"
      report_kind: "buyer_vs_relay" | "transporter_vs_relay"
      report_outcome: "favor_relay" | "favor_reporter" | "mixed"
      report_priority: "normale" | "elevee" | "tres_elevee" | "critique"
      report_status: "awaiting_relay" | "in_review" | "resolved"
      requested_solution:
        | "refund_full"
        | "refund_partial"
        | "return_partial_refund"
        | "return_full_refund"
      return_fee_exception:
        | "agreement"
        | "seller_commitment"
        | "counterfeit"
        | "specific_decision"
      return_fee_payer: "buyer" | "seller" | "shared"
      return_relay_kind: "partner" | "locker"
      return_status: "pending_pickup" | "overdue" | "returned"
      return_tracking_mode: "tracked" | "registered"
      review_report_reason:
        | "offensive"
        | "personal_data"
        | "false_review"
        | "off_topic"
        | "hate_speech"
        | "other"
      review_report_status:
        | "nouveau"
        | "en_cours"
        | "accepte"
        | "rejete"
        | "cloture"
      role_status:
        | "active"
        | "pending_kyc"
        | "pending_convention"
        | "pending_validation"
        | "pending_verification"
        | "pending_config"
        | "suspended"
        | "rejected"
      route_status:
        | "active"
        | "paused"
        | "expired"
        | "scheduled"
        | "completed"
        | "cancelled"
      route_type: "recurring" | "one_time"
      scan_result:
        | "success"
        | "package_mismatch"
        | "wrong_code"
        | "no_eligible"
        | "expired_qr"
        | "out_of_window"
        | "duplicate"
      settlement_kind: "refund" | "pay" | "fee" | "kept" | "unpaid"
      settlement_party: "buyer" | "seller" | "transporter" | "platform"
      shipment_state:
        | "created"
        | "awaiting_transporter"
        | "accepted"
        | "seller_confirmed"
        | "pickup_pending"
        | "picked_up"
        | "in_transit"
        | "at_relay"
        | "awaiting_collection"
        | "out_for_delivery"
        | "delivered"
        | "completed"
        | "redelivery_pending"
        | "return_pending"
        | "returned"
        | "cancelled"
        | "disputed"
        | "expired"
      shipping_method:
        | "h2h_logistic"
        | "mondial_relay"
        | "colissimo"
        | "chronopost"
        | "ups"
        | "pickup"
      support_decision:
        | "refund_full"
        | "refund_partial"
        | "return_partial_refund"
        | "return_full_refund"
        | "pay_seller"
        | "rejected"
        | "other"
      transport_mode:
        | "walking"
        | "bike"
        | "scooter"
        | "moto"
        | "car"
        | "utilitaire"
        | "bus"
        | "train"
      tx_status: "pending" | "available" | "completed" | "paid" | "failed"
      user_report_reason:
        | "fraud"
        | "harassment"
        | "aggressive"
        | "spam"
        | "fake_profile"
        | "hate_speech"
        | "inappropriate"
        | "suspicious_meeting"
        | "rule_circumvention"
        | "suspicious_behavior"
        | "other"
      username_error:
        | "required"
        | "email"
        | "phone"
        | "too_short"
        | "too_long"
        | "charset"
        | "reserved"
        | "insult"
        | "taken"
      visibility_option:
        | "bump"
        | "daily7"
        | "daily14"
        | "daily30"
        | "urgent"
        | "courtage"
    }
    CompositeTypes: {
      bo_operation: {
        ref: string | null
        type: string | null
        service: string | null
        objet_table: string | null
        objet_id: string | null
        bien_titre: string | null
        bien_image: string | null
        participants: Json | null
        etape: string | null
        etape_libelle: string | null
        finance: string | null
        finance_libelle: string | null
        action_attendue: string | null
        acteur_attendu: string | null
        echeance: string | null
        localisation: string | null
        dernier_evenement: string | null
        dernier_evenement_le: string | null
        alerte: string | null
        alerte_libelle: string | null
        montant_cents: number | null
        paiement_en_attente: boolean | null
        est_test: boolean | null
        termine_le: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_request_status: ["pending", "granted", "refused"],
      account_type: ["individual", "ecommerce"],
      app_role: ["buyer", "seller", "transporter", "relais", "admin"],
      attempt_status: ["scheduled", "in_progress", "completed", "failed"],
      attestation_status: [
        "required",
        "identities_to_verify",
        "data_frozen",
        "photos_required",
        "seller_declarations",
        "draft_generated",
        "awaiting_seller_signature",
        "signed_by_seller",
        "awaiting_buyer_decision",
        "refused_by_buyer",
        "accepted_by_buyer",
        "signed_by_both",
        "final_available",
        "cancelled_or_replaced",
      ],
      auth_provider: ["apple", "google", "facebook", "phone"],
      boost_tier: ["essentiel", "premium", "ultra"],
      business_category: [
        "cafe",
        "bakery",
        "grocery",
        "pharmacy",
        "newsstand",
        "florist",
        "bookstore",
        "tabac",
        "restaurant",
        "other",
        "domicile",
      ],
      business_status: ["pending", "verified", "rejected"],
      buyer_decision: ["accepted", "refused"],
      cancellation_kind: ["cancellation", "refund"],
      cancellation_reason: [
        "seller_no_show",
        "buyer_no_show",
        "transporter_cancelled_before_pickup",
        "transporter_cancelled_after_pickup",
        "seller_timer_expired",
        "other",
      ],
      carrier_key: [
        "colissimo_home",
        "mondial_home",
        "mondial_locker",
        "chronopost_home",
        "chronopost_shop2shop",
        "ups",
      ],
      claim_family: [
        "not_received_damaged",
        "received_non_conforme",
        "authenticity",
        "other",
      ],
      claim_journey: ["support_direct", "seller_response"],
      claim_party: ["buyer", "seller"],
      claim_phase: [
        "open",
        "support_direct",
        "seller_response",
        "amicable",
        "support_review",
        "decided",
        "return_pending",
        "return_in_transit",
        "return_validation",
        "closed",
        "rejected",
      ],
      claim_proof_kind: ["photo", "video"],
      claim_status: ["pending", "under_review", "approved", "rejected"],
      claim_type: ["damage", "loss", "non_conformity", "non_delivery"],
      commission_tier: ["low", "standard", "high"],
      conversation_kind: ["dm", "mission_group", "support", "live"],
      courtage_handover: ["hand_to_hand", "h2h_logistic", "relay", "postal"],
      courtage_selection_mode: ["exclu", "flash"],
      courtage_status: [
        "propositions_open",
        "cap_reached",
        "propositions_closed",
        "seller_choosing",
        "exclu_active",
        "flash_active",
        "payment_validated",
        "sold",
        "unsold",
        "cancelled",
        "disputed",
      ],
      declarant_role: ["buyer", "seller", "transporter"],
      delivery_failure_reason: [
        "buyer_no_show",
        "transporter_no_show",
        "package_damaged",
        "wrong_hub",
        "other",
      ],
      exchange_logistics: ["pending", "handoff", "h2h_logistic"],
      exchange_status: [
        "pending",
        "accepted",
        "declined",
        "withdrawn",
        "completed",
      ],
      handoff_app: [
        "marketplace",
        "logistic",
        "relais",
        "system",
        "backoffice",
      ],
      handoff_kind: [
        "tracking_qr",
        "seller_qr",
        "buyer_qr",
        "buyer_otp",
        "photo",
        "return_qr",
        "geo_presence",
        "system",
        "transporter_qr",
        "relay_qr",
        "package_qr",
      ],
      handoff_role: ["seller", "buyer", "transporter", "relay", "platform"],
      hors_hub_statut: ["pending", "accepted", "rejected", "expired"],
      hub_application_status: ["pending", "approved", "rejected", "withdrawn"],
      hub_etape: ["recuperation", "remise"],
      hub_partie: ["vendeur", "acheteur", "cotransporteur"],
      hub_place_type: [
        "parking",
        "gare",
        "station",
        "entree",
        "rond_point",
        "commerce",
        "place",
        "port",
        "eglise",
        "aire_covoiturage",
        "arret",
      ],
      hub_report_reason: [
        "closed",
        "wrong_address",
        "saturated",
        "security",
        "partner_uncooperative",
        "other",
      ],
      hub_status: ["active", "inactive", "full"],
      incident_form_type: [
        "common",
        "buyer_absent",
        "contest_buyer_absent",
        "transporter_absent",
        "contest_transporter_absent",
        "hub_blocked",
        "seller_absent",
        "contest_seller_absent",
        "cancel_seller",
        "cancel_buyer",
        "cancel_transporter",
        "refuse_package",
        "collect_absent",
        "contest_decision",
      ],
      incident_responsible: ["transporter", "relay", "shared"],
      insurance_tier: ["basic", "premium"],
      je_cherche_status: [
        "active",
        "propositions_recues",
        "en_discussion",
        "trouve",
        "expiree",
        "annulee",
      ],
      je_cherche_urgency: ["urgent", "this_week", "this_month"],
      kyc_status: ["none", "pending", "verified", "rejected"],
      ledger_account_kind: [
        "buyer_funds",
        "platform_revenue",
        "insurance_pool",
        "refund_reserve",
        "stripe_fee_expense",
        "seller_payable",
        "courier_payable",
        "relais_payable",
        "external_carrier",
        "buyer_receivable",
        "courier_pool",
        "platform_cash",
      ],
      ledger_event: [
        "buyer_charge",
        "platform_commission",
        "insurance_contribution",
        "stripe_fee",
        "seller_payout",
        "courier_participation",
        "relais_participation",
        "relay_deposit_commission",
        "third_party_return_billing",
        "external_carrier_cost",
        "refund",
        "insurance_claim_payout",
        "reserve_funding",
        "reserve_release",
        "exchange_soulte",
        "courier_payout",
        "payout_reversal",
        "external_carrier_settlement",
      ],
      listing_edit_origin: ["seller", "handtohand", "moderation"],
      listing_option_kind: [
        "photo_pack",
        "video_count",
        "video_duration",
        "insertion_fee",
        "edit_fee",
        "courtage_duration",
        "courtage_boost",
      ],
      listing_report_reason: [
        "fraud",
        "prohibited",
        "counterfeit",
        "misleading",
        "stolen_photos",
        "wrong_category",
        "already_sold",
        "off_platform",
        "inappropriate",
        "impersonation",
        "other",
      ],
      listing_type: ["fixed", "offer", "flash"],
      live_article_outcome: [
        "pending",
        "exclu_active",
        "flash_active",
        "sold",
        "unsold",
        "cancelled",
      ],
      live_article_phase: ["presentation", "propositions", "choix", "pause"],
      live_boost_window: ["immediate", "h24", "d7", "d14", "d30"],
      live_format: ["classic", "exclusive", "vip"],
      live_option_kind: [
        "pack",
        "boost",
        "timer_extension",
        "article_extension",
        "seats",
      ],
      live_pack_id: ["live_plus", "live_vip_premium"],
      live_seat_role: ["buyer", "spectator"],
      live_seat_state: [
        "reserved",
        "confirmed",
        "waitlisted",
        "released",
        "no_show",
      ],
      live_selection_mode: ["exclu_live", "flash_access"],
      live_status: ["upcoming", "live", "ended"],
      live_stream_state: ["idle", "connecting", "live", "ended"],
      message_type: [
        "text",
        "image",
        "offer",
        "exchange",
        "jecherche",
        "system",
        "call_summary",
      ],
      mission_form_status: ["pending", "closed", "blocked", "support_review"],
      mission_status: [
        "proposal",
        "accepted",
        "seller_pending",
        "group_created",
        "pickup_pending",
        "picked_up",
        "in_transit",
        "deposited",
        "delivery_pending",
        "delivered",
        "completed",
        "cancelled",
        "expired",
      ],
      notification_type: [
        "message",
        "order",
        "proposition",
        "delivery",
        "boost",
        "exchange",
        "mission_proposal",
        "pickup",
        "payout",
        "dispute",
        "system",
        "incoming_package",
        "pickup_done",
        "co_delivery",
        "price_drop",
        "access_request",
        "seat_freed",
        "seat_reminder",
        "vip_live",
        "correction_requested",
        "purchase_access",
      ],
      offer_status: ["pending", "accepted", "rejected"],
      order_status: [
        "pending",
        "awaiting_seller",
        "confirmed",
        "picked_up",
        "in_transit",
        "at_hub",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      package_state: ["yes", "no", "unknown", "not_received"],
      package_status: ["incoming", "in_store", "picked_up", "returned"],
      parcel_format: ["XS", "S", "M", "L", "XL", "XXL"],
      payment_status: [
        "requires_action",
        "pre_authorized",
        "captured",
        "released",
        "refunded",
        "failed",
        "canceled",
      ],
      payout_method: ["iban", "paypal"],
      payout_status: ["processing", "paid", "failed"],
      photo_pack: ["pack5", "pack10"],
      platform_invoice_kind: [
        "listing_boost",
        "listing_edit",
        "listing_insertion",
        "photo_pack",
        "photo_pack_upgrade",
        "video_options",
        "video_duration_upgrade",
        "publication_capacites",
        "courtage_boost",
        "courtage_duration",
        "live_boost",
        "live_pack",
        "live_timer_extension",
        "live_vip_seats",
        "article_extension",
        "other",
        "live_options",
      ],
      product_access_mode: ["public", "controlled"],
      product_condition: ["new", "like_new", "good", "fair", "poor"],
      product_mode: ["sale", "exchange"],
      product_status: ["draft", "active", "reserved", "sold", "expired"],
      proposition_status: ["pending", "accepted", "declined", "withdrawn"],
      purchase_access_status: ["active", "paid", "expired"],
      receipt_delivery_kind: [
        "co_livraison",
        "mondial_relay",
        "main_propre",
        "autre",
      ],
      receipt_status: [
        "purchase_initiated",
        "payment_in_progress",
        "payment_secured",
        "transaction_in_progress",
        "transaction_finalized",
        "receipt_generating",
        "receipt_available",
        "receipt_amended",
        "transaction_cancelled",
      ],
      report_kind: ["buyer_vs_relay", "transporter_vs_relay"],
      report_outcome: ["favor_relay", "favor_reporter", "mixed"],
      report_priority: ["normale", "elevee", "tres_elevee", "critique"],
      report_status: ["awaiting_relay", "in_review", "resolved"],
      requested_solution: [
        "refund_full",
        "refund_partial",
        "return_partial_refund",
        "return_full_refund",
      ],
      return_fee_exception: [
        "agreement",
        "seller_commitment",
        "counterfeit",
        "specific_decision",
      ],
      return_fee_payer: ["buyer", "seller", "shared"],
      return_relay_kind: ["partner", "locker"],
      return_status: ["pending_pickup", "overdue", "returned"],
      return_tracking_mode: ["tracked", "registered"],
      review_report_reason: [
        "offensive",
        "personal_data",
        "false_review",
        "off_topic",
        "hate_speech",
        "other",
      ],
      review_report_status: [
        "nouveau",
        "en_cours",
        "accepte",
        "rejete",
        "cloture",
      ],
      role_status: [
        "active",
        "pending_kyc",
        "pending_convention",
        "pending_validation",
        "pending_verification",
        "pending_config",
        "suspended",
        "rejected",
      ],
      route_status: [
        "active",
        "paused",
        "expired",
        "scheduled",
        "completed",
        "cancelled",
      ],
      route_type: ["recurring", "one_time"],
      scan_result: [
        "success",
        "package_mismatch",
        "wrong_code",
        "no_eligible",
        "expired_qr",
        "out_of_window",
        "duplicate",
      ],
      settlement_kind: ["refund", "pay", "fee", "kept", "unpaid"],
      settlement_party: ["buyer", "seller", "transporter", "platform"],
      shipment_state: [
        "created",
        "awaiting_transporter",
        "accepted",
        "seller_confirmed",
        "pickup_pending",
        "picked_up",
        "in_transit",
        "at_relay",
        "awaiting_collection",
        "out_for_delivery",
        "delivered",
        "completed",
        "redelivery_pending",
        "return_pending",
        "returned",
        "cancelled",
        "disputed",
        "expired",
      ],
      shipping_method: [
        "h2h_logistic",
        "mondial_relay",
        "colissimo",
        "chronopost",
        "ups",
        "pickup",
      ],
      support_decision: [
        "refund_full",
        "refund_partial",
        "return_partial_refund",
        "return_full_refund",
        "pay_seller",
        "rejected",
        "other",
      ],
      transport_mode: [
        "walking",
        "bike",
        "scooter",
        "moto",
        "car",
        "utilitaire",
        "bus",
        "train",
      ],
      tx_status: ["pending", "available", "completed", "paid", "failed"],
      user_report_reason: [
        "fraud",
        "harassment",
        "aggressive",
        "spam",
        "fake_profile",
        "hate_speech",
        "inappropriate",
        "suspicious_meeting",
        "rule_circumvention",
        "suspicious_behavior",
        "other",
      ],
      username_error: [
        "required",
        "email",
        "phone",
        "too_short",
        "too_long",
        "charset",
        "reserved",
        "insult",
        "taken",
      ],
      visibility_option: [
        "bump",
        "daily7",
        "daily14",
        "daily30",
        "urgent",
        "courtage",
      ],
    },
  },
} as const
