import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Activity, CircleDollarSign, FolderPlus, Layers3, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import type { ApiResponse, Plan, PlanCategory } from "@/types";
import { PlanEditorDialog } from "./PlanEditorDialog";
import { PlanCard } from "./PlanCard";
import { blankPlanDraft, type PlanDraft } from "./planEditorConfig";
const inputClass = "w-full rounded-xl border border-[#D9ECFA] bg-white px-3 py-2.5 text-sm text-[#102F4B] outline-none focus:border-[#4F9FF0] focus:ring-2 focus:ring-[#4F9FF0]/15";
const cardClass = "rounded-2xl border border-[#D9ECFA] bg-white";

function rows<T,>(data: ApiResponse<T> | T[] | undefined): T[] { return Array.isArray(data) ? data : data?.results ?? []; }
function MetricCard({ label, value, icon: Icon, tone = "blue" }: { label: string; value: number; icon: LucideIcon; tone?: "blue" | "green" }) {
  return <article className="flex items-center gap-4 rounded-2xl border border-[#D9ECFA] bg-white px-5 py-4 shadow-[0_2px_12px_rgba(79,159,240,0.035)]">
    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone === "green" ? "bg-[#E7F5EF] text-[#178C68]" : "bg-[#EAF4FD] text-[#246FC1]"}`}><Icon size={19} strokeWidth={1.8} /></span>
    <div><p className="text-xs font-semibold text-[#71879A]">{label}</p><p className="mt-0.5 text-2xl font-extrabold tracking-[-0.03em] tabular-nums text-[#102F4B]">{value}</p></div>
  </article>;
}

export function AdminPlansPage() {
  const cache = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState<PlanDraft>(blankPlanDraft);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const plansQuery = useQuery({ queryKey: ["plans"], queryFn: async () => rows((await apiClient.get<ApiResponse<Plan> | Plan[]>("/plans/")).data) });
  const categoriesQuery = useQuery({ queryKey: ["plan-categories"], queryFn: async () => rows((await apiClient.get<ApiResponse<PlanCategory> | PlanCategory[]>("/plan-categories/")).data) });
  const plans = plansQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const visiblePlans = useMemo(() => plans.filter((plan) => {
    const term = search.trim().toLowerCase();
    return (!term || [plan.name, plan.code, plan.description, categories.find((category) => category.id === plan.category)?.name].some((value) => value?.toLowerCase().includes(term)))
      && (categoryFilter === "all" || String(plan.category ?? "") === categoryFilter)
      && (statusFilter === "all" || plan.catalog_status === statusFilter);
  }), [plans, categories, search, categoryFilter, statusFilter]);

  const savePlan = useMutation({
    mutationFn: async ({ mode, features }: { mode: "draft" | "publish"; features: PlanDraft["features"] }) => {
      const quoteOnly = form.quote_only || form.plan_type === "enterprise";
      const payload = {
        ...form,
        code: form.code.trim(),
        monthly_price: quoteOnly ? null : form.monthly_price || null,
        yearly_price: quoteOnly ? null : form.yearly_price || null,
        monthly_certificate_fee: form.monthly_certificate_fee || "0",
        catalog_status: "draft" as const,
        features: features.filter((section) => section.title.trim()).map((section) => ({
          ...section,
          title: section.title.trim(),
          items: section.items.filter((item) => item.title.trim()).map((item) => ({ ...item, title: item.title.trim(), description: item.description.trim() })),
        })),
      };
      const saved = editing
        ? (await apiClient.put<Plan>(`/plans/${editing.id}/`, payload)).data
        : (await apiClient.post<Plan>("/plans/", payload)).data;
      return mode === "publish" ? (await apiClient.post<Plan>(`/plans/${saved.id}/publish/`)).data : saved;
    },
    onSuccess: (_, variables) => { cache.invalidateQueries({ queryKey: ["plans"] }); toast.success(variables.mode === "publish" ? "Plan publicado" : editing ? "Borrador guardado" : "Borrador creado"); closeForm(); },
    onError: (error: any) => {
      const data = error?.response?.data;
      const firstFieldError = data && typeof data === "object" ? Object.values(data).flatMap((value) => Array.isArray(value) ? value : []).find((value) => typeof value === "string") : undefined;
      toast.error(firstFieldError || data?.detail || error?.message || "No se pudo guardar el plan.");
    },
  });
  const saveCategory = useMutation({
    mutationFn: async () => (await apiClient.post<PlanCategory>("/plan-categories/", { name: categoryName.trim(), description: categoryDescription.trim() })).data,
    onSuccess: (category) => { cache.invalidateQueries({ queryKey: ["plan-categories"] }); setForm((current) => ({ ...current, category: category.id })); setCategoryName(""); setCategoryDescription(""); setShowCategoryForm(false); toast.success("Categoría creada"); },
    onError: () => toast.error("No se pudo crear la categoría. Verifica que el nombre no esté repetido."),
  });
  const duplicatePlan = useMutation({ mutationFn: async (plan: Plan) => (await apiClient.post<Plan>(`/plans/${plan.id}/duplicate/`)).data, onSuccess: (plan) => { cache.invalidateQueries({ queryKey: ["plans"] }); editPlan(plan); toast.success("Borrador duplicado; puedes editarlo antes de publicarlo"); }, onError: () => toast.error("No se pudo duplicar el plan.") });
  const newVersion = useMutation({ mutationFn: async (plan: Plan) => (await apiClient.post<Plan>(`/plans/${plan.id}/new-version/`)).data, onSuccess: (plan) => { cache.invalidateQueries({ queryKey: ["plans"] }); editPlan(plan); toast.success(`Versión ${plan.version_number} creada como borrador`); }, onError: () => toast.error("No se pudo crear la versión del plan.") });
  const updateLifecycle = useMutation({ mutationFn: async ({ plan, action }: { plan: Plan; action: "publish" | "retire" | "archive" }) => (await apiClient.post<Plan>(`/plans/${plan.id}/${action}/`)).data, onSuccess: (plan) => { cache.invalidateQueries({ queryKey: ["plans"] }); toast.success(`Plan ${plan.catalog_status === "published" ? "publicado" : plan.catalog_status === "retired" ? "retirado" : "archivado"}`); }, onError: (error: any) => toast.error(error?.response?.data?.detail || "No se pudo cambiar el estado del plan.") });
  const deletePlan = useMutation({ mutationFn: async (plan: Plan) => apiClient.delete(`/plans/${plan.id}/`), onSuccess: () => { cache.invalidateQueries({ queryKey: ["plans"] }); toast.success("Plan eliminado"); }, onError: (error: any) => toast.error(error?.response?.data?.detail || "No se pudo eliminar el plan. Si tiene suscripciones, desactívalo para conservar el historial.") });
  const deleteCategory = useMutation({ mutationFn: async (category: PlanCategory) => apiClient.delete(`/plan-categories/${category.id}/`), onSuccess: () => { cache.invalidateQueries({ queryKey: ["plan-categories"] }); toast.success("Categoría eliminada"); }, onError: () => toast.error("No se pudo eliminar. Reasigna primero los planes de esta categoría.") });

  function closeForm() { setShowForm(false); setEditing(null); setForm(blankPlanDraft); }
  function createPlan() { setEditing(null); setForm(blankPlanDraft); setShowForm(true); }
  function editPlan(plan: Plan) { setEditing(plan); setForm({ ...blankPlanDraft, ...plan, monthly_price: plan.monthly_price ?? "", yearly_price: plan.yearly_price ?? "", features: plan.features ?? [] }); setShowForm(true); }

  return <div className="mx-auto max-w-7xl space-y-6 pb-8">
    <header className="relative overflow-hidden rounded-3xl border border-[#D9ECFA] bg-[linear-gradient(115deg,#FFFFFF_0%,#F5FAFF_100%)] px-5 py-6 sm:px-7 sm:py-7">
      <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-[#EAF4FD] opacity-70 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-[#4F83B5]"><Layers3 size={15} /> CATÁLOGO COMERCIAL</div><h1 className="font-manrope text-3xl font-extrabold tracking-[-0.04em] text-[#102F4B] sm:text-[34px]">Planes y precios</h1><p className="mt-1.5 max-w-xl text-sm leading-6 text-[#647D92]">Administra la oferta comercial de NUVVI y sus condiciones de contratación.</p></div>
        <div className="flex shrink-0 flex-wrap gap-2"><Button variant="outline" onClick={() => setShowCategoryForm(true)} className="h-11 rounded-xl border-[#D9ECFA] bg-white px-4 text-[#39566F] transition hover:border-[#B8D9F3] hover:bg-[#F8FCFF]"><FolderPlus size={16} className="mr-2" />Nueva categoría</Button><Button onClick={createPlan} className="h-11 rounded-xl bg-[#246FC1] px-5 text-white shadow-[0_5px_14px_rgba(36,111,193,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1B5FA8]"><Plus size={17} className="mr-2" />Crear plan</Button></div>
      </div>
    </header>

    <section aria-label="Resumen del catálogo" className="grid gap-3 sm:grid-cols-3"><MetricCard label="Planes creados" value={plans.length} icon={CircleDollarSign} /><MetricCard label="Planes publicados" value={plans.filter((plan) => plan.catalog_status === "published").length} icon={Activity} tone="green" /><MetricCard label="Categorías" value={categories.length} icon={Tag} /></section>

    <section className={`${cardClass} p-3.5 sm:p-4`}><div className="grid gap-2.5 md:grid-cols-[minmax(240px,1fr)_220px_180px]"><label className="relative"><span className="sr-only">Buscar planes</span><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7890A5]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, código o descripción" className={`${inputClass} h-11 border-transparent bg-[#F7FAFD] pl-10 focus:border-[#4F9FF0] focus:bg-white`} /></label><label><span className="sr-only">Filtrar por categoría</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={`${inputClass} h-11 border-transparent bg-[#F7FAFD] focus:bg-white`}><option value="all">Todas las categorías</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label><span className="sr-only">Filtrar por estado</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={`${inputClass} h-11 border-transparent bg-[#F7FAFD] focus:bg-white`}><option value="all">Todos los estados</option><option value="draft">Borradores</option><option value="published">Publicados</option><option value="retired">Retirados</option><option value="archived">Archivados</option></select></label></div><div className="mt-3 flex items-center justify-between border-t border-[#EAF1F7] pt-3 text-xs text-[#71879A]"><span>{visiblePlans.length} {visiblePlans.length === 1 ? "plan" : "planes"}{categoryFilter !== "all" || statusFilter !== "all" || search ? " encontrados" : " en el catálogo"}</span>{(categoryFilter !== "all" || statusFilter !== "all" || search) && <button type="button" onClick={() => { setSearch(""); setCategoryFilter("all"); setStatusFilter("all"); }} className="font-semibold text-[#246FC1] hover:text-[#174F8A]">Limpiar filtros</button>}</div></section>

    {categories.length > 0 && <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-[#102F4B]">Categorías</h2><span className="text-xs text-[#6C8398]">Agrupa planes para mantener la oferta ordenada</span></div><div className="flex flex-wrap gap-2">{categories.map((category) => <div key={category.id} className="inline-flex items-center gap-2 rounded-full border border-[#D9ECFA] bg-white py-1.5 pl-3 pr-2 text-sm text-[#39566F]"><Tag size={14} className="text-[#4F83B5]" /><span className="font-semibold">{category.name}</span><span className="text-xs text-[#8A9EAF]">{plans.filter((plan) => plan.category === category.id).length}</span><button type="button" aria-label={`Eliminar categoría ${category.name}`} title="Eliminar categoría" onClick={() => { if (window.confirm(`¿Eliminar la categoría “${category.name}”?`)) deleteCategory.mutate(category); }} className="ml-1 rounded-full p-1 text-[#91A3B2] hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button></div>)}</div></section>}

    {plansQuery.isLoading ? (
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3" aria-label="Cargando planes">
        {[0, 1, 2].map((item) => <div key={item} className={`${cardClass} h-[370px] animate-pulse p-5`}><div className="h-10 w-10 rounded-xl bg-[#EDF4FA]" /><div className="mt-5 h-5 w-2/3 rounded bg-[#EDF4FA]" /><div className="mt-3 h-3 w-1/2 rounded bg-[#F2F6F9]" /><div className="mt-8 h-12 rounded bg-[#F2F6F9]" /><div className="mt-6 space-y-3">{[0, 1, 2, 3].map((line) => <div key={line} className="h-3 rounded bg-[#F2F6F9]" />)}</div></div>)}
      </div>
    ) : visiblePlans.length === 0 ? (
      <div className={`${cardClass} px-5 py-16 text-center`}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FD] text-[#246FC1]"><CircleDollarSign size={24} /></div>
        <h2 className="mt-4 font-manrope text-lg font-extrabold text-[#102F4B]">{plans.length ? "No encontramos planes" : "Empieza a crear tu catálogo"}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#71879A]">{plans.length ? "Prueba con otra búsqueda o ajusta los filtros." : "Crea un plan para definir precios, límites y beneficios comerciales."}</p>
        {!plans.length && <Button onClick={createPlan} className="mt-5 h-10 rounded-xl bg-[#246FC1] px-4 text-white hover:bg-[#1B5FA8]"><Plus size={16} className="mr-2" />Crear primer plan</Button>}
      </div>
    ) : (
      <section aria-label="Planes del catálogo" className="grid items-stretch gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {visiblePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            categoryName={categories.find((category) => category.id === plan.category)?.name}
            onDuplicate={(item) => duplicatePlan.mutate(item)}
            onPublish={(item) => updateLifecycle.mutate({ plan: item, action: "publish" })}
            onCreateVersion={(item) => newVersion.mutate(item)}
            onRetire={(item) => updateLifecycle.mutate({ plan: item, action: "retire" })}
            onArchive={(item) => { if (window.confirm(`¿Archivar “${item.name}”? Se conservarán sus suscripciones e historial.`)) updateLifecycle.mutate({ plan: item, action: "archive" }); }}
            onDelete={(item) => { if (window.confirm(`¿Eliminar el plan “${item.name}”? Si tiene suscripciones asociadas, deberás desactivarlo.`)) deletePlan.mutate(item); }}
            onEdit={editPlan}
          />
        ))}
      </section>
    )}

    {showForm && createPortal(<PlanEditorDialog form={form} setForm={setForm} editing={editing} plans={plans} categories={categories} saving={savePlan.isPending} onSave={(mode, features) => savePlan.mutate({ mode, features })} onClose={closeForm} />, document.body)}

    {showCategoryForm && <div className="fixed inset-0 z-[110] flex items-end justify-center bg-[#102F4B]/45 p-4 backdrop-blur-sm sm:items-center"><form onSubmit={(event) => { event.preventDefault(); if (!categoryName.trim()) return; saveCategory.mutate(); }} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[#102F4B]">Nueva categoría</h2><button type="button" onClick={() => setShowCategoryForm(false)} aria-label="Cerrar" className="rounded-lg p-2 text-[#6C8398] hover:bg-[#F1F6FA]"><X size={18} /></button></div><label className="block space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Nombre *</span><input autoFocus required maxLength={100} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Ej. Emprendedores" className={inputClass} /></label><label className="block space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Descripción (opcional)</span><input maxLength={255} value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="Para quién está pensada esta categoría" className={inputClass} /></label><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)} className="rounded-xl border-[#D9ECFA]">Cancelar</Button><Button type="submit" disabled={saveCategory.isPending} className="rounded-xl bg-[#246FC1] text-white shadow-none hover:bg-[#1B5FA8]">{saveCategory.isPending ? "Guardando…" : "Crear categoría"}</Button></div></form></div>}
  </div>;
}
