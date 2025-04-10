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
      learning_path_modules: {
        Row: {
          module_id: string
          path_id: string
          sequence_order: number
          unlock_requirements: Json | null
          user_id: string
        }
        Insert: {
          module_id: string
          path_id: string
          sequence_order: number
          unlock_requirements?: Json | null
          user_id: string
        }
        Update: {
          module_id?: string
          path_id?: string
          sequence_order?: number
          unlock_requirements?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_modules_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string | null
          id: string
          library_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          library_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          library_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      libraries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      module_sources: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          module_id: string
          size_bytes: number | null
          storage_object_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          module_id: string
          size_bytes?: number | null
          storage_object_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          module_id?: string
          size_bytes?: number | null
          storage_object_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_sources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_stats: {
        Row: {
          average_score: number | null
          current_box: number
          last_reviewed_at: string | null
          module_id: string
          next_review_at: string | null
          quiz_attempts: number
          review_count: number
          user_id: string
        }
        Insert: {
          average_score?: number | null
          current_box?: number
          last_reviewed_at?: string | null
          module_id: string
          next_review_at?: string | null
          quiz_attempts?: number
          review_count?: number
          user_id: string
        }
        Update: {
          average_score?: number | null
          current_box?: number
          last_reviewed_at?: string | null
          module_id?: string
          next_review_at?: string | null
          quiz_attempts?: number
          review_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_stats_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: true
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          id: string
          lesson_content: Json | null
          library_id: string
          overview: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_content?: Json | null
          library_id: string
          overview?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_content?: Json | null
          library_id?: string
          overview?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          choices: Json | null
          correct_answer_text: string | null
          id: string
          question_text: string
          question_type: string
          quiz_id: string
          sequence_order: number
          user_id: string
        }
        Insert: {
          choices?: Json | null
          correct_answer_text?: string | null
          id?: string
          question_text: string
          question_type: string
          quiz_id: string
          sequence_order?: number
          user_id: string
        }
        Update: {
          choices?: Json | null
          correct_answer_text?: string | null
          id?: string
          question_text?: string
          question_type?: string
          quiz_id?: string
          sequence_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          module_id: string
          time_limit_seconds: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          time_limit_seconds?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          time_limit_seconds?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          feedback: string | null
          graded_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string
          student_answer_text: string | null
          submission_id: string
          user_id: string
        }
        Insert: {
          feedback?: string | null
          graded_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          student_answer_text?: string | null
          submission_id: string
          user_id: string
        }
        Update: {
          feedback?: string | null
          graded_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          student_answer_text?: string | null
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          attempt_number: number
          grade_percent: number | null
          id: string
          letter_grade: string | null
          module_id: string
          quiz_id: string
          status: string
          submitted_at: string | null
          time_elapsed_seconds: number | null
          user_id: string
        }
        Insert: {
          attempt_number?: number
          grade_percent?: number | null
          id?: string
          letter_grade?: string | null
          module_id: string
          quiz_id: string
          status?: string
          submitted_at?: string | null
          time_elapsed_seconds?: number | null
          user_id: string
        }
        Update: {
          attempt_number?: number
          grade_percent?: number | null
          id?: string
          letter_grade?: string | null
          module_id?: string
          quiz_id?: string
          status?: string
          submitted_at?: string | null
          time_elapsed_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          encrypted_gemini_api_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_gemini_api_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_gemini_api_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
