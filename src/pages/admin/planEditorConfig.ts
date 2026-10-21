import type { Plan, PlanBundle } from "@/types";
import { bundleFeatures, type Category } from "./planPresentation";

export interface PlanDraft {
  name: string;
  short_description: string;
  category: Category;
  quote_only: boolean;
  monthly_price: string;
  yearly_price: string;
  annual_document_quota: number | null;
  max_documents_per_month: number | null;
  max_employees: number | null;
  max_users: number | null;
  accountant_users: number | null;
  billing_plan: string;
  payroll_plan: string;
  discount_percent: number;
  features: Plan["features"];
}
export function makeDraft(category: Category, plan?: Plan, bundle?: PlanBundle): PlanDraft {
  return {
    name: bundle?.name ?? plan?.name ?? "",
    short_description: bundle?.short_description ?? plan?.short_description ?? "",
    category,
    quote_only: bundle?.quote_only ?? (plan?.quote_only || plan?.plan_type === "enterprise"),
    monthly_price: plan?.monthly_price ?? "", yearly_price: plan?.yearly_price ?? "",
    annual_document_quota: plan?.annual_document_quota ?? null,
    max_documents_per_month: plan?.max_documents_per_month ?? null,
    max_employees: plan?.max_employees ?? null,
    max_users: plan?.max_users ?? null, accountant_users: plan?.accountant_users ?? null,
    billing_plan: bundle ? String(bundle.billing_plan) : "", payroll_plan: bundle ? String(bundle.payroll_plan) : "",
    discount_percent: bundle?.discount_percent ?? 0,
    features: structuredClone(bundle ? bundleFeatures(bundle) : plan?.features ?? []),
  };
}
