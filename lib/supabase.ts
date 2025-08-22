import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          batch_year: number
          profession: string
          company: string
          location: string
          bio: string
          avatar_url: string
          linkedin_url: string
          website_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          batch_year: number
          profession?: string
          company?: string
          location?: string
          bio?: string
          avatar_url?: string
          linkedin_url?: string
          website_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          batch_year?: number
          profession?: string
          company?: string
          location?: string
          bio?: string
          avatar_url?: string
          linkedin_url?: string
          website_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          time: string
          location: string
          category: string
          max_attendees: number
          current_attendees: number
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          time: string
          location: string
          category: string
          max_attendees: number
          current_attendees?: number
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          time?: string
          location?: string
          category?: string
          max_attendees?: number
          current_attendees?: number
          image_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          author_id: string
          category: string
          tags: string[]
          image_url: string
          views: number
          likes: number
          comments: number
          featured: boolean
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt: string
          author_id: string
          category: string
          tags?: string[]
          image_url?: string
          views?: number
          likes?: number
          comments?: number
          featured?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          author_id?: string
          category?: string
          tags?: string[]
          image_url?: string
          views?: number
          likes?: number
          comments?: number
          featured?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          donor_id: string
          amount: number
          cause_id: string
          message: string
          anonymous: boolean
          payment_status: string
          created_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          amount: number
          cause_id: string
          message?: string
          anonymous?: boolean
          payment_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          amount?: number
          cause_id?: string
          message?: string
          anonymous?: boolean
          payment_status?: string
          created_at?: string
        }
      }
      donation_causes: {
        Row: {
          id: string
          title: string
          description: string
          target_amount: number
          raised_amount: number
          category: string
          image_url: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          target_amount: number
          raised_amount?: number
          category: string
          image_url?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          target_amount?: number
          raised_amount?: number
          category?: string
          image_url?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
