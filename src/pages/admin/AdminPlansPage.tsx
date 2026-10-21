import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, CircleDollarSign, FolderPlus, Layers3, Pencil, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import type { ApiResponse, Plan, PlanCategory } from "@/types";
import { PlanEditorDialog } from "./PlanEditorDialog";
import { blankPlanDraft, type PlanDraft } from "./planEditorConfig";
const inputClass = "w-full rounded-xl border border-[#D9ECFA] bg-white px-3 py-2.5 text-sm text-[#102F4B] outline-none focus:border-[#4F9FF0] focus:ring-2 focus:ring-[#4F9FF0]/15";
const cardClass = "rounded-2xl border border-[#D9ECFA] bg-white";

function rows<T,>(data: ApiResponse<T> | T[] | undefined): T[] { return Array.isArray(data) ? data : data?.results ?? []; }
function money(value: string | null) { return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(value || 0)); }

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

  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#4F83B5]"><Layers3 size={15} /> Catálogo comercial</div><h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope sm:text-3xl">Planes</h1><p className="mt-1 max-w-2xl text-sm text-[#6C8398]">Organiza la oferta de NUVVI por categorías, precio mensual y beneficios claros para cada cliente.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setShowCategoryForm(true)} className="h-11 rounded-xl border-[#D9ECFA] bg-white text-[#39566F]"><FolderPlus size={16} className="mr-2" />Nueva categoría</Button><Button onClick={createPlan} className="h-11 rounded-xl bg-[#246FC1] text-white shadow-none hover:bg-[#1B5FA8]"><Plus size={17} className="mr-2" />Crear plan</Button></div></div>

    <div className="grid gap-3 sm:grid-cols-3"><div className={`${cardClass} p-4`}><p className="text-xs font-semibold text-[#6C8398]">Planes creados</p><p className="mt-1 text-2xl font-bold text-[#102F4B]">{plans.length}</p></div><div className={`${cardClass} p-4`}><p className="text-xs font-semibold text-[#6C8398]">Planes publicados</p><p className="mt-1 text-2xl font-bold text-[#178C68]">{plans.filter((plan) => plan.catalog_status === "published").length}</p></div><div className={`${cardClass} p-4`}><p className="text-xs font-semibold text-[#6C8398]">Categorías</p><p className="mt-1 text-2xl font-bold text-[#102F4B]">{categories.length}</p></div></div>

    <section className={`${cardClass} p-4`}><div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_220px_180px]"><label className="relative"><span className="sr-only">Buscar planes</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7890A5]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, código o descripción" className={`${inputClass} pl-10`} /></label><label><span className="sr-only">Filtrar por categoría</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={inputClass}><option value="all">Todas las categorías</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label><span className="sr-only">Filtrar por estado</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}><option value="all">Todos los estados</option><option value="draft">Borradores</option><option value="published">Publicados</option><option value="retired">Retirados</option><option value="archived">Archivados</option></select></label></div></section>

    {categories.length > 0 && <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-[#102F4B]">Categorías</h2><span className="text-xs text-[#6C8398]">Agrupa planes para mantener la oferta ordenada</span></div><div className="flex flex-wrap gap-2">{categories.map((category) => <div key={category.id} className="inline-flex items-center gap-2 rounded-full border border-[#D9ECFA] bg-white py-1.5 pl-3 pr-2 text-sm text-[#39566F]"><Tag size={14} className="text-[#4F83B5]" /><span className="font-semibold">{category.name}</span><span className="text-xs text-[#8A9EAF]">{plans.filter((plan) => plan.category === category.id).length}</span><button type="button" aria-label={`Eliminar categoría ${category.name}`} title="Eliminar categoría" onClick={() => { if (window.confirm(`¿Eliminar la categoría “${category.name}”?`)) deleteCategory.mutate(category); }} className="ml-1 rounded-full p-1 text-[#91A3B2] hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button></div>)}</div></section>}

    {plansQuery.isLoading ? <div className={`${cardClass} p-12 text-center text-sm text-[#6C8398]`}>Cargando planes…</div> : visiblePlans.length === 0 ? <div className={`${cardClass} px-5 py-14 text-center`}><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#246FC1]"><CircleDollarSign size={23} /></div><h3 className="mt-4 font-bold text-[#102F4B]">{plans.length ? "No hay resultados" : "Aún no hay planes configurados"}</h3><p className="mx-auto mt-1 max-w-md text-sm text-[#6C8398]">{plans.length ? "Prueba otra búsqueda o cambia los filtros." : "Crea el primer plan y define precio, categoría y beneficios por secciones."}</p>{!plans.length && <Button onClick={createPlan} className="mt-5 rounded-xl bg-[#246FC1] text-white hover:bg-[#1B5FA8]"><Plus size={16} className="mr-2" />Crear primer plan</Button>}</div> : <div className="grid gap-4 xl:grid-cols-2">{visiblePlans.map((plan) => { const category = categories.find((item) => item.id === plan.category); return <article key={plan.id} className={`${cardClass} overflow-hidden`}><div className="flex items-start justify-between gap-4 border-b border-[#EAF1F7] p-5"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#E8F0FE] px-2.5 py-1 text-xs font-bold text-[#246FC1]">{plan.plan_type === "payroll_addon" ? "Nómina electrónica" : plan.plan_type === "enterprise" ? "Empresarial" : "Facturación"}</span>{category && <span className="rounded-full bg-[#F1F6FA] px-2.5 py-1 text-xs font-bold text-[#526B80]">{category.name}</span>}{plan.version_number > 1 && <span className="rounded-full bg-[#F1F6FA] px-2.5 py-1 text-xs font-bold text-[#526B80]">Versión {plan.version_number}</span>}<span className={`rounded-full px-2.5 py-1 text-xs font-bold ${plan.catalog_status === "published" ? "bg-[#D8F5EB] text-[#178C68]" : "bg-[#F1F4F7] text-[#6C8398]"}`}>{plan.catalog_status === "draft" ? "Borrador" : plan.catalog_status === "published" ? "Publicado" : plan.catalog_status === "retired" ? "Retirado" : "Archivado"}</span></div><h2 className="truncate text-xl font-extrabold text-[#102F4B]">{plan.name}</h2><p className="mt-1 text-xs text-[#8A9EAF]">Código: {plan.code}</p></div><div className="shrink-0 text-right"><p className="text-xl font-extrabold tabular-nums text-[#102F4B]">{plan.quote_only ? "Cotización" : money(plan.monthly_price)}</p><p className="text-xs text-[#6C8398]">{plan.quote_only ? "personalizada" : "por mes"}</p>{!plan.quote_only && Number(plan.yearly_price) > 0 && <p className="mt-1 text-xs font-semibold text-[#526B80]">{money(plan.yearly_price)} / año</p>}</div></div><div className="space-y-4 p-5"><p className="text-sm leading-6 text-[#526B80]">{plan.short_description || plan.description || "Sin descripción del plan."}</p>{plan.features?.map((section, index) => <div key={`${section.title}-${index}`}><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#39566F]">{section.title}</h3><div className="space-y-2">{section.items.map((feature, itemIndex) => <div key={`${feature.title}-${itemIndex}`} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-[#178C68]" /><div><p className="text-sm font-semibold text-[#102F4B]">{feature.title}</p>{feature.description && <p className="mt-0.5 text-xs leading-5 text-[#6C8398]">{feature.description}</p>}</div></div>)}</div></div>)}</div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAF1F7] bg-[#FBFDFF] px-5 py-3"><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6C8398]"><span>{plan.max_users} {plan.max_users === 1 ? "usuario" : "usuarios"}</span><span>{plan.annual_document_quota ? `${plan.annual_document_quota.toLocaleString("es-CO")} documentos/año` : plan.max_documents_per_month ? `${plan.max_documents_per_month} documentos/mes` : "Cupo por definir"}</span>{plan.plan_type === "payroll_addon" && <span>Hasta {plan.max_employees} empleados</span>}</div><div className="flex items-center gap-2"><button type="button" onClick={() => duplicatePlan.mutate(plan)} className="rounded-lg px-3 py-2 text-xs font-bold text-[#39566F] hover:bg-[#E8F0FE]">Duplicar</button>{plan.catalog_status === "draft" && <button type="button" onClick={() => updateLifecycle.mutate({ plan, action: "publish" })} className="rounded-lg px-3 py-2 text-xs font-bold text-[#178C68] hover:bg-[#D8F5EB]">Publicar</button>}{plan.catalog_status === "published" && <button type="button" onClick={() => newVersion.mutate(plan)} className="rounded-lg px-3 py-2 text-xs font-bold text-[#246FC1] hover:bg-[#E8F0FE]">Crear versión</button>}{plan.catalog_status === "published" && <button type="button" onClick={() => updateLifecycle.mutate({ plan, action: "retire" })} className="rounded-lg px-3 py-2 text-xs font-bold text-[#39566F] hover:bg-[#E8F0FE]">Retirar</button>}{plan.catalog_status !== "archived" && <button type="button" onClick={() => { if (window.confirm(`¿Archivar “${plan.name}”? Se conservarán sus suscripciones e historial.`)) updateLifecycle.mutate({ plan, action: "archive" }); }} className="rounded-lg px-3 py-2 text-xs font-bold text-[#8A9EAF] hover:bg-[#F1F4F7]">Archivar</button>}{plan.catalog_status !== "published" && <button type="button" aria-label={`Eliminar plan ${plan.name}`} title="Eliminar plan" onClick={() => { if (window.confirm(`¿Eliminar el plan “${plan.name}”? Si tiene suscripciones asociadas, deberás desactivarlo.`)) deletePlan.mutate(plan); }} className="rounded-lg p-2 text-[#8A9EAF] hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>}{plan.catalog_status === "draft" && <Button variant="outline" onClick={() => editPlan(plan)} className="h-9 rounded-lg border-[#D9ECFA] bg-white text-[#246FC1]"><Pencil size={14} className="mr-1.5" />Editar borrador</Button>}</div></div></article>; })}</div>}

    {showForm && createPortal(<PlanEditorDialog form={form} setForm={setForm} editing={editing} plans={plans} categories={categories} saving={savePlan.isPending} onSave={(mode, features) => savePlan.mutate({ mode, features })} onClose={closeForm} />, document.body)}

    {showCategoryForm && <div className="fixed inset-0 z-[110] flex items-end justify-center bg-[#102F4B]/45 p-4 backdrop-blur-sm sm:items-center"><form onSubmit={(event) => { event.preventDefault(); if (!categoryName.trim()) return; saveCategory.mutate(); }} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[#102F4B]">Nueva categoría</h2><button type="button" onClick={() => setShowCategoryForm(false)} aria-label="Cerrar" className="rounded-lg p-2 text-[#6C8398] hover:bg-[#F1F6FA]"><X size={18} /></button></div><label className="block space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Nombre *</span><input autoFocus required maxLength={100} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Ej. Emprendedores" className={inputClass} /></label><label className="block space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Descripción (opcional)</span><input maxLength={255} value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="Para quién está pensada esta categoría" className={inputClass} /></label><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)} className="rounded-xl border-[#D9ECFA]">Cancelar</Button><Button type="submit" disabled={saveCategory.isPending} className="rounded-xl bg-[#246FC1] text-white shadow-none hover:bg-[#1B5FA8]">{saveCategory.isPending ? "Guardando…" : "Crear categoría"}</Button></div></form></div>}
  </div>;
}
