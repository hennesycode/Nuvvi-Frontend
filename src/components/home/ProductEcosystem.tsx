import { useNavigate } from "react-router-dom";
import { Reveal, RevealStagger, RevealItem } from "./Reveal";
import { ArrowRight } from "lucide-react";

interface ProductCardProps {
  title: string;
  text: string;
  cta: string;
  status?: "available" | "beta" | "soon";
}

const statusBadge: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-[#D8F5EB] text-[#178C68]" },
  beta: { label: "Beta", color: "bg-[#E8F0FE] text-[#246FC1]" },
  soon: { label: "Próximamente", color: "bg-[#F5F0E6] text-[#B97812]" },
};

export function ProductCard({ title, text, cta, status }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[20px] border border-[#D9ECFA] p-6 flex flex-col shadow-[0_2px_12px_rgba(79,159,240,0.04)] hover:shadow-[0_6px_24px_rgba(79,159,240,0.08)] hover:-translate-y-1 hover:border-[#4F9FF0] transition-all duration-[220ms]">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-[#102F4B] font-manrope">{title}</h3>
          {status && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusBadge[status]?.color ?? ""}`}>
              {statusBadge[status]?.label}
            </span>
          )}
        </div>
        <p className="text-sm text-[#6C8398] leading-[1.6]">{text}</p>
      </div>
      <button
        onClick={() => navigate("/login")}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F9FF0] hover:text-[#246FC1] transition-colors group"
      >
        {cta}
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

const products = [
  { title: "Facturación electrónica", text: "Crea, envía y consulta facturas, notas crédito y notas débito con su estado y trazabilidad.", cta: "Conocer facturación", status: "available" as const },
  { title: "Nómina electrónica", text: "Organiza la generación y transmisión de los documentos soporte de pago de nómina electrónica.", cta: "Conocer nómina", status: "soon" as const },
  { title: "POS electrónico", text: "Gestiona los documentos equivalentes electrónicos generados en tus puntos de venta.", cta: "Conocer POS", status: "soon" as const },
  { title: "Documento soporte", text: "Registra adquisiciones realizadas a proveedores no obligados a expedir factura de venta.", cta: "Conocer documento soporte", status: "soon" as const },
  { title: "Eventos RADIAN", text: "Consulta y gestiona eventos asociados a la recepción, entrega y aceptación de las facturas.", cta: "Conocer RADIAN", status: "soon" as const },
  { title: "Dashboard multicliente", text: "Cambia entre empresas, revisa alertas y controla la operación desde una vista central.", cta: "Conocer multiempresa", status: "soon" as const },
  { title: "Ventas y compras", text: "Centraliza los movimientos que alimentan tus reportes y procesos de conciliación.", cta: "Ver gestión", status: "beta" as const },
  { title: "Asistente Nuvvi", text: "Obtén explicaciones contextuales, sugerencias y orientación durante cada proceso.", cta: "Conocer el asistente", status: "beta" as const },
  { title: "Soporte técnico", text: "Encuentra ayuda, documentación y acompañamiento cuando lo necesites.", cta: "Ir al soporte", status: "available" as const },
];

export function ProductEcosystem() {
  return (
    <section className="bg-white py-24 md:py-28 lg:py-[120px]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#246FC1] uppercase tracking-wider mb-3">Un ecosistema conectado</p>
            <h2 className="text-[32px] md:text-[40px] lg:text-[46px] font-extrabold text-[#102F4B] leading-[1.12] max-w-[680px] mx-auto font-manrope">
              Todo lo que necesitas para operar, revisar y avanzar.
            </h2>
            <p className="text-lg text-[#39566F] leading-[1.6] mt-4 max-w-[620px] mx-auto">
              Cada módulo comparte la misma información para evitar reprocesos y darte una visión más clara de tu empresa.
            </p>
          </div>
        </Reveal>

        <RevealStagger>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <RevealItem key={p.title}>
                <ProductCard {...p} />
              </RevealItem>
            ))}
          </div>
        </RevealStagger>
      </div>
    </section>
  );
}
