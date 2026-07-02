import { motion } from "framer-motion";
import { Check, Tag, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";

const plans = [
  {
    code: "basic",
    name: "Básico",
    price: "$49",
    period: "/mes",
    color: "from-gray-500 to-gray-400",
    features: ["1 empresa emisora", "100 documentos/mes", "Soporte por email"],
    highlight: false,
  },
  {
    code: "pro",
    name: "Pro",
    price: "$99",
    period: "/mes",
    color: "from-nuvvi to-teal",
    features: ["5 empresas emisoras", "1,000 documentos/mes", "Inventario básico", "Caja registradora", "Soporte prioritario"],
    highlight: true,
  },
  {
    code: "enterprise",
    name: "Enterprise",
    price: "$249",
    period: "/mes",
    color: "from-teal to-blue-400",
    features: ["Empresas ilimitadas", "Documentos ilimitados", "Inventario completo", "Caja + Ventas", "API Access", "Soporte 24/7"],
    highlight: false,
  },
  {
    code: "api",
    name: "API",
    price: "$149",
    period: "/mes",
    color: "from-purple-500 to-pink-400",
    features: ["API completa", "Webhooks", "SDK disponibles", "Documentación", "Sandbox gratuito"],
    highlight: false,
  },
];

export function PlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Planes" subtitle="Elige el plan ideal para tu negocio" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={cn(
              "glass rounded-xl p-6 space-y-4 relative overflow-hidden transition-all duration-300 hover:border-nuvvi/30",
              plan.highlight && "border-nuvvi/30"
            )}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0">
                <div className="bg-nuvvi text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wide uppercase">
                  Popular
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${plan.color} bg-opacity-10`}>
                <Tag size={16} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{plan.price}</span>
              <span className="text-sm text-muted">{plan.period}</span>
            </div>

            <ul className="space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted">
                  <Check size={14} className="text-nuvvi shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={cn(
                "w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                plan.highlight
                  ? "bg-nuvvi text-black hover:bg-nuvvi/90 shadow-lg shadow-nuvvi/20"
                  : "border border-card-border text-foreground hover:bg-card-hover"
              )}
            >
              Seleccionar {plan.name}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
