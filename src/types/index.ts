export interface User {
  id: number;
  email: string;
  username?: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  admin_role?: "superadmin" | "finance" | "support" | "";
  admin_role_label?: string;
  identification_type?: string;
  identification_number?: string;
  country?: string;
  department?: string;
  city?: string;
  address?: string;
  phone_country_code?: string;
  phone_number?: string;
  last_login?: string | null;
  invitation_sent_at?: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  legal_name: string;
  nit: string;
  email: string;
  phone: string;
  status: "active" | "suspended" | "blocked" | "pending";
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  monthly_price: string;
  yearly_price: string;
  max_users: number;
  max_issuers: number;
  max_documents_per_month: number;
  has_inventory: boolean;
  has_cash_register: boolean;
  has_api_access: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  tenant: number;
  plan: number;
  status: "active" | "trialing" | "past_due" | "suspended" | "canceled";
  billing_cycle: "monthly" | "yearly";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entity_id: number | null;
  status: "success" | "error" | "warning";
  status_label: string;
  message: string;
  error_message: string;
  request_method: string;
  request_path: string;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  created_at_colombia: string;
  actor: number | null;
  actor_name: string;
  actor_email: string;
  actor_username: string;
  actor_identification: string;
}

export interface MatiasConnection {
  id: number;
  name: string;
  environment: "sandbox" | "production";
  environment_label: string;
  base_url: string;
  default_base_url: string;
  enabled: boolean;
  timeout_seconds: number;
  retry_attempts: number;
  token_generation_endpoint: string;
  auth_method: string;
  token_preview: string;
  token_external_id: string;
  token_name: string;
  token_expires_at: string | null;
  token_created_at: string | null;
  authenticated_user_id: string;
  authenticated_user_email: string;
  account_email: string;
  parent_company_uuid: string;
  external_company_id: string;
  external_company_name: string;
  external_company_nit: string;
  account_main_email: string;
  linked_companies_count: number;
  external_company_status: string;
  membership_plan: string;
  membership_status: string;
  membership_expires_at: string | null;
  membership_documents_available: number | null;
  membership_documents_consumed: number | null;
  membership_company_limit: number | null;
  membership_summary: Record<string, unknown>;
  connection_status: string;
  operational_status: string;
  environment_detected: string;
  multicompany_verified: boolean;
  last_test_at: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_code: string;
  last_error_message: string;
  last_response_time_ms: number | null;
  last_test_results: Array<{ label: string; endpoint?: string; http_status?: number | null; response_time_ms?: number | null; status: "success" | "error" | "warning"; detail: string }>;
  catalogs_status: string;
  catalogs_synced_count: number;
  catalogs_total_count: number;
  catalogs_last_attempt_at: string | null;
  catalogs_last_synced_at: string | null;
  catalogs_detail: Array<{ endpoint: string; name: string; records: number | null; status: string; last_attempt_at?: string; last_synced_at: string; http_status?: number | null; response_time_ms?: number | null; error: string }>;
}
