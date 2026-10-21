import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, CircleAlert, FileCheck2, ShieldCheck } from "lucide-react";
import apiClient from "@/api/client";
import type { ApiResponse, Plan } from "@/types";

type Bundle = {
  id: number;
  slug: string;
  name: string;
  billing_plan_details: Plan;
  payroll_plan_details: Plan;
  monthly_price: string;
  yearly_price: string;
};

const money = (value: string | number | null | undefined) => new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
}).format(Number(value || 0));

function rows<T>(data: ApiResponse<T> | T[] | undefined): T[] {
  return Array.isArray(data) ? data : data?.results ?? [];
}

export function PlansPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedBilling, setSelectedBilling] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState("");
  const plansQuery = useQuery({
    queryKey: ["commercial-proposals"],
    queryFn: async () => rows((await apiClient.get<ApiResponse<Plan> | Plan[]>("/plans/commercial-proposals/")).data),
  });
  const bundleQuery = useQuery({
    queryKey: ["plan-bundles"],
    queryFn: async () => rows((await apiClient.get<ApiResponse<Bundle> | Bundle[]>("/plan-bundles/")).data),
  });
  const plans = plansQuery.data ?? [];
  const billing = plans.filter((plan) => plan.plan_type === "invoicing");
  const payroll = plans.filter((plan) => plan.plan_type === "payroll_addon");
  const billingPlan = billing.find((plan) => String(plan.id) === selectedBilling) ?? billing[0];
  const payrollPlan = payroll.find((plan) => String(plan.id) === selectedPayroll);
  const selectedBundle = useMemo(() => (bundleQuery.data ?? []).find((bundle) =>
    bundle.billing_plan_details?.id === billingPlan?.id && bundle.payroll_plan_details?.id === payrollPlan?.id,
  ), [bundleQuery.data, billingPlan?.id, payrollPlan?.id]);

  const selectedPrice = (plan: Plan) => cycle === "monthly" ? plan.monthly_price : plan.yearly_price;
  const selectedQuota = (plan: Plan) => cycle === "monthly" ? plan.max_documents_per_month : plan.annual_document_quota;
  const quotePlan = plans.find((plan) => plan.plan_type === "enterprise");

  return <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 text-foreground sm:px-6 lg:py-12">
    <header className="max-w-3xl space-y-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-nuvvi">NUVVI · Facturación electrónica</p>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Planes para trabajar con claridad.</h1>
      <p className="max-w-2xl text-base leading-7 text-muted">Elige facturación y, si lo necesitas, añade nómina electrónica. Estos valores son una propuesta comercial, todavía no contratables.</p>
      <div className="inline-flex rounded-xl border border-card-border bg-card p-1" aria-label="Periodicidad de cobro">
        {(["monthly", "yearly"] as const).map((value) => <button key={value} type="button" aria-pressed={cycle === value} onClick={() => setCycle(value)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${cycle === value ? "bg-nuvvi text-black" : "text-muted hover:text-foreground"}`}>
          {value === "monthly" ? "Mensual" : "Anual · 12 meses"}
        </button>)}
      </div>
    </header>

    <div role="status" className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
      <CircleAlert className="mt-0.5 shrink-0 text-amber-300" size={18} />
      <p><strong>Propuesta pendiente de aprobación comercial e IVA.</strong> Precios sujetos a validación tributaria. No se aceptan contrataciones, pagos ni activaciones desde esta página.</p>
    </div>

    {plansQuery.isLoading ? <p className="rounded-2xl border border-card-border p-8 text-muted">Cargando propuesta de planes…</p> : plansQuery.isError ? <p role="alert" className="rounded-2xl border border-red-500/30 p-6 text-red-200">No fue posible cargar el catálogo propuesto. Intenta nuevamente más tarde.</p> : <>
      <section aria-labelledby="billing-title">
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-muted">01 · Elige tu plan</p><h2 id="billing-title" className="mt-1 text-2xl font-bold">Facturación electrónica</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          {billing.map((plan) => <article key={plan.id} className={`rounded-2xl border p-5 transition ${billingPlan?.id === plan.id ? "border-nuvvi/70 bg-nuvvi/5" : "border-card-border bg-card"}`}>
            <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold">{plan.name}</h3>{billingPlan?.id === plan.id && <Check size={18} className="text-nuvvi" />}</div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{money(selectedPrice(plan))}<span className="ml-1 text-sm font-medium text-muted">/{cycle === "monthly" ? "mes" : "año"}</span></p>
            <p className="mt-2 text-sm text-muted">{selectedQuota(plan)?.toLocaleString("es-CO")} documentos de facturación por {cycle === "monthly" ? "mes" : "año"}</p>
            <div className="mt-4 space-y-2 border-t border-card-border pt-4 text-sm text-muted">
              <p>{plan.max_users ?? "Según propuesta"} usuarios administrativos · {plan.accountant_users ?? "Según propuesta"} acceso para contador</p>
              <p>{plan.max_branches ?? "Según propuesta"} sucursal(es) · certificado anual incluido</p>
              {plan.has_inventory && <p>Inventario: propuesto, sujeto a validación técnica</p>}
              {plan.has_cash_register && <p>Caja: propuesta, sujeta a validación técnica</p>}
              {plan.plan_capabilities?.filter((item: any) => item.capability?.validation_status === "available").map((item: any) => <p key={item.id}>{item.capability.name}</p>)}
              {!plan.has_inventory && !plan.has_cash_register && <p>Sin inventario ni caja</p>}
            </div>
            <button type="button" onClick={() => setSelectedBilling(String(plan.id))} className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-bold ${billingPlan?.id === plan.id ? "bg-nuvvi text-black" : "border border-card-border hover:border-nuvvi/50"}`}>Elegir {plan.name.replace("NUVVI ", "")}</button>
          </article>)}
        </div>
      </section>

      {quotePlan && <section aria-labelledby="enterprise-title" className="rounded-3xl border border-card-border bg-card p-6 sm:p-8"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-widest text-muted">Alcance a la medida</p><h2 id="enterprise-title" className="mt-1 text-2xl font-bold">{quotePlan.name}</h2><p className="mt-2 text-sm leading-6 text-muted">{quotePlan.short_description} El volumen, usuarios, sedes, certificado, implementación y soporte se configuran en cada propuesta. La aceptación requiere verificar la capacidad disponible con el proveedor.</p><p className="mt-3 text-xs text-muted">Sin límites numéricos predefinidos ni promesas de capacidad ilimitada.</p></div><span className="w-fit rounded-xl border border-card-border px-5 py-3 text-sm font-bold">Precio por cotización</span></div></section>}

      <section aria-labelledby="payroll-title" className="grid gap-6 rounded-3xl border border-card-border bg-card p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr]">
        <div><p className="text-xs font-bold uppercase tracking-widest text-muted">02 · Complemento opcional</p><h2 id="payroll-title" className="mt-1 text-2xl font-bold">¿También necesitas nómina?</h2><p className="mt-3 text-sm leading-6 text-muted">Requiere una suscripción de facturación activa. Comparte el certificado vigente del mismo NIT. Su cupo es independiente del de facturación.</p>
          <label className="mt-5 block space-y-2 text-sm font-semibold"><span>Complemento</span><select value={selectedPayroll} onChange={(event) => setSelectedPayroll(event.target.value)} className="w-full rounded-xl border border-card-border bg-background px-3 py-3"><option value="">Sin complemento de nómina</option>{payroll.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {money(selectedPrice(plan))}/{cycle === "monthly" ? "mes" : "año"}</option>)}</select></label>
        </div>
        <div className="rounded-2xl bg-background p-5">
          <div className="flex items-center gap-2 font-bold"><FileCheck2 size={18} className="text-nuvvi" />Resumen de propuesta</div>
          {billingPlan ? <div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-muted">{billingPlan.name} · {selectedQuota(billingPlan)} documentos de facturación</span><strong>{money(selectedPrice(billingPlan))}</strong></div>
            {payrollPlan && <div className="flex justify-between gap-4"><span className="text-muted">{payrollPlan.name} · {selectedQuota(payrollPlan)} documentos de nómina</span><strong>{money(selectedPrice(payrollPlan))}</strong></div>}
            <div className="flex justify-between border-t border-card-border pt-3 text-base"><strong>Total {cycle === "monthly" ? "mensual" : "anual"}</strong><strong>{money(Number(selectedPrice(billingPlan) || 0) + Number(payrollPlan ? selectedPrice(payrollPlan) : 0))}</strong></div>
            {cycle === "monthly" ? <p className="rounded-xl bg-amber-500/10 p-3 text-xs leading-5 text-amber-100">Certificado digital: $119.000 por NIT al activar y al renovar cada 12 meses. Se cobra una sola vez, no por módulo. Total con certificado inicial: {money(Number(selectedPrice(billingPlan) || 0) + Number(payrollPlan ? selectedPrice(payrollPlan) : 0) + 119000)}.</p> : <p className="rounded-xl bg-nuvvi/10 p-3 text-xs text-muted">La anualidad cubre 12 meses e incluye un certificado digital por NIT.</p>}
            {selectedBundle && <p className="text-xs text-muted">Composición de catálogo: {selectedBundle.name}. Los cupos permanecen separados por módulo.</p>}
          </div> : <p className="mt-4 text-sm text-muted">Selecciona una opción de facturación.</p>}
        </div>
      </section>

      <section className="grid gap-6 border-t border-card-border pt-8 md:grid-cols-2">
        <div><h2 className="text-lg font-bold">Alcance del complemento de nómina</h2><p className="mt-2 text-sm leading-6 text-muted">Registro de trabajadores, ingreso de valores previamente calculados, generación, firma y transmisión de documentos electrónicos, notas de ajuste dentro del cupo e historial.</p><p className="mt-3 text-sm leading-6 text-muted"><strong className="text-foreground">No incluye:</strong> liquidación laboral integral, cálculo automático de prestaciones, PILA, pagos salariales ni asesoría laboral.</p></div>
        <div><h2 className="text-lg font-bold">Condiciones y capacidad</h2><ul className="mt-2 space-y-2 text-sm leading-6 text-muted"><li>Una suscripción cubre un NIT. Los cupos mensuales y anuales son distintos.</li><li>Soporte de lunes a viernes, 8:00 a. m.–6:00 p. m. (Colombia): objetivo de primera respuesta hasta 1 día hábil; prioritario hasta 4 horas hábiles. No garantiza resolución.</li><li>Recargas propuestas sujetas a capacidad: 100 por $19.900, 300 por $49.900, 500 por $79.900. Vencen al cierre del período; no están disponibles para venta automática.</li><li>Capacidades de inventario, caja, sucursales, reportes y transmisión están sujetas a verificación de implementación y proveedor.</li></ul></div>
      </section>
    </>}

    <footer className="flex gap-3 rounded-2xl border border-card-border p-4 text-xs leading-5 text-muted"><ShieldCheck size={17} className="mt-0.5 shrink-0" /><p>Esta página presenta únicamente una propuesta privada; no inicia una suscripción ni procesa pagos. La autorización como proveedor tecnológico ante la DIAN no se afirma aquí y debe verificarse por separado.</p></footer>
  </main>;
}
