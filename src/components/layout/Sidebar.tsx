import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  RefreshCw,
  Settings,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { env } from "@/config/env";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tenants", icon: Building2, label: "Tenants" },
  { to: "/plans", icon: CreditCard, label: "Planes" },
  { to: "/subscriptions", icon: RefreshCw, label: "Suscripciones" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex w-64 flex-col border-r border-card-border bg-[#010a07]/95 backdrop-blur-xl">
        <SidebarContent />
      </aside>
    </>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5 border-b border-card-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-nuvvi to-teal flex items-center justify-center">
            <span className="text-black font-bold text-sm">N</span>
          </div>
          <div>
            <span className="text-sm font-bold text-gradient">{env.APP_NAME}</span>
            <p className="text-[10px] text-muted">by Hennesy</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted hover:text-foreground lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                isActive
                  ? "bg-nuvvi/10 text-nuvvi border border-nuvvi/20"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              )
            }
          >
            <item.icon size={18} className={cn("transition-colors duration-200")} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-card-border p-3">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
              isActive
                ? "bg-nuvvi/10 text-nuvvi border border-nuvvi/20"
                : "text-muted hover:text-foreground hover:bg-white/5"
            )
          }
        >
          <Settings size={18} />
          <span>Configuración</span>
        </NavLink>
      </div>
    </div>
  );
}
