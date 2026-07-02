export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_staff: boolean;
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
