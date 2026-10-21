import type { Plan } from "@/types";

type PlanDraftFields = Pick<Plan,
  | "name" | "code" | "short_description" | "description" | "target_audience"
  | "commercial_badge" | "display_order" | "catalog_status" | "visibility"
  | "plan_type" | "monthly_price" | "yearly_price" | "monthly_certificate_fee"
  | "quote_only" | "annual_document_quota" | "category" | "features" | "max_users"
  | "accountant_users" | "max_issuers" | "max_branches" | "max_documents_per_month"
  | "max_employees" | "requires_base_plan" | "certificate_included_annual"
  | "support_level" | "has_inventory" | "has_cash_register" | "has_api_access" | "is_active" | "quotation_scope"
>;

export type PlanDraft = Omit<PlanDraftFields,
  "annual_document_quota" | "max_users" | "accountant_users" | "max_branches" | "max_documents_per_month" | "max_employees"
> & {
  annual_document_quota: number;
  max_users: number;
  accountant_users: number;
  max_branches: number;
  max_documents_per_month: number;
  max_employees: number;
};

export const blankPlanDraft: PlanDraft = {
  name: "", code: "", short_description: "", description: "", target_audience: "",
  commercial_badge: "", display_order: 0, catalog_status: "draft", visibility: "private",
  plan_type: "invoicing", monthly_price: "", yearly_price: "", monthly_certificate_fee: "119000",
  quote_only: false, annual_document_quota: 0, category: null,
  features: [], max_users: 1, accountant_users: 1, max_issuers: 1, max_branches: 1,
  max_documents_per_month: 0, max_employees: 0, requires_base_plan: false,
  certificate_included_annual: true, support_level: "standard", has_inventory: false,
  has_cash_register: false, has_api_access: false, is_active: false,
  quotation_scope: { document_volume: "", users: "", branches: "", certificate: "", implementation: "", support: "", integrations: "" },
};

const invoicingBenefits = [
  ["Facturación electrónica", "Emite documentos electrónicos para tu operación."],
  ["Notas crédito y débito", "Gestiona ajustes a los documentos emitidos."],
  ["Documento soporte electrónico", "Genera documentos soporte desde la plataforma."],
  ["Documento equivalente POS", "Gestiona documentos equivalentes POS."],
  ["Eventos RADIAN", "Consulta y gestiona eventos RADIAN disponibles."],
  ["Clientes y productos", "Organiza clientes, productos y servicios."],
  ["Cotizaciones", "Prepara cotizaciones para tus clientes."],
  ["Reportes y correo", "Consulta ventas y comparte documentos por correo."],
] as const;

export function generatedPlanBenefits(plan: PlanDraft): Plan["features"] {
  if (plan.plan_type === "payroll_addon") {
    return [{ title: "Nómina electrónica", items: [
      { title: "Transmisión de nómina electrónica", description: "Emite documentos con importes previamente calculados." },
      { title: "Hasta " + (plan.max_employees ?? 0) + " empleados", description: "Límite de trabajadores del complemento." },
      { title: (plan.annual_document_quota ?? 0).toLocaleString("es-CO") + " documentos al año", description: "Cupo independiente del plan de facturación." },
      { title: "Requiere facturación activa", description: "Comparte el certificado vigente del mismo NIT cuando aplique." },
      { title: "Alcance laboral delimitado", description: "No incluye liquidación integral, cálculo automático de prestaciones, PILA, pagos salariales ni asesoría laboral." },
    ] }];
  }

  if (plan.plan_type === "enterprise") {
    return [{ title: "Servicio empresarial", items: [
      { title: "Configuración personalizada", description: "Volúmenes, usuarios, sucursales y soporte según cotización." },
    ] }];
  }

  return [
    { title: "Facturación y gestión", items: invoicingBenefits.map(([title, description]) => ({ title, description })) },
    { title: "Límites del plan", items: [
      { title: `${(plan.annual_document_quota ?? 0).toLocaleString("es-CO")} documentos al año`, description: `${(plan.max_documents_per_month ?? 0).toLocaleString("es-CO")} documentos por mes en modalidad mensual.` },
      { title: `Hasta ${plan.max_users} usuarios administrativos`, description: "Accesos de acuerdo con los límites contratados." },
      { title: `${plan.accountant_users} acceso(s) para contador`, description: "Acceso de consulta para el contador." },
      { title: `${plan.max_branches} sucursal(es)`, description: "Sucursales del mismo NIT emisor." },
      { title: plan.support_level === "priority" ? "Soporte prioritario" : "Soporte estándar", description: "Atención en el horario definido por NUVVI." },
      { title: plan.certificate_included_annual ? "Certificado digital anual incluido" : "Certificado según propuesta", description: "Un certificado por NIT; en mensual se cobra una vez cada 12 meses." },
      { title: "Nómina electrónica opcional", description: "Se contrata como complemento independiente." },
    ] },
  ];
}
