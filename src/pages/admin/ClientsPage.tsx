import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, BarChart3, Building2, CheckCircle2, Eye, FileCheck2, Loader2, Pencil, Power, RefreshCw, Search, Settings, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Company } from "@/types";

type Environment = "sandbox" | "production";
type CatalogItem = Record<string, any>;

type CompanyForm = {
  request_id: string;
  company_name: string;
  nit: string;
  country_id: string;
  department_id: string;
  city_id: string;
  address: string;
  mobile: string;
  phone: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  environment: Environment;
};

const inputClass = "h-11 w-full rounded-xl border border-[#D9ECFA] bg-white px-3 text-sm text-[#102F4B] outline-none transition-all focus:ring-2 focus:ring-[#4F9FF0]/20";
const emptyForm = (environment: Environment): CompanyForm => ({ request_id: crypto.randomUUID(), company_name: "", nit: "", country_id: "", department_id: "", city_id: "", address: "", mobile: "", phone: "", first_name: "", last_name: "", email: "", password: "", password_confirmation: "", environment });

function formatDate(value?: string | null) {
  if (!value) return "Sin registro";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getApiErrorMessage(error: any, fallback: string) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  const key = Object.keys(data)[0];
  const message = key ? data[key] : null;
  if (Array.isArray(message)) return message[0];
  if (typeof message === "string") return message;
  return fallback;
}

function optionId(item: CatalogItem) {
  return String(item.id ?? item.value ?? item.code ?? item.uuid ?? "");
}

function optionLabel(item: CatalogItem) {
  return String(item.name ?? item.label ?? item.description ?? item.city ?? item.department ?? item.country ?? item.text ?? optionId(item));
}

function statusStyle(value?: string) {
  if (["REGISTERED", "ACTIVE", "READY_TO_INVOICE", "COMPANY_REGISTERED"].includes(value || "")) return "bg-[#D8F5EB] text-[#178C68]";
  if (["PENDING_CREATION", "PENDING_UPDATE", "DRAFT", "TAX_INFORMATION_PENDING", "DIAN_SOFTWARE_PENDING", "RESOLUTION_PENDING", "CERTIFICATE_PENDING"].includes(value || "")) return "bg-[#FFF3E0] text-[#B97812]";
  return "bg-[#FDE8E8] text-[#C94455]";
}

function StatusPill({ value, label }: { value?: string; label?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", statusStyle(value))}>{label || value || "Sin estado"}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">{label}</span>{children}</label>;
}

function SearchableObjectSelect({ label, value, options, placeholder, disabled, onChange }: { label: string; value: string; options: CatalogItem[]; placeholder: string; disabled?: boolean; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((item) => optionId(item) === value);
  const filtered = useMemo(() => options.filter((item) => optionLabel(item).toLowerCase().includes(query.toLowerCase())), [options, query]);
  return (
    <Field label={label}>
      <div className="relative">
        <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className={cn(inputClass, "flex items-center justify-between text-left disabled:bg-[#F8FCFF] disabled:text-[#8EA3B5]")}><span className={cn("truncate", !selected && "text-[#8EA3B5]")}>{selected ? optionLabel(selected) : placeholder}</span><Search size={15} className="text-[#6C8398]" /></button>
        {open && <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[#D9ECFA] bg-white shadow-[0_18px_45px_rgba(16,47,75,0.16)]"><div className="border-b border-[#EEF6FC] p-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." className="h-10 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm outline-none" /></div><div className="max-h-56 overflow-y-auto p-1">{filtered.map((item) => <button key={optionId(item)} type="button" onClick={() => { onChange(optionId(item)); setOpen(false); }} className={cn("w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors", optionId(item) === value ? "bg-[#E8F0FE] font-semibold text-[#246FC1]" : "text-[#39566F] hover:bg-[#F8FCFF]")}>{optionLabel(item)}</button>)}{!filtered.length && <p className="px-3 py-4 text-center text-xs text-[#6C8398]">Sin resultados.</p>}</div></div>}
      </div>
    </Field>
  );
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return <AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#102F4B]/35 p-4 backdrop-blur-sm"><motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} className={cn("max-h-[92vh] w-full overflow-hidden rounded-3xl border border-[#D9ECFA] bg-white shadow-2xl", wide ? "max-w-5xl" : "max-w-2xl")}><div className="flex items-center justify-between border-b border-[#EEF6FC] px-5 py-4"><h2 className="text-lg font-extrabold text-[#102F4B] font-manrope">{title}</h2><button onClick={onClose} className="rounded-xl p-2 text-[#6C8398] hover:bg-[#F8FCFF]"><X size={18} /></button></div><div className="max-h-[calc(92vh-72px)] overflow-y-auto p-5">{children}</div></motion.div></motion.div></AnimatePresence>;
}

export function ClientsPage() {
  const queryClient = useQueryClient();
  const [environment, setEnvironment] = useState<Environment>("sandbox");
  const [search, setSearch] = useState("");
  const [providerStatus, setProviderStatus] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const [selected, setSelected] = useState<Company | null>(null);
  const [editing, setEditing] = useState<Company | null>(null);
  const [creating, setCreating] = useState(false);
  const [statsCompany, setStatsCompany] = useState<Company | null>(null);
  const [settingsCompany, setSettingsCompany] = useState<Company | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [form, setForm] = useState<CompanyForm>(emptyForm(environment));

  const companiesQuery = useQuery({
    queryKey: ["companies", environment, search, providerStatus, localStatus],
    queryFn: async () => (await apiClient.get<Company[]>("/admin/companies/", { params: { environment, search, provider_status: providerStatus, local_status: localStatus } })).data,
  });
  const catalogsQuery = useQuery({ queryKey: ["company-catalogs", environment], queryFn: async () => (await apiClient.get<{ countries: CatalogItem[]; departments: CatalogItem[]; cities: CatalogItem[] }>("/admin/companies/catalogs/", { params: { environment } })).data });
  const syncStatusQuery = useQuery({ queryKey: ["company-provider-status", environment], queryFn: async () => (await apiClient.get<{ ready: boolean; operational_status: string; linked_companies_count: number }>("/admin/companies/provider-sync-status/", { params: { environment } })).data });

  const catalogs = catalogsQuery.data || { countries: [], departments: [], cities: [] };
  const filteredCities = catalogs.cities.filter((city) => !form.department_id || String(city.department_id ?? city.department ?? city.departmentId ?? "") === form.department_id || !String(city.department_id ?? city.department ?? city.departmentId ?? ""));
  const busy = companiesQuery.isLoading || catalogsQuery.isLoading;

  const createMutation = useMutation({
    mutationFn: async () => (await apiClient.post<Company>("/admin/companies/", form)).data,
    onSuccess: (company) => { toast.success("Empresa creada y sincronización MATIAS ejecutada"); queryClient.invalidateQueries({ queryKey: ["companies"] }); queryClient.invalidateQueries({ queryKey: ["company-provider-status"] }); setCreating(false); setSelected(company); setForm(emptyForm(environment)); setFormStep(1); },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo crear la empresa.")),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<CompanyForm> & { id: string }) => (await apiClient.patch<Company>(`/admin/companies/${payload.id}/`, { ...payload, environment })).data,
    onSuccess: (company) => { toast.success("Empresa actualizada correctamente"); queryClient.invalidateQueries({ queryKey: ["companies"] }); setEditing(null); setSelected(company); },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo actualizar la empresa.")),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "sync" | "enable-provider" | "disable-provider" | "archive" }) => (await apiClient.post<Company>(`/admin/companies/${id}/${action}/`, { environment })).data,
    onSuccess: (company, variables) => { toast.success(variables.action === "archive" ? "Empresa archivada localmente" : "Acción MATIAS ejecutada y registrada"); queryClient.invalidateQueries({ queryKey: ["companies"] }); setSelected(company); },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo ejecutar la acción.")),
  });

  const reconcileMutation = useMutation({
    mutationFn: async () => (await apiClient.post("/admin/companies/reconcile/", { environment })).data,
    onSuccess: (data: any) => { toast.success(`Reconciliación finalizada: ${data.updated} procesadas, ${data.errors} con error`); queryClient.invalidateQueries({ queryKey: ["companies"] }); },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo reconciliar con MATIAS.")),
  });

  const canCreateStep1 = form.company_name && form.nit && form.country_id && form.city_id && form.address && form.mobile;
  const canCreateStep2 = form.first_name && form.last_name && form.email && form.password && form.password === form.password_confirmation;
  const modalBusy = createMutation.isPending || updateMutation.isPending || actionMutation.isPending || reconcileMutation.isPending;

  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope">Empresas facturadoras</h1><p className="mt-1 text-sm text-[#6C8398]">Empresas o NIT que emitirán facturas desde NUVVI con sincronización MATIAS.</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => { setForm(emptyForm(environment)); setCreating(true); }} className="h-11 rounded-xl bg-[#4F9FF0] hover:bg-[#246FC1]"><Building2 size={16} className="mr-2" />Crear empresa</Button><Button variant="outline" onClick={() => reconcileMutation.mutate()} disabled={modalBusy} className="h-11 rounded-xl border-[#D9ECFA] bg-white text-[#39566F] hover:bg-[#F8FCFF]"><RefreshCw size={16} className="mr-2" />Sincronizar MATIAS</Button></div></div>

    <section className="grid gap-4 rounded-3xl border border-[#D9ECFA] bg-white p-5 shadow-[0_2px_18px_rgba(79,159,240,0.08)] lg:grid-cols-[1fr_auto_auto_auto]">
      <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por razón social, NIT o correo" className="h-11 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] pl-9 pr-3 text-sm outline-none" /></div>
      <select value={localStatus} onChange={(event) => setLocalStatus(event.target.value)} className={inputClass}><option value="">Estado local</option><option value="ACTIVE">Activa</option><option value="SUSPENDED">Suspendida</option><option value="ARCHIVED">Archivada</option></select>
      <select value={providerStatus} onChange={(event) => setProviderStatus(event.target.value)} className={inputClass}><option value="">Estado MATIAS</option><option value="REGISTERED">Registrada</option><option value="PENDING_CREATION">Creación pendiente</option><option value="SYNC_ERROR">Error</option><option value="REMOTE_DISABLED">Desactivada</option></select>
      <select value={environment} onChange={(event) => setEnvironment(event.target.value as Environment)} className={inputClass}><option value="sandbox">Sandbox</option><option value="production">Producción</option></select>
    </section>

    <section className="overflow-hidden rounded-3xl border border-[#D9ECFA] bg-white shadow-[0_2px_18px_rgba(79,159,240,0.08)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF6FC] px-5 py-4"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#E8F0FE] p-3 text-[#246FC1]"><FileCheck2 size={20} /></div><div><p className="font-bold text-[#102F4B]">Empresas vinculadas: {syncStatusQuery.data?.linked_companies_count ?? 0}</p><p className="text-xs text-[#6C8398]">Estado proveedor: {syncStatusQuery.data?.operational_status || "Sin diagnóstico"}</p></div></div><StatusPill value={syncStatusQuery.data?.ready ? "REGISTERED" : "PENDING_CREATION"} label={syncStatusQuery.data?.ready ? "Listo para registrar empresas" : "Conexión pendiente"} /></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#F8FCFF] text-xs uppercase tracking-wide text-[#6C8398]"><tr><th className="px-5 py-3">Empresa</th><th className="px-5 py-3">NIT</th><th className="px-5 py-3">Estado MATIAS</th><th className="px-5 py-3">Facturación</th><th className="px-5 py-3">Última sincronización</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-[#EEF6FC]">{(companiesQuery.data || []).map((company) => <tr key={company.id} className="hover:bg-[#F8FCFF]"><td className="px-5 py-4"><p className="font-bold text-[#102F4B]">{company.legal_name}</p><p className="text-xs text-[#6C8398]">{company.email}</p></td><td className="px-5 py-4 font-semibold text-[#39566F]">{company.nit}</td><td className="px-5 py-4"><StatusPill value={company.provider_link?.provider_status} label={company.provider_link?.provider_status_label} /></td><td className="px-5 py-4"><StatusPill value={company.onboarding_status} label={company.onboarding_status_label} /></td><td className="px-5 py-4 text-[#6C8398]">{formatDate(company.provider_link?.last_sync_at)}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><IconAction title="Ver" onClick={() => setSelected(company)} icon={<Eye size={16} />} /><IconAction title="Editar" onClick={() => setEditing(company)} icon={<Pencil size={16} />} /><IconAction title="Sincronizar" onClick={() => actionMutation.mutate({ id: company.id, action: "sync" })} icon={<RefreshCw size={16} />} /><IconAction title="Estadísticas" onClick={() => setStatsCompany(company)} icon={<BarChart3 size={16} />} /><IconAction title="Habilitar" onClick={() => actionMutation.mutate({ id: company.id, action: "enable-provider" })} icon={<Power size={16} />} /><IconAction title="Desactivar MATIAS" danger onClick={() => window.confirm("Se llamará DELETE en MATIAS. Usa esta acción solo si entiendes que puede desactivar o eliminar remotamente según Sandbox.") && actionMutation.mutate({ id: company.id, action: "disable-provider" })} icon={<Trash2 size={16} />} /><IconAction title="Archivar local" danger onClick={() => window.confirm("La empresa se archivará solo en NUVVI y conservará auditoría e identificadores.") && actionMutation.mutate({ id: company.id, action: "archive" })} icon={<Archive size={16} />} /></div></td></tr>)}{!busy && !(companiesQuery.data || []).length && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#6C8398]">No hay empresas registradas para los filtros actuales.</td></tr>}</tbody></table></div></section>

    {creating && <Modal title="Crear empresa" onClose={() => setCreating(false)} wide><div className="mb-5 grid gap-2 sm:grid-cols-3">{[1, 2, 3].map((step) => <div key={step} className={cn("rounded-2xl border p-3 text-sm font-bold", formStep === step ? "border-[#4F9FF0] bg-[#E8F0FE] text-[#246FC1]" : "border-[#D9ECFA] bg-[#F8FCFF] text-[#6C8398]")}>Paso {step}: {step === 1 ? "Empresa" : step === 2 ? "Responsable" : "Verificación"}</div>)}</div>{formStep === 1 && <div className="grid gap-4 md:grid-cols-2"><Field label="Razón social"><input value={form.company_name} onChange={(e) => setForm((c) => ({ ...c, company_name: e.target.value }))} className={inputClass} /></Field><Field label="NIT"><input value={form.nit} onChange={(e) => setForm((c) => ({ ...c, nit: e.target.value }))} className={inputClass} /></Field><SearchableObjectSelect label="País" value={form.country_id} options={catalogs.countries} placeholder="Seleccionar país" onChange={(value) => setForm((c) => ({ ...c, country_id: value, city_id: "" }))} /><SearchableObjectSelect label="Departamento" value={form.department_id} options={catalogs.departments} placeholder="Seleccionar departamento" onChange={(value) => setForm((c) => ({ ...c, department_id: value, city_id: "" }))} /><SearchableObjectSelect label="Ciudad" value={form.city_id} options={filteredCities} placeholder="Seleccionar ciudad" onChange={(value) => setForm((c) => ({ ...c, city_id: value }))} /><Field label="Dirección"><input value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} className={inputClass} /></Field><Field label="Celular"><input value={form.mobile} onChange={(e) => setForm((c) => ({ ...c, mobile: e.target.value }))} className={inputClass} /></Field><Field label="Teléfono"><input value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} className={inputClass} /></Field></div>}{formStep === 2 && <div className="grid gap-4 md:grid-cols-2"><Field label="Nombres"><input value={form.first_name} onChange={(e) => setForm((c) => ({ ...c, first_name: e.target.value }))} className={inputClass} /></Field><Field label="Apellidos"><input value={form.last_name} onChange={(e) => setForm((c) => ({ ...c, last_name: e.target.value }))} className={inputClass} /></Field><Field label="Correo"><input type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} className={inputClass} /></Field><div /><Field label="Contraseña temporal"><input type="password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} className={inputClass} /></Field><Field label="Confirmación"><input type="password" value={form.password_confirmation} onChange={(e) => setForm((c) => ({ ...c, password_confirmation: e.target.value }))} className={inputClass} /></Field>{form.password && form.password_confirmation && form.password !== form.password_confirmation && <p className="text-sm font-semibold text-[#C94455] md:col-span-2">Las contraseñas no coinciden.</p>}</div>}{formStep === 3 && <div className="grid gap-3 md:grid-cols-2"><Info label="Empresa" value={form.company_name} /><Info label="NIT" value={form.nit} /><Info label="Responsable" value={`${form.first_name} ${form.last_name}`} /><Info label="Correo" value={form.email} /><Info label="Ambiente" value={environment === "sandbox" ? "Sandbox" : "Producción"} /><Info label="Request ID" value={form.request_id} /></div>}<div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => formStep === 1 ? setCreating(false) : setFormStep((s) => s - 1)} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]">{formStep === 1 ? "Cancelar" : "Atrás"}</Button>{formStep < 3 ? <Button onClick={() => setFormStep((s) => s + 1)} disabled={formStep === 1 ? !canCreateStep1 : !canCreateStep2} className="rounded-xl">Continuar</Button> : <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !canCreateStep1 || !canCreateStep2 || !syncStatusQuery.data?.ready} className="rounded-xl"><CheckCircle2 size={16} className="mr-2" />Crear empresa</Button>}</div>{!syncStatusQuery.data?.ready && <p className="mt-3 rounded-xl bg-[#FFF3E0] px-3 py-2 text-xs font-semibold text-[#B97812]">La conexión MATIAS debe estar en READY_TO_REGISTER_COMPANIES antes de crear empresas.</p>}</Modal>}
    {selected && <DetailModal company={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} onStats={() => setStatsCompany(selected)} onSettings={() => setSettingsCompany(selected)} />}
    {editing && <EditModal company={editing} onClose={() => setEditing(null)} onSave={(payload) => updateMutation.mutate({ ...payload, id: editing.id })} busy={updateMutation.isPending} />}
    {statsCompany && <RemoteJsonModal title={`Estadísticas MATIAS · ${statsCompany.legal_name}`} endpoint={`/admin/companies/${statsCompany.id}/stats/`} environment={environment} onClose={() => setStatsCompany(null)} />}
    {settingsCompany && <SettingsModal company={settingsCompany} environment={environment} onClose={() => setSettingsCompany(null)} />}
    {modalBusy && <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#102F4B] px-4 py-3 text-sm font-semibold text-white shadow-2xl"><Loader2 size={16} className="animate-spin" />Procesando acción...</div>}
  </motion.div>;
}

function IconAction({ title, icon, onClick, danger = false }: { title: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return <button title={title} onClick={onClick} className={cn("rounded-xl p-2 transition-colors", danger ? "text-[#C94455] hover:bg-[#FDE8E8]" : "text-[#39566F] hover:bg-[#E8F0FE] hover:text-[#246FC1]")}>{icon}</button>;
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl bg-[#F8FCFF] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#6C8398]">{label}</p><div className="mt-1 break-words text-sm font-semibold text-[#102F4B]">{value || "-"}</div></div>;
}

function DetailModal({ company, onClose, onEdit, onStats, onSettings }: { company: Company; onClose: () => void; onEdit: () => void; onStats: () => void; onSettings: () => void }) {
  const [tab, setTab] = useState("resumen");
  const link = company.provider_link;
  return <Modal title={company.legal_name} onClose={onClose} wide><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#39566F]">NIT {company.nit}</p><div className="mt-2 flex flex-wrap gap-2"><StatusPill value={link?.provider_status} label={`MATIAS: ${link?.provider_status_label || "Sin registro"}`} /><StatusPill value={company.onboarding_status} label={`Facturación: ${company.onboarding_status_label}`} /></div></div><div className="flex gap-2"><Button onClick={onEdit} className="rounded-xl"><Pencil size={16} className="mr-2" />Editar</Button><Button variant="outline" onClick={onStats} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]"><BarChart3 size={16} className="mr-2" />Estadísticas</Button><Button variant="outline" onClick={onSettings} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]"><Settings size={16} className="mr-2" />Configuración</Button></div></div><div className="mb-5 flex flex-wrap gap-2">{["resumen", "empresa", "matias", "dian", "actividad"].map((item) => <button key={item} onClick={() => setTab(item)} className={cn("rounded-xl px-3 py-2 text-sm font-bold capitalize", tab === item ? "bg-[#E8F0FE] text-[#246FC1]" : "bg-[#F8FCFF] text-[#6C8398] hover:text-[#102F4B]")}>{item}</button>)}</div>{tab === "resumen" && <div className="grid gap-3 md:grid-cols-2"><Info label="Correo" value={company.email} /><Info label="Responsable" value={`${company.owner_first_name} ${company.owner_last_name}`} /><Info label="Dirección" value={company.address} /><Info label="Celular" value={company.mobile} /></div>}{tab === "empresa" && <div className="grid gap-3 md:grid-cols-2"><Info label="País" value={company.country_id} /><Info label="Departamento" value={company.department_id} /><Info label="Ciudad" value={company.city_id} /><Info label="Teléfono" value={company.phone} /><Info label="Ejecutivo" value={company.assigned_executive} /><Info label="Notas" value={company.notes} /></div>}{tab === "matias" && <div className="grid gap-3 md:grid-cols-2"><Info label="MATIAS company ID" value={link?.matias_company_id} /><Info label="Client UUID" value={link?.matias_client_uuid} /><Info label="Empresa padre" value={link?.parent_company_uuid} /><Info label="Ambiente" value={link?.environment} /><Info label="Última sincronización" value={formatDate(link?.last_sync_at)} /><Info label="Último error" value={link?.last_error_message || "Ninguno"} /><div className="md:col-span-2"><pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#F8FCFF] p-4 text-xs text-[#39566F]">{JSON.stringify(link?.last_remote_snapshot || {}, null, 2)}</pre></div></div>}{tab === "dian" && <div className="space-y-2">{["Empresa creada en MATIAS", "Datos tributarios", "Software DIAN", "Resolución", "Certificado", "Factura de prueba"].map((item, index) => <div key={item} className="flex items-center justify-between rounded-2xl bg-[#F8FCFF] p-4 text-sm font-bold text-[#102F4B]"><span>{index + 1}. {item}</span><span className={index === 0 && link?.provider_status === "REGISTERED" ? "text-[#178C68]" : "text-[#B97812]"}>{index === 0 && link?.provider_status === "REGISTERED" ? "Completado" : "Pendiente"}</span></div>)}</div>}{tab === "actividad" && <div className="space-y-2">{company.recent_attempts.map((attempt) => <div key={attempt.id} className="rounded-2xl border border-[#D9ECFA] p-3 text-sm"><div className="flex justify-between gap-3"><b className="text-[#102F4B]">{attempt.operation}</b><StatusPill value={attempt.successful ? "REGISTERED" : "SYNC_ERROR"} label={attempt.successful ? "Correcto" : "Error"} /></div><p className="mt-1 text-xs text-[#6C8398]">{attempt.http_method} {attempt.endpoint} · HTTP {attempt.http_status ?? "-"} · {formatDate(attempt.created_at)}</p>{attempt.error_message && <p className="mt-1 text-xs font-semibold text-[#C94455]">{attempt.error_message}</p>}</div>)}</div>}</Modal>;
}

function EditModal({ company, onClose, onSave, busy }: { company: Company; onClose: () => void; onSave: (payload: any) => void; busy: boolean }) {
  const [form, setForm] = useState({ company_name: company.legal_name, nit: company.nit, email: company.email, owner_first_name: company.owner_first_name, owner_last_name: company.owner_last_name, address: company.address, mobile: company.mobile, phone: company.phone, notes: company.notes, assigned_executive: company.assigned_executive });
  const nitChanged = form.nit !== company.nit;
  return <Modal title="Editar empresa" onClose={onClose} wide><div className="mb-4 rounded-2xl bg-[#FFF3E0] p-4 text-sm font-semibold text-[#B97812]">Solo razón social, NIT y correo se sincronizan con MATIAS según documentación oficial. Los demás datos se guardan localmente.</div><div className="grid gap-4 md:grid-cols-2"><Field label="Razón social"><input value={form.company_name} onChange={(e) => setForm((c) => ({ ...c, company_name: e.target.value }))} className={inputClass} /></Field><Field label="NIT"><input value={form.nit} onChange={(e) => setForm((c) => ({ ...c, nit: e.target.value }))} className={inputClass} /></Field><Field label="Correo"><input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} className={inputClass} /></Field><Field label="Nombres responsable"><input value={form.owner_first_name} onChange={(e) => setForm((c) => ({ ...c, owner_first_name: e.target.value }))} className={inputClass} /></Field><Field label="Apellidos responsable"><input value={form.owner_last_name} onChange={(e) => setForm((c) => ({ ...c, owner_last_name: e.target.value }))} className={inputClass} /></Field><Field label="Dirección"><input value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} className={inputClass} /></Field><Field label="Celular"><input value={form.mobile} onChange={(e) => setForm((c) => ({ ...c, mobile: e.target.value }))} className={inputClass} /></Field><Field label="Teléfono"><input value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} className={inputClass} /></Field><Field label="Ejecutivo asignado"><input value={form.assigned_executive} onChange={(e) => setForm((c) => ({ ...c, assigned_executive: e.target.value }))} className={inputClass} /></Field><Field label="Notas internas"><textarea value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} className="min-h-24 w-full rounded-xl border border-[#D9ECFA] bg-white px-3 py-2 text-sm outline-none" /></Field></div>{nitChanged && <p className="mt-4 rounded-xl bg-[#FDE8E8] px-3 py-2 text-sm font-semibold text-[#C94455]">Cambiar el NIT afecta la identidad fiscal. Confirma antes de guardar.</p>}<div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={onClose} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]">Cancelar</Button><Button disabled={busy} onClick={() => (!nitChanged || window.confirm("Confirmo el cambio de NIT de esta empresa.")) && onSave(form)} className="rounded-xl">Guardar cambios</Button></div></Modal>;
}

function RemoteJsonModal({ title, endpoint, environment, onClose }: { title: string; endpoint: string; environment: Environment; onClose: () => void }) {
  const query = useQuery({ queryKey: [endpoint, environment], queryFn: async () => (await apiClient.get(endpoint, { params: { environment } })).data });
  return <Modal title={title} onClose={onClose} wide>{query.isLoading ? <p className="text-sm text-[#6C8398]">Consultando MATIAS...</p> : <pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-[#F8FCFF] p-4 text-xs text-[#39566F]">{JSON.stringify(query.data || {}, null, 2)}</pre>}</Modal>;
}

function SettingsModal({ company, environment, onClose }: { company: Company; environment: Environment; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [key, setKey] = useState("invoice_prefix");
  const [value, setValue] = useState("");
  const query = useQuery({ queryKey: ["company-settings", company.id, environment], queryFn: async () => (await apiClient.get(`/admin/companies/${company.id}/settings/`, { params: { environment } })).data });
  const mutation = useMutation({ mutationFn: async () => (await apiClient.put(`/admin/companies/${company.id}/settings/`, { environment, setting_key: key, setting_value: value })).data, onSuccess: () => { toast.success("Configuración actualizada en MATIAS"); queryClient.invalidateQueries({ queryKey: ["company-settings", company.id, environment] }); }, onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo actualizar configuración.")) });
  return <Modal title={`Configuración MATIAS · ${company.legal_name}`} onClose={onClose} wide><div className="mb-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><Field label="Clave"><input value={key} onChange={(e) => setKey(e.target.value)} className={inputClass} /></Field><Field label="Valor"><input value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} /></Field><div className="flex items-end"><Button onClick={() => mutation.mutate()} disabled={!key || mutation.isPending} className="h-11 rounded-xl">Actualizar</Button></div></div>{query.isLoading ? <p className="text-sm text-[#6C8398]">Consultando MATIAS...</p> : <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-[#F8FCFF] p-4 text-xs text-[#39566F]">{JSON.stringify(query.data || {}, null, 2)}</pre>}</Modal>;
}
