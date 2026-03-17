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
      accounts: {
        Row: {
          account_number: string
          account_type: Database["public"]["Enums"]["account_type"]
          activity: Database["public"]["Enums"]["activity_type"]
          address: string
          balance: number
          birth_date: string
          birth_place: string
          branch_id: string | null
          created_at: string
          created_by: string
          currency: string
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          email: string | null
          first_name: string
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          initial_deposit: number
          last_activity: string | null
          last_name: string
          phone: string
          photo_url: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          account_number: string
          account_type: Database["public"]["Enums"]["account_type"]
          activity: Database["public"]["Enums"]["activity_type"]
          address: string
          balance?: number
          birth_date: string
          birth_place: string
          branch_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          email?: string | null
          first_name: string
          full_name?: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id?: string
          initial_deposit: number
          last_activity?: string | null
          last_name: string
          phone: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          account_number?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          activity?: Database["public"]["Enums"]["activity_type"]
          address?: string
          balance?: number
          birth_date?: string
          birth_place?: string
          branch_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          document_number?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          email?: string | null
          first_name?: string
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          initial_deposit?: number
          last_activity?: string | null
          last_name?: string
          phone?: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          success: boolean | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          success?: boolean | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          success?: boolean | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bank_info: {
        Row: {
          address: string | null
          created_at: string
          currency: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slogan: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slogan?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slogan?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string
          code: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          code: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      loan_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          id: string
          loan_id: string
          payment_date: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          id?: string
          loan_id: string
          payment_date?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          loan_id?: string
          payment_date?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          created_by: string
          duration_months: number
          end_date: string | null
          id: string
          interest_rate: number
          loan_number: string
          monthly_payment: number
          next_payment_date: string | null
          remaining_amount: number
          start_date: string | null
          status: Database["public"]["Enums"]["loan_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          created_by: string
          duration_months: number
          end_date?: string | null
          id?: string
          interest_rate: number
          loan_number: string
          monthly_payment: number
          next_payment_date?: string | null
          remaining_amount: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          created_by?: string
          duration_months?: number
          end_date?: string | null
          id?: string
          interest_rate?: number
          loan_number?: string
          monthly_payment?: number
          next_payment_date?: string | null
          remaining_amount?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          active_accounts: number
          created_at: string
          created_by: string
          id: string
          new_accounts: number
          report_date: string
          report_number: string
          total_deposits: number
          total_loan_payments: number
          total_loans: number
          total_transfers: number
          total_withdrawals: number
        }
        Insert: {
          active_accounts?: number
          created_at?: string
          created_by: string
          id?: string
          new_accounts?: number
          report_date?: string
          report_number: string
          total_deposits?: number
          total_loan_payments?: number
          total_loans?: number
          total_transfers?: number
          total_withdrawals?: number
        }
        Update: {
          active_accounts?: number
          created_at?: string
          created_by?: string
          id?: string
          new_accounts?: number
          report_date?: string
          report_number?: string
          total_deposits?: number
          total_loan_payments?: number
          total_loans?: number
          total_transfers?: number
          total_withdrawals?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          balance_after: number
          balance_before: number
          branch_id: string | null
          created_at: string
          description: string | null
          destination_account_id: string | null
          id: string
          performed_by: string
          reference: string | null
          transaction_number: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          account_id: string
          amount: number
          balance_after: number
          balance_before: number
          branch_id?: string | null
          created_at?: string
          description?: string | null
          destination_account_id?: string | null
          id?: string
          performed_by: string
          reference?: string | null
          transaction_number: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number
          balance_before?: number
          branch_id?: string | null
          created_at?: string
          description?: string | null
          destination_account_id?: string | null
          id?: string
          performed_by?: string
          reference?: string | null
          transaction_number?: string
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_auth_user: { Args: { user_email: string }; Returns: undefined }
      delete_user_account: {
        Args: { user_id_to_delete: string }
        Returns: undefined
      }
      generate_account_number: { Args: never; Returns: string }
      generate_loan_number: { Args: never; Returns: string }
      generate_transaction_number: { Args: never; Returns: string }
      get_user_branch_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_general_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_status: "active" | "inactive" | "suspended" | "closed"
      account_type: "savings" | "checking" | "investment"
      activity_type: "salary" | "student" | "scholar" | "self_employed"
      app_role: "admin" | "cashier"
      document_type: "passport" | "id_card" | "driver_license"
      gender_type: "male" | "female" | "other"
      loan_status: "pending" | "active" | "completed" | "defaulted"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "transfer"
        | "loan_payment"
        | "interest"
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
      account_status: ["active", "inactive", "suspended", "closed"],
      account_type: ["savings", "checking", "investment"],
      activity_type: ["salary", "student", "scholar", "self_employed"],
      app_role: ["admin", "cashier"],
      document_type: ["passport", "id_card", "driver_license"],
      gender_type: ["male", "female", "other"],
      loan_status: ["pending", "active", "completed", "defaulted"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "transfer",
        "loan_payment",
        "interest",
      ],
    },
  },
} as const
