import { Building2, Check, Copy, FileText, MoreHorizontal, Pencil, UsersRound } from "lucide-react";
import type { Plan } from "@/types";
import { Button } from "@/components/ui/button";

interface PlanCardProps {
  plan: Plan;
  categoryName?: string;
  onDuplicate: (plan: Plan) => void;
  onPublish: (plan: Plan) => void;
  onApproveProposal: (plan: Plan) => void;
  onValidateTax: (plan: Plan, note: string) => void;
  onCreateVersion: (plan: Plan) => void;
  onRetire: (plan: Plan) => void;
  onArchive: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onEdit: (plan: Plan) => void;
}

function money(value: string | null) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function PlanCard({
  plan,
  categoryName,
  onDuplicate,
  onPublish,
  onApproveProposal,
  onValidateTax,
  onCreateVersion,
  onRetire,
  onArchive,
  onDelete,
  onEdit,
}: PlanCardProps) {
  const published = plan.catalog_status === "published";
  const statusLabel = {
    draft: "Borrador",
    published: "Publicado",
    retired: "Retirado",
    archived: "Archivado",
  }[plan.catalog_status];
  const visibleFeatures = plan.features
    ?.flatMap((section) => section.items)
    .filter((feature) => feature.is_visible !== false) ?? [];
  const Icon = plan.plan_type === "payroll_addon"
    ? UsersRound
    : plan.plan_type === "enterprise"
      ? Building2
      : FileText;

  return (
    <article className={`group flex min-h-[370px] flex-col overflow-hidden rounded-2xl border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(16,47,75,0.08)] ${
      plan.commercial_badge
        ? "border-[#79B7EC] shadow-[0_4px_16px_rgba(79,159,240,0.09)]"
        : "border-[#D9ECFA]"
    }`}>
      {plan.commercial_badge && <div className="h-1 bg-[#4F9FF0]" />}

      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FD] text-[#246FC1]">
            <Icon size={19} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${published ? "bg-[#E7F5EF] text-[#178C68]" : "bg-[#F1F6FA] text-[#647D92]"}`}>
                {statusLabel}
              </span>
              {plan.commercial_status === "proposal" && <span className="rounded-md bg-[#FFF4DB] px-2 py-1 text-[10px] font-bold text-[#8C6718]">Propuesta · IVA pendiente</span>}
              {plan.version_number > 1 && <span className="rounded-md bg-[#F1F6FA] px-2 py-1 text-[10px] font-bold text-[#647D92]">Versión {plan.version_number}</span>}
            </div>
            <h2 className="truncate text-lg font-extrabold tracking-[-0.02em] text-[#102F4B]">{plan.name}</h2>
            <p className="mt-0.5 truncate text-xs text-[#8296A8]">{categoryName || (plan.plan_type === "payroll_addon" ? "Nómina electrónica" : plan.plan_type === "enterprise" ? "Empresarial" : "Facturación electrónica")}</p>
          </div>
        </div>

        <details className="relative shrink-0">
          <summary aria-label={`Acciones de ${plan.name}`} className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-[#70869A] transition hover:bg-[#F1F6FA] hover:text-[#246FC1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9FF0]">
            <MoreHorizontal size={18} />
          </summary>
          <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-[#D9ECFA] bg-white p-1.5 shadow-[0_12px_32px_rgba(16,47,75,0.14)]">
            <Action onClick={() => onDuplicate(plan)} icon={<Copy size={14} />}>Duplicar plan</Action>
            {plan.catalog_status === "draft" && <Action onClick={() => onEdit(plan)} icon={<Pencil size={14} />}>Editar borrador</Action>}
            {plan.catalog_status === "draft" && plan.commercial_status === "legacy" && <Action onClick={() => onPublish(plan)}>Publicar oferta anterior</Action>}
            {plan.catalog_status === "draft" && plan.commercial_status === "proposal" && <Action onClick={() => onApproveProposal(plan)}>Aprobar propuesta comercial</Action>}
            {plan.catalog_status === "draft" && plan.commercial_status === "proposal" && <Action onClick={() => { const note = window.prompt("Confirma la revisión tributaria e ingresa su referencia:"); if (note?.trim()) onValidateTax(plan, note.trim()); }}>Registrar validación tributaria</Action>}
            {plan.catalog_status === "draft" && plan.commercial_status === "approved" && plan.tax_validation_status === "validated" && <Action onClick={() => onPublish(plan)}>Publicar propuesta aprobada</Action>}
            {published && <Action onClick={() => onCreateVersion(plan)}>Crear versión</Action>}
            {published && <Action onClick={() => onRetire(plan)}>Retirar</Action>}
            {plan.catalog_status !== "archived" && <Action onClick={() => onArchive(plan)}>Archivar</Action>}
            {plan.catalog_status !== "published" && <Action destructive onClick={() => onDelete(plan)}>Eliminar</Action>}
          </div>
        </details>
      </div>

      <div className="px-5">
        <p className="min-h-10 text-sm leading-5 text-[#647D92]">{plan.short_description || plan.description || "Sin descripción del plan."}</p>
        <div className="mt-4 flex items-end justify-between gap-3 border-y border-[#EAF1F7] py-3.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8296A8]">{plan.quote_only ? "Modalidad" : "Desde"}</p>
            <p className="mt-0.5 text-[26px] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-[#102F4B]">{plan.quote_only ? "Cotización" : money(plan.monthly_price)}</p>
          </div>
          {!plan.quote_only && <span className="pb-0.5 text-xs text-[#8296A8]">/ mes</span>}
          {!plan.quote_only && Number(plan.yearly_price) > 0 && <div className="pb-0.5 text-right"><p className="text-[10px] font-semibold text-[#8296A8]">ANUAL</p><p className="text-sm font-bold tabular-nums text-[#39566F]">{money(plan.yearly_price)}</p></div>}
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        <div className="space-y-2.5">
          {visibleFeatures.slice(0, 4).map((feature, index) => (
            <div key={`${feature.title}-${index}`} className="flex items-start gap-2.5 text-sm text-[#39566F]">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E7F5EF] text-[#178C68]"><Check size={11} strokeWidth={2.5} /></span>
              <span className="line-clamp-1">{feature.title}</span>
            </div>
          ))}
          {visibleFeatures.length > 4 && <p className="pl-6 text-xs font-semibold text-[#246FC1]">+ {visibleFeatures.length - 4} beneficios más</p>}
          {visibleFeatures.length === 0 && <p className="text-xs text-[#8296A8]">Beneficios por configurar</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#EAF1F7] bg-[#FBFDFF] px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3 text-xs text-[#647D92]">
          <span className="whitespace-nowrap">{plan.plan_type === "enterprise" ? "Alcance por propuesta" : plan.plan_type === "payroll_addon" ? `${plan.max_employees ?? 0} empleados` : `${plan.max_users ?? 0} usuarios`}</span>
          <span className="h-3.5 w-px bg-[#D9E5EF]" />
          <span className="truncate">{plan.plan_type === "enterprise" ? "Por cotización" : plan.annual_document_quota ? `${plan.annual_document_quota.toLocaleString("es-CO")} docs/año` : `${plan.max_documents_per_month ?? 0} docs/mes`}</span>
        </div>
        {plan.catalog_status === "draft" && <Button variant="outline" onClick={() => onEdit(plan)} className="h-8 shrink-0 rounded-lg border-[#D9ECFA] px-3 text-xs font-bold text-[#246FC1] hover:bg-[#EAF4FD]">Editar</Button>}
      </div>
    </article>
  );
}

function Action({ children, onClick, icon, destructive = false }: { children: React.ReactNode; onClick: () => void; icon?: React.ReactNode; destructive?: boolean }) {
  return <button type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); onClick(); }} className={`flex min-h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs font-semibold transition hover:bg-[#F1F6FA] ${destructive ? "text-[#B54552] hover:bg-[#FFF1F1]" : "text-[#39566F]"}`}>
    {icon}<span>{children}</span>
  </button>;
}
