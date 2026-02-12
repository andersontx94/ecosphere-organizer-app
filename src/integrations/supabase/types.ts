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
      accounts_payable: {
        Row: {
          amount: number
          category: string | null
          client_id: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          notes: string | null
          organization_id: string | null
          paid_at: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["payable_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["payable_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["payable_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          notes: string | null
          organization_id: string | null
          project_id: string | null
          received_at: string | null
          status: Database["public"]["Enums"]["receivable_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["receivable_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["receivable_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          checklist_id: string
          created_at: string
          id: string
          notes: string | null
          order_index: number | null
          status: Database["public"]["Enums"]["checklist_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          id?: string
          notes?: string | null
          order_index?: number | null
          status?: Database["public"]["Enums"]["checklist_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          order_index?: number | null
          status?: Database["public"]["Enums"]["checklist_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string | null
          service_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id?: string | null
          service_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string | null
          service_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "environmental_services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          cnpj: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          responsible: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          responsible?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          responsible?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          enterprise_id: string | null
          expiry_date: string | null
          file_name: string | null
          file_path: string | null
          id: string
          issue_date: string | null
          name: string
          notes: string | null
          organization_id: string | null
          project_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          enterprise_id?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          issue_date?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          enterprise_id?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          issue_date?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprises: {
        Row: {
          activity_type: string | null
          address: string | null
          client_id: string
          created_at: string
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          address?: string | null
          client_id: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string | null
          address?: string | null
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprises_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      environmental_processes: {
        Row: {
          agency: string
          client_id: string | null
          created_at: string
          decision_date: string | null
          due_date: string | null
          enterprise_id: string | null
          expiry_date: string | null
          id: string
          internal_deadline: string | null
          license_type_id: string | null
          notes: string | null
          owner_id: string | null
          organization_id: string | null
          process_number: string | null
          process_type_id: string | null
          process_type: string
          protocol_date: string | null
          protocol_number: string | null
          risk_status: string | null
          service_id: string | null
          start_date: string | null
          city: string | null
          state: string | null
          status: string
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agency: string
          client_id?: string | null
          created_at?: string
          decision_date?: string | null
          due_date?: string | null
          enterprise_id?: string | null
          expiry_date?: string | null
          id?: string
          internal_deadline?: string | null
          license_type_id?: string | null
          notes?: string | null
          owner_id?: string | null
          organization_id?: string | null
          process_number?: string | null
          process_type_id?: string | null
          process_type: string
          protocol_date?: string | null
          protocol_number?: string | null
          risk_status?: string | null
          service_id?: string | null
          start_date?: string | null
          city?: string | null
          state?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agency?: string
          client_id?: string | null
          created_at?: string
          decision_date?: string | null
          due_date?: string | null
          enterprise_id?: string | null
          expiry_date?: string | null
          id?: string
          internal_deadline?: string | null
          license_type_id?: string | null
          notes?: string | null
          owner_id?: string | null
          organization_id?: string | null
          process_number?: string | null
          process_type_id?: string | null
          process_type?: string
          protocol_date?: string | null
          protocol_number?: string | null
          risk_status?: string | null
          service_id?: string | null
          start_date?: string | null
          city?: string | null
          state?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "environmental_processes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environmental_processes_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environmental_processes_license_type_id_fkey"
            columns: ["license_type_id"]
            isOneToOne: false
            referencedRelation: "license_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environmental_processes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      environmental_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          initial_balance: number | null
          is_default: boolean | null
          name: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          initial_balance?: number | null
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          initial_balance?: number | null
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string | null
          client_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          notes: string | null
          organization_id: string | null
          project_id: string | null
          type: Database["public"]["Enums"]["financial_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          type: Database["public"]["Enums"]["financial_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          type?: Database["public"]["Enums"]["financial_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      license_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      process_costs: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string | null
          paid_at: string | null
          process_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          paid_at?: string | null
          process_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          paid_at?: string | null
          process_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_costs_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "environmental_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_revenues: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          process_id: string
          received_at: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          process_id: string
          received_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          process_id?: string
          received_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_revenues_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "environmental_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_stages: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          name: string
          notes: string | null
          order_index: number | null
          organization_id: string | null
          process_id: string
          responsible: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          notes?: string | null
          order_index?: number | null
          organization_id?: string | null
          process_id: string
          responsible?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_index?: number | null
          organization_id?: string | null
          process_id?: string
          responsible?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_stages_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "environmental_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_types: {
        Row: {
          active: boolean | null
          category: string | null
          code: string | null
          created_at: string
          created_by: string | null
          default_deadline_days: number | null
          description: string | null
          id: string
          is_default: boolean | null
          is_licensing: boolean | null
          name: string
          organization_id: string | null
          requires_agency: boolean | null
          requires_protocol_number: boolean | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          default_deadline_days?: number | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_licensing?: boolean | null
          name: string
          organization_id?: string | null
          requires_agency?: boolean | null
          requires_protocol_number?: boolean | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          default_deadline_days?: number | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_licensing?: boolean | null
          name?: string
          organization_id?: string | null
          requires_agency?: boolean | null
          requires_protocol_number?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          active_organization_id: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          id: string
          main_activity: string | null
          name: string
          person_type: Database["public"]["Enums"]["person_type"]
          professional_type: Database["public"]["Enums"]["professional_type"]
          profile_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          active_organization_id?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          main_activity?: string | null
          name: string
          person_type?: Database["public"]["Enums"]["person_type"]
          professional_type?: Database["public"]["Enums"]["professional_type"]
          profile_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          active_organization_id?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          main_activity?: string | null
          name?: string
          person_type?: Database["public"]["Enums"]["person_type"]
          professional_type?: Database["public"]["Enums"]["professional_type"]
          profile_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_services: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          project_id: string
          service_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          project_id: string
          service_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          project_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "environmental_services"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          enterprise_id: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          enterprise_id?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          enterprise_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          enterprise_id: string | null
          id: string
          organization_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          process_id: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          enterprise_id?: string | null
          id?: string
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          process_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          enterprise_id?: string | null
          id?: string
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          process_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "environmental_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          id: string
          organization_id: string | null
          client_id: string
          name: string
          role: string | null
          email: string | null
          phone: string | null
          is_primary: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          client_id: string
          name: string
          role?: string | null
          email?: string | null
          phone?: string | null
          is_primary?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          client_id?: string
          name?: string
          role?: string | null
          email?: string | null
          phone?: string | null
          is_primary?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string | null
          created_by: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          created_by?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          created_by?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          name: string
          category: string | null
          description: string | null
          default_price: number | null
          unit: string | null
          active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          name: string
          category?: string | null
          description?: string | null
          default_price?: number | null
          unit?: string | null
          active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          name?: string
          category?: string | null
          description?: string | null
          default_price?: number | null
          unit?: string | null
          active?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      process_services: {
        Row: {
          id: string
          organization_id: string | null
          process_id: string
          service_id: string
          qty: number | null
          unit_price: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          process_id: string
          service_id: string
          qty?: number | null
          unit_price?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          process_id?: string
          service_id?: string
          qty?: number | null
          unit_price?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_services_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "environmental_processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          id: string
          organization_id: string
          status: string
          title: string
          company_name: string
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          cpf_cnpj: string | null
          city: string | null
          state: string | null
          notes: string | null
          total_amount: number | null
          created_at: string
          updated_at: string
          converted_at: string | null
          converted_client_id: string | null
          converted_enterprise_id: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          status?: string
          title: string
          company_name: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cpf_cnpj?: string | null
          city?: string | null
          state?: string | null
          notes?: string | null
          total_amount?: number | null
          created_at?: string
          updated_at?: string
          converted_at?: string | null
          converted_client_id?: string | null
          converted_enterprise_id?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          status?: string
          title?: string
          company_name?: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cpf_cnpj?: string | null
          city?: string | null
          state?: string | null
          notes?: string | null
          total_amount?: number | null
          created_at?: string
          updated_at?: string
          converted_at?: string | null
          converted_client_id?: string | null
          converted_enterprise_id?: string | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_converted_client_id_fkey"
            columns: ["converted_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_converted_enterprise_id_fkey"
            columns: ["converted_enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_items: {
        Row: {
          id: string
          proposal_id: string
          organization_id: string
          service_id: string | null
          name: string
          description: string | null
          quantity: number
          unit_price: number
          total_price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          organization_id: string
          service_id?: string | null
          name: string
          description?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          organization_id?: string
          service_id?: string | null
          name?: string
          description?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          id: string
          organization_id: string | null
          client_id: string
          enterprise_id: string | null
          process_id: string | null
          number: string | null
          status: string | null
          issue_date: string | null
          due_date: string | null
          notes: string | null
          total: number | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          client_id: string
          enterprise_id?: string | null
          process_id?: string | null
          number?: string | null
          status?: string | null
          issue_date?: string | null
          due_date?: string | null
          notes?: string | null
          total?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          client_id?: string
          enterprise_id?: string | null
          process_id?: string | null
          number?: string | null
          status?: string | null
          issue_date?: string | null
          due_date?: string | null
          notes?: string | null
          total?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "environmental_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          id: string
          organization_id: string | null
          invoice_id: string
          description: string
          qty: number | null
          unit_price: number | null
          total: number | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          invoice_id: string
          description: string
          qty?: number | null
          unit_price?: number | null
          total?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          invoice_id?: string
          description?: string
          qty?: number | null
          unit_price?: number | null
          total?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          organization_id: string | null
          invoice_id: string
          paid_at: string | null
          amount: number
          method: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          invoice_id: string
          paid_at?: string | null
          amount: number
          method?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          invoice_id?: string
          paid_at?: string | null
          amount?: number
          method?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          price_cents: number
          billing_period: string
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          price_cents?: number
          billing_period?: string
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          price_cents?: number
          billing_period?: string
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      usage_limits: {
        Row: {
          id: string
          plan_id: string
          key: string
          limit_value: number
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          key: string
          limit_value: number
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          key?: string
          limit_value?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_limits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          organization_id: string
          plan_id: string
          status: string
          started_at: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan_id: string
          status?: string
          started_at?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan_id?: string
          status?: string
          started_at?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          id: string
          organization_id: string
          key: string
          quantity: number
          occurred_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          key: string
          quantity?: number
          occurred_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          key?: string
          quantity?: number
          occurred_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_account_active: { Args: { _user_id: string }; Returns: boolean }
      convert_proposal: {
        Args: { proposal_id: string; options?: Json }
        Returns: Json
      }
    }
    Enums: {
      account_status: "active" | "inactive"
      checklist_status: "pendente" | "em_andamento" | "concluido"
      client_type: "fisica" | "juridica"
      document_type:
        | "licenca"
        | "relatorio"
        | "autorizacao"
        | "certidao"
        | "outro"
      financial_type: "entrada" | "saida"
      payable_status: "em_aberto" | "pago"
      person_type: "fisica" | "juridica"
      professional_type:
        | "consultor_autonomo"
        | "profissional_pj"
        | "empresa_ambiental"
      receivable_status: "em_aberto" | "recebido"
      task_priority: "baixa" | "media" | "alta"
      task_status: "pendente" | "em_andamento" | "concluido"
      validity_status: "valido" | "proximo_vencimento" | "vencido"
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
      account_status: ["active", "inactive"],
      checklist_status: ["pendente", "em_andamento", "concluido"],
      client_type: ["fisica", "juridica"],
      document_type: [
        "licenca",
        "relatorio",
        "autorizacao",
        "certidao",
        "outro",
      ],
      financial_type: ["entrada", "saida"],
      payable_status: ["em_aberto", "pago"],
      person_type: ["fisica", "juridica"],
      professional_type: [
        "consultor_autonomo",
        "profissional_pj",
        "empresa_ambiental",
      ],
      receivable_status: ["em_aberto", "recebido"],
      task_priority: ["baixa", "media", "alta"],
      task_status: ["pendente", "em_andamento", "concluido"],
      validity_status: ["valido", "proximo_vencimento", "vencido"],
    },
  },
} as const

