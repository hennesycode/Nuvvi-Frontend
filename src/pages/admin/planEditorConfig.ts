import type { Plan } from "@/types";

export type PlanDraft = Pick<Plan,
  | "name" | "code" | "short_description" | "description" | "target_audience"
  | "commercial_badge" | "display_order" | "catalog_status" | "visibility"
  | "plan_type" | "monthly_price" | "yearly_price" | "monthly_certificate_fee"
  | "quote_only" | "annual_document_quota" | "category" | "features" | "max_users"
  | "accountant_users" | "max_issuers" | "max_branches" | "max_documents_per_month"
  | "max_employees" | "requires_base_plan" | "certificate_included_annual"
  | "support_level" | "has_inventory" | "has_cash_register" | "has_api_access" | "is_active"
>;

export const blankPlanDraft: PlanDraft = {
  name: "", code: "", short_description: "", description: "", target_audience: "",
  commercial_badge: "", display_order: 0, catalog_status: "draft", visibility: "private",
  plan_type: "invoicing", monthly_price: "", yearly_price: "", monthly_certificate_fee: "119000",
  quote_only: false, annual_document_quota: 0, category: null,
  features: [], max_users: 1, accountant_users: 1, max_issuers: 1, max_branches: 1,
  max_documents_per_month: 0, max_employees: 0, requires_base_plan: false,
  certificate_included_annual: true, support_level: "standard", has_inventory: true,
  has_cash_register: true, has_api_access: false, is_active: false,
};

export type PlanTemplateId = "blank" | "nuvvi-inicio" | "nuvvi-negocio" | "nuvvi-crecimiento" | "payroll-initial" | "payroll-business" | "payroll-plus" | "enterprise";

export const planTemplateNames: Record<PlanTemplateId, string> = {
  blank: "Desde cero",
  "nuvvi-inicio": "NUVVI Inicio",
  "nuvvi-negocio": "NUVVI Negocio",
  "nuvvi-crecimiento": "NUVVI Crecimiento",
  "payroll-initial": "Nómina Inicial",
  "payroll-business": "Nómina Negocio",
  "payroll-plus": "Nómina Plus",
  enterprise: "Plan personalizado",
};

const invoicingBenefits = [
  ["Facturación electrónica", "Emite documentos electrónicos para tu operación."],
  ["Notas crédito y débito", "Gestiona ajustes a los documentos emitidos."],
  ["Documento soporte electrónico", "Genera documentos soporte desde la plataforma."],
  ["Documento equivalente POS", "Gestiona documentos equivalentes POS."],
  ["Eventos RADIAN", "Consulta y gestiona eventos RADIAN disponibles."],
  ["Clientes y productos", "Organiza clientes, productos y servicios."],
  ["Cotizaciones", "Prepara cotizaciones para tus clientes."],
  ["Inventario y caja", "Funciones incluidas en los planes principales de facturación."],
  ["Reportes y correo", "Consulta ventas y comparte documentos por correo."],
] as const;

export function generatedPlanBenefits(plan: PlanDraft): Plan["features"] {
  if (plan.plan_type === "payroll_addon") {
    return [{ title: "Nómina electrónica", items: [
      { title: "Transmisión de nómina electrónica", description: "Emite documentos con importes previamente calculados." },
      { title: "Hasta " + plan.max_employees + " empleados", description: "Límite de trabajadores del complemento." },
      { title: plan.annual_document_quota.toLocaleString("es-CO") + " documentos al año", description: "Cupo independiente del plan de facturación." },
      { title: "Requiere facturación activa", description: "Comparte el certificado vigente del mismo NIT cuando aplique." },
      { title: "Sin liquidación laboral integral", description: "No incluye cálculos laborales ni aportes PILA." },
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
      { title: `${plan.annual_document_quota.toLocaleString("es-CO")} documentos al año`, description: `${plan.max_documents_per_month.toLocaleString("es-CO")} documentos por mes en modalidad mensual.` },
      { title: `Hasta ${plan.max_users} usuarios administrativos`, description: "Accesos de acuerdo con los límites contratados." },
      { title: `${plan.accountant_users} acceso(s) para contador`, description: "Acceso de consulta para el contador." },
      { title: `${plan.max_branches} sucursal(es)`, description: "Sucursales del mismo NIT emisor." },
      { title: plan.support_level === "priority" ? "Soporte prioritario" : "Soporte estándar", description: "Atención en el horario definido por NUVVI." },
      { title: "Certificado digital anual incluido", description: "Incluido en la modalidad anual para un NIT." },
      { title: "Nómina electrónica opcional", description: "Se contrata como complemento independiente." },
    ] },
  ];
}
