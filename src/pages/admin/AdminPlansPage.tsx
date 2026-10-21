import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/api/client";
import type { ApiResponse, Plan, PlanBundle } from "@/types";
import { Button } from "@/components/ui/button";
import { PlanEditorDialog } from "./PlanEditorDialog";
import { blankPlanDraft, type PlanDraft } from "./planEditorConfig";

const tabs = ["invoicing", "payroll_addon", "bundles"] as const;
type Tab = typeof tabs[number];
const labels: Record<Tab, string> = { invoicing: "Facturación electrónica", payroll_addon: "Nómina electrónica", bundles: "Facturación + nómina" };
const money = (value: string | number | null) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(value || 0));
const rows = <T,>(data?: ApiResponse<T> | T[]) => Array.isArray(data) ? data : data?.results ?? [];

export function AdminPlansPage() {
  const cache = useQueryClient();
  const [tab, setTab] = useState<Tab>("invoicing");
  const [form, setForm] = useState<PlanDraft>(blankPlanDraft);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [open, setOpen] = useState(false);
  const [bundleDiscount, setBundleDiscount] = useState<Record<number, number>>({});
  const plansQuery = useQuery({ queryKey: ["plans"], queryFn: async () => rows((await apiClient.get<ApiResponse<Plan> | Plan[]>("/plans/")).data) });
  const bundlesQuery = useQuery({ queryKey: ["plan-bundles"], queryFn: async () => rows((await apiClient.get<ApiResponse<PlanBundle> | PlanBundle[]>("/plan-bundles/")).data) });
  const plans = plansQuery.data ?? [];
  const bundles = bundlesQuery.data ?? [];
  const billing = plans.filter(p => p.plan_type === "invoicing" || p.plan_type === "enterprise");
  const payroll = plans.filter(p => p.plan_type === "payroll_addon");
  const counts: Record<Tab, number> = { invoicing: billing.length, payroll_addon: payroll.length, bundles: bundles.length };
  const currentPlans = tab === "invoicing" ? billing : payroll;
  const save = useMutation({
    mutationFn: async (features: PlanDraft["features"]) => {
      const quote = form.quote_only || form.plan_type === "enterprise";
      const payload = { ...form, code: form.code.trim(), catalog_status: "published" as const, visibility: quote ? "quote" as const : "public" as const, is_active: true, monthly_price: quote ? null : form.monthly_price || null, yearly_price: quote ? null : form.yearly_price || null, features };
      if (editing) return (await apiClient.put<Plan>(`/plans/${editing.id}/`, payload)).data;
      return (await apiClient.post<Plan>("/plans/", payload)).data;
    },
    onSuccess: () => { cache.invalidateQueries({ queryKey: ["plans"] }); toast.success(editing ? "Cambios guardados" : "Plan creado y publicado"); close(); },
    onError: (error: any) => toast.error(error?.response?.data?.detail || "No se pudo guardar el plan."),
  });
  const makeBundle = useMutation({ mutationFn: async (bundle: {name:string; slug:string; billing_plan:number; payroll_plan:number; discount_percent:number}) => apiClient.post("/plan-bundles/", {...bundle, short_description:"Facturación y nómina con cupos independientes."}), onSuccess: () => { cache.invalidateQueries({queryKey:["plan-bundles"]}); toast.success("Oferta creada"); }, onError: () => toast.error("No se pudo crear la oferta") });
  const updateBundle = useMutation({ mutationFn: async ({id,discount_percent}:{id:number;discount_percent:number}) => apiClient.patch(`/plan-bundles/${id}/`,{discount_percent}), onSuccess:()=>cache.invalidateQueries({queryKey:["plan-bundles"]}), onError:()=>toast.error("No se pudo guardar el descuento") });
  const [bundleForm, setBundleForm] = useState({ name: "", billing: "", payroll: "", discount: 5 });
  const create = () => { setEditing(null); setForm({ ...blankPlanDraft, plan_type: tab === "payroll_addon" ? "payroll_addon" : "invoicing" }); setOpen(true); };
  const edit = (plan: Plan) => { setEditing(plan); setForm({ ...blankPlanDraft, ...plan, annual_document_quota: plan.annual_document_quota ?? 0, max_users: plan.max_users ?? 0, accountant_users: plan.accountant_users ?? 0, max_branches: plan.max_branches ?? 0, max_documents_per_month: plan.max_documents_per_month ?? 0, max_employees: plan.max_employees ?? 0, monthly_price: plan.monthly_price ?? "", yearly_price: plan.yearly_price ?? "", features: plan.features ?? [] }); setOpen(true); };
  function close() { setOpen(false); setEditing(null); setForm(blankPlanDraft); }
  const categoryPlans = useMemo(() => currentPlans.filter(p => p.catalog_status === "published" && p.is_active), [currentPlans]);
  return <main className="mx-auto max-w-7xl space-y-6 pb-10">
    <header><h1 className="text-3xl font-extrabold tracking-tight text-[#102F4B]">Planes y precios</h1><p className="mt-1 text-sm text-[#647D92]">Administra los planes publicados de NUVVI.</p></header>
    <nav className="grid grid-cols-1 gap-2 border-b border-[#D9ECFA] sm:grid-cols-3" aria-label="Catálogo de planes">{tabs.map(key => <button key={key} type="button" onClick={() => setTab(key)} aria-selected={tab === key} role="tab" className={`flex items-center justify-between border-b-2 px-3 py-3 text-left text-sm font-semibold ${tab === key ? "border-[#246FC1] text-[#246FC1]" : "border-transparent text-[#647D92] hover:text-[#102F4B]"}`}><span>{labels[key]}</span><span className="rounded-full bg-[#EFF6FC] px-2 py-0.5 text-xs">{counts[key]}</span></button>)}</nav>
    {tab !== "bundles" ? <><div className="flex justify-end"><Button onClick={create} className="bg-[#246FC1] text-white hover:bg-[#1B5FA8]"><Plus size={16} className="mr-2"/>Crear plan</Button></div>
      {plansQuery.isLoading ? <p className="p-8 text-center text-[#647D92]">Cargando planes…</p> : <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{categoryPlans.map(plan => <PlanCard key={plan.id} plan={plan} onEdit={() => edit(plan)}/>)}</section>}
    </> : <section className="space-y-5"><form onSubmit={e => { e.preventDefault(); if (!bundleForm.name.trim() || !bundleForm.billing || !bundleForm.payroll) return; const slug = bundleForm.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); makeBundle.mutate({ name:bundleForm.name.trim(), slug, billing_plan:Number(bundleForm.billing), payroll_plan:Number(bundleForm.payroll), discount_percent:bundleForm.discount }); }} className="grid gap-3 rounded-2xl border border-[#D9ECFA] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
       <label className="text-xs font-semibold text-[#39566F]">Nombre<input required value={bundleForm.name} onChange={e=>setBundleForm({...bundleForm,name:e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm"/></label>
       <label className="text-xs font-semibold text-[#39566F]">Facturación<select required value={bundleForm.billing} onChange={e=>setBundleForm({...bundleForm,billing:e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="">Seleccionar</option>{billing.filter(p=>p.plan_type==="invoicing").map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
       <label className="text-xs font-semibold text-[#39566F]">Nómina<select required value={bundleForm.payroll} onChange={e=>setBundleForm({...bundleForm,payroll:e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="">Seleccionar</option>{payroll.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
       <label className="text-xs font-semibold text-[#39566F]">Descuento del combo (%)<input type="number" min="0" max="100" value={bundleForm.discount} onChange={e=>setBundleForm({...bundleForm,discount:Number(e.target.value)})} className="mt-1 w-full rounded-lg border p-2 text-sm"/></label>
       <Button disabled={makeBundle.isPending} className="self-end bg-[#246FC1] text-white">Crear oferta</Button>
      </form><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{bundles.map(bundle=><BundleCard key={bundle.id} bundle={bundle} discount={bundleDiscount[bundle.id] ?? bundle.discount_percent ?? 5} onDiscount={value=>setBundleDiscount({...bundleDiscount,[bundle.id]:value})} onSave={value=>updateBundle.mutate({id:bundle.id,discount_percent:value})}/>)}</div></section>}
    {open && <PlanEditorDialog form={form} setForm={setForm} editing={editing} plans={plans} categories={[]} saving={save.isPending} onSave={(_,features)=>save.mutate(features)} onClose={close}/>}
  </main>;
}

function PlanCard({plan,onEdit}:{plan:Plan;onEdit:()=>void}) { const features=plan.features.filter(s=>s.title.toLowerCase().includes("incluye")&&!s.title.toLowerCase().includes("no incluye")).flatMap(s=>s.items).filter(i=>i.is_visible!==false); const exclusions=plan.features.filter(s=>s.title.toLowerCase().includes("no incluye")).flatMap(s=>s.items).filter(i=>i.is_visible!==false); const monthly=Number(plan.monthly_price||0)*12, annual=Number(plan.yearly_price||0), saved=Math.max(0,monthly-annual); return <article className="flex min-w-0 flex-col rounded-2xl border border-[#D9ECFA] bg-white p-5"><div className="flex justify-between gap-2"><h2 className="text-lg font-bold text-[#102F4B]">{plan.name}</h2><Button variant="outline" onClick={onEdit} className="h-8 px-3"><Pencil size={14} className="mr-1"/>Editar</Button></div><p className="mt-1 text-sm text-[#647D92]">{plan.short_description}</p>{plan.quote_only?<p className="mt-5 rounded-xl bg-[#EFF6FC] p-4 text-lg font-bold text-[#246FC1]">Precio por cotización</p>:<div className="mt-4 grid grid-cols-2 gap-3 border-y py-4"><div><small>Mensual</small><p className="font-bold">{money(plan.monthly_price)}/mes</p></div><div><small>Anual</small><p className="font-bold">{money(plan.yearly_price)}/año</p><small>Ahorro {money(saved)} · {monthly?((saved/monthly)*100).toFixed(1):0}%</small></div></div>}<div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#526B80]"><span>{plan.annual_document_quota?.toLocaleString("es-CO")} documentos/año</span><span>{plan.max_documents_per_month?.toLocaleString("es-CO")} documentos/mes</span><span>{plan.max_employees ? `${plan.max_employees} empleados` : `${plan.max_users} usuarios`}</span><span>Contador: {plan.accountant_users ? "Sí" : "No"}</span></div><details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-semibold">Qué incluye ({features.length})</summary><ul className="mt-2 space-y-1 text-sm text-[#526B80]">{features.map((f,i)=><li key={i} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-green-700"/>{f.title}</li>)}</ul></details>{exclusions.length>0&&<details className="mt-2"><summary className="cursor-pointer text-sm font-semibold">Qué no incluye</summary><ul className="mt-2 space-y-1 text-sm text-[#526B80]">{exclusions.map((x,i)=><li key={i} className="flex gap-2"><X size={15}/>{x.title}</li>)}</ul></details>}</article> }
function BundleCard({bundle,discount,onDiscount,onSave}:{bundle:PlanBundle;discount:number;onDiscount:(value:number)=>void;onSave:(value:number)=>void}) { const baseM=Number(bundle.billing_plan_details?.monthly_price||0)+Number(bundle.payroll_plan_details?.monthly_price||0), baseY=Number(bundle.billing_plan_details?.yearly_price||0)+Number(bundle.payroll_plan_details?.yearly_price||0), totalM=baseM*(100-discount)/100,totalY=baseY*(100-discount)/100; return <article className="rounded-2xl border border-[#D9ECFA] bg-white p-5"><h2 className="text-lg font-bold">{bundle.name}</h2><p className="mt-1 text-sm">{bundle.billing_plan_details?.name} + {bundle.payroll_plan_details?.name}</p><p className="mt-3 text-xs text-[#647D92]">{bundle.billing_plan_details?.annual_document_quota} facturación docs/año · {bundle.payroll_plan_details?.annual_document_quota} nómina docs/año · {bundle.payroll_plan_details?.max_employees} empleados</p><label className="mt-3 block text-xs font-semibold">Descuento del combo (%)<input type="number" min="0" max="100" value={discount} onChange={e=>onDiscount(Math.max(0,Math.min(100,Number(e.target.value))))} onBlur={()=>onSave(discount)} className="mt-1 w-full rounded-lg border p-2"/></label><div className="mt-3 border-t pt-3 text-sm">Mensual: <b>{money(totalM)}</b> <span className="text-xs text-[#647D92]">(antes {money(baseM)})</span><br/>Anual: <b>{money(totalY)}</b> <span className="text-xs text-[#647D92]">(antes {money(baseY)})</span><br/>Ahorro anual: <b>{money(baseY-totalY)}</b></div></article> }
