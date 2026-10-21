import { Check, Minus, Pencil, FileText, UsersRound, UserRoundCheck } from "lucide-react";
import type { Plan, PlanBundle } from "@/types";
import { Button } from "@/components/ui/button";
import { annualSaving, bundleFeatures, bundleTotals, isExclusion, money, percent } from "./planPresentation";

export function PriceBlock({ monthly, annual, quote = false }: { monthly: string | number | null; annual: string | number | null; quote?: boolean }) {
  const saving = annualSaving(monthly, annual);
  if (quote) return <div className="rounded-xl bg-muted p-4"><p className="text-xl font-semibold">Por cotización</p><p className="mt-2 text-sm text-muted-foreground">Límites y condiciones según cotización</p></div>;
  return <div className="space-y-3 border-y py-4 tabular-nums">
    <div><p className="text-sm text-muted-foreground">Pago mensual</p><p><strong className="text-3xl font-semibold tracking-tight">{money(monthly)}</strong> <span className="text-sm text-muted-foreground">/ mes</span></p></div>
    <div><p className="text-sm text-muted-foreground">Pago anual</p><p><strong className="text-3xl font-semibold tracking-tight">{money(annual)}</strong> <span className="text-sm text-muted-foreground">/ año</span></p></div>
    {saving && <p className="text-sm font-medium text-emerald-800">Ahorras {money(saving.amount)} al año · {percent(saving.percent)} %</p>}
  </div>;
}

export function LimitsSummary({ plan }: { plan: Plan }) {
  const payroll = plan.plan_type === "payroll_addon";
  const rows = [
    { value: plan.annual_document_quota, label: `documentos de ${payroll ? "nómina" : "facturación"} al año`, icon: FileText },
    { value: plan.max_documents_per_month, label: "documentos al mes", icon: FileText },
    ...(payroll ? [{ value: plan.max_employees, label: plan.max_employees === 1 ? "empleado incluido" : "empleados incluidos", icon: UsersRound }] : []),
    { value: plan.max_users, label: plan.max_users === 1 ? "usuario administrativo" : "usuarios administrativos", icon: UsersRound },
  ];
  return <ul className="space-y-2 text-sm">{rows.filter(row => row.value !== null).map(row => <li key={row.label} className="flex items-start gap-2"><row.icon size={18} className="mt-0.5 shrink-0 text-muted-foreground"/><span><b className="tabular-nums">{row.value?.toLocaleString("es-CO")}</b> {row.label}</span></li>)}
    {plan.accountant_users !== null && <li className="flex gap-2"><UserRoundCheck size={18} className="shrink-0 text-muted-foreground"/><span>Acceso del contador: <b>{plan.accountant_users > 0 ? "Incluido" : "No incluido"}</b></span></li>}
  </ul>;
}

export function BenefitsList({ features, requiresBase = false }: { features: Plan["features"]; requiresBase?: boolean }) {
  const visible = (excluded: boolean) => [...new Map(features.filter(s => isExclusion(s.title) === excluded).flatMap(s => s.items).filter(i => i.is_visible !== false && !(requiresBase && /requiere.*facturaci|requiere.*plan.*activo/i.test(i.title))).map(i => [i.title, i])).values()];
  const included = visible(false), excluded = visible(true);
  const list = (items: typeof included, exclusion = false) => <ul className="space-y-2">{items.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm">{exclusion ? <Minus size={18} className="mt-0.5 shrink-0 text-muted-foreground"/> : <Check size={18} className="mt-0.5 shrink-0 text-emerald-800"/>}<span>{item.title}</span></li>)}</ul>;
  return <div className="space-y-3">{included.length > 0 && <><h3 className="text-sm font-semibold">Qué incluye</h3>{list(included.slice(0, 5))}{included.length > 5 && <details><summary className="cursor-pointer text-sm font-medium text-[#246FC1]">Ver todos los beneficios ({included.length})</summary><div className="pt-3">{list(included.slice(5))}</div></details>}</>}
    {excluded.length > 0 && <details><summary className="cursor-pointer text-sm font-medium">Qué no incluye ({excluded.length})</summary><div className="pt-3">{list(excluded, true)}</div></details>}
    {requiresBase && <p className="border-t pt-3 text-sm text-muted-foreground">Requiere un plan de facturación activo.</p>}
  </div>;
}

export function ComboCalculation({ billing, payroll, discount }: { billing?: Plan; payroll?: Plan; discount: number }) {
  const totals = bundleTotals(billing, payroll, discount);
  return <div className="space-y-2 text-sm tabular-nums"><p className="font-medium">Descuento del combo: {percent(discount)} %</p>{totals.annual && totals.annual.base > totals.annual.total && <p className="text-emerald-800">Ahorro del combo frente a planes separados: <b>{money(totals.annual.base - totals.annual.total)}</b> por año.</p>}<details><summary className="cursor-pointer text-[#246FC1]">Ver desglose de precios</summary><dl className="mt-3 space-y-2"><div><dt>Mensual por separado → combo</dt><dd>{money(totals.monthly?.base ?? null)} → {money(totals.monthly?.total ?? null)}</dd></div><div><dt>Anual por separado → combo</dt><dd>{money(totals.annual?.base ?? null)} → {money(totals.annual?.total ?? null)}</dd></div><div><dt>Doce mensualidades del combo</dt><dd>{money(totals.monthly ? centsTimesTwelve(totals.monthly.total) : null)}</dd></div></dl></details></div>;
}
const centsTimesTwelve = (amount: number) => Math.round(amount * 100) * 12 / 100;

export function PlanCard({ plan, bundle, onEdit }: { plan?: Plan; bundle?: PlanBundle; onEdit: () => void }) {
  const item = bundle ?? plan!;
  const quote = item.quote_only || plan?.plan_type === "enterprise";
  return <article className={`flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-6 text-card-foreground ${quote ? "plan-quote" : ""}`}>
    <header><h2 className="text-xl font-semibold">{item.name}</h2>{!(plan?.requires_base_plan && /^requiere.*facturaci/i.test(item.short_description)) && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.short_description}</p>}{bundle && <p className="mt-2 text-sm font-medium">{bundle.billing_plan_details.name} + {bundle.payroll_plan_details.name}</p>}</header>
    <PriceBlock monthly={item.monthly_price} annual={item.yearly_price} quote={quote}/>
    {bundle && !quote && <ComboCalculation billing={bundle.billing_plan_details} payroll={bundle.payroll_plan_details} discount={bundle.discount_percent}/>}
    <div className="space-y-4">{bundle ? <><div><h3 className="mb-2 text-sm font-semibold">Facturación</h3><LimitsSummary plan={bundle.billing_plan_details}/></div><div><h3 className="mb-2 text-sm font-semibold">Nómina</h3><LimitsSummary plan={bundle.payroll_plan_details}/></div></> : <LimitsSummary plan={plan!}/>}</div>
    <BenefitsList features={bundle ? bundleFeatures(bundle) : plan!.features} requiresBase={plan?.requires_base_plan}/>
    <footer className="mt-auto border-t pt-4"><Button variant="outline" className="w-full shadow-none" onClick={onEdit} aria-label={`Editar ${item.name}`}><Pencil size={16} className="mr-2"/>Editar</Button></footer>
  </article>;
}
