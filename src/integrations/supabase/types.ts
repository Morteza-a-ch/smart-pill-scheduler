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
      case_appeals: {
        Row: {
          case_id: string
          created_at: string
          id: string
          message: string
          patient_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          message: string
          patient_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          message?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_appeals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "commission_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_documents: {
        Row: {
          case_id: string
          created_at: string
          file_path: string
          id: string
          patient_id: string
          title: string
        }
        Insert: {
          case_id: string
          created_at?: string
          file_path: string
          id?: string
          patient_id: string
          title: string
        }
        Update: {
          case_id?: string
          created_at?: string
          file_path?: string
          id?: string
          patient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "commission_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_cases: {
        Row: {
          case_number: number
          created_at: string
          disease_name: string | null
          doctor_prescription_url: string | null
          documents_finalized: boolean
          fee_amount: number
          id: string
          insurance_name: string | null
          needs_doctor_prescription: boolean
          paid: boolean
          patient_id: string
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        Insert: {
          case_number?: number
          created_at?: string
          disease_name?: string | null
          doctor_prescription_url?: string | null
          documents_finalized?: boolean
          fee_amount?: number
          id?: string
          insurance_name?: string | null
          needs_doctor_prescription?: boolean
          paid?: boolean
          patient_id: string
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Update: {
          case_number?: number
          created_at?: string
          disease_name?: string | null
          doctor_prescription_url?: string | null
          documents_finalized?: boolean
          fee_amount?: number
          id?: string
          insurance_name?: string | null
          needs_doctor_prescription?: boolean
          paid?: boolean
          patient_id?: string
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Relationships: []
      }
      commission_votes: {
        Row: {
          approved: boolean
          case_id: string
          created_at: string
          daily_dose: number | null
          id: string
          medication_form: Database["public"]["Enums"]["med_form"] | null
          medication_name: string | null
          member_id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          approved: boolean
          case_id: string
          created_at?: string
          daily_dose?: number | null
          id?: string
          medication_form?: Database["public"]["Enums"]["med_form"] | null
          medication_name?: string | null
          member_id: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          approved?: boolean
          case_id?: string
          created_at?: string
          daily_dose?: number | null
          id?: string
          medication_form?: Database["public"]["Enums"]["med_form"] | null
          medication_name?: string | null
          member_id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_votes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "commission_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          national_id: string | null
          patient_id: string
          phone: string | null
          province: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          national_id?: string | null
          patient_id: string
          phone?: string | null
          province?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          national_id?: string | null
          patient_id?: string
          phone?: string | null
          province?: string | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          case_id: string | null
          created_at: string
          daily_dose: number
          disease_name: string
          dispensing_interval_days: number | null
          doctor_id: string
          id: string
          issue_date_jalali: string | null
          medication_form: Database["public"]["Enums"]["med_form"]
          medication_name: string
          patient_id: string
          reduction_interval_months: number | null
          reduction_percent: number | null
          signature_note: string | null
          unit_volume: number | null
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          daily_dose: number
          disease_name: string
          dispensing_interval_days?: number | null
          doctor_id: string
          id?: string
          issue_date_jalali?: string | null
          medication_form: Database["public"]["Enums"]["med_form"]
          medication_name: string
          patient_id: string
          reduction_interval_months?: number | null
          reduction_percent?: number | null
          signature_note?: string | null
          unit_volume?: number | null
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          daily_dose?: number
          disease_name?: string
          dispensing_interval_days?: number | null
          doctor_id?: string
          id?: string
          issue_date_jalali?: string | null
          medication_form?: Database["public"]["Enums"]["med_form"]
          medication_name?: string
          patient_id?: string
          reduction_interval_months?: number | null
          reduction_percent?: number | null
          signature_note?: string | null
          unit_volume?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "commission_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_cert_no: string | null
          birth_date: string | null
          card_number: string | null
          city: string | null
          commission_title: string | null
          created_at: string
          father_name: string | null
          first_name: string
          id: string
          insurance_name: string | null
          issued_from: string | null
          last_name: string
          medical_code: string | null
          national_id: string | null
          phone: string | null
          province: string | null
          sheba: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_cert_no?: string | null
          birth_date?: string | null
          card_number?: string | null
          city?: string | null
          commission_title?: string | null
          created_at?: string
          father_name?: string | null
          first_name?: string
          id: string
          insurance_name?: string | null
          issued_from?: string | null
          last_name?: string
          medical_code?: string | null
          national_id?: string | null
          phone?: string | null
          province?: string | null
          sheba?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_cert_no?: string | null
          birth_date?: string | null
          card_number?: string | null
          city?: string | null
          commission_title?: string | null
          created_at?: string
          father_name?: string | null
          first_name?: string
          id?: string
          insurance_name?: string | null
          issued_from?: string | null
          last_name?: string
          medical_code?: string | null
          national_id?: string | null
          phone?: string | null
          province?: string | null
          sheba?: string | null
          specialty?: string | null
          updated_at?: string
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
      wallet_transactions: {
        Row: {
          amount: number
          card_number: string | null
          created_at: string
          description: string | null
          id: string
          sheba: string | null
          status: Database["public"]["Enums"]["wallet_tx_status"]
          type: Database["public"]["Enums"]["wallet_tx_type"]
          user_id: string
        }
        Insert: {
          amount: number
          card_number?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sheba?: string | null
          status?: Database["public"]["Enums"]["wallet_tx_status"]
          type: Database["public"]["Enums"]["wallet_tx_type"]
          user_id: string
        }
        Update: {
          amount?: number
          card_number?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sheba?: string | null
          status?: Database["public"]["Enums"]["wallet_tx_status"]
          type?: Database["public"]["Enums"]["wallet_tx_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "doctor" | "commission" | "patient" | "admin"
      case_status:
        | "unreviewed"
        | "reviewing"
        | "approved"
        | "rejected"
        | "reappeal"
      med_form: "syrup" | "tablet" | "ampoule" | "suppository"
      wallet_tx_status: "pending" | "done" | "failed"
      wallet_tx_type: "deposit" | "withdraw"
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
      app_role: ["doctor", "commission", "patient", "admin"],
      case_status: [
        "unreviewed",
        "reviewing",
        "approved",
        "rejected",
        "reappeal",
      ],
      med_form: ["syrup", "tablet", "ampoule", "suppository"],
      wallet_tx_status: ["pending", "done", "failed"],
      wallet_tx_type: ["deposit", "withdraw"],
    },
  },
} as const
