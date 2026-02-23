/* eslint-disable @typescript-eslint/no-empty-object-type */
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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      APIKey: {
        Row: {
          createdAt: string
          encryptedKey: string
          id: string
          isActive: boolean
          lastVerified: string | null
          maskedKey: string
          provider: Database["public"]["Enums"]["AIProvider"]
          tenantId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          encryptedKey: string
          id?: string
          isActive?: boolean
          lastVerified?: string | null
          maskedKey: string
          provider: Database["public"]["Enums"]["AIProvider"]
          tenantId: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          encryptedKey?: string
          id?: string
          isActive?: boolean
          lastVerified?: string | null
          maskedKey?: string
          provider?: Database["public"]["Enums"]["AIProvider"]
          tenantId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "APIKey_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      AuditLog: {
        Row: {
          aiResponse: string | null
          categoriesTriggered: string[]
          estimatedCostUSD: number
          id: string
          provider: Database["public"]["Enums"]["AIProvider"]
          rawPrompt: string | null
          redactedPrompt: string | null
          redactionCount: number
          tenantId: string
          timestamp: string
          tokensUsed: number
          userId: string
        }
        Insert: {
          aiResponse?: string | null
          categoriesTriggered: string[]
          estimatedCostUSD: number
          id?: string
          provider: Database["public"]["Enums"]["AIProvider"]
          rawPrompt?: string | null
          redactedPrompt?: string | null
          redactionCount: number
          tenantId: string
          timestamp?: string
          tokensUsed: number
          userId: string
        }
        Update: {
          aiResponse?: string | null
          categoriesTriggered?: string[]
          estimatedCostUSD?: number
          id?: string
          provider?: Database["public"]["Enums"]["AIProvider"]
          rawPrompt?: string | null
          redactedPrompt?: string | null
          redactionCount?: number
          tenantId?: string
          timestamp?: string
          tokensUsed?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "AuditLog_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AuditLog_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Tenant: {
        Row: {
          createdAt: string
          customBlacklist: string[]
          dailyTokenBudget: number
          domain: string
          id: string
          logo: string | null
          name: string
          primaryColor: string
          promptStorageMode: Database["public"]["Enums"]["PromptStorageMode"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          customBlacklist?: string[]
          dailyTokenBudget?: number
          domain: string
          id?: string
          logo?: string | null
          name: string
          primaryColor?: string
          promptStorageMode?: Database["public"]["Enums"]["PromptStorageMode"]
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          customBlacklist?: string[]
          dailyTokenBudget?: number
          domain?: string
          id?: string
          logo?: string | null
          name?: string
          primaryColor?: string
          promptStorageMode?: Database["public"]["Enums"]["PromptStorageMode"]
          updatedAt?: string
        }
        Relationships: []
      }
      TokenUsage: {
        Row: {
          createdAt: string
          date: string
          id: string
          redactionCount: number
          requestCount: number
          tenantId: string
          tokensUsed: number
          userId: string
        }
        Insert: {
          createdAt?: string
          date: string
          id?: string
          redactionCount: number
          requestCount: number
          tenantId: string
          tokensUsed: number
          userId: string
        }
        Update: {
          createdAt?: string
          date?: string
          id?: string
          redactionCount?: number
          requestCount?: number
          tenantId?: string
          tokensUsed?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "TokenUsage_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TokenUsage_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          dailyTokenLimit: number
          department: string | null
          email: string
          id: string
          name: string | null
          password: string
          role: Database["public"]["Enums"]["Role"]
          tenantId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          dailyTokenLimit?: number
          department?: string | null
          email: string
          id?: string
          name?: string | null
          password: string
          role?: Database["public"]["Enums"]["Role"]
          tenantId: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          dailyTokenLimit?: number
          department?: string | null
          email?: string
          id?: string
          name?: string | null
          password?: string
          role?: Database["public"]["Enums"]["Role"]
          tenantId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "User_tenantId_fkey"
            columns: ["tenantId"]
            isOneToOne: false
            referencedRelation: "Tenant"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AIProvider: "OPENAI" | "GEMINI" | "ANTHROPIC"
      PromptStorageMode: "NONE" | "REDACTED_ONLY" | "FULL"
      Role: "SUPER_ADMIN" | "ADMIN" | "USER"
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
      AIProvider: ["OPENAI", "GEMINI", "ANTHROPIC"],
      PromptStorageMode: ["NONE", "REDACTED_ONLY", "FULL"],
      Role: ["SUPER_ADMIN", "ADMIN", "USER"],
    },
  },
} as const
