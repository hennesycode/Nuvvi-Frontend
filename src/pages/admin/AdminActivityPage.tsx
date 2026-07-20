import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Search, XCircle } from "lucide-react";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApiResponse, AuditLog } from "@/types";

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "success", label: "Exitoso" },
  { value: "error", label: "Error" },
  { value: "warning", label: "Advertencia" },
];

const statusStyles = {
  success: "bg-[#D8F5EB] text-[#178C68]",
  error: "bg-[#FDE8E8] text-[#C94455]",
  warning: "bg-[#FFF3E0] text-[#B97812]",
};

const statusIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
};

function toApiDate(value: string, endOfDay = false) {
  if (!value) return "";
  return `${value}T${endOfDay ? "23:59:59" : "00:00:00"}-05:00`;
}

function actionLabel(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AdminActivityPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    if (startDate) params.set("start_date", toApiDate(startDate));
    if (endDate) params.set("end_date", toApiDate(endDate, true));
    return params.toString();
  }, [endDate, page, search, startDate, status]);

  const activityQuery = useQuery({
    queryKey: ["activity", queryParams],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AuditLog>>(`/activity/?${queryParams}`);
      return data;
    },
  });

  const logs = activityQuery.data?.results ?? [];
  const total = activityQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope">Actividad del sistema</h1>
          <p className="mt-1 text-sm text-[#6C8398]">Registro de acciones, errores, correos, accesos y cambios administrativos con hora Colombia.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#D9ECFA] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(79,159,240,0.04)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#246FC1]"><Activity size={20} /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#6C8398]">Eventos registrados</p>
            <p className="text-xl font-extrabold text-[#102F4B]">{total}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[#D9ECFA] bg-white p-4 shadow-[0_2px_12px_rgba(79,159,240,0.04)] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_.8fr_.8fr_.8fr_auto]">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-[#39566F]">Buscar</span>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" />
              <input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Usuario, correo, identificación, ruta o acción"
                className="h-11 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] pl-9 pr-3 text-sm text-[#102F4B] outline-none focus:ring-2 focus:ring-[#4F9FF0]/20"
              />
            </div>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-[#39566F]">Estado</span>
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm text-[#102F4B] outline-none focus:ring-2 focus:ring-[#4F9FF0]/20">
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-[#39566F]">Desde</span>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" />
              <input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] pl-9 pr-3 text-sm text-[#102F4B] outline-none focus:ring-2 focus:ring-[#4F9FF0]/20" />
            </div>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-[#39566F]">Hasta</span>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" />
              <input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] pl-9 pr-3 text-sm text-[#102F4B] outline-none focus:ring-2 focus:ring-[#4F9FF0]/20" />
            </div>
          </label>
          <div className="flex items-end">
            <button onClick={resetFilters} className="h-11 w-full rounded-xl border border-[#D9ECFA] px-4 text-sm font-semibold text-[#39566F] transition-colors hover:bg-[#F8FCFF] lg:w-auto">Limpiar</button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#D9ECFA] bg-white shadow-[0_2px_12px_rgba(79,159,240,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-[#F8FCFF] text-xs uppercase tracking-wide text-[#6C8398]">
              <tr>
                <th className="px-5 py-3 text-left font-bold">Fecha y hora</th>
                <th className="px-5 py-3 text-left font-bold">Estado</th>
                <th className="px-5 py-3 text-left font-bold">Acción</th>
                <th className="px-5 py-3 text-left font-bold">Usuario</th>
                <th className="px-5 py-3 text-left font-bold">Solicitud</th>
                <th className="px-5 py-3 text-left font-bold">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF6FC]">
              {logs.map((log) => {
                const StatusIcon = statusIcons[log.status];
                return (
                  <tr key={log.id} className="align-top transition-colors hover:bg-[#F8FCFF]/70">
                    <td className="px-5 py-4 text-[#39566F]"><div className="flex items-center gap-2"><Clock size={15} className="text-[#6C8398]" />{log.created_at_colombia}</div></td>
                    <td className="px-5 py-4"><span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", statusStyles[log.status])}><StatusIcon size={14} />{log.status_label}</span></td>
                    <td className="px-5 py-4"><p className="font-semibold text-[#102F4B]">{actionLabel(log.action)}</p><p className="text-xs text-[#6C8398]">{log.entity}{log.entity_id ? ` #${log.entity_id}` : ""}</p></td>
                    <td className="px-5 py-4"><p className="font-semibold text-[#102F4B]">{log.actor_name || "Sistema"}</p><p className="text-xs text-[#6C8398]">{log.actor_email || "Sin correo"}</p><p className="text-xs text-[#6C8398]">{log.actor_username ? `Usuario: ${log.actor_username}` : "Sin usuario"}{log.actor_identification ? ` · ID: ${log.actor_identification}` : ""}</p></td>
                    <td className="px-5 py-4"><p className="text-[#39566F]">{log.request_method || "-"} {log.request_path || ""}</p><p className="text-xs text-[#6C8398]">IP: {log.ip_address || "No disponible"}</p></td>
                    <td className="px-5 py-4"><p className="max-w-[360px] text-[#39566F]">{log.message || "Sin detalle"}</p>{log.error_message && <p className="mt-1 max-w-[360px] rounded-lg bg-[#FDE8E8] px-2 py-1 text-xs text-[#C94455]">{log.error_message}</p>}</td>
                  </tr>
                );
              })}
              {!activityQuery.isLoading && logs.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#6C8398]">No hay actividad para los filtros seleccionados.</td></tr>
              )}
              {activityQuery.isLoading && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#6C8398]">Cargando actividad...</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#D9ECFA] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#6C8398]">Página {page} de {totalPages} · {total} registros</p>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 rounded-xl" disabled={page <= 1 || activityQuery.isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} className="mr-1" />Anterior</Button>
            <Button variant="outline" className="h-10 rounded-xl" disabled={page >= totalPages || activityQuery.isLoading} onClick={() => setPage((current) => current + 1)}>Siguiente<ChevronRight size={16} className="ml-1" /></Button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
