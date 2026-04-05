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
      activities: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          linked_entity_id: string | null
          linked_entity_type: string | null
          status: string | null
          title: string
          type: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          status?: string | null
          title: string
          type: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          status?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          linked_entity_id: string | null
          linked_entity_type: string | null
          mime_type: string | null
          name: string
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          mime_type?: string | null
          name: string
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          mime_type?: string | null
          name?: string
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          acquisition_cost: number | null
          acquisition_date: string | null
          category_id: string | null
          code: string
          condition: string | null
          created_at: string | null
          created_by: string | null
          criticality: string | null
          description: string | null
          estimated_value: number | null
          funding_source: string | null
          id: string
          is_archived: boolean | null
          is_loanable: boolean | null
          loan_conditions: string | null
          location_id: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          owner: string | null
          qr_code_url: string | null
          quantity: number | null
          rate_per_day: number | null
          rate_per_month: number | null
          rate_per_week: number | null
          responsible_id: string | null
          serial_number: string | null
          specifications: Json | null
          status: string | null
          tags: string[] | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          category_id?: string | null
          code: string
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          criticality?: string | null
          description?: string | null
          estimated_value?: number | null
          funding_source?: string | null
          id?: string
          is_archived?: boolean | null
          is_loanable?: boolean | null
          loan_conditions?: string | null
          location_id?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          owner?: string | null
          qr_code_url?: string | null
          quantity?: number | null
          rate_per_day?: number | null
          rate_per_month?: number | null
          rate_per_week?: number | null
          responsible_id?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          category_id?: string | null
          code?: string
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          criticality?: string | null
          description?: string | null
          estimated_value?: number | null
          funding_source?: string | null
          id?: string
          is_archived?: boolean | null
          is_loanable?: boolean | null
          loan_conditions?: string | null
          location_id?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          owner?: string | null
          qr_code_url?: string | null
          quantity?: number | null
          rate_per_day?: number | null
          rate_per_month?: number | null
          rate_per_week?: number | null
          responsible_id?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          closed_at: string | null
          code: string
          converted_to_id: string | null
          converted_to_type: string | null
          created_at: string | null
          description: string
          equipment_id: string | null
          id: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          submitted_by: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          closed_at?: string | null
          code: string
          converted_to_id?: string | null
          converted_to_type?: string | null
          created_at?: string | null
          description: string
          equipment_id?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          submitted_by: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          closed_at?: string | null
          code?: string
          converted_to_id?: string | null
          converted_to_type?: string | null
          created_at?: string | null
          description?: string
          equipment_id?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          submitted_by?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_items: {
        Row: {
          condition_after: string | null
          condition_before: string | null
          created_at: string | null
          days_billed: number | null
          equipment_id: string
          id: string
          loan_id: string
          notes: string | null
          photo_after_url: string | null
          photo_before_url: string | null
          quantity: number | null
          rate_applied: number | null
          rate_type: string | null
          subtotal: number | null
        }
        Insert: {
          condition_after?: string | null
          condition_before?: string | null
          created_at?: string | null
          days_billed?: number | null
          equipment_id: string
          id?: string
          loan_id: string
          notes?: string | null
          photo_after_url?: string | null
          photo_before_url?: string | null
          quantity?: number | null
          rate_applied?: number | null
          rate_type?: string | null
          subtotal?: number | null
        }
        Update: {
          condition_after?: string | null
          condition_before?: string | null
          created_at?: string | null
          days_billed?: number | null
          equipment_id?: string
          id?: string
          loan_id?: string
          notes?: string | null
          photo_after_url?: string | null
          photo_before_url?: string | null
          quantity?: number | null
          rate_applied?: number | null
          rate_type?: string | null
          subtotal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_items_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          actual_return: string | null
          borrower_email: string | null
          borrower_name: string
          borrower_org: string | null
          borrower_phone: string | null
          borrower_type: string | null
          checkout_date: string | null
          code: string
          created_at: string | null
          created_by: string | null
          expected_return: string
          id: string
          invoice_code: string | null
          is_invoiced: boolean | null
          notes: string | null
          responsible_id: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          actual_return?: string | null
          borrower_email?: string | null
          borrower_name: string
          borrower_org?: string | null
          borrower_phone?: string | null
          borrower_type?: string | null
          checkout_date?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          expected_return: string
          id?: string
          invoice_code?: string | null
          is_invoiced?: boolean | null
          notes?: string | null
          responsible_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_return?: string | null
          borrower_email?: string | null
          borrower_name?: string
          borrower_org?: string | null
          borrower_phone?: string | null
          borrower_type?: string | null
          checkout_date?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          expected_return?: string
          id?: string
          invoice_code?: string | null
          is_invoiced?: boolean | null
          notes?: string | null
          responsible_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          building: string | null
          created_at: string | null
          description: string | null
          floor: string | null
          id: string
          name: string
          room: string | null
          zone: string | null
        }
        Insert: {
          building?: string | null
          created_at?: string | null
          description?: string | null
          floor?: string | null
          id?: string
          name: string
          room?: string | null
          zone?: string | null
        }
        Update: {
          building?: string | null
          created_at?: string | null
          description?: string | null
          floor?: string | null
          id?: string
          name?: string
          room?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          linked_entity_id: string | null
          linked_entity_type: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sst_incidents: {
        Row: {
          closed_at: string | null
          code: string
          corrective_actions: string | null
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string
          equipment_id: string | null
          evidence_urls: string[] | null
          generated_work_order_id: string | null
          id: string
          immediate_measures: string | null
          incident_date: string
          incident_type: string
          location: string | null
          probable_cause: string | null
          responsible_id: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          code: string
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description: string
          equipment_id?: string | null
          evidence_urls?: string[] | null
          generated_work_order_id?: string | null
          id?: string
          immediate_measures?: string | null
          incident_date: string
          incident_type: string
          location?: string | null
          probable_cause?: string | null
          responsible_id?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          code?: string
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string
          equipment_id?: string | null
          evidence_urls?: string[] | null
          generated_work_order_id?: string | null
          id?: string
          immediate_measures?: string | null
          incident_date?: string
          incident_type?: string
          location?: string | null
          probable_cause?: string | null
          responsible_id?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_incidents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_incidents_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_incidents_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_incidents_generated_work_order_id_fkey"
            columns: ["generated_work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_incidents_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_sheets: {
        Row: {
          created_at: string | null
          danger_category: string | null
          equipment_id: string
          id: string
          last_reviewed: string | null
          lockout_procedure: string | null
          main_risks: string | null
          prevention_measures: string | null
          prohibited_actions: string | null
          required_ppe: string | null
          reviewed_by: string | null
          sop_reference: string | null
          updated_at: string | null
          warnings: string | null
        }
        Insert: {
          created_at?: string | null
          danger_category?: string | null
          equipment_id: string
          id?: string
          last_reviewed?: string | null
          lockout_procedure?: string | null
          main_risks?: string | null
          prevention_measures?: string | null
          prohibited_actions?: string | null
          required_ppe?: string | null
          reviewed_by?: string | null
          sop_reference?: string | null
          updated_at?: string | null
          warnings?: string | null
        }
        Update: {
          created_at?: string | null
          danger_category?: string | null
          equipment_id?: string
          id?: string
          last_reviewed?: string | null
          lockout_procedure?: string | null
          main_risks?: string | null
          prevention_measures?: string | null
          prohibited_actions?: string | null
          required_ppe?: string | null
          reviewed_by?: string | null
          sop_reference?: string | null
          updated_at?: string | null
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_sheets_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: true
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_sheets_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: true
            referencedRelation: "v_equipment_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_sheets_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          closed_at: string | null
          code: string
          completed_at: string | null
          condition_after: string | null
          condition_before: string | null
          corrective_actions: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_hours: number | null
          equipment_id: string
          estimated_cost: number | null
          id: string
          is_recurring: boolean | null
          next_scheduled: string | null
          observations: string | null
          photo_ref: string | null
          planned_date: string | null
          priority: string | null
          problem_detected: string | null
          recurrence_interval_months: number | null
          report_ref: string | null
          root_cause: string | null
          started_at: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          closed_at?: string | null
          code: string
          completed_at?: string | null
          condition_after?: string | null
          condition_before?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          equipment_id: string
          estimated_cost?: number | null
          id?: string
          is_recurring?: boolean | null
          next_scheduled?: string | null
          observations?: string | null
          photo_ref?: string | null
          planned_date?: string | null
          priority?: string | null
          problem_detected?: string | null
          recurrence_interval_months?: number | null
          report_ref?: string | null
          root_cause?: string | null
          started_at?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          closed_at?: string | null
          code?: string
          completed_at?: string | null
          condition_after?: string | null
          condition_before?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          equipment_id?: string
          estimated_cost?: number | null
          id?: string
          is_recurring?: boolean | null
          next_scheduled?: string | null
          observations?: string | null
          photo_ref?: string | null
          planned_date?: string | null
          priority?: string | null
          problem_detected?: string | null
          recurrence_interval_months?: number | null
          report_ref?: string | null
          root_cause?: string | null
          started_at?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_detail"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_dashboard_kpis: {
        Row: {
          active_loans: number | null
          available: number | null
          borrowed: number | null
          in_maintenance: number | null
          open_incidents: number | null
          open_tickets: number | null
          open_work_orders: number | null
          out_of_service: number | null
          overdue_loans: number | null
          overdue_maintenance: number | null
          total_equipment: number | null
          total_value: number | null
        }
        Relationships: []
      }
      v_equipment_detail: {
        Row: {
          acquisition_cost: number | null
          acquisition_date: string | null
          active_loan_count: number | null
          active_wo_count: number | null
          category_id: string | null
          category_name: string | null
          code: string | null
          condition: string | null
          created_at: string | null
          created_by: string | null
          criticality: string | null
          description: string | null
          estimated_value: number | null
          funding_source: string | null
          id: string | null
          is_archived: boolean | null
          is_loanable: boolean | null
          loan_conditions: string | null
          location_id: string | null
          location_name: string | null
          location_zone: string | null
          manufacturer: string | null
          model: string | null
          name: string | null
          notes: string | null
          owner: string | null
          qr_code_url: string | null
          quantity: number | null
          rate_per_day: number | null
          rate_per_month: number | null
          rate_per_week: number | null
          responsible_id: string | null
          responsible_name: string | null
          serial_number: string | null
          specifications: Json | null
          status: string | null
          tags: string[] | null
          unit: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_overdue_loans: { Args: never; Returns: undefined }
      get_user_role: { Args: never; Returns: string }
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
