export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          organization_id: number | null
          person_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_member?: boolean
          organization_id?: number | null
          person_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          is_member?: boolean
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
          id: number
          organization_id: number | null
          payment_deadline: string | null
          year: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: number
          organization_id?: number | null
          payment_deadline?: string | null
          year?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: {
        Args: {
          event: Json
        }
        Returns: Json
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
