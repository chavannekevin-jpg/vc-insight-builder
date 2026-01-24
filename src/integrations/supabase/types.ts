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
      accelerator_cohorts: {
        Row: {
          accelerator_id: string
          created_at: string | null
          demo_day_date: string | null
          end_date: string | null
          id: string
          invite_id: string | null
          is_active: boolean | null
          name: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          accelerator_id: string
          created_at?: string | null
          demo_day_date?: string | null
          end_date?: string | null
          id?: string
          invite_id?: string | null
          is_active?: boolean | null
          name: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          accelerator_id?: string
          created_at?: string | null
          demo_day_date?: string | null
          end_date?: string | null
          id?: string
          invite_id?: string | null
          is_active?: boolean | null
          name?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accelerator_cohorts_accelerator_id_fkey"
            columns: ["accelerator_id"]
            isOneToOne: false
            referencedRelation: "accelerators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accelerator_cohorts_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "accelerator_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      accelerator_invites: {
        Row: {
          accelerator_name: string
          accelerator_slug: string
          code: string
          cohort_name: string | null
          created_at: string | null
          created_by: string | null
          custom_message: string | null
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          linked_accelerator_id: string | null
          max_uses: number | null
          uses: number | null
        }
        Insert: {
          accelerator_name: string
          accelerator_slug: string
          code: string
          cohort_name?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_message?: string | null
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          linked_accelerator_id?: string | null
          max_uses?: number | null
          uses?: number | null
        }
        Update: {
          accelerator_name?: string
          accelerator_slug?: string
          code?: string
          cohort_name?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_message?: string | null
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          linked_accelerator_id?: string | null
          max_uses?: number | null
          uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "accelerator_invites_linked_accelerator_id_fkey"
            columns: ["linked_accelerator_id"]
            isOneToOne: false
            referencedRelation: "accelerators"
            referencedColumns: ["id"]
          },
        ]
      }
      accelerator_members: {
        Row: {
          accelerator_id: string
          id: string
          invite_email: string | null
          invite_token: string | null
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          accelerator_id: string
          id?: string
          invite_email?: string | null
          invite_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          accelerator_id?: string
          id?: string
          invite_email?: string | null
          invite_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accelerator_members_accelerator_id_fkey"
            columns: ["accelerator_id"]
            isOneToOne: false
            referencedRelation: "accelerators"
            referencedColumns: ["id"]
          },
        ]
      }
      accelerator_section_recommendations: {
        Row: {
          company_id: string
          created_at: string | null
          generated_at: string | null
          id: string
          key_insight: string | null
          section_name: string
          suggestions: Json
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          generated_at?: string | null
          id?: string
          key_insight?: string | null
          section_name: string
          suggestions: Json
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          generated_at?: string | null
          id?: string
          key_insight?: string | null
          section_name?: string
          suggestions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accelerator_section_recommendations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accelerator_section_recommendations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      accelerators: {
        Row: {
          cohort_size_target: number | null
          created_at: string | null
          default_discount_percent: number | null
          demo_day_date: string | null
          description: string | null
          ecosystem_head_id: string
          focus_areas: string[] | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          paid_at: string | null
          pending_head_email: string | null
          program_length_weeks: number | null
          slug: string
          stripe_payment_id: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          cohort_size_target?: number | null
          created_at?: string | null
          default_discount_percent?: number | null
          demo_day_date?: string | null
          description?: string | null
          ecosystem_head_id: string
          focus_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          paid_at?: string | null
          pending_head_email?: string | null
          program_length_weeks?: number | null
          slug: string
          stripe_payment_id?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          cohort_size_target?: number | null
          created_at?: string | null
          default_discount_percent?: number | null
          demo_day_date?: string | null
          description?: string | null
          ecosystem_head_id?: string
          focus_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          paid_at?: string | null
          pending_head_email?: string | null
          program_length_weeks?: number | null
          slug?: string
          stripe_payment_id?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
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
      booking_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          investor_id: string
          is_active: boolean | null
          start_time: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          investor_id: string
          is_active?: boolean | null
          start_time: string
          timezone?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          investor_id?: string
          is_active?: boolean | null
          start_time?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_availability_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_event_types: {
        Row: {
          buffer_after_minutes: number | null
          buffer_before_minutes: number | null
          color: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          investor_id: string
          is_active: boolean | null
          max_bookings_per_day: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          buffer_after_minutes?: number | null
          buffer_before_minutes?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          investor_id: string
          is_active?: boolean | null
          max_bookings_per_day?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          buffer_after_minutes?: number | null
          buffer_before_minutes?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          investor_id?: string
          is_active?: boolean | null
          max_bookings_per_day?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_event_types_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_slot_overrides: {
        Row: {
          created_at: string | null
          date: string
          end_time: string | null
          id: string
          investor_id: string
          is_available: boolean | null
          reason: string | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time?: string | null
          id?: string
          investor_id: string
          is_available?: boolean | null
          reason?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string | null
          id?: string
          investor_id?: string
          is_available?: boolean | null
          reason?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_slot_overrides_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booker_company: string | null
          booker_email: string
          booker_name: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          end_time: string
          event_type_id: string
          google_event_id: string | null
          id: string
          investor_id: string
          notes: string | null
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          booker_company?: string | null
          booker_email: string
          booker_name: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_time: string
          event_type_id: string
          google_event_id?: string | null
          id?: string
          investor_id: string
          notes?: string | null
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          booker_company?: string | null
          booker_email?: string
          booker_name?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_time?: string
          event_type_id?: string
          google_event_id?: string | null
          id?: string
          investor_id?: string
          notes?: string | null
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "booking_event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_opportunities: {
        Row: {
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          currency: string
          description: string | null
          id: string
          investor_id: string
          name: string
          notes: string | null
          status: string
          updated_at: string | null
          value_estimate: number | null
        }
        Insert: {
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          investor_id: string
          name: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          value_estimate?: number | null
        }
        Update: {
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          investor_id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          value_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_opportunities_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          accelerator_invite_id: string | null
          biggest_challenge: string | null
          category: string | null
          created_at: string
          deck_confidence_scores: Json | null
          deck_parsed_at: string | null
          deck_url: string | null
          description: string | null
          earned_referral_discount: number | null
          founder_id: string
          generations_available: number
          generations_used: number
          has_premium: boolean | null
          id: string
          memo_content_generated: boolean | null
          name: string
          public_score: number | null
          referral_code: string | null
          referral_discount_applied: boolean | null
          referred_by_company_id: string | null
          referred_by_founder_code: string | null
          referred_by_investor: string | null
          scoreboard_anonymous: boolean | null
          scoreboard_opt_in: boolean | null
          stage: string
          updated_at: string
          vc_verdict_json: Json | null
          verdict_generated_at: string | null
        }
        Insert: {
          accelerator_invite_id?: string | null
          biggest_challenge?: string | null
          category?: string | null
          created_at?: string
          deck_confidence_scores?: Json | null
          deck_parsed_at?: string | null
          deck_url?: string | null
          description?: string | null
          earned_referral_discount?: number | null
          founder_id: string
          generations_available?: number
          generations_used?: number
          has_premium?: boolean | null
          id?: string
          memo_content_generated?: boolean | null
          name: string
          public_score?: number | null
          referral_code?: string | null
          referral_discount_applied?: boolean | null
          referred_by_company_id?: string | null
          referred_by_founder_code?: string | null
          referred_by_investor?: string | null
          scoreboard_anonymous?: boolean | null
          scoreboard_opt_in?: boolean | null
          stage: string
          updated_at?: string
          vc_verdict_json?: Json | null
          verdict_generated_at?: string | null
        }
        Update: {
          accelerator_invite_id?: string | null
          biggest_challenge?: string | null
          category?: string | null
          created_at?: string
          deck_confidence_scores?: Json | null
          deck_parsed_at?: string | null
          deck_url?: string | null
          description?: string | null
          earned_referral_discount?: number | null
          founder_id?: string
          generations_available?: number
          generations_used?: number
          has_premium?: boolean | null
          id?: string
          memo_content_generated?: boolean | null
          name?: string
          public_score?: number | null
          referral_code?: string | null
          referral_discount_applied?: boolean | null
          referred_by_company_id?: string | null
          referred_by_founder_code?: string | null
          referred_by_investor?: string | null
          scoreboard_anonymous?: boolean | null
          scoreboard_opt_in?: boolean | null
          stage?: string
          updated_at?: string
          vc_verdict_json?: Json | null
          verdict_generated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_accelerator_invite_id_fkey"
            columns: ["accelerator_invite_id"]
            isOneToOne: false
            referencedRelation: "accelerator_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_referred_by_company_id_fkey"
            columns: ["referred_by_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_referred_by_company_id_fkey"
            columns: ["referred_by_company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_referred_by_investor_fkey"
            columns: ["referred_by_investor"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
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
          {
            foreignKeyName: "company_models_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      dealflow_shares: {
        Row: {
          company_id: string
          created_at: string | null
          from_investor_id: string
          id: string
          is_read: boolean | null
          message: string | null
          to_investor_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          from_investor_id: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          to_investor_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          from_investor_id?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          to_investor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealflow_shares_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealflow_shares_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealflow_shares_from_investor_id_fkey"
            columns: ["from_investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealflow_shares_to_investor_id_fkey"
            columns: ["to_investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
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
      founder_referral_signups: {
        Row: {
          created_at: string | null
          credit_awarded: boolean | null
          id: string
          referral_id: string
          referred_company_id: string
        }
        Insert: {
          created_at?: string | null
          credit_awarded?: boolean | null
          id?: string
          referral_id: string
          referred_company_id: string
        }
        Update: {
          created_at?: string | null
          credit_awarded?: boolean | null
          id?: string
          referral_id?: string
          referred_company_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_referral_signups_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "founder_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_referral_signups_referred_company_id_fkey"
            columns: ["referred_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_referral_signups_referred_company_id_fkey"
            columns: ["referred_company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_referrals: {
        Row: {
          code: string
          created_at: string | null
          credits_per_signup: number | null
          discount_percent: number | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          referrer_company_id: string
          referrer_user_id: string
          uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          credits_per_signup?: number | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          referrer_company_id: string
          referrer_user_id: string
          uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          credits_per_signup?: number | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          referrer_company_id?: string
          referrer_user_id?: string
          uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_referrals_referrer_company_id_fkey"
            columns: ["referrer_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_referrals_referrer_company_id_fkey"
            columns: ["referrer_company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
        ]
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
      google_calendar_tokens: {
        Row: {
          access_token: string
          calendar_id: string | null
          connected_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          investor_id: string
          refresh_token: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          connected_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          investor_id: string
          refresh_token: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          connected_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          investor_id?: string
          refresh_token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_tokens_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: true
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
      investor_dealflow: {
        Row: {
          added_at: string | null
          company_id: string | null
          deck_company_id: string | null
          id: string
          investor_id: string
          invited_via_code: string | null
          notes: string | null
          shared_at: string | null
          shared_by_investor_id: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          added_at?: string | null
          company_id?: string | null
          deck_company_id?: string | null
          id?: string
          investor_id: string
          invited_via_code?: string | null
          notes?: string | null
          shared_at?: string | null
          shared_by_investor_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          added_at?: string | null
          company_id?: string | null
          deck_company_id?: string | null
          id?: string
          investor_id?: string
          invited_via_code?: string | null
          notes?: string | null
          shared_at?: string | null
          shared_by_investor_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_dealflow_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_dealflow_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_dealflow_deck_company_fk"
            columns: ["deck_company_id"]
            isOneToOne: false
            referencedRelation: "investor_deck_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_dealflow_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_dealflow_shared_by_investor_id_fkey"
            columns: ["shared_by_investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_deck_companies: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          investor_id: string
          memo_json: Json | null
          name: string
          stage: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          investor_id: string
          memo_json?: Json | null
          name: string
          stage: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          investor_id?: string
          memo_json?: Json | null
          name?: string
          stage?: string
          updated_at?: string
        }
        Relationships: []
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
          additional_organizations: Json | null
          booking_page_bio: string | null
          booking_page_cover_position: string | null
          booking_page_cover_url: string | null
          booking_page_headline: string | null
          booking_page_theme: string | null
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
          profile_picture_url: string | null
          profile_slug: string | null
          social_linkedin: string | null
          social_twitter: string | null
          social_website: string | null
          ticket_size_max: number | null
          ticket_size_min: number | null
          updated_at: string | null
        }
        Insert: {
          additional_organizations?: Json | null
          booking_page_bio?: string | null
          booking_page_cover_position?: string | null
          booking_page_cover_url?: string | null
          booking_page_headline?: string | null
          booking_page_theme?: string | null
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
          profile_picture_url?: string | null
          profile_slug?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          social_website?: string | null
          ticket_size_max?: number | null
          ticket_size_min?: number | null
          updated_at?: string | null
        }
        Update: {
          additional_organizations?: Json | null
          booking_page_bio?: string | null
          booking_page_cover_position?: string | null
          booking_page_cover_url?: string | null
          booking_page_headline?: string | null
          booking_page_theme?: string | null
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
          profile_picture_url?: string | null
          profile_slug?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          social_website?: string | null
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
      kb_benchmarks: {
        Row: {
          business_model: string | null
          created_at: string
          currency: string
          geography_scope: string
          id: string
          median_value: number | null
          metric_key: string
          metric_label: string | null
          notes: string | null
          p25_value: number | null
          p75_value: number | null
          region: string | null
          sample_size: number | null
          sector: string | null
          source_id: string
          stage: string
          timeframe_label: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          business_model?: string | null
          created_at?: string
          currency?: string
          geography_scope?: string
          id?: string
          median_value?: number | null
          metric_key: string
          metric_label?: string | null
          notes?: string | null
          p25_value?: number | null
          p75_value?: number | null
          region?: string | null
          sample_size?: number | null
          sector?: string | null
          source_id: string
          stage: string
          timeframe_label?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          business_model?: string | null
          created_at?: string
          currency?: string
          geography_scope?: string
          id?: string
          median_value?: number | null
          metric_key?: string
          metric_label?: string | null
          notes?: string | null
          p25_value?: number | null
          p75_value?: number | null
          region?: string | null
          sample_size?: number | null
          sector?: string | null
          source_id?: string
          stage?: string
          timeframe_label?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_benchmarks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "kb_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_frameworks: {
        Row: {
          created_at: string
          geography_scope: string
          id: string
          key_points: Json | null
          region: string | null
          section_relevance: Json | null
          sector: string | null
          source_id: string
          summary: string
          tags: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          geography_scope?: string
          id?: string
          key_points?: Json | null
          region?: string | null
          section_relevance?: Json | null
          sector?: string | null
          source_id: string
          summary: string
          tags?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          geography_scope?: string
          id?: string
          key_points?: Json | null
          region?: string | null
          section_relevance?: Json | null
          sector?: string | null
          source_id?: string
          summary?: string
          tags?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_frameworks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "kb_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_market_notes: {
        Row: {
          created_at: string
          geography_scope: string
          headline: string | null
          id: string
          key_points: Json | null
          region: string | null
          sector: string | null
          source_id: string
          summary: string
          timeframe_label: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          geography_scope?: string
          headline?: string | null
          id?: string
          key_points?: Json | null
          region?: string | null
          sector?: string | null
          source_id: string
          summary: string
          timeframe_label?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          geography_scope?: string
          headline?: string | null
          id?: string
          key_points?: Json | null
          region?: string | null
          sector?: string | null
          source_id?: string
          summary?: string
          timeframe_label?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_market_notes_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "kb_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_sources: {
        Row: {
          content_kind: string
          created_at: string
          data_period_end: string | null
          data_period_start: string | null
          extracted_json: Json | null
          extraction_confidence: string | null
          geography_scope: string
          id: string
          publication_date: string | null
          publisher: string | null
          source_type: string
          source_url: string | null
          status: string
          storage_path: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content_kind?: string
          created_at?: string
          data_period_end?: string | null
          data_period_start?: string | null
          extracted_json?: Json | null
          extraction_confidence?: string | null
          geography_scope?: string
          id?: string
          publication_date?: string | null
          publisher?: string | null
          source_type: string
          source_url?: string | null
          status?: string
          storage_path?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content_kind?: string
          created_at?: string
          data_period_end?: string | null
          data_period_start?: string | null
          extracted_json?: Json | null
          extraction_confidence?: string | null
          geography_scope?: string
          id?: string
          publication_date?: string | null
          publisher?: string | null
          source_type?: string
          source_url?: string | null
          status?: string
          storage_path?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      linked_calendars: {
        Row: {
          access_token: string
          calendar_email: string | null
          calendar_id: string
          calendar_name: string
          color: string | null
          connected_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          include_in_availability: boolean | null
          investor_id: string
          is_primary: boolean | null
          refresh_token: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          calendar_email?: string | null
          calendar_id?: string
          calendar_name?: string
          color?: string | null
          connected_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          include_in_availability?: boolean | null
          investor_id: string
          is_primary?: boolean | null
          refresh_token: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          calendar_email?: string | null
          calendar_id?: string
          calendar_name?: string
          color?: string | null
          connected_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          include_in_availability?: boolean | null
          investor_id?: string
          is_primary?: boolean | null
          refresh_token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linked_calendars_investor_id_fkey"
            columns: ["investor_id"]
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
          {
            foreignKeyName: "fk_memo"
            columns: ["memo_id"]
            isOneToOne: false
            referencedRelation: "shareable_memo_preview"
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
          {
            foreignKeyName: "memo_purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
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
          {
            foreignKeyName: "memo_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
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
          {
            foreignKeyName: "memo_tool_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
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
          {
            foreignKeyName: "memos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
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
          {
            foreignKeyName: "roast_question_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
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
      startup_claim_codes: {
        Row: {
          accelerator_id: string | null
          claimed_at: string | null
          claimed_by: string | null
          code: string
          company_id: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          accelerator_id?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          code: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          accelerator_id?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          code?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_claim_codes_accelerator_id_fkey"
            columns: ["accelerator_id"]
            isOneToOne: false
            referencedRelation: "accelerators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_claim_codes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_claim_codes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_invites: {
        Row: {
          code: string
          created_at: string | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          investor_id: string
          is_active: boolean | null
          max_uses: number | null
          uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          investor_id: string
          is_active?: boolean | null
          max_uses?: number | null
          uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          investor_id?: string
          is_active?: boolean | null
          max_uses?: number | null
          uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_invites_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "waitlist_signups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
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
      shareable_company_preview: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
          public_score: number | null
          stage: string | null
          vc_verdict_json: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          public_score?: number | null
          stage?: string | null
          vc_verdict_json?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          public_score?: number | null
          stage?: string | null
          vc_verdict_json?: Json | null
        }
        Relationships: []
      }
      shareable_memo_preview: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string | null
          structured_content: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "memos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      shareable_memo_responses: {
        Row: {
          answer: string | null
          company_id: string | null
          question_key: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memo_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memo_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      shareable_section_scores: {
        Row: {
          ai_generated_data: Json | null
          company_id: string | null
          section_name: string | null
          user_overrides: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "memo_tool_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memo_tool_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "shareable_company_preview"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_investor_role_with_invite: {
        Args: { p_invite_code: string; p_user_id: string }
        Returns: Json
      }
      award_founder_referral_credit: {
        Args: { p_referral_code: string; p_referred_company_id: string }
        Returns: boolean
      }
      generate_accelerator_slug: { Args: { acc_name: string }; Returns: string }
      generate_founder_referral_code: { Args: never; Returns: string }
      generate_invite_code: { Args: never; Returns: string }
      generate_profile_slug: { Args: { full_name: string }; Returns: string }
      get_inviter_id_from_code: {
        Args: { invite_code: string }
        Returns: string
      }
      has_premium_company: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_accelerator_member: {
        Args: { _accelerator_id: string; _user_id: string }
        Returns: boolean
      }
      is_ecosystem_head: {
        Args: { _accelerator_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "investor" | "accelerator"
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
      app_role: ["admin", "user", "investor", "accelerator"],
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
