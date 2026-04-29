// Auto-generated Supabase database types for Bonim Olamot
// Run `npx supabase gen types typescript` to regenerate after schema changes

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      matchmakers: {
        Row: {
          id: string
          user_id: string | null
          email: string
          first_name: string
          last_name: string
          organization: string | null
          phone: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          first_name: string
          last_name: string
          organization?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          first_name?: string
          last_name?: string
          organization?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      profiles: {
        Row: {
          id: string
          matchmaker_id: string | null
          gender: 'male' | 'female'
          first_name: string
          last_name: string
          age: number
          hebrew_birthday: string | null
          marital_status: string | null
          has_children: boolean
          number_of_children: number | null
          city: string | null
          community: string | null
          phone: string | null
          email: string | null
          occupation: string | null
          style: string | null
          partner_style: string | null
          preferred_stream: string | null
          clothing: string | null
          headcovering: string | null
          partner_clothing: string | null
          phone_type: string | null
          traits: string[]
          relationship_values: string[]
          brings: string[]
          doesnt_suit: string | null
          flexibility: string | null
          about_me: string | null
          about_partner: string | null
          photos: string[]
          matchmaker_status: 'green' | 'orange' | 'light_red' | 'bright_red'
          locked_at: string | null
          locked_by: string | null
          last_offer_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          matchmaker_id?: string | null
          gender: 'male' | 'female'
          first_name: string
          last_name: string
          age: number
          hebrew_birthday?: string | null
          marital_status?: string | null
          has_children?: boolean
          number_of_children?: number | null
          city?: string | null
          community?: string | null
          phone?: string | null
          email?: string | null
          occupation?: string | null
          style?: string | null
          partner_style?: string | null
          preferred_stream?: string | null
          clothing?: string | null
          headcovering?: string | null
          partner_clothing?: string | null
          phone_type?: string | null
          traits?: string[]
          relationship_values?: string[]
          brings?: string[]
          doesnt_suit?: string | null
          flexibility?: string | null
          about_me?: string | null
          about_partner?: string | null
          photos?: string[]
          matchmaker_status?: 'green' | 'orange' | 'light_red' | 'bright_red'
          locked_at?: string | null
          locked_by?: string | null
          last_offer_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          matchmaker_id?: string | null
          gender?: 'male' | 'female'
          first_name?: string
          last_name?: string
          age?: number
          hebrew_birthday?: string | null
          marital_status?: string | null
          has_children?: boolean
          number_of_children?: number | null
          city?: string | null
          community?: string | null
          phone?: string | null
          email?: string | null
          occupation?: string | null
          style?: string | null
          partner_style?: string | null
          preferred_stream?: string | null
          clothing?: string | null
          headcovering?: string | null
          partner_clothing?: string | null
          phone_type?: string | null
          traits?: string[]
          relationship_values?: string[]
          brings?: string[]
          doesnt_suit?: string | null
          flexibility?: string | null
          about_me?: string | null
          about_partner?: string | null
          photos?: string[]
          matchmaker_status?: 'green' | 'orange' | 'light_red' | 'bright_red'
          locked_at?: string | null
          locked_by?: string | null
          last_offer_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_matchmaker_id_fkey'
            columns: ['matchmaker_id']
            isOneToOne: false
            referencedRelation: 'matchmakers'
            referencedColumns: ['id']
          }
        ]
      }

      profile_notes: {
        Row: {
          id: string
          profile_id: string
          matchmaker_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          matchmaker_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          matchmaker_id?: string | null
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profile_notes_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }

      matches: {
        Row: {
          id: string
          matchmaker_id: string | null
          female_id: string
          male_id: string
          stage: 'checking' | 'proposal_sent' | 'meeting_1' | 'meeting_2' | 'closing'
          status: 'active' | 'closed' | 'rejected'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          matchmaker_id?: string | null
          female_id: string
          male_id: string
          stage?: 'checking' | 'proposal_sent' | 'meeting_1' | 'meeting_2' | 'closing'
          status?: 'active' | 'closed' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          matchmaker_id?: string | null
          female_id?: string
          male_id?: string
          stage?: 'checking' | 'proposal_sent' | 'meeting_1' | 'meeting_2' | 'closing'
          status?: 'active' | 'closed' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'matches_female_id_fkey'
            columns: ['female_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_male_id_fkey'
            columns: ['male_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }

      social_posts: {
        Row: {
          id: string
          author_id: string | null
          content: string
          tagged_profiles: Json
          is_announcement: boolean
          created_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          content: string
          tagged_profiles?: Json
          is_announcement?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          content?: string
          tagged_profiles?: Json
          is_announcement?: boolean
          created_at?: string
        }
        Relationships: []
      }

      date_spots: {
        Row: {
          id: string
          name: string
          city: string
          region: 'jerusalem' | 'center' | 'north' | 'south'
          category: 'restaurant' | 'hotel_lobby' | 'park' | 'quiet'
          vibe: string | null
          address: string | null
          google_maps_url: string | null
          kosher: boolean | null
          price_range: '₪' | '₪₪' | '₪₪₪' | null
          average_rating: number
          review_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          region: 'jerusalem' | 'center' | 'north' | 'south'
          category: 'restaurant' | 'hotel_lobby' | 'park' | 'quiet'
          vibe?: string | null
          address?: string | null
          google_maps_url?: string | null
          kosher?: boolean | null
          price_range?: '₪' | '₪₪' | '₪₪₪' | null
          average_rating?: number
          review_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          region?: 'jerusalem' | 'center' | 'north' | 'south'
          category?: 'restaurant' | 'hotel_lobby' | 'park' | 'quiet'
          vibe?: string | null
          address?: string | null
          google_maps_url?: string | null
          kosher?: boolean | null
          price_range?: '₪' | '₪₪' | '₪₪₪' | null
          average_rating?: number
          review_count?: number
          created_at?: string
        }
        Relationships: []
      }

      date_spot_reviews: {
        Row: {
          id: string
          spot_id: string
          reviewer_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          reviewer_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          spot_id?: string
          reviewer_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'date_spot_reviews_spot_id_fkey'
            columns: ['spot_id']
            isOneToOne: false
            referencedRelation: 'date_spots'
            referencedColumns: ['id']
          }
        ]
      }
    }

    Views: Record<string, never>
    Functions: Record<string, never>
    CompositeTypes: Record<string, never>
    Enums: {
      gender_type: 'male' | 'female'
      matchmaker_status_type: 'green' | 'orange' | 'light_red' | 'bright_red'
      match_stage: 'checking' | 'proposal_sent' | 'meeting_1' | 'meeting_2' | 'closing'
      match_status: 'active' | 'closed' | 'rejected'
      spot_category: 'restaurant' | 'hotel_lobby' | 'park' | 'quiet'
      spot_region: 'jerusalem' | 'center' | 'north' | 'south'
      price_range: '₪' | '₪₪' | '₪₪₪'
    }
  }
}

// Convenience row types
export type MatchmakerRow    = Database['public']['Tables']['matchmakers']['Row']
export type ProfileRow       = Database['public']['Tables']['profiles']['Row']
export type ProfileNoteRow   = Database['public']['Tables']['profile_notes']['Row']
export type MatchRow         = Database['public']['Tables']['matches']['Row']
export type SocialPostRow    = Database['public']['Tables']['social_posts']['Row']
export type DateSpotRow      = Database['public']['Tables']['date_spots']['Row']
export type DateSpotReviewRow = Database['public']['Tables']['date_spot_reviews']['Row']
