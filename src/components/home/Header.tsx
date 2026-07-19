import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { label: "Soluciones", hasMega: true },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Para quién", href: "#perfiles" },
  { label: "Soporte", href: "#soporte" },
];

const megaMenuSections = [
  {
    title: "Documentos electrónicos",
    items: [
      { name: "Facturación electrónica", desc: "Crea, envía y consulta facturas", status: "available" as const },
      { name: "Nómina electrónica", desc: "Soporte de pago de nómina", status: "soon" as const },
      { name: "POS electrónico", desc: "Documentos equivalentes", status: "soon" as const },
      { name: "Documento soporte", desc: "Para no obligados a facturar", status: "soon" as const },
      { name: "Eventos RADIAN", desc: "Recepción y aceptación", status: "soon" as const },
    ],
  },
  {
    title: "Gestión",
    items: [
      { name: "Ventas y compras", desc: "Centraliza tus movimientos", status: "beta" as const },
      { name: "Conciliación de IVA", desc: "Detecta diferencias", status: "beta" as const },
      { name: "Dashboard multicliente", desc: "Varias empresas", status: "soon" as const },
    ],
  },
  {
    title: "Ayuda",
    items: [
      { name: "Asistente con IA", desc: "Orientación contextual", status: "beta" as const },
      { name: "Centro de ayuda", desc: "Guías y documentación", status: "available" as const },
      { name: "Soporte técnico", desc: "Acompañamiento", status: "available" as const },
    ],
  },
];

const statusLabels: Record<string, string> = {
  available: "Disponible",
  soon: "Próximamente",
  beta: "Beta",
};

const statusColors: Record<string, string> = {
  available: "bg-[#D8F5EB] text-[#178C68]",
  soon: "bg-[#F5F0E6] text-[#B97812]",
  beta: "bg-[#E8F0FE] text-[#246FC1]",
};

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/92 backdrop-blur-[16px] border-b border-[#D9ECFA] shadow-[0_1px_8px_rgba(79,159,240,0.06)]"
            : "bg-white/70 backdrop-blur-[6px] border-b border-transparent"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10 flex items-center justify-between" style={{ height: scrolled ? 72 : 76 }}>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9FF0] rounded-lg px-1"
            aria-label="Nuvvi inicio"
          >
            <img src="/logo-favicon-nuvvi.png" alt="" className="h-[38px] w-[38px]" />
            <span className="text-[#102F4B] font-bold text-lg tracking-tight font-manrope">NUVVI</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
            {navLinks.map((link) =>
              link.hasMega ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <button
                    onClick={() => setMegaOpen(!megaOpen)}
                    className={`px-3.5 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                      megaOpen ? "text-[#246FC1] bg-[#EDF8FF]" : "text-[#39566F] hover:text-[#102F4B] hover:bg-[#F8FCFF]"
                    }`}
                  >
                    {link.label}
                  </button>
                  <AnimatePresence>
                    {megaOpen && <MegaMenu onMouseLeave={() => setMegaOpen(false)} />}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href!)}
                  className="px-3.5 py-2 rounded-lg text-[15px] font-medium text-[#39566F] hover:text-[#102F4B] hover:bg-[#F8FCFF] transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-xl text-[15px] font-semibold text-[#39566F] hover:text-[#102F4B] hover:bg-[#F8FCFF] transition-all border border-transparent hover:border-[#D9ECFA]"
              aria-label="Iniciar sesión en Nuvvi"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-xl text-[15px] font-semibold text-white bg-[#4F9FF0] hover:bg-[#348BE3] transition-all shadow-[0_2px_8px_rgba(79,159,240,0.25)] hover:shadow-[0_4px_12px_rgba(79,159,240,0.35)] flex items-center gap-1.5"
            >
              Comenzar
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#39566F] hover:text-[#102F4B] transition-colors"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-[#39566F] hover:bg-[#F8FCFF] transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div style={{ height: 76 }} aria-hidden="true" />
    </>
  );
}

function MegaMenu({ onMouseLeave }: { onMouseLeave?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white rounded-2xl border border-[#D9ECFA] shadow-[0_16px_48px_rgba(11,41,68,0.08)] p-6 flex gap-10 min-w-[720px]">
        {megaMenuSections.map((section) => (
          <div key={section.title} className="flex-1">
            <h4 className="text-xs font-semibold text-[#6C8398] uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h4>
            <div className="space-y-1">
              {section.items.map((item) => (
                <a
                  key={item.name}
                  href="#"
                  className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-[#F8FCFF] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#102F4B]">{item.name}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <span className="text-xs text-[#6C8398] mt-0.5">{item.desc}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
