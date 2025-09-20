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
      address: {
        Row: {
          addressLine1: string | null
          addressLine2: string | null
          city: string | null
          created_at: string
          id: number
          person_id: number | null
          postcode: string | null
        }
        Insert: {
          addressLine1?: string | null
          addressLine2?: string | null
          city?: string | null
          created_at?: string
          id?: number
          person_id?: number | null
          postcode?: string | null
        }
        Update: {
          addressLine1?: string | null
          addressLine2?: string | null
          city?: string | null
          created_at?: string
          id?: number
          person_id?: number | null
          postcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adress_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      membership: {
        Row: {
          created_at: string
          id: number
          is_member: boolean
          membership_end_date: string | null
          membership_end_reason: string | null
          organization_id: number | null
          person_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_member?: boolean
          membership_end_date?: string | null
          membership_end_reason?: string | null
          organization_id?: number | null
          person_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          is_member?: boolean
          membership_end_date?: string | null
          membership_end_reason?: string | null
          organization_id?: number | null
          person_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      organization: {
        Row: {
          bank_account_number: string | null
          created_at: string
          id: number
          name: string | null
          organization_number: string | null
        }
        Insert: {
          bank_account_number?: string | null
          created_at?: string
          id?: number
          name?: string | null
          organization_number?: string | null
        }
        Update: {
          bank_account_number?: string | null
          created_at?: string
          id?: number
          name?: string | null
          organization_number?: string | null
        }
        Relationships: []
      }
      payment_detail: {
        Row: {
          amount: number | null
          created_at: string
          deleted: boolean
          id: number
          late_fee: number | null
          organization_id: number | null
          payment_deadline: string | null
          year: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          deleted?: boolean
          id?: number
          late_fee?: number | null
          organization_id?: number | null
          payment_deadline?: string | null
          year?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          deleted?: boolean
          id?: number
          late_fee?: number | null
          organization_id?: number | null
          payment_deadline?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_detail_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_info: {
        Row: {
          amount: number | null
          created_at: string
          id: number
          membership_id: number | null
          payment_date: string | null
          payment_detail_id: number
          payment_state: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: number
          membership_id?: number | null
          payment_date?: string | null
          payment_detail_id: number
          payment_state?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: number
          membership_id?: number | null
          payment_date?: string | null
          payment_detail_id?: number
          payment_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_info_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "membership"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_info_payment_detail_id_fkey"
            columns: ["payment_detail_id"]
            isOneToOne: false
            referencedRelation: "payment_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      person: {
        Row: {
          birthdate: string | null
          created_timestamp: string | null
          deleted: boolean | null
          email: string | null
          firstname: string
          gender: string | null
          id: number
          lastname: string | null
          phone_number: string | null
          roles: string[] | null
          user_id: string | null
        }
        Insert: {
          birthdate?: string | null
          created_timestamp?: string | null
          deleted?: boolean | null
          email?: string | null
          firstname: string
          gender?: string | null
          id?: number
          lastname?: string | null
          phone_number?: string | null
          roles?: string[] | null
          user_id?: string | null
        }
        Update: {
          birthdate?: string | null
          created_timestamp?: string | null
          deleted?: boolean | null
          email?: string | null
          firstname?: string
          gender?: string | null
          id?: number
          lastname?: string | null
          phone_number?: string | null
          roles?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      person_relation: {
        Row: {
          created_at: string
          has_access: boolean
          id: number
          person_id: number
          person_related_id: number
          relation_type: string
        }
        Insert: {
          created_at?: string
          has_access?: boolean
          id?: number
          person_id: number
          person_related_id: number
          relation_type: string
        }
        Update: {
          created_at?: string
          has_access?: boolean
          id?: number
          person_id?: number
          person_related_id?: number
          relation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_relation_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_relation_person_related_id_fkey"
            columns: ["person_related_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      has_access_to_related_person: {
        Args: { _related_id: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
