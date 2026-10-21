import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Circle, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan, PlanCategory } from "@/types";
import { blankPlanDraft, generatedPlanBenefits, type PlanDraft } from "./planEditorConfig";

type Step = 0 | 1 | 2 | 3;
type SaveMode = "draft" | "publish";
type FeatureSection = PlanDraft["features"][number];

interface PlanEditorDialogProps {
  form: PlanDraft;
  setForm: React.Dispatch<React.SetStateAction<PlanDraft>>;
  editing: Plan | null;
  plans: Plan[];
  categories: PlanCategory[];
  saving: boolean;
  onSave: (mode: SaveMode, features: PlanDraft["features"]) => void;
  onClose: () => void;
}

const inputClass = "w-full rounded-xl border border-[#D9ECFA] bg-white px-3 py-2.5 text-sm text-[#102F4B] outline-none transition focus:border-[#4F9FF0] focus:ring-2 focus:ring-[#4F9FF0]/15";
const steps = ["Información", "Precios", "Beneficios y límites", "Revisar"] as const;

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^[_-]+|[_-]+$/g, "").slice(0, 50);
}

function uniqueCode(name: string, plans: Plan[]) {
  const base = slug(name).slice(0, 50) || "plan-nuevo";
  const codes = new Set(plans.map((plan) => plan.code));
  if (!codes.has(base)) return base;
  let suffix = 2;
  while (codes.has(`${base.slice(0, 47)}-${suffix}`)) suffix += 1;
  return `${base.slice(0, 47)}-${suffix}`;
}

function categoryNameForType(type: PlanDraft["plan_type"]) {
  if (type === "payroll_addon") return "Nómina electrónica";
  if (type === "enterprise") return "Empresarial";
  return "Facturación electrónica";
}

function formatMoney(value: string | null) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function applyProductDefaults(current: PlanDraft, type: PlanDraft["plan_type"], categories: PlanCategory[]): PlanDraft {
  const category = categories.find((item) => item.name.toLowerCase() === categoryNameForType(type).toLowerCase());
  if (type === "payroll_addon") return {
    ...current, plan_type: type, category: category?.id ?? null, quote_only: false,
    monthly_price: current.monthly_price || "9900", yearly_price: current.yearly_price || "89000",
    monthly_certificate_fee: "0", certificate_included_annual: false, requires_base_plan: true,
    has_inventory: false, has_cash_register: false, has_api_access: false, max_issuers: 0,
    max_employees: current.max_employees || 2, max_documents_per_month: current.max_documents_per_month || 2,
    annual_document_quota: current.annual_document_quota || 24, max_users: 0, accountant_users: 0, max_branches: 0,
    support_level: "standard",
  };
  if (type === "enterprise") return {
    ...current, plan_type: type, category: category?.id ?? null, quote_only: true,
    monthly_price: "", yearly_price: "", monthly_certificate_fee: "0", max_employees: 0,
    requires_base_plan: false, max_issuers: 1,
    quotation_scope: current.quotation_scope ?? blankPlanDraft.quotation_scope,
  };
  return {
    ...current, plan_type: type, category: category?.id ?? null, quote_only: false,
    monthly_certificate_fee: current.monthly_certificate_fee || "119000", certificate_included_annual: true,
    requires_base_plan: false, has_inventory: current.has_inventory, has_cash_register: current.has_cash_register, max_issuers: 1,
    max_employees: 0, max_users: current.max_users || 1, accountant_users: current.accountant_users || 1,
    max_branches: current.max_branches || 1,
  };
}

function draftFromPlan(plan: Plan, plans: Plan[]): PlanDraft {
  const name = `${plan.name} (copia)`;
  return {
    name,
    code: uniqueCode(name, plans),
    short_description: plan.short_description,
    description: plan.description,
    target_audience: plan.target_audience,
    commercial_badge: plan.commercial_badge,
    display_order: plan.display_order,
    catalog_status: "draft",
    visibility: "private",
    plan_type: plan.plan_type,
    monthly_price: plan.monthly_price ?? "",
    yearly_price: plan.yearly_price ?? "",
    monthly_certificate_fee: plan.monthly_certificate_fee,
    quote_only: plan.quote_only,
    annual_document_quota: plan.annual_document_quota ?? 0,
    category: plan.category,
    features: plan.features.map((section) => ({
      ...section,
      items: section.items.map((item) => ({ ...item })),
    })),
    max_users: plan.max_users ?? 0,
    accountant_users: plan.accountant_users ?? 0,
    max_issuers: plan.max_issuers,
    max_branches: plan.max_branches ?? 0,
    max_documents_per_month: plan.max_documents_per_month ?? 0,
    max_employees: plan.max_employees ?? 0,
    requires_base_plan: plan.requires_base_plan,
    certificate_included_annual: plan.certificate_included_annual,
    support_level: plan.support_level,
    has_inventory: plan.has_inventory,
    has_cash_register: plan.has_cash_register,
    has_api_access: plan.has_api_access,
    quotation_scope: plan.quotation_scope ?? blankPlanDraft.quotation_scope,
    is_active: false,
  };
}

function setItemAt(sections: FeatureSection[], sectionIndex: number, items: FeatureSection["items"]) {
  return sections.map((section, index) => index === sectionIndex ? { ...section, items } : section);
}

export function PlanEditorDialog({ form, setForm, editing, plans, categories, saving, onSave, onClose }: PlanEditorDialogProps) {
  const [step, setStep] = useState<Step>(0);
  const [template, setTemplate] = useState("blank");
  const [customizeBenefits, setCustomizeBenefits] = useState(Boolean(editing?.features?.length));
  const [codeTouched, setCodeTouched] = useState(false);
  const autoBenefits = useMemo(() => generatedPlanBenefits(form), [form]);
  const benefits = customizeBenefits ? form.features : autoBenefits;
  const codeTaken = plans.some((plan) => plan.code === form.code && plan.id !== editing?.id);
  const annualBase = Number(form.monthly_price || 0) * 12;
  const annualPrice = Number(form.yearly_price || 0);
  const annualDiscount = annualBase > 0 && annualPrice > 0 ? (1 - annualPrice / annualBase) * 100 : 0;
  const quote = form.quote_only || form.plan_type === "enterprise";

  function chooseTemplate(value: string) {
    setTemplate(value);
    if (value === "blank") {
      setForm({ ...blankPlanDraft, code: "", category: null });
    } else {
      const source = plans.find((plan) => String(plan.id) === value);
      if (source) setForm(draftFromPlan(source, plans));
    }
    setCustomizeBenefits(false);
    setCodeTouched(false);
  }

  function chooseType(type: PlanDraft["plan_type"]) {
    setForm((current) => applyProductDefaults(current, type, categories));
    setCustomizeBenefits(false);
  }

  function nextStep() {
    if (step === 0) {
      if (!form.name.trim()) return;
      if (!form.code.trim() || codeTaken) return;
    }
    if (step === 2 && form.plan_type === "payroll_addon" && form.max_employees < 1) return;
    setStep((current) => Math.min(3, current + 1) as Step);
  }

  function changeName(name: string) {
    setForm((current) => ({ ...current, name, code: editing || codeTouched ? current.code : uniqueCode(name, plans) }));
  }

  function showBenefitsCustomization() {
    if (!customizeBenefits) setForm((current) => ({ ...current, features: generatedPlanBenefits(current) }));
    setCustomizeBenefits((value) => !value);
  }

  function renderInformationStep() {
    return <div className="space-y-5">
      {!editing && <label className="block max-w-md space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Crear desde</span><select value={template} onChange={(event) => chooseTemplate(event.target.value)} className={inputClass}><option value="blank">Desde cero</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {plan.catalog_status === "draft" ? "Borrador" : plan.catalog_status === "published" ? "Publicado" : plan.catalog_status === "retired" ? "Retirado" : "Archivado"}</option>)}</select>{plans.length > 0 && <span className="block text-xs text-[#71879A]">Puedes usar un plan existente como base; se abrirá una copia nueva en borrador.</span>}</label>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Nombre del plan *</span><input autoFocus required maxLength={255} value={form.name} onChange={(event) => changeName(event.target.value)} placeholder="Ej. NUVVI Negocio" className={inputClass} /></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Tipo de producto *</span><select value={form.plan_type} onChange={(event) => chooseType(event.target.value as PlanDraft["plan_type"])} className={inputClass}><option value="invoicing">Facturación electrónica</option><option value="payroll_addon">Complemento de nómina</option><option value="enterprise">Empresarial / cotización</option></select></label>
        <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-bold text-[#39566F]">Descripción corta</span><input maxLength={255} value={form.short_description} onChange={(event) => setForm({ ...form, short_description: event.target.value })} placeholder="Resumen que verá el cliente" className={inputClass} /></label>
        <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-bold text-[#39566F]">Descripción completa <span className="font-normal text-[#8A9EAF]">(opcional)</span></span><textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="¿Para qué tipo de negocio está diseñado?" className={`${inputClass} resize-y`} /></label>
      </div>
      {form.name.trim() && <div className="flex items-start gap-2 rounded-xl border border-[#D9ECFA] bg-white px-3 py-2.5 text-xs text-[#526B80]"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#178C68]" /><span>Código sugerido: <code className="font-semibold text-[#102F4B]">{form.code || slug(form.name)}</code>{codeTaken && <span className="ml-1 font-semibold text-red-600">Ese código ya existe; se propone una alternativa.</span>}</span></div>}
      <details className="rounded-xl border border-[#D9ECFA] bg-white"><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[#39566F]"><span>Opciones avanzadas</span><ChevronDown size={16} /></summary><div className="grid gap-4 border-t border-[#EAF1F7] p-4 sm:grid-cols-2">
        <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Código / slug</span><input maxLength={50} value={form.code} readOnly={Boolean(editing && editing.catalog_status !== "draft")} onChange={(event) => { setCodeTouched(true); setForm({ ...form, code: slug(event.target.value) }); }} className={inputClass} /><span className="text-xs text-[#71879A]">Se conservan los guiones bajos, por ejemplo payroll_initial.</span></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Categoría</span><select value={form.category ?? ""} onChange={(event) => setForm({ ...form, category: event.target.value ? Number(event.target.value) : null })} className={inputClass}><option value="">Automática: {categoryNameForType(form.plan_type)}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Público objetivo</span><input maxLength={255} value={form.target_audience} onChange={(event) => setForm({ ...form, target_audience: event.target.value })} className={inputClass} placeholder="Profesionales, comercios…" /></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Etiqueta comercial</span><input maxLength={80} value={form.commercial_badge} onChange={(event) => setForm({ ...form, commercial_badge: event.target.value })} className={inputClass} placeholder="Recomendado" /></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Orden</span><input type="number" min="0" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} className={inputClass} /></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Visibilidad</span><select value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value as PlanDraft["visibility"] })} className={inputClass}><option value="private">Privado</option><option value="public">Público</option><option value="link">Mediante enlace</option><option value="quote">Solo cotización</option></select></label>
      </div></details>
    </div>;
  }

  function renderPricingStep() {
    return <div className="space-y-5">
      {quote ? <div className="rounded-2xl border border-[#D9ECFA] bg-white p-5"><div className="flex items-start gap-3"><input id="plan-quote-only" type="checkbox" checked={form.quote_only} onChange={(event) => setForm({ ...form, quote_only: event.target.checked, plan_type: event.target.checked ? "enterprise" : "invoicing", monthly_price: "", yearly_price: "" })} className="mt-1 h-4 w-4 accent-[#246FC1]" /><div><label htmlFor="plan-quote-only" className="font-bold text-[#102F4B]">Precio bajo cotización personalizada</label><p className="mt-1 text-sm text-[#6C8398]">El catálogo no mostrará tarifas fijas. Los precios quedan vacíos hasta acordar una propuesta.</p></div></div></div> : <>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 rounded-2xl border border-[#D9ECFA] bg-white p-4"><span className="text-sm font-bold text-[#39566F]">Precio mensual (COP)</span><div className="flex items-center gap-2"><span className="text-lg font-semibold text-[#7890A5]">$</span><input aria-label="Precio mensual en pesos colombianos" type="number" min="0" step="100" value={form.monthly_price || ""} onChange={(event) => setForm({ ...form, monthly_price: event.target.value })} className={`${inputClass} text-lg font-bold tabular-nums`} /></div></label>
          <label className="space-y-2 rounded-2xl border border-[#D9ECFA] bg-white p-4"><span className="text-sm font-bold text-[#39566F]">Precio anual (COP)</span><div className="flex items-center gap-2"><span className="text-lg font-semibold text-[#7890A5]">$</span><input aria-label="Precio anual en pesos colombianos" type="number" min="0" step="100" value={form.yearly_price || ""} onChange={(event) => setForm({ ...form, yearly_price: event.target.value })} className={`${inputClass} text-lg font-bold tabular-nums`} /></div></label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#EFF6FC] px-4 py-3 text-sm"><span className="text-[#39566F]">{annualDiscount > 0 ? `Ahorras ${annualDiscount.toFixed(1).replace(".0", "")}% pagando anualmente.` : "El ahorro anual se calcula al ingresar ambos precios."}</span><span className="font-semibold text-[#102F4B]">12 meses: {formatMoney(form.monthly_price)} · anual: {formatMoney(form.yearly_price)}</span></div>
      </>}
      {form.plan_type === "invoicing" && <div className="rounded-xl border border-[#D9ECFA] bg-white px-4 py-3 text-sm leading-6 text-[#526B80]">Firma digital incluida en el pago anual. En la modalidad mensual se cobra una activación de firma digital de <strong className="text-[#102F4B]">{formatMoney(form.monthly_certificate_fee)}</strong>, renovable cada 12 meses. <details className="mt-2"><summary className="inline-flex cursor-pointer text-xs font-semibold text-[#246FC1]">Modificar condiciones del certificado</summary><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs font-semibold text-[#39566F]"><span>Tarifa de activación mensual (COP)</span><input type="number" min="0" step="100" value={form.monthly_certificate_fee} onChange={(event) => setForm({ ...form, monthly_certificate_fee: event.target.value })} className={inputClass} /></label><label className="inline-flex items-center gap-2 text-xs font-semibold text-[#39566F]"><input type="checkbox" checked={form.certificate_included_annual} onChange={(event) => setForm({ ...form, certificate_included_annual: event.target.checked })} className="h-4 w-4 accent-[#246FC1]" />Incluido en anualidad</label></div></details></div>}
      {form.plan_type === "payroll_addon" && <p className="rounded-xl border border-[#D9ECFA] bg-white px-4 py-3 text-sm leading-6 text-[#526B80]">El complemento requiere facturación activa. Comparte el certificado vigente del mismo NIT cuando sea válido; no agrega otro cargo de certificado.</p>}
      <details className="rounded-xl border border-[#D9ECFA] bg-white"><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[#39566F]"><span>Opciones avanzadas de precio</span><ChevronDown size={16} /></summary><div className="border-t border-[#EAF1F7] p-4 text-sm text-[#71879A]">Impuestos, promociones, prorrateos y condiciones especiales no están conectados a un motor de precios en este módulo; no se muestran como controles editables para evitar guardar opciones sin efecto.</div></details>
    </div>;
  }

  function renderLimits() {
    if (form.plan_type === "payroll_addon") return <div className="grid gap-4 sm:grid-cols-2">
      <NumberField label="Empleados permitidos" value={form.max_employees} onChange={(value) => setForm({ ...form, max_employees: value })} />
      <NumberField label="Documentos al mes" value={form.max_documents_per_month} onChange={(value) => setForm({ ...form, max_documents_per_month: value })} />
      <NumberField label="Documentos al año" value={form.annual_document_quota} onChange={(value) => setForm({ ...form, annual_document_quota: value })} />
      <div className="rounded-xl bg-[#EFF6FC] px-4 py-3 text-sm text-[#39566F]">Plan principal requerido · certificado compartido con el mismo NIT · inventario y caja se heredan.</div>
    </div>;

    if (form.plan_type === "enterprise") {
      const scopeFields = [
        ["document_volume", "Volumen de documentos"], ["users", "Usuarios"],
        ["branches", "Sucursales / sedes"], ["certificate", "Certificado digital"],
        ["implementation", "Implementación"], ["support", "Nivel de soporte"],
        ["integrations", "Integraciones"],
      ] as const;
      return <div className="space-y-4"><div className="rounded-xl border border-[#D9ECFA] bg-[#EFF6FC] p-4 text-sm leading-6 text-[#39566F]">Configura el alcance en cada cotización. No se imponen topes predeterminados; verifica capacidad antes de aceptar la propuesta.</div><div className="grid gap-3 sm:grid-cols-2">{scopeFields.map(([key, label]) => <label key={key} className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">{label} · alcance propuesto</span><input value={String(form.quotation_scope[key] ?? "")} onChange={(event) => setForm({ ...form, quotation_scope: { ...form.quotation_scope, [key]: event.target.value } })} placeholder="Por definir con el cliente" className={inputClass} /></label>)}</div></div>;
    }

    return <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField label="Documentos al mes" value={form.max_documents_per_month} onChange={(value) => setForm({ ...form, max_documents_per_month: value })} />
        <NumberField label="Documentos al año" value={form.annual_document_quota} onChange={(value) => setForm({ ...form, annual_document_quota: value })} />
        <NumberField label="Usuarios administrativos" value={form.max_users} onChange={(value) => setForm({ ...form, max_users: value })} />
        <NumberField label="Accesos para contador" value={form.accountant_users} onChange={(value) => setForm({ ...form, accountant_users: value })} />
        <NumberField label="Sucursales" value={form.max_branches} onChange={(value) => setForm({ ...form, max_branches: value })} />
        <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">Nivel de soporte</span><select value={form.support_level} onChange={(event) => setForm({ ...form, support_level: event.target.value as PlanDraft["support_level"] })} className={inputClass}><option value="standard">Estándar</option><option value="priority">Prioritario</option><option value="custom">Según cotización</option></select></label>
      </div>
      {form.plan_type === "invoicing" && <div className="grid gap-3 rounded-xl border border-[#D9ECFA] bg-white p-4 sm:grid-cols-2"><label className="flex items-center gap-2 text-sm font-semibold text-[#39566F]"><input type="checkbox" checked={form.has_inventory} onChange={(event) => setForm({ ...form, has_inventory: event.target.checked })} className="h-4 w-4 accent-[#246FC1]" />Inventario (validar desarrollo)</label><label className="flex items-center gap-2 text-sm font-semibold text-[#39566F]"><input type="checkbox" checked={form.has_cash_register} onChange={(event) => setForm({ ...form, has_cash_register: event.target.checked })} className="h-4 w-4 accent-[#246FC1]" />Caja (validar desarrollo)</label><p className="text-xs leading-5 text-[#71879A] sm:col-span-2">Estas casillas representan el alcance propuesto, no certifican disponibilidad técnica. La publicación se bloquea hasta validar cada capacidad asociada.</p></div>}
      <details className="rounded-xl border border-[#D9ECFA] bg-white"><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[#39566F]"><span>Opciones avanzadas de límites</span><ChevronDown size={16} /></summary><div className="grid gap-4 border-t border-[#EAF1F7] p-4 sm:grid-cols-2"><NumberField label="NIT emisores" value={form.max_issuers} onChange={(value) => setForm({ ...form, max_issuers: value })} /><label className="inline-flex items-center gap-2 text-sm font-semibold text-[#39566F]"><input type="checkbox" checked={form.has_api_access} onChange={(event) => setForm({ ...form, has_api_access: event.target.checked })} className="h-4 w-4 accent-[#246FC1]" />Acceso API externa</label><p className="text-xs leading-5 text-[#71879A] sm:col-span-2">La cuota de almacenamiento y otros límites no se muestran hasta que exista una capacidad técnica medible para contratarlos.</p></div></details>
    </div>;
  }

  function renderBenefitsStep() {
    return <div className="space-y-5">
      <section className="rounded-2xl border border-[#D9ECFA] bg-white p-4"><div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="font-bold text-[#102F4B]">Beneficios incluidos</h3><p className="mt-1 text-xs text-[#71879A]">Se generan desde el producto, sus límites y el soporte; puedes personalizar cómo se presentan.</p></div><button type="button" onClick={showBenefitsCustomization} className="shrink-0 text-xs font-bold text-[#246FC1] hover:text-[#174F8A]">{customizeBenefits ? "Usar beneficios automáticos" : "Personalizar presentación"}</button></div>
        {!customizeBenefits ? <div className="grid gap-2 sm:grid-cols-2">{benefits.flatMap((section) => section.items).map((item, index) => <div key={`${item.title}-${index}`} className="flex gap-2 rounded-lg bg-[#F7FAFD] px-3 py-2 text-sm"><Check size={15} className="mt-0.5 shrink-0 text-[#178C68]" /><span className="text-[#39566F]">{item.title}</span></div>)}</div> : <div className="space-y-4">{form.features.map((section, sectionIndex) => <div key={`${section.title}-${sectionIndex}`} className="rounded-xl border border-[#EAF1F7] bg-[#FBFDFF] p-3"><div className="mb-3 flex items-center gap-2"><input aria-label="Título de sección" value={section.title} onChange={(event) => setForm({ ...form, features: form.features.map((item, index) => index === sectionIndex ? { ...item, title: event.target.value } : item) })} className={`${inputClass} font-semibold`} /><button type="button" disabled={form.features.length < 2} onClick={() => setForm({ ...form, features: form.features.filter((_, index) => index !== sectionIndex) })} aria-label="Eliminar sección" className="rounded-lg p-2 text-[#8A9EAF] hover:bg-red-50 hover:text-red-600 disabled:opacity-40"><Trash2 size={15} /></button></div>{section.items.map((item, itemIndex) => <div key={`${sectionIndex}-${itemIndex}`} className="mb-2 grid gap-2 sm:grid-cols-[1fr_1.2fr_auto]">
            <input aria-label="Nombre del beneficio" value={item.title} onChange={(event) => setForm({ ...form, features: setItemAt(form.features, sectionIndex, section.items.map((entry, index) => index === itemIndex ? { ...entry, title: event.target.value } : entry)) })} className={inputClass} />
            <input aria-label="Descripción del beneficio" value={item.description} onChange={(event) => setForm({ ...form, features: setItemAt(form.features, sectionIndex, section.items.map((entry, index) => index === itemIndex ? { ...entry, description: event.target.value } : entry)) })} className={inputClass} />
            <div className="flex items-center gap-1"><label className="flex items-center gap-1 px-1 text-[11px] text-[#71879A]"><input type="checkbox" checked={item.is_visible !== false} onChange={(event) => setForm({ ...form, features: setItemAt(form.features, sectionIndex, section.items.map((entry, index) => index === itemIndex ? { ...entry, is_visible: event.target.checked } : entry)) })} />Mostrar</label><button type="button" disabled={itemIndex === 0} onClick={() => setForm({ ...form, features: setItemAt(form.features, sectionIndex, section.items.map((entry, index, items) => index === itemIndex ? items[index - 1] : index === itemIndex - 1 ? items[index] : entry)) })} aria-label="Subir beneficio" className="rounded p-1 text-[#6C8398] hover:bg-[#E8F0FE] disabled:opacity-30"><ArrowUp size={14} /></button><button type="button" disabled={itemIndex === section.items.length - 1} onClick={() => setForm({ ...form, features: setItemAt(form.features, sectionIndex, section.items.map((entry, index, items) => index === itemIndex ? items[index + 1] : index === itemIndex + 1 ? items[index] : entry)) })} aria-label="Bajar beneficio" className="rounded p-1 text-[#6C8398] hover:bg-[#E8F0FE] disabled:opacity-30"><ArrowDown size={14} /></button><button type="button" onClick={() => setForm({ ...form, features: setItemAt(form.features, sectionIndex, section.items.filter((_, index) => index !== itemIndex)) })} aria-label="Eliminar beneficio" className="rounded p-1 text-[#8A9EAF] hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button></div>
          </div>)}<button type="button" onClick={() => setForm({ ...form, features: setItemAt(form.features, sectionIndex, [...section.items, { title: "", description: "", is_visible: true }]) })} className="inline-flex items-center gap-1 text-xs font-bold text-[#246FC1]"><Plus size={14} />Agregar beneficio</button></div>)}<Button type="button" variant="outline" onClick={() => setForm({ ...form, features: [...form.features, { title: "Nueva sección", items: [{ title: "", description: "", is_visible: true }] }] })} className="h-9 rounded-lg border-[#D9ECFA] text-[#246FC1]"><Plus size={14} className="mr-1" />Agregar sección</Button></div>}
      </section>
      {renderLimits()}
    </div>;
  }

  const reviewItems = benefits.flatMap((section) => section.items).filter((item) => item.is_visible !== false);
  const publicationErrors = [
    !form.name.trim() ? "Agrega el nombre del plan." : "",
      !form.code.trim() || codeTaken ? "El código interno debe ser único." : "",
    !quote && Number(form.monthly_price || 0) <= 0 && Number(form.yearly_price || 0) <= 0 ? "Configura al menos un precio." : "",
    form.plan_type === "payroll_addon" && form.max_employees < 1 ? "Define el máximo de empleados." : "",
    form.plan_type === "invoicing" && (form.max_documents_per_month < 1 || form.annual_document_quota < 1) ? "Define los cupos mensual y anual." : "",
  ].filter(Boolean);

  function renderReviewStep() {
    return <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-2xl border border-[#D9ECFA] bg-white p-5"><div className="flex items-start justify-between gap-4"><div><span className="text-xs font-semibold uppercase tracking-wide text-[#4F83B5]">{form.plan_type === "payroll_addon" ? "Complemento de nómina" : form.plan_type === "enterprise" ? "Empresarial" : "Facturación electrónica"}</span><h3 className="mt-1 text-xl font-extrabold text-[#102F4B]">{form.name || "Nombre del plan"}</h3><p className="mt-1 text-sm text-[#6C8398]">{form.short_description || "Sin descripción corta"}</p></div>{form.commercial_badge && <span className="rounded-lg bg-[#EFF6FC] px-2 py-1 text-xs font-bold text-[#246FC1]">{form.commercial_badge}</span>}</div>
        <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-y border-[#EAF1F7] py-4"><span className="text-lg font-extrabold text-[#102F4B]">{quote ? "Cotización personalizada" : `${formatMoney(form.monthly_price)} / mes`}</span>{!quote && <span className="text-sm font-semibold text-[#526B80]">{formatMoney(form.yearly_price)} / año{annualDiscount > 0 ? ` · ahorras ${annualDiscount.toFixed(1).replace(".0", "")}%` : ""}</span>}</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{form.plan_type === "payroll_addon" ? <><SummaryItem label="Empleados" value={String(form.max_employees)} /><SummaryItem label="Documentos anuales" value={form.annual_document_quota.toLocaleString("es-CO")} /><SummaryItem label="Documentos mensuales" value={form.max_documents_per_month.toLocaleString("es-CO")} /><SummaryItem label="Plan principal" value="Requerido" /></> : form.plan_type === "enterprise" ? <><SummaryItem label="Cotización" value="Personalizada" /><SummaryItem label="Volumen, usuarios y sedes" value="Por propuesta" /><SummaryItem label="Verificación de capacidad" value="Requerida" /></> : <><SummaryItem label="Documentos anuales" value={form.annual_document_quota.toLocaleString("es-CO")} /><SummaryItem label="Usuarios" value={String(form.max_users)} /><SummaryItem label="Contador" value={String(form.accountant_users)} /><SummaryItem label="Sucursales" value={String(form.max_branches)} /><SummaryItem label="Inventario" value={form.has_inventory ? "Propuesto · validar" : "No incluido"} /><SummaryItem label="Caja" value={form.has_cash_register ? "Propuesta · validar" : "No incluida"} /><SummaryItem label="Certificado anual" value={form.certificate_included_annual ? "Incluido" : "No incluido"} /><SummaryItem label="Soporte" value={form.support_level === "priority" ? "Prioritario" : form.support_level === "custom" ? "Según cotización" : "Estándar"} /></>}</div>
        <ul className="mt-4 space-y-1.5 border-t border-[#EAF1F7] pt-4">{reviewItems.slice(0, 8).map((item, index) => <li key={`${item.title}-${index}`} className="flex gap-2 text-sm text-[#526B80]"><Check size={15} className="mt-0.5 shrink-0 text-[#178C68]" />{item.title}</li>)}</ul>
      </article>
      <aside className="space-y-3"><div className="rounded-2xl border border-[#D9ECFA] bg-white p-4"><h4 className="font-bold text-[#102F4B]">Validación</h4><ul className="mt-3 space-y-2 text-sm">{["Información", "Precios", "Beneficios", "Límites"].map((label, index) => { const ready = index === 0 ? Boolean(form.name.trim() && form.code.trim() && !codeTaken) : index === 1 ? Boolean(quote || Number(form.monthly_price || 0) > 0 || Number(form.yearly_price || 0) > 0) : index === 2 ? reviewItems.length > 0 : form.plan_type === "payroll_addon" ? form.max_employees > 0 : form.max_documents_per_month > 0 && form.annual_document_quota > 0; return <li key={label} className={`flex items-center gap-2 ${ready ? "text-[#178C68]" : "text-[#A27319]"}`}>{ready ? <CheckCircle2 size={15} /> : <Circle size={15} />}{label} {ready ? "completo" : "pendiente"}</li>; })}</ul></div>
         {publicationErrors.length > 0 && <div role="status" className="rounded-xl border border-[#F2D9A8] bg-[#FFF9EC] p-3 text-xs leading-5 text-[#815C16]"><strong>Para publicar:</strong><ul className="mt-1 list-disc pl-4">{publicationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
         <p className="rounded-xl bg-[#EFF6FC] p-3 text-xs leading-5 text-[#526B80]">Propuesta comercial: IVA pendiente de validación tributaria. Guardar conserva el borrador privado; publicación y venta quedan deshabilitadas hasta aprobar precios, impuestos y capacidades técnicas.</p>
      </aside>
    </div>;
  }

  const content = [renderInformationStep(), renderPricingStep(), renderBenefitsStep(), renderReviewStep()][step];

  return <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-[#102F4B]/45 backdrop-blur-sm sm:items-center sm:p-3" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="plan-form-title" className="flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden rounded-none bg-[#F8FCFF] shadow-2xl sm:h-[88dvh] sm:max-h-[850px] sm:rounded-3xl">
      <header className="shrink-0 border-b border-[#D9ECFA] bg-white px-5 py-4 sm:px-7"><div className="flex items-center justify-between"><div><h2 id="plan-form-title" className="text-lg font-extrabold text-[#102F4B]">{editing ? `Editar ${editing.name}` : "Crear plan"}</h2><p className="mt-0.5 text-xs text-[#6C8398]">Configura los detalles de tu plan.</p></div><button type="button" onClick={onClose} aria-label="Cerrar asistente de planes" className="rounded-xl p-2 text-[#6C8398] hover:bg-[#F1F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9FF0]"><X size={20} /></button></div>
        <nav aria-label="Pasos de creación" className="mt-4 grid grid-cols-4 gap-2">{steps.map((label, index) => { const active = step === index; const complete = step > index; return <div key={label} className="min-w-0"><div className={`h-1 rounded-full ${active || complete ? "bg-[#246FC1]" : "bg-[#E2EAF1]"}`} /><div className={`mt-2 flex items-center gap-1.5 text-[10px] font-semibold sm:text-xs ${active ? "text-[#246FC1]" : complete ? "text-[#178C68]" : "text-[#8A9EAF]"}`}>{complete ? <CheckCircle2 size={14} className="shrink-0" /> : <span className="shrink-0">{index + 1}.</span>}<span className="truncate">{label}</span></div></div>; })}</nav>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6"><div className="mb-4"><h3 className="text-base font-bold text-[#102F4B]">{steps[step]}</h3><p className="mt-1 text-xs text-[#71879A]">{step === 0 ? "Empieza con los datos básicos; puedes ajustar el resto después." : step === 1 ? "Define la tarifa y revisa las condiciones de certificado." : step === 2 ? "Los beneficios y límites se completan automáticamente según el producto." : "Revisa la configuración antes de guardarla o publicarla."}</p></div>{content}</div>
      <footer className="shrink-0 border-t border-[#D9ECFA] bg-white px-5 py-3.5 sm:px-7"><div className="flex flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">{step === 0 ? <Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-xl border-[#D9ECFA] text-[#6C8398]">Salir sin guardar</Button> : <Button type="button" variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1) as Step)} className="h-10 rounded-xl border-[#D9ECFA] text-[#39566F]"><ChevronLeft size={16} className="mr-1" />Anterior</Button>}
         <div className="flex flex-wrap justify-end gap-2">{step < 3 ? <Button type="button" disabled={step === 0 && (!form.name.trim() || !form.code.trim() || codeTaken) || step === 2 && form.plan_type === "payroll_addon" && form.max_employees < 1} onClick={nextStep} className="h-10 rounded-xl bg-[#246FC1] px-5 text-white hover:bg-[#1B5FA8]">{step === 2 ? "Revisar plan" : "Siguiente"}<ChevronRight size={16} className="ml-1" /></Button> : <Button type="button" variant="outline" disabled={saving} onClick={() => onSave("draft", customizeBenefits ? form.features : autoBenefits)} className="h-10 rounded-xl border-[#D9ECFA] text-[#39566F]">{saving ? "Guardando…" : "Guardar propuesta privada"}</Button>}</div>
      </div></footer>
    </section>
  </div>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="space-y-1.5"><span className="text-xs font-bold text-[#39566F]">{label}</span><input type="number" min="0" step="1" value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} className={inputClass} /></label>;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-2 rounded-lg bg-[#F7FAFD] px-3 py-2 text-sm"><span className="text-[#71879A]">{label}</span><strong className="text-right text-[#39566F]">{value}</strong></div>;
}
