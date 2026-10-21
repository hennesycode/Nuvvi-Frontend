import { cloneElement, useEffect, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan, PlanBundle } from "@/types";
import { makeDraft, type PlanDraft } from "./planEditorConfig";
import { categories, categoryLabels, isExclusion, bundleTotals, type Category } from "./planPresentation";
import { ComboCalculation, LimitsSummary, PriceBlock } from "./PlanCard";

export type FieldErrors = Record<string, string>;
type Props = { category: Category; plan?: Plan; bundle?: PlanBundle; plans: Plan[]; saving: boolean; errors: FieldErrors; onSave: (draft: PlanDraft) => void; onClose: () => void };
const input = "mt-2 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2.5 text-base text-foreground";

export function PlanEditorDialog({ category, plan, bundle, plans, saving, errors, onSave, onClose }: Props) {
  const [form, setForm] = useState(() => makeDraft(category, plan, bundle));
  const dialog = useRef<HTMLDialogElement>(null);
  const editing = !!(plan || bundle), combo = form.category === "bundles";
  const set = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) => setForm(current => ({ ...current, [key]: value }));
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current!;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, []);
  useEffect(() => {
    if (Object.keys(errors).length) {
      const invalid = dialog.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      invalid?.focus();
      if (!invalid) dialog.current?.querySelector('[role="alert"]')?.scrollIntoView({ block: "nearest" });
    }
  }, [errors]);
  const billing = plans.find(p => String(p.id) === form.billing_plan) ?? bundle?.billing_plan_details;
  const payroll = plans.find(p => String(p.id) === form.payroll_plan) ?? bundle?.payroll_plan_details;
  const totals = bundleTotals(billing, payroll, form.discount_percent);
  const error = (key: string) => errors[key] && <p id={`error-${key}`} role="alert" className="mt-2 text-sm text-red-700">{errors[key]}</p>;
  const field = (label: string, key: keyof PlanDraft, control: ReactElement) => <div key={key} className="text-sm font-medium"><label htmlFor={`plan-${key}`}>{label}</label>{cloneElement(control, { id: `plan-${key}` })}{error(key)}</div>;
  const attrs = (key: string) => ({ "aria-invalid": !!errors[key], "aria-describedby": errors[key] ? `error-${key}` : undefined });
  const number = (label: string, key: "annual_document_quota" | "max_documents_per_month" | "max_employees" | "max_users") => field(label, key, <input {...attrs(key)} inputMode="numeric" pattern="[0-9]*" value={form[key] ?? ""} placeholder={form.quote_only ? "Según cotización" : "Sin definir"} onChange={e => { if (/^\d*$/.test(e.target.value)) set(key, e.target.value === "" ? null : Number(e.target.value)); }} className={input}/>);
  const featureList = (excluded: boolean) => {
    const title = excluded ? "Qué no incluye" : "Qué incluye";
    const sections = form.features.map((section, index) => ({ section, index })).filter(({ section }) => isExclusion(section.title) === excluded);
    const count = sections.reduce((n, { section }) => n + section.items.length, 0);
    return <details className="rounded-xl border bg-card p-4"><summary className="cursor-pointer font-medium">{title} ({count})</summary><div className="mt-4 space-y-3">{sections.flatMap(({ section, index }) => section.items.map((item, i) => <div key={`${index}-${i}`} className="flex items-center gap-2"><input aria-label={`${title} ${i + 1}`} value={item.title} className={input + " mt-0"} onChange={e => set("features", form.features.map((s, si) => si === index ? { ...s, items: s.items.map((f, fi) => fi === i ? { ...f, title: e.target.value } : f) } : s))}/><Button type="button" variant="outline" size="icon" className="shrink-0" aria-label={`Eliminar ${item.title || "beneficio"}`} onClick={() => set("features", form.features.map((s, si) => si === index ? { ...s, items: s.items.filter((_, fi) => fi !== i) } : s))}><Trash2 size={18}/></Button></div>))}<Button type="button" variant="outline" onClick={() => set("features", [...form.features, { title, items: [{ title: "", description: "", is_visible: true }] }])}><Plus size={16} className="mr-2"/>Añadir {excluded ? "exclusión" : "beneficio"}</Button></div></details>;
  };
  return createPortal(<dialog ref={dialog} onKeyDown={event => {
    if (event.key !== "Tab") return;
    const elements = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]')].filter(element => element.getClientRects().length > 0);
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={e => { e.preventDefault(); if (!saving) onClose(); }} aria-labelledby="plan-title" className="admin-theme fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-[720px] border-0 bg-background p-0 text-foreground shadow-xl backdrop:bg-[#102f4b]/40">
    <form className="flex h-full flex-col" onSubmit={e => { e.preventDefault(); if (!saving) onSave(form); }}>
      <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-card px-6 py-4 pt-[max(16px,env(safe-area-inset-top))]"><div><h2 id="plan-title" className="text-xl font-semibold">{editing ? "Editar plan" : "Crear plan"}</h2><p className="mt-1 text-sm text-muted-foreground">{editing ? "Actualiza la oferta publicada." : "El plan se publica al crear."}</p></div><Button disabled={saving} type="button" variant="outline" size="icon" aria-label="Cerrar editor" onClick={onClose}><X size={20}/></Button></header>
      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain p-6">
        {Object.keys(errors).length > 0 && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{errors.detail || "No se pudo guardar. Revisa los campos indicados."}{Object.entries(errors).filter(([key]) => !Object.keys(form).includes(key) && key !== "detail").map(([key, value]) => <p key={key}>{value}</p>)}</div>}
        <section className="space-y-4"><h3 className="text-base font-semibold">Información</h3>{field("Nombre del plan", "name", <input autoFocus required maxLength={160} {...attrs("name")} value={form.name} onChange={e => set("name", e.target.value)} className={input}/>)}{field("Descripción breve", "short_description", <textarea maxLength={255} rows={2} value={form.short_description} onChange={e => set("short_description", e.target.value)} className={input}/>)}
          <div className="grid gap-4 sm:grid-cols-2">{field("Categoría", "category", <select disabled={editing} value={form.category} onChange={e => set("category", e.target.value as Category)} className={input}>{categories.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}</select>)}{field("Modalidad", "quote_only", <select value={form.quote_only ? "quote" : "fixed"} onChange={e => set("quote_only", e.target.value === "quote")} className={input}><option value="fixed">Precio definido</option><option value="quote">Por cotización</option></select>)}</div>
        </section>
        <section className="space-y-4"><h3 className="text-base font-semibold">Precios <span className="font-normal text-muted-foreground">· COP</span></h3>
          {combo && <div className="grid gap-4 sm:grid-cols-2">{(["billing_plan", "payroll_plan"] as const).map(key => field(key === "billing_plan" ? "Plan de facturación" : "Plan de nómina", key, <select required {...attrs(key)} value={form[key]} onChange={e => set(key, e.target.value)} className={input}><option value="">Seleccionar plan</option>{[...plans, ...[bundle?.billing_plan_details, bundle?.payroll_plan_details].filter((p): p is Plan => !!p && !plans.some(candidate => candidate.id === p.id))].filter(p => p.plan_type === (key === "billing_plan" ? "invoicing" : "payroll_addon") && (!p.quote_only || form.quote_only)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>))}</div>}
          {!form.quote_only && (combo ? <>{field("Descuento del combo (%)", "discount_percent", <input required inputMode="numeric" pattern="[0-9]{1,3}" value={form.discount_percent} {...attrs("discount_percent")} onChange={e => { if (/^\d{0,3}$/.test(e.target.value)) set("discount_percent", Number(e.target.value)); }} className={input}/>)}<ComboCalculation billing={billing} payroll={payroll} discount={form.discount_percent}/></> : <div className="grid gap-4 sm:grid-cols-2">{(["monthly_price", "yearly_price"] as const).map(key => field(key === "monthly_price" ? "Precio mensual en COP" : "Precio anual total en COP", key, <input required inputMode="decimal" placeholder={key === "monthly_price" ? "Ej. 24900" : "Ej. 219000"} {...attrs(key)} value={form[key].replace(".", ",")} onChange={e => { const value = e.target.value.replace(",", "."); if (/^\d*(\.\d{0,2})?$/.test(value)) set(key, value); }} className={input}/>))}</div>)}
          <PriceBlock quote={form.quote_only} monthly={combo ? totals.monthly?.total ?? null : form.monthly_price} annual={combo ? totals.annual?.total ?? null : form.yearly_price}/>
          {!form.quote_only && <p className="text-sm text-muted-foreground">El precio anual es el total cobrado por 12 meses.</p>}
        </section>
        <section className="space-y-4"><h3 className="text-base font-semibold">Límites y accesos</h3>{combo ? <div className="grid gap-4 sm:grid-cols-2">{[billing, payroll].map((p, i) => p && <div key={i}><h4 className="mb-3 text-sm font-medium">{p.name}</h4><LimitsSummary plan={p}/></div>)}<p className="text-sm text-muted-foreground sm:col-span-2">Se conservan los límites independientes de cada plan seleccionado.</p></div> : <><p className="text-sm text-muted-foreground">Vacío: {form.quote_only ? "según cotización" : "sin definir"}. Cero es un límite real, no ilimitado.</p><div className="grid gap-4 sm:grid-cols-2">{number(`Documentos de ${form.category === "payroll_addon" ? "nómina" : "facturación"} al año`, "annual_document_quota")}{number("Límite mensual (opcional)", "max_documents_per_month")}{form.category === "payroll_addon" && number("Empleados incluidos en nómina", "max_employees")}{number("Usuarios administrativos", "max_users")}{field("Acceso del contador", "accountant_users", <select value={form.accountant_users === null ? "" : String(form.accountant_users)} onChange={e => set("accountant_users", e.target.value === "" ? null : Number(e.target.value))} className={input}><option value="">{form.quote_only ? "Según cotización" : "Sin definir"}</option><option value="0">No incluido</option><option value="1">Incluido</option>{form.accountant_users !== null && form.accountant_users > 1 && <option value={form.accountant_users}>Incluido ({form.accountant_users} accesos)</option>}</select>)}</div></>}</section>
        <section className="space-y-3"><h3 className="text-base font-semibold">Beneficios y exclusiones</h3>{featureList(false)}{featureList(true)}{error("features")}</section>
      </div>
      <footer className="flex shrink-0 justify-end gap-3 border-t bg-card px-6 py-4 pb-[max(16px,env(safe-area-inset-bottom))]"><Button disabled={saving} type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button disabled={saving} className="bg-[#246FC1] text-white shadow-none hover:bg-[#1b5fa8]">{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear y publicar"}</Button></footer>
    </form>
  </dialog>, document.body);
}
