import type { Plan, PlanBundle } from "@/types";

export const categories = ["invoicing", "payroll_addon", "bundles"] as const;
export type Category = typeof categories[number];
export const categoryLabels: Record<Category, string> = { invoicing: "Facturación electrónica", payroll_addon: "Nómina electrónica", bundles: "Facturación + nómina" };
export const money = (value: number | string | null) => value === null || value === "" || !Number.isFinite(Number(value)) ? "Sin definir" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2 }).format(Number(value));
export const percent = (value: number) => new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);
// Nonnegative COP amounts, rounded half-up to cents, matching Django Decimal.
export const cents = (value: string | number | null) => Math.round((Number(value || 0) + Number.EPSILON) * 100);
export function annualSaving(monthly: string | number | null, annual: string | number | null) {
  if (monthly === null || annual === null || monthly === "" || annual === "") return null;
  const base = cents(monthly) * 12, saved = base - cents(annual);
  return base > 0 && saved > 0 ? { amount: saved / 100, percent: saved / base * 100 } : null;
}
export function bundleTotals(billing: Plan | undefined, payroll: Plan | undefined, discount: number) {
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) return { monthly: null, annual: null };
  const total = (key: "monthly_price" | "yearly_price") => {
    if (!billing || !payroll || billing[key] === null || payroll[key] === null || billing.quote_only || payroll.quote_only) return null;
    const base = cents(billing[key]) + cents(payroll[key]);
    return { base: base / 100, total: Math.floor((base * (100 - discount) + 50) / 100) / 100 };
  };
  return { monthly: total("monthly_price"), annual: total("yearly_price") };
}
export const slugify = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
export const isExclusion = (title: string) => /no incluye|exclusi/i.test(title);
export function bundleFeatures(bundle: PlanBundle): Plan["features"] {
  return bundle.features ?? [...bundle.billing_plan_details.features, ...bundle.payroll_plan_details.features];
}
