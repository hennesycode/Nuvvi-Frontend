import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/api/client";
import type { ApiResponse, Plan, PlanBundle } from "@/types";
import { Button } from "@/components/ui/button";
import { PlanEditorDialog, type FieldErrors } from "./PlanEditorDialog";
import type { PlanDraft } from "./planEditorConfig";
import { PlanCard } from "./PlanCard";
import { categories, categoryLabels, slugify, type Category } from "./planPresentation";
import "./planCatalog.css";

async function collection<T>(url: string): Promise<T[]> {
  const result: T[] = [];
  let next: string | null = url;
  while (next) {
    const { data }: { data: ApiResponse<T> | T[] } = await apiClient.get(next);
    if (Array.isArray(data)) return [...result, ...data];
    result.push(...data.results);
    next = data.next;
  }
  return result;
}

function CatalogTabs({ tab, counts, onChange }: { tab: Category; counts: Record<Category, number>; onChange: (category: Category) => void }) {
  const short = { invoicing: "Facturación", payroll_addon: "Nómina", bundles: "Combos" };
  return <div role="tablist" aria-label="Catálogo de planes" className="flex max-w-full gap-1 overflow-x-auto border-b">{categories.map((key, index) => <button key={key} id={`tab-${key}`} aria-controls="plan-catalog-panel" role="tab" aria-selected={tab === key} tabIndex={tab === key ? 0 : -1} aria-label={`${categoryLabels[key]} (${counts[key]})`} onClick={() => onChange(key)} onKeyDown={e => {
    const target = e.key === "ArrowRight" ? (index + 1) % 3 : e.key === "ArrowLeft" ? (index + 2) % 3 : e.key === "Home" ? 0 : e.key === "End" ? 2 : -1;
    if (target >= 0) { e.preventDefault(); onChange(categories[target]); document.getElementById(`tab-${categories[target]}`)?.focus(); }
  }} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium ${tab === key ? "border-[#246FC1] text-[#246FC1]" : "border-transparent text-muted-foreground"}`}><span className="hidden md:inline">{categoryLabels[key]}</span><span className="md:hidden">{short[key]}</span><span className="rounded-md bg-muted px-1.5 py-0.5 text-xs tabular-nums">{counts[key]}</span></button>)}</div>;
}

export function AdminPlansPage() {
  const cache = useQueryClient();
  const [tab, setTab] = useState<Category>("invoicing");
  const [editor, setEditor] = useState<{ category: Category; plan?: Plan; bundle?: PlanBundle } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const plansQuery = useQuery({ queryKey: ["plans", "current"], queryFn: () => collection<Plan>("/plans/?current=true") });
  const bundlesQuery = useQuery({ queryKey: ["plan-bundles", "current"], queryFn: () => collection<PlanBundle>("/plan-bundles/?current=true") });
  const plans = plansQuery.data ?? [], bundles = bundlesQuery.data ?? [];
  const billing = plans.filter(p => p.plan_type !== "payroll_addon"), payroll = plans.filter(p => p.plan_type === "payroll_addon");
  const counts = { invoicing: billing.length, payroll_addon: payroll.length, bundles: bundles.length };
  const current = tab === "invoicing" ? billing : payroll;
  const save = useMutation({
    mutationFn: async (form: PlanDraft) => {
      const features = form.features.map(s => ({ ...s, items: s.items.filter(i => i.title.trim()).map(i => ({ ...i, title: i.title.trim() })) })).filter(s => s.items.length);
      const common = { name: form.name.trim(), short_description: form.short_description, quote_only: form.quote_only, features };
      if (form.category === "bundles") {
        const payload = { ...common, features: !editor?.bundle && features.length === 0 ? null : features, billing_plan: Number(form.billing_plan), payroll_plan: Number(form.payroll_plan), discount_percent: form.discount_percent };
        return editor?.bundle ? apiClient.patch(`/plan-bundles/${editor.bundle.id}/`, payload) : apiClient.post("/plan-bundles/", { ...payload, slug: slugify(form.name) });
      }
      const payload = { ...common, plan_type: form.category, monthly_price: form.quote_only ? null : form.monthly_price, yearly_price: form.quote_only ? null : form.yearly_price, annual_document_quota: form.annual_document_quota, max_documents_per_month: form.max_documents_per_month, max_users: form.max_users, accountant_users: form.accountant_users, ...(form.category === "payroll_addon" ? { max_employees: form.max_employees } : {}), catalog_status: "published", visibility: form.quote_only ? "quote" : "public", is_active: true };
      return editor?.plan ? apiClient.patch(`/plans/${editor.plan.id}/`, payload) : apiClient.post("/plans/", { ...payload, code: slugify(form.name) });
    },
    onSuccess: async () => {
      await Promise.all([cache.invalidateQueries({ queryKey: ["plans"] }), cache.invalidateQueries({ queryKey: ["plan-bundles"] })]);
      toast.success(editor?.plan || editor?.bundle ? "Cambios guardados" : "Plan creado y publicado");
      setEditor(null);
    },
    onError: (error: unknown) => {
      const data: unknown = isAxiosError(error) ? error.response?.data : null;
      setErrors(data && typeof data === "object" ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value.join(" ") : String(value)])) : { detail: "No se pudo guardar. Revisa tu conexión e inténtalo de nuevo." });
    },
  });
  const open = (value: NonNullable<typeof editor>) => { setErrors({}); setEditor(value); };
  const query = tab === "bundles" ? bundlesQuery : plansQuery;
  return <main className="plan-catalog mx-auto w-full max-w-[1440px] space-y-6 pb-8 text-foreground">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-[30px] font-semibold tracking-tight">Planes y precios</h1><p className="mt-1 text-sm text-muted-foreground">Crea y administra los planes publicados de NUVVI</p></div><Button onClick={() => open({ category: tab })} className="bg-[#246FC1] text-white shadow-none hover:bg-[#1b5fa8]"><Plus size={18} className="mr-2"/>Crear plan</Button></header>
    <CatalogTabs tab={tab} counts={counts} onChange={setTab}/>
    <section id="plan-catalog-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0} className="space-y-4">
      <p className="text-sm text-muted-foreground">Precios en pesos colombianos (COP). El pago anual cubre 12 meses.</p>
      {query.isLoading ? <p role="status" className="rounded-xl border bg-card p-8">Cargando planes…</p> : query.isError ? <div role="alert" className="space-y-3 rounded-xl border bg-card p-6"><p>No se pudo cargar el catálogo.</p><Button variant="outline" onClick={() => query.refetch()}>Reintentar</Button></div> : counts[tab] === 0 ? <div className="rounded-xl border bg-card p-8 text-center"><h2 className="text-lg font-semibold">Todavía no hay planes en esta categoría</h2><p className="mt-2 text-muted-foreground">Crea el primer plan para publicarlo en el catálogo.</p></div> : <div className="plan-grid">{tab === "bundles" ? bundles.map(bundle => <PlanCard key={bundle.id} bundle={bundle} onEdit={() => open({ category: tab, bundle })}/>) : [...current.filter(p => !p.quote_only && p.plan_type !== "enterprise"), ...current.filter(p => p.quote_only || p.plan_type === "enterprise")].map(plan => <PlanCard key={plan.id} plan={plan} onEdit={() => open({ category: tab, plan })}/>)}</div>}
    </section>
    {editor && <PlanEditorDialog {...editor} plans={plans} saving={save.isPending} errors={errors} onSave={form => { setErrors({}); save.mutate(form); }} onClose={() => setEditor(null)}/>}
  </main>;
}
