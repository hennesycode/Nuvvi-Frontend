import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useLogout, useCurrentUser } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/usuarios", icon: UserCog, label: "Usuarios", superadminOnly: true },
  { to: "/admin/clientes", icon: Users, label: "Clientes" },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { logout } = useLogout();
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperadmin = user?.is_superuser || user?.admin_role === "superadmin";
  const items = sidebarItems.filter((item) => !item.superadminOnly || isSuperadmin);

  useEffect(() => {
    if (!userMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-[#D9ECFA] transition-all duration-300 shrink-0",
          collapsed ? "w-[72px]" : "w-[248px]"
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-[#D9ECFA] gap-3">
          <button onClick={() => navigate("/")} className="shrink-0">
            <img src="/logo-favicon-nuvvi.png" alt="Nuvvi" className="h-8 w-8" />
          </button>
          {!collapsed && (
            <span className="text-[#102F4B] font-bold text-sm font-manrope">NUVVI</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`ml-auto p-1 rounded-lg text-[#6C8398] hover:bg-[#F8FCFF] transition-colors ${collapsed ? "rotate-180 mx-auto" : ""}`}
          >
            <ChevronDown size={16} className={`${collapsed ? "-rotate-90" : "rotate-90"}`} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={cn(
                  "flex items-center gap-3 w-full rounded-xl text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5",
                  isActive
                    ? "bg-[#E8F0FE] text-[#246FC1]"
                    : "text-[#39566F] hover:bg-[#F8FCFF] hover:text-[#102F4B]"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#D9ECFA]">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl text-sm font-medium text-[#6C8398] hover:text-[#C94455] hover:bg-[#FDE8E8] transition-all",
              collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"
            )}
            title={collapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-white flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-[#D9ECFA]">
                <div className="flex items-center gap-2.5">
                  <img src="/logo-favicon-nuvvi.png" alt="Nuvvi" className="h-8 w-8" />
                  <span className="text-[#102F4B] font-bold text-sm font-manrope">NUVVI</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-[#6C8398] hover:bg-[#F8FCFF]">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {items.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <button
                      key={item.to}
                      onClick={() => { navigate(item.to); setMobileOpen(false); }}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-[#E8F0FE] text-[#246FC1]"
                          : "text-[#39566F] hover:bg-[#F8FCFF]"
                      )}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-[#D9ECFA]">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#6C8398] hover:text-[#C94455] hover:bg-[#FDE8E8] transition-all">
                  <LogOut size={18} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-5 border-b border-[#D9ECFA] bg-white shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-[#39566F] hover:bg-[#F8FCFF] lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div />
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-[#6C8398] hover:bg-[#F8FCFF] transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C94455]" />
            </button>
            <div ref={userMenuRef} className="relative border-l border-[#D9ECFA] pl-3">
              <button
                type="button"
                onClick={() => setUserMenuOpen((current) => !current)}
                className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-[#F8FCFF]"
              >
                <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] flex items-center justify-center text-[#246FC1] font-bold text-sm">
                  {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-[#102F4B] leading-none">{user?.full_name || "Admin"}</p>
                  <p className="text-[10px] text-[#6C8398] leading-none mt-0.5">Administrador</p>
                </div>
                <ChevronDown size={14} className={`hidden sm:block text-[#6C8398] transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-[#D9ECFA] bg-white p-2 shadow-[0_18px_45px_rgba(16,47,75,0.16)]"
                  >
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); navigate("/admin/perfil"); }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#39566F] transition-colors hover:bg-[#F8FCFF] hover:text-[#102F4B]"
                    >
                      <UserCircle size={17} /> Mi perfil
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#C94455] transition-colors hover:bg-[#FDE8E8]"
                    >
                      <LogOut size={17} /> Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-[#F8FCFF] p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
