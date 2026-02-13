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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      album_api_keys: {
        Row: {
          album_id: string
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          album_id: string
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          album_id?: string
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "album_api_keys_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      album_landing_pages: {
        Row: {
          album_id: string
          created_at: string
          elements: Json
          id: string
          is_published: boolean
          theme: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          album_id: string
          created_at?: string
          elements?: Json
          id?: string
          is_published?: boolean
          theme?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          album_id?: string
          created_at?: string
          elements?: Json
          id?: string
          is_published?: boolean
          theme?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_landing_pages_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: true
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          artist_bio: string | null
          artist_name: string | null
          artwork_url: string | null
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_bio?: string | null
          artist_name?: string | null
          artwork_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_bio?: string | null
          artist_name?: string | null
          artwork_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_albums_user_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      albums_analytics: {
        Row: {
          album_id: string
          client_name: string | null
          created_at: string
          id: string
          last_played_at: string | null
          title: string
          total_plays: number | null
          total_tracks: number | null
          unique_listeners: number | null
          updated_at: string
        }
        Insert: {
          album_id: string
          client_name?: string | null
          created_at?: string
          id?: string
          last_played_at?: string | null
          title: string
          total_plays?: number | null
          total_tracks?: number | null
          unique_listeners?: number | null
          updated_at?: string
        }
        Update: {
          album_id?: string
          client_name?: string | null
          created_at?: string
          id?: string
          last_played_at?: string | null
          title?: string
          total_plays?: number | null
          total_tracks?: number | null
          unique_listeners?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      artists: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audio_tracks: {
        Row: {
          artist_id: string
          audio_url: string
          cover_image_url: string | null
          created_at: string
          duration: number | null
          has_shopping_cart: boolean | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          audio_url: string
          cover_image_url?: string | null
          created_at?: string
          duration?: number | null
          has_shopping_cart?: boolean | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          audio_url?: string
          cover_image_url?: string | null
          created_at?: string
          duration?: number | null
          has_shopping_cart?: boolean | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      card_designs: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          design_data: Json
          id: string
          is_active: boolean
          name: string
          preview_image_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          design_data: Json
          id?: string
          is_active?: boolean
          name: string
          preview_image_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          design_data?: Json
          id?: string
          is_active?: boolean
          name?: string
          preview_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_progress: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      end_user_sessions: {
        Row: {
          album_id: string
          card_id: string
          created_at: string
          id: string
          ip_address: string | null
          location: Json | null
          user_agent: string | null
        }
        Insert: {
          album_id: string
          card_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          location?: Json | null
          user_agent?: string | null
        }
        Update: {
          album_id?: string
          card_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          location?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      fan_cards: {
        Row: {
          album_id: string
          artwork_url: string
          created_at: string
          description: string | null
          id: string
          purchased: boolean | null
          quantity: number
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          album_id: string
          artwork_url: string
          created_at?: string
          description?: string | null
          id?: string
          purchased?: boolean | null
          quantity?: number
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          album_id?: string
          artwork_url?: string
          created_at?: string
          description?: string | null
          id?: string
          purchased?: boolean | null
          quantity?: number
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_cards_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          caption: string | null
          created_at: string
          file_url: string
          hyperlink_url: string | null
          id: string
          label: string | null
          order_position: number | null
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_url: string
          hyperlink_url?: string | null
          id?: string
          label?: string | null
          order_position?: number | null
          project_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_url?: string
          hyperlink_url?: string | null
          id?: string
          label?: string | null
          order_position?: number | null
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      media_analytics: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          location: Json | null
          media_id: string
          media_type: string
          play_count: number
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          location?: Json | null
          media_id: string
          media_type: string
          play_count?: number
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          location?: Json | null
          media_id?: string
          media_type?: string
          play_count?: number
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nfc_cards: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          price: number
          shop_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          price: number
          shop_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          price?: number
          shop_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      nfc_sessions: {
        Row: {
          card_id: string
          created_at: string
          expires_at: string
          id: string
          session_token: string
        }
        Insert: {
          card_id: string
          created_at?: string
          expires_at: string
          id?: string
          session_token: string
        }
        Update: {
          card_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
        }
        Relationships: []
      }
      nfc_usage_analytics: {
        Row: {
          album_id: string
          avg_session_duration: number | null
          card_id: string
          created_at: string
          id: string
          last_tapped_at: string | null
          most_played_track_id: string | null
          tap_count: number | null
          unique_sessions: number | null
          updated_at: string
        }
        Insert: {
          album_id: string
          avg_session_duration?: number | null
          card_id: string
          created_at?: string
          id?: string
          last_tapped_at?: string | null
          most_played_track_id?: string | null
          tap_count?: number | null
          unique_sessions?: number | null
          updated_at?: string
        }
        Update: {
          album_id?: string
          avg_session_duration?: number | null
          card_id?: string
          created_at?: string
          id?: string
          last_tapped_at?: string | null
          most_played_track_id?: string | null
          tap_count?: number | null
          unique_sessions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          email_sent: boolean | null
          fan_card_id: string
          id: string
          notification_sent_at: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          quantity: number
          shipping_address: Json | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_sent?: boolean | null
          fan_card_id: string
          id?: string
          notification_sent_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          quantity?: number
          shipping_address?: Json | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_sent?: boolean | null
          fan_card_id?: string
          id?: string
          notification_sent_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          quantity?: number
          shipping_address?: Json | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_fan_card_id_fkey"
            columns: ["fan_card_id"]
            isOneToOne: false
            referencedRelation: "fan_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          created_at: string
          id: string
          media_id: string
          playlist_id: string
          playlist_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          playlist_id: string
          playlist_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          playlist_id?: string
          playlist_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          artist_name: string | null
          client_name: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          artist_name?: string | null
          client_name?: string | null
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          artist_name?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_bios: {
        Row: {
          content_1: string | null
          content_2: string | null
          created_at: string
          header_1: string | null
          header_2: string | null
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_1?: string | null
          content_2?: string | null
          created_at?: string
          header_1?: string | null
          header_2?: string | null
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_1?: string | null
          content_2?: string | null
          created_at?: string
          header_1?: string | null
          header_2?: string | null
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      project_social_links: {
        Row: {
          created_at: string
          display_order: number
          display_text: string
          id: string
          is_active: boolean
          platform: string
          project_id: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          display_text: string
          id?: string
          is_active?: boolean
          platform: string
          project_id: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          display_text?: string
          id?: string
          is_active?: boolean
          platform?: string
          project_id?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      rfid_cards: {
        Row: {
          album_id: string
          card_id: string
          created_at: string
          id: string
          is_active: boolean
          last_accessed_at: string | null
          updated_at: string
        }
        Insert: {
          album_id: string
          card_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          updated_at?: string
        }
        Update: {
          album_id?: string
          card_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          name: string
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          platform: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      social_media_links: {
        Row: {
          created_at: string
          display_order: number
          display_text: string
          id: string
          is_active: boolean
          platform: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          display_text: string
          id?: string
          is_active?: boolean
          platform: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          display_text?: string
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      team_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      track_analytics: {
        Row: {
          album_id: string | null
          avg_listen_duration: number | null
          completion_rate: number | null
          created_at: string
          id: string
          last_played_at: string | null
          play_count: number | null
          skip_count: number | null
          title: string
          track_id: string
          updated_at: string
        }
        Insert: {
          album_id?: string | null
          avg_listen_duration?: number | null
          completion_rate?: number | null
          created_at?: string
          id?: string
          last_played_at?: string | null
          play_count?: number | null
          skip_count?: number | null
          title: string
          track_id: string
          updated_at?: string
        }
        Update: {
          album_id?: string | null
          avg_listen_duration?: number | null
          completion_rate?: number | null
          created_at?: string
          id?: string
          last_played_at?: string | null
          play_count?: number | null
          skip_count?: number | null
          title?: string
          track_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          album_id: string | null
          created_at: string
          duration: number | null
          file_url: string
          id: string
          order_position: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          album_id?: string | null
          created_at?: string
          duration?: number | null
          file_url: string
          id?: string
          order_position?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          album_id?: string | null
          created_at?: string
          duration?: number | null
          file_url?: string
          id?: string
          order_position?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bios: {
        Row: {
          content_1: string | null
          content_2: string | null
          created_at: string
          header_1: string | null
          header_2: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_1?: string | null
          content_2?: string | null
          created_at?: string
          header_1?: string | null
          header_2?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_1?: string | null
          content_2?: string | null
          created_at?: string
          header_1?: string | null
          header_2?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_tracks: {
        Row: {
          artist_id: string
          created_at: string
          duration: number | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          duration: number | null
          file_url: string
          id: string
          order_position: number | null
          project_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_url: string
          id?: string
          order_position?: number | null
          project_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_url?: string
          id?: string
          order_position?: number | null
          project_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      user_playlist_orders: {
        Row: {
          id: string
          user_id: string
          audio_order: string[]
          video_order: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          audio_order?: string[]
          video_order?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          audio_order?: string[]
          video_order?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_album_by_card_id: {
        Args: { card_id_param: string }
        Returns: {
          album_description: string
          album_id: string
          album_title: string
          artist_bio: string
          artist_name: string
          artwork_url: string
        }[]
      }
      get_client_analytics: {
        Args: { client_id: string }
        Returns: {
          monthly_plays: number
          total_cards_bought: number
          total_plays: number
          unique_locations: number
          weekly_plays: number
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      has_permission: {
        Args: { permission_name: string; user_id: string }
        Returns: boolean
      }
      is_current_user_super_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: { user_id: string }; Returns: boolean }
      is_user_super_admin: { Args: { check_user_id: string }; Returns: boolean }
      sync_album_analytics: { Args: never; Returns: undefined }
      sync_all_analytics: { Args: never; Returns: undefined }
      sync_nfc_analytics: { Args: never; Returns: undefined }
      sync_track_analytics: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role:
        | "artist"
        | "super_admin"
        | "fan"
        | "team_member"
        | "user"
        | "admin"
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
      app_role: [
        "artist",
        "super_admin",
        "fan",
        "team_member",
        "user",
        "admin",
      ],
    },
  },
} as const
