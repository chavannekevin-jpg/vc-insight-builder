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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      answer_quality_criteria: {
        Row: {
          created_at: string
          example_good_answer: string | null
          id: string
          nice_to_have: Json
          question_key: string
          required_elements: Json
          updated_at: string
          vc_context: string | null
        }
        Insert: {
          created_at?: string
          example_good_answer?: string | null
          id?: string
          nice_to_have?: Json
          question_key: string
          required_elements?: Json
          updated_at?: string
          vc_context?: string | null
        }
        Update: {
          created_at?: string
          example_good_answer?: string | null
          id?: string
          nice_to_have?: Json
          question_key?: string
          required_elements?: Json
          updated_at?: string
          vc_context?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          biggest_challenge: string | null
          category: string | null
          created_at: string
          deck_confidence_scores: Json | null
          deck_parsed_at: string | null
          deck_url: string | null
          description: string | null
          founder_id: string
          generations_available: number
          generations_used: number
          has_premium: boolean | null
          id: string
          memo_content_generated: boolean | null
          name: string
          stage: string
          updated_at: string
          vc_verdict_json: Json | null
          verdict_generated_at: string | null
        }
        Insert: {
          biggest_challenge?: string | null
          category?: string | null
          created_at?: string
          deck_confidence_scores?: Json | null
          deck_parsed_at?: string | null
          deck_url?: string | null
          description?: string | null
          founder_id: string
          generations_available?: number
          generations_used?: number
          has_premium?: boolean | null
          id?: string
          memo_content_generated?: boolean | null
          name: string
          stage: string
          updated_at?: string
          vc_verdict_json?: Json | null
          verdict_generated_at?: string | null
        }
        Update: {
          biggest_challenge?: string | null
          category?: string | null
          created_at?: string
          deck_confidence_scores?: Json | null
          deck_parsed_at?: string | null
          deck_url?: string | null
          description?: string | null
          founder_id?: string
          generations_available?: number
          generations_used?: number
          has_premium?: boolean | null
          id?: string
          memo_content_generated?: boolean | null
          name?: string
          stage?: string
          updated_at?: string
          vc_verdict_json?: Json | null
          verdict_generated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_models: {
        Row: {
          coherence_score: number | null
          company_id: string
          created_at: string
          discrepancy_count: number | null
          id: string
          model_data: Json
          updated_at: string
          version: number | null
        }
        Insert: {
          coherence_score?: number | null
          company_id: string
          created_at?: string
          discrepancy_count?: number | null
          id?: string
          model_data: Json
          updated_at?: string
          version?: number | null
        }
        Update: {
          coherence_score?: number | null
          company_id?: string
          created_at?: string
          discrepancy_count?: number | null
          id?: string
          model_data?: Json
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_models_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          uses: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          uses?: number
        }
        Relationships: []
      }
      educational_articles: {
        Row: {
          content: string
          created_at: string
          description: string
          icon: string
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          automation_key: string | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          automation_key?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type?: string
          updated_at?: string | null
        }
        Update: {
          automation_key?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      global_contacts: {
        Row: {
          city: string | null
          city_lat: number | null
          city_lng: number | null
          contributor_count: number | null
          country: string | null
          created_at: string | null
          email: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          focus_confidence: string | null
          focus_last_researched_at: string | null
          focus_source: string | null
          fund_size: number | null
          id: string
          investment_focus: Json | null
          linked_investor_id: string | null
          linkedin_url: string | null
          name: string
          notable_investments: Json | null
          organization_name: string | null
          phone: string | null
          stages: Json | null
          thesis_keywords: Json | null
          ticket_size_max: number | null
          ticket_size_min: number | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          city_lat?: number | null
          city_lng?: number | null
          contributor_count?: number | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          focus_confidence?: string | null
          focus_last_researched_at?: string | null
          focus_source?: string | null
          fund_size?: number | null
          id?: string
          investment_focus?: Json | null
          linked_investor_id?: string | null
          linkedin_url?: string | null
          name: string
          notable_investments?: Json | null
          organization_name?: string | null
          phone?: string | null
          stages?: Json | null
          thesis_keywords?: Json | null
          ticket_size_max?: number | null
          ticket_size_min?: number | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          city_lat?: number | null
          city_lng?: number | null
          contributor_count?: number | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          focus_confidence?: string | null
          focus_last_researched_at?: string | null
          focus_source?: string | null
          fund_size?: number | null
          id?: string
          investment_focus?: Json | null
          linked_investor_id?: string | null
          linkedin_url?: string | null
          name?: string
          notable_investments?: Json | null
          organization_name?: string | null
          phone?: string | null
          stages?: Json | null
          thesis_keywords?: Json | null
          ticket_size_max?: number | null
          ticket_size_min?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "global_contacts_linked_investor_id_fkey"
            columns: ["linked_investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_contacts: {
        Row: {
          created_at: string | null
          global_contact_id: string | null
          id: string
          investor_id: string
          last_contact_date: string | null
          local_email: string | null
          local_focus_override: Json | null
          local_name: string | null
          local_notes: string | null
          local_organization: string | null
          local_phone: string | null
          relationship_status:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          global_contact_id?: string | null
          id?: string
          investor_id: string
          last_contact_date?: string | null
          local_email?: string | null
          local_focus_override?: Json | null
          local_name?: string | null
          local_notes?: string | null
          local_organization?: string | null
          local_phone?: string | null
          relationship_status?:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          global_contact_id?: string | null
          id?: string
          investor_id?: string
          last_contact_date?: string | null
          local_email?: string | null
          local_focus_override?: Json | null
          local_name?: string | null
          local_notes?: string | null
          local_organization?: string | null
          local_phone?: string | null
          relationship_status?:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_contacts_global_contact_id_fkey"
            columns: ["global_contact_id"]
            isOneToOne: false
            referencedRelation: "global_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_contacts_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_invites: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          inviter_id: string
          is_active: boolean
          max_uses: number | null
          uses: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          inviter_id: string
          is_active?: boolean
          max_uses?: number | null
          uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          inviter_id?: string
          is_active?: boolean
          max_uses?: number | null
          uses?: number
        }
        Relationships: [
          {
            foreignKeyName: "investor_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_profiles: {
        Row: {
          city: string
          city_lat: number | null
          city_lng: number | null
          created_at: string | null
          full_name: string
          geographic_focus: Json | null
          id: string
          investor_type: Database["public"]["Enums"]["investor_type"]
          invited_by_code: string | null
          onboarding_completed: boolean | null
          organization_name: string | null
          preferred_stages: Json | null
          primary_sectors: Json | null
          ticket_size_max: number | null
          ticket_size_min: number | null
          updated_at: string | null
        }
        Insert: {
          city: string
          city_lat?: number | null
          city_lng?: number | null
          created_at?: string | null
          full_name: string
          geographic_focus?: Json | null
          id: string
          investor_type: Database["public"]["Enums"]["investor_type"]
          invited_by_code?: string | null
          onboarding_completed?: boolean | null
          organization_name?: string | null
          preferred_stages?: Json | null
          primary_sectors?: Json | null
          ticket_size_max?: number | null
          ticket_size_min?: number | null
          updated_at?: string | null
        }
        Update: {
          city?: string
          city_lat?: number | null
          city_lng?: number | null
          created_at?: string | null
          full_name?: string
          geographic_focus?: Json | null
          id?: string
          investor_type?: Database["public"]["Enums"]["investor_type"]
          invited_by_code?: string | null
          onboarding_completed?: boolean | null
          organization_name?: string | null
          preferred_stages?: Json | null
          primary_sectors?: Json | null
          ticket_size_max?: number | null
          ticket_size_min?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      investor_referrals: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          invitee_id: string
          inviter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          invitee_id: string
          inviter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          invitee_id?: string
          inviter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_referrals_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: true
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_referrals_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memo_analyses: {
        Row: {
          analysis: Json
          created_at: string
          id: string
          memo_id: string
          updated_at: string
        }
        Insert: {
          analysis: Json
          created_at?: string
          id?: string
          memo_id: string
          updated_at?: string
        }
        Update: {
          analysis?: Json
          created_at?: string
          id?: string
          memo_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_memo"
            columns: ["memo_id"]
            isOneToOne: false
            referencedRelation: "memos"
            referencedColumns: ["id"]
          },
        ]
      }
      memo_generation_jobs: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          started_at: string
          status: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      memo_prompts: {
        Row: {
          created_at: string
          id: string
          prompt: string
          section_id: string | null
          section_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          section_id?: string | null
          section_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          section_id?: string | null
          section_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memo_prompts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      memo_purchases: {
        Row: {
          admin_notified: boolean | null
          amount_paid: number
          company_id: string
          created_at: string
          discount_code_used: string | null
          id: string
          user_id: string
        }
        Insert: {
          admin_notified?: boolean | null
          amount_paid: number
          company_id: string
          created_at?: string
          discount_code_used?: string | null
          id?: string
          user_id: string
        }
        Update: {
          admin_notified?: boolean | null
          amount_paid?: number
          company_id?: string
          created_at?: string
          discount_code_used?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memo_purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      memo_responses: {
        Row: {
          answer: string | null
          company_id: string
          confidence_score: number | null
          created_at: string
          id: string
          question_key: string
          source: string | null
          updated_at: string
        }
        Insert: {
          answer?: string | null
          company_id: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          question_key: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string | null
          company_id?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          question_key?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memo_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      memo_tool_data: {
        Row: {
          ai_generated_data: Json | null
          company_id: string
          created_at: string | null
          data_source: string | null
          id: string
          section_name: string
          tool_name: string
          updated_at: string | null
          user_overrides: Json | null
        }
        Insert: {
          ai_generated_data?: Json | null
          company_id: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          section_name: string
          tool_name: string
          updated_at?: string | null
          user_overrides?: Json | null
        }
        Update: {
          ai_generated_data?: Json | null
          company_id?: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          section_name?: string
          tool_name?: string
          updated_at?: string | null
          user_overrides?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "memo_tool_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      memos: {
        Row: {
          company_id: string
          content: string | null
          created_at: string
          id: string
          status: string
          structured_content: Json | null
          updated_at: string
        }
        Insert: {
          company_id: string
          content?: string | null
          created_at?: string
          id?: string
          status?: string
          structured_content?: Json | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          content?: string | null
          created_at?: string
          id?: string
          status?: string
          structured_content?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_notified_signup: boolean | null
          created_at: string
          email: string
          id: string
          last_sign_in_at: string | null
          sign_in_count: number | null
          updated_at: string
        }
        Insert: {
          admin_notified_signup?: boolean | null
          created_at?: string
          email: string
          id: string
          last_sign_in_at?: string | null
          sign_in_count?: number | null
          updated_at?: string
        }
        Update: {
          admin_notified_signup?: boolean | null
          created_at?: string
          email?: string
          id?: string
          last_sign_in_at?: string | null
          sign_in_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_questions: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          is_required: boolean
          placeholder: string | null
          question: string
          question_key: string
          section_id: string
          sort_order: number
          title: string
          tldr: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          placeholder?: string | null
          question: string
          question_key: string
          section_id: string
          sort_order?: number
          title: string
          tldr?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          placeholder?: string | null
          question?: string
          question_key?: string
          section_id?: string
          sort_order?: number
          title?: string
          tldr?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_sections: {
        Row: {
          color: string
          created_at: string
          display_title: string
          icon: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          display_title: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          display_title?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      roast_question_history: {
        Row: {
          asked_at: string
          category: string | null
          company_id: string
          id: string
          question_text: string
        }
        Insert: {
          asked_at?: string
          category?: string | null
          company_id: string
          id?: string
          question_text: string
        }
        Update: {
          asked_at?: string
          category?: string | null
          company_id?: string
          id?: string
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "roast_question_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_emails: {
        Row: {
          email_type: string
          id: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          email_type: string
          id?: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          email_type?: string
          id?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          company_id: string
          created_at: string
          discount_amount: number
          has_paid: boolean
          id: string
          paid_at: string | null
          payment_intent_id: string | null
          pricing_tier: string
          signed_up_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          discount_amount?: number
          has_paid?: boolean
          id?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          pricing_tier?: string
          signed_up_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          discount_amount?: number
          has_paid?: boolean
          id?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          pricing_tier?: string
          signed_up_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_signups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_signups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invite_code: { Args: never; Returns: string }
      get_inviter_id_from_code: {
        Args: { invite_code: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "investor"
      entity_type: "investor" | "fund"
      investor_type:
        | "vc"
        | "family_office"
        | "business_angel"
        | "corporate_vc"
        | "lp"
        | "other"
      relationship_status: "prospect" | "warm" | "connected" | "invested"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "user", "investor"],
      entity_type: ["investor", "fund"],
      investor_type: [
        "vc",
        "family_office",
        "business_angel",
        "corporate_vc",
        "lp",
        "other",
      ],
      relationship_status: ["prospect", "warm", "connected", "invested"],
    },
  },
} as const
