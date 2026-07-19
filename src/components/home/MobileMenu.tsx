import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sections = [
    {
      title: "Documentos electrónicos",
      items: ["Facturación electrónica", "Nómina electrónica", "POS electrónico", "Documento soporte", "Eventos RADIAN"],
    },
    {
      title: "Gestión",
      items: ["Ventas y compras", "Conciliación de IVA", "Dashboard multicliente"],
    },
    {
      title: "Ayuda",
      items: ["Asistente con IA", "Centro de ayuda", "Soporte técnico"],
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={menuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-[320px] max-w-[85vw] bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-label="Menú de navegación"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D9ECFA]">
              <button onClick={() => { onClose(); navigate("/"); }} className="flex items-center gap-2">
                <img src="/logo-favicon-nuvvi.png" alt="" className="h-8 w-8" />
                <span className="text-[#102F4B] font-bold text-lg font-manrope">NUVVI</span>
              </button>
              <button onClick={onClose} className="p-2 rounded-lg text-[#6C8398] hover:bg-[#F8FCFF]" aria-label="Cerrar menú">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              <div>
                <a href="#como-funciona" onClick={onClose} className="block py-3 text-[#102F4B] font-semibold text-base border-b border-[#F8FCFF]">
                  Cómo funciona
                </a>
                <a href="#perfiles" onClick={onClose} className="block py-3 text-[#102F4B] font-semibold text-base border-b border-[#F8FCFF]">
                  Para quién
                </a>
                <a href="#soporte" onClick={onClose} className="block py-3 text-[#102F4B] font-semibold text-base border-b border-[#F8FCFF]">
                  Soporte
                </a>
              </div>

              {sections.map((s) => (
                <div key={s.title}>
                  <h4 className="text-xs font-semibold text-[#6C8398] uppercase tracking-wider mb-2">{s.title}</h4>
                  <div className="space-y-0.5">
                    {s.items.map((item) => (
                      <a key={item} href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="block py-2 px-3 rounded-lg text-sm text-[#39566F] hover:bg-[#F8FCFF] transition-colors">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-[#D9ECFA] space-y-2.5">
              <button
                onClick={() => { onClose(); navigate("/login"); }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-[#39566F] border border-[#D9ECFA] hover:bg-[#F8FCFF] transition-all"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { onClose(); navigate("/login"); }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#4F9FF0] hover:bg-[#348BE3] transition-all shadow-[0_2px_8px_rgba(79,159,240,0.25)] flex items-center justify-center gap-1.5"
              >
                Comenzar
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
