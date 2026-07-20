import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  identity_document_id: string;
  country_id: string;
  department_id: string;
  city_id: string;
  verification_digit: string;
  organization_type_id: string;
  accounting_regime_id: string;
  fiscal_regime_id: string;
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
const emptyForm = (environment: Environment): CompanyForm => ({ request_id: crypto.randomUUID(), company_name: "", nit: "", identity_document_id: "", country_id: "", department_id: "", city_id: "", verification_digit: "", organization_type_id: "", accounting_regime_id: "", fiscal_regime_id: "", address: "", mobile: "+57", phone: "+57", first_name: "", last_name: "", email: "", password: "", password_confirmation: "", environment });

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

function optionId(item?: CatalogItem) {
  return String(item?.id ?? item?.value ?? item?.code ?? item?.uuid ?? "");
}

function optionName(item?: CatalogItem) {
  return String(item?.name_city ?? item?.name_department ?? item?.country_name ?? item?.document_name ?? item?.name ?? item?.label ?? item?.description ?? item?.text ?? "");
}

function optionCode(item?: CatalogItem) {
  return String(item?.city_code ?? item?.code ?? item?.abbreviation ?? item?.abbreviation_A2 ?? item?.value ?? item?.id ?? "");
}

function optionLabel(item?: CatalogItem) {
  const name = optionName(item);
  const code = optionCode(item);
  return name ? `${code ? `(${code}) - ` : ""}${name}` : optionId(item);
}

function cityDepartmentId(item?: CatalogItem) {
  return String(item?.department?.id ?? item?.department_id ?? item?.departmentId ?? "");
}

function onlyNumbers(value: string, maxLength?: number) {
  const cleaned = value.replace(/\D/g, "");
  return maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

function calculateNitDv(value: string) {
  const number = onlyNumbers(value, 15);
  if (!number || number.length > 15) return "";
  const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  const padded = number.padStart(15, "0");
  const total = padded.split("").reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
  const remainder = total % 11;
  return String(remainder === 0 || remainder === 1 ? remainder : 11 - remainder);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function statusStyle(value?: string) {
  if (["REGISTERED", "ACTIVE", "READY_TO_INVOICE", "COMPANY_REGISTERED"].includes(value || "")) return "bg-[#D8F5EB] text-[#178C68]";
  if (["PENDING_CREATION", "PENDING_UPDATE", "DRAFT", "TAX_INFORMATION_PENDING", "DIAN_SOFTWARE_PENDING", "RESOLUTION_PENDING", "CERTIFICATE_PENDING"].includes(value || "")) return "bg-[#FFF3E0] text-[#B97812]";
  return "bg-[#FDE8E8] text-[#C94455]";
}

function StatusPill({ value, label }: { value?: string; label?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", statusStyle(value))}>{label || value || "Sin estado"}</span>;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold text-[#39566F]">{label}</span>
      {children}
      {hint && !error ? <p className="text-[11px] font-medium text-[#6C8398]">{hint}</p> : null}
      {error ? <p className="text-[11px] font-semibold text-[#C94455]">{error}</p> : null}
    </label>
  );
}

function SearchableObjectSelect({ id, label, value, options, placeholder, disabled, openSelect, setOpenSelect, onChange }: { id: string; label: string; value: string; options: CatalogItem[]; placeholder: string; disabled?: boolean; openSelect: string | null; setOpenSelect: (value: string | null) => void; onChange: (value: string) => void }) {
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const open = openSelect === id;
  const selected = options.find((item) => optionId(item) === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((item) => optionLabel(item).toLowerCase().includes(normalized));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpenSelect(null);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open, setOpenSelect]);

  return (
    <Field label={label}>
      <div ref={wrapperRef} className="relative">
        <button type="button" disabled={disabled} onClick={() => { setQuery(""); setOpenSelect(open ? null : id); }} className={cn(inputClass, "flex items-center justify-between text-left disabled:bg-[#F8FCFF] disabled:text-[#8EA3B5]")}>
          <span className={cn("truncate", !selected && "text-[#8EA3B5]")}>{selected ? optionLabel(selected) : placeholder}</span>
          <Search size={15} className="text-[#6C8398]" />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[#D9ECFA] bg-white shadow-[0_18px_45px_rgba(16,47,75,0.16)]">
            <div className="border-b border-[#EEF6FC] p-2">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por código o nombre..." className="h-10 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm outline-none" />
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {filtered.map((item) => (
                <button key={optionId(item)} type="button" onClick={() => { onChange(optionId(item)); setOpenSelect(null); }} className={cn("w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors", optionId(item) === value ? "bg-[#E8F0FE] font-semibold text-[#246FC1]" : "text-[#39566F] hover:bg-[#F8FCFF]")}>
                  {optionLabel(item)}
                </button>
              ))}
              {!filtered.length && <p className="px-3 py-4 text-center text-xs text-[#6C8398]">Sin resultados.</p>}
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-[#102F4B]/35 p-4 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} className={cn("max-h-[92vh] w-full overflow-hidden rounded-3xl border border-[#D9ECFA] bg-white shadow-2xl", wide ? "max-w-5xl" : "max-w-2xl")}>
          <div className="flex items-center justify-between border-b border-[#EEF6FC] px-5 py-4">
            <h2 className="text-lg font-extrabold text-[#102F4B] font-manrope">{title}</h2>
            <button onClick={onClose} className="rounded-xl p-2 text-[#6C8398] hover:bg-[#F8FCFF]"><X size={18} /></button>
          </div>
          <div className="max-h-[calc(92vh-72px)] overflow-y-auto p-5">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl bg-[#F8FCFF] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#6C8398]">{label}</p><div className="mt-1 break-words text-sm font-semibold text-[#102F4B]">{value || "-"}</div></div>;
}

function VerificationItem({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return <div className={cn("flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-semibold", ok ? "bg-[#D8F5EB] text-[#178C68]" : "bg-[#FFF3E0] text-[#B97812]")}><CheckCircle2 size={15} className={cn("mt-0.5 shrink-0", !ok && "opacity-40")} /><div><p>{label}</p><p className="font-medium opacity-80">{detail}</p></div></div>;
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
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const companiesQuery = useQuery({
    queryKey: ["companies", environment, search, providerStatus, localStatus],
    queryFn: async () => (await apiClient.get<Company[]>("/admin/companies/", { params: { environment, search, provider_status: providerStatus, local_status: localStatus } })).data,
  });
  const catalogsQuery = useQuery({ queryKey: ["company-catalogs", environment], queryFn: async () => (await apiClient.get<{ countries: CatalogItem[]; departments: CatalogItem[]; cities: CatalogItem[]; identity_documents: CatalogItem[]; organization_types: CatalogItem[]; accounting_regimes: CatalogItem[]; fiscal_regimes: CatalogItem[] }>("/admin/companies/catalogs/", { params: { environment } })).data });
  const syncStatusQuery = useQuery({ queryKey: ["company-provider-status", environment], queryFn: async () => (await apiClient.get<{ ready: boolean; operational_status: string; linked_companies_count: number }>("/admin/companies/provider-sync-status/", { params: { environment } })).data });

  const catalogs = catalogsQuery.data || { countries: [], departments: [], cities: [], identity_documents: [], organization_types: [], accounting_regimes: [], fiscal_regimes: [] };
  const colombia = useMemo(() => catalogs.countries.find((country) => optionName(country).toLowerCase() === "colombia" || String(country.abbreviation_A2 || "").toUpperCase() === "CO"), [catalogs.countries]);
  const nitDocument = useMemo(() => catalogs.identity_documents.find((item) => String(item.abbreviation || "").toUpperCase() === "NIT" || String(item.code || "") === "31"), [catalogs.identity_documents]);
  const legalPerson = useMemo(() => catalogs.organization_types.find((item) => optionName(item).toLowerCase().includes("jurídica") || optionName(item).toLowerCase().includes("juridica")), [catalogs.organization_types]);
  const noVat = useMemo(() => catalogs.accounting_regimes.find((item) => String(item.code || "") === "49"), [catalogs.accounting_regimes]);
  const noApply = useMemo(() => catalogs.fiscal_regimes.find((item) => String(item.code || "") === "R-99-PN"), [catalogs.fiscal_regimes]);
  const selectedCountry = catalogs.countries.find((item) => optionId(item) === form.country_id);
  const selectedIdentityDocument = catalogs.identity_documents.find((item) => optionId(item) === form.identity_document_id);
  const selectedDepartment = catalogs.departments.find((item) => optionId(item) === form.department_id);
  const selectedCity = catalogs.cities.find((item) => optionId(item) === form.city_id);
  const selectedOrganizationType = catalogs.organization_types.find((item) => optionId(item) === form.organization_type_id);
  const selectedAccountingRegime = catalogs.accounting_regimes.find((item) => optionId(item) === form.accounting_regime_id);
  const selectedFiscalRegime = catalogs.fiscal_regimes.find((item) => optionId(item) === form.fiscal_regime_id);
  const isNitIdentification = String(selectedIdentityDocument?.abbreviation || "").toUpperCase() === "NIT" || String(selectedIdentityDocument?.code || "") === "31";
  const filteredCities = catalogs.cities.filter((city) => !form.department_id || cityDepartmentId(city) === form.department_id);
  const mobileDigits = form.mobile.replace(/^\+57/, "").replace(/\D/g, "").slice(0, 10);
  const phoneDigits = form.phone.replace(/^\+57/, "").replace(/\D/g, "").slice(0, 10);
  const existingNit = (companiesQuery.data || []).some((company) => company.nit === form.nit);
  const existingEmail = (companiesQuery.data || []).some((company) => normalizeEmail(company.email) === normalizeEmail(form.email));
  const fieldChecks = {
    companyName: form.company_name.trim().length >= 3,
    identityDocument: !!selectedIdentityDocument,
    nit: /^\d{5,15}$/.test(form.nit) && !existingNit,
    verificationDigit: !form.verification_digit || /^\d$/.test(form.verification_digit),
    organizationType: !!selectedOrganizationType,
    accountingRegime: !!selectedAccountingRegime,
    fiscalRegime: !!selectedFiscalRegime,
    country: !!form.country_id && optionName(selectedCountry).toLowerCase() === "colombia",
    department: !!selectedDepartment,
    city: !!selectedCity && (!form.department_id || cityDepartmentId(selectedCity) === form.department_id),
    address: form.address.trim().length >= 5,
    mobile: /^\+57\d{10}$/.test(form.mobile),
    phone: /^\+57\d{10}$/.test(form.phone),
    owner: form.first_name.trim().length >= 2 && form.last_name.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && !existingEmail,
    password: !!form.password && form.password === form.password_confirmation,
    provider: !!syncStatusQuery.data?.ready,
  };
  const canCreateStep1 = fieldChecks.companyName && fieldChecks.identityDocument && fieldChecks.nit && fieldChecks.verificationDigit && fieldChecks.organizationType && fieldChecks.accountingRegime && fieldChecks.fiscalRegime && fieldChecks.country && fieldChecks.department && fieldChecks.city && fieldChecks.address && fieldChecks.mobile && fieldChecks.phone;
  const canCreateStep2 = fieldChecks.owner && fieldChecks.email && fieldChecks.password;
  const busy = companiesQuery.isLoading || catalogsQuery.isLoading;

  useEffect(() => {
    setForm((current) => ({
      ...current,
      country_id: current.country_id || (colombia ? optionId(colombia) : ""),
      identity_document_id: current.identity_document_id || (nitDocument ? optionId(nitDocument) : ""),
      organization_type_id: current.organization_type_id || (legalPerson ? optionId(legalPerson) : ""),
      accounting_regime_id: current.accounting_regime_id || (noVat ? optionId(noVat) : ""),
      fiscal_regime_id: current.fiscal_regime_id || (noApply ? optionId(noApply) : ""),
    }));
  }, [colombia, form.accounting_regime_id, form.country_id, form.fiscal_regime_id, form.identity_document_id, form.organization_type_id, legalPerson, nitDocument, noApply, noVat]);

  useEffect(() => {
    const calculated = isNitIdentification ? calculateNitDv(form.nit) : "";
    if (form.verification_digit !== calculated) setForm((current) => ({ ...current, verification_digit: calculated }));
  }, [form.nit, form.verification_digit, isNitIdentification]);

  const createPayload = {
    ...form,
    identity_document_code: optionCode(selectedIdentityDocument),
    identity_document_name: optionName(selectedIdentityDocument),
    organization_type_code: optionCode(selectedOrganizationType),
    organization_type_name: optionName(selectedOrganizationType),
    accounting_regime_code: optionCode(selectedAccountingRegime),
    accounting_regime_name: optionName(selectedAccountingRegime),
    fiscal_regime_code: optionCode(selectedFiscalRegime),
    fiscal_regime_name: optionName(selectedFiscalRegime),
  };

  const createMutation = useMutation({
    mutationFn: async () => (await apiClient.post<Company>("/admin/companies/", createPayload)).data,
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
  const isBusy = createMutation.isPending || updateMutation.isPending || actionMutation.isPending || reconcileMutation.isPending;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope">Empresas facturadoras</h1><p className="mt-1 text-sm text-[#6C8398]">Empresas o NIT que emitirán facturas desde NUVVI con sincronización MATIAS.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setForm(emptyForm(environment)); setFormStep(1); setCreating(true); }} className="h-11 rounded-xl bg-[#4F9FF0] hover:bg-[#246FC1]"><Building2 size={16} className="mr-2" />Crear empresa</Button>
          <Button variant="outline" onClick={() => reconcileMutation.mutate()} disabled={isBusy} className="h-11 rounded-xl border-[#D9ECFA] bg-white text-[#39566F] hover:bg-[#F8FCFF]"><RefreshCw size={16} className="mr-2" />Sincronizar MATIAS</Button>
        </div>
      </div>

      <section className="grid gap-4 rounded-3xl border border-[#D9ECFA] bg-white p-5 shadow-[0_2px_18px_rgba(79,159,240,0.08)] lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por razón social, NIT o correo" className="h-11 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] pl-9 pr-3 text-sm outline-none" /></div>
        <select value={localStatus} onChange={(event) => setLocalStatus(event.target.value)} className={inputClass}><option value="">Estado local</option><option value="ACTIVE">Activa</option><option value="SUSPENDED">Suspendida</option><option value="ARCHIVED">Archivada</option></select>
        <select value={providerStatus} onChange={(event) => setProviderStatus(event.target.value)} className={inputClass}><option value="">Estado MATIAS</option><option value="REGISTERED">Registrada</option><option value="PENDING_CREATION">Creación pendiente</option><option value="SYNC_ERROR">Error</option><option value="REMOTE_DISABLED">Desactivada</option></select>
        <select value={environment} onChange={(event) => setEnvironment(event.target.value as Environment)} className={inputClass}><option value="sandbox">Sandbox</option><option value="production">Producción</option></select>
      </section>

      <CompaniesTable companies={companiesQuery.data || []} busy={busy} syncStatus={syncStatusQuery.data} onView={setSelected} onEdit={setEditing} onStats={setStatsCompany} onSync={(id) => actionMutation.mutate({ id, action: "sync" })} onEnable={(id) => actionMutation.mutate({ id, action: "enable-provider" })} onDisable={(id) => actionMutation.mutate({ id, action: "disable-provider" })} onArchive={(id) => actionMutation.mutate({ id, action: "archive" })} />

      {creating && (
        <Modal title="Crear empresa" onClose={() => setCreating(false)} wide>
          <div className="mb-5 grid gap-2 sm:grid-cols-3">
            {[1, 2, 3].map((step) => <div key={step} className={cn("rounded-2xl border p-3 text-sm font-bold", formStep === step ? "border-[#4F9FF0] bg-[#E8F0FE] text-[#246FC1]" : "border-[#D9ECFA] bg-[#F8FCFF] text-[#6C8398]")}>Paso {step}: {step === 1 ? "Empresa" : step === 2 ? "Responsable" : "Verificación"}</div>)}
          </div>

          {formStep === 1 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Razón social" hint="Nombre legal exacto que se usará para crear la subcuenta en MATIAS." error={form.company_name && !fieldChecks.companyName ? "Escribe al menos 3 caracteres." : undefined}>
                  <input value={form.company_name} onChange={(e) => setForm((c) => ({ ...c, company_name: e.target.value }))} className={inputClass} placeholder="EMPRESA DEMO SAS" />
                </Field>
                <SearchableObjectSelect id="identity" label="Tipo de identificación" value={form.identity_document_id} options={catalogs.identity_documents} placeholder="Seleccionar tipo" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, identity_document_id: value }))} />
                <Field label="Identificación" hint="Número fiscal o documento; se enviará a MATIAS como dni." error={form.nit && !fieldChecks.nit ? existingNit ? "Ya existe una empresa con esta identificación." : "Escribe solo números, entre 5 y 15 dígitos." : undefined}>
                  <input inputMode="numeric" value={form.nit} onChange={(e) => setForm((c) => ({ ...c, nit: onlyNumbers(e.target.value, 15) }))} className={inputClass} placeholder="Ej: 901999991" />
                </Field>
                <Field label="Dígito de verificación" hint={isNitIdentification ? "Calculado automáticamente con el algoritmo oficial DIAN. Solo se guarda localmente." : "No aplica para este tipo de identificación."}>
                  <input readOnly value={form.verification_digit} className={cn(inputClass, "bg-[#F8FCFF] font-bold text-[#102F4B]")} placeholder={isNitIdentification ? "Se calcula al escribir la identificación" : "No aplica"} />
                </Field>
                <Field label="País" hint="Colombia queda fijo para facturación electrónica nacional.">
                  <div className="flex h-11 items-center justify-between rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-semibold text-[#102F4B]"><span>🇨🇴 Colombia</span><span className="text-xs text-[#6C8398]">Fijo</span></div>
                </Field>
                <SearchableObjectSelect id="department" label="Departamento" value={form.department_id} options={catalogs.departments} placeholder="Seleccionar departamento" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, department_id: value, city_id: "" }))} />
                <SearchableObjectSelect id="city" label="Ciudad" value={form.city_id} options={filteredCities} placeholder={form.department_id ? "Seleccionar ciudad" : "Selecciona primero departamento"} disabled={!form.department_id} openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, city_id: value }))} />
                <SearchableObjectSelect id="organization" label="Tipo de contribuyente" value={form.organization_type_id} options={catalogs.organization_types} placeholder="Seleccionar tipo" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, organization_type_id: value }))} />
                <SearchableObjectSelect id="accounting" label="Régimen contable" value={form.accounting_regime_id} options={catalogs.accounting_regimes} placeholder="Seleccionar régimen" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, accounting_regime_id: value }))} />
                <SearchableObjectSelect id="fiscal" label="Tipo de responsabilidad" value={form.fiscal_regime_id} options={catalogs.fiscal_regimes} placeholder="Seleccionar responsabilidad" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, fiscal_regime_id: value }))} />
                <Field label="Dirección" hint="Dirección principal de la empresa." error={form.address && !fieldChecks.address ? "Agrega una dirección más completa." : undefined}>
                  <input value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} className={inputClass} placeholder="Calle 123 #45-67" />
                </Field>
                <Field label="Celular" hint="Número colombiano de 10 dígitos.">
                  <div className="flex h-11 overflow-hidden rounded-xl border border-[#D9ECFA] bg-white focus-within:ring-2 focus-within:ring-[#4F9FF0]/20"><span className="flex items-center gap-2 border-r border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-bold text-[#102F4B]">🇨🇴 +57</span><input inputMode="numeric" value={mobileDigits} onChange={(e) => setForm((c) => ({ ...c, mobile: `+57${onlyNumbers(e.target.value, 10)}` }))} className="min-w-0 flex-1 px-3 text-sm text-[#102F4B] outline-none" placeholder="3001234567" /></div>
                </Field>
                <Field label="Teléfono fijo o alternativo" hint="MATIAS lo admite en el JSON oficial; usa +57 y 10 dígitos.">
                  <div className="flex h-11 overflow-hidden rounded-xl border border-[#D9ECFA] bg-white focus-within:ring-2 focus-within:ring-[#4F9FF0]/20"><span className="flex items-center gap-2 border-r border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-bold text-[#102F4B]">🇨🇴 +57</span><input inputMode="numeric" value={phoneDigits} onChange={(e) => setForm((c) => ({ ...c, phone: `+57${onlyNumbers(e.target.value, 10)}` }))} className="min-w-0 flex-1 px-3 text-sm text-[#102F4B] outline-none" placeholder="6011234567" /></div>
                </Field>
              </div>
              <LiveChecks checks={fieldChecks} />
            </div>
          )}

          {formStep === 2 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombres del responsable" hint="Nombres del usuario propietario o administrador inicial." error={form.first_name && form.first_name.trim().length < 2 ? "Escribe al menos 2 caracteres." : undefined}><input value={form.first_name} onChange={(e) => setForm((c) => ({ ...c, first_name: e.target.value }))} className={inputClass} placeholder="Ej: Laura" /></Field>
                <Field label="Apellidos del responsable" hint="Apellidos del usuario propietario." error={form.last_name && form.last_name.trim().length < 2 ? "Escribe al menos 2 caracteres." : undefined}><input value={form.last_name} onChange={(e) => setForm((c) => ({ ...c, last_name: e.target.value }))} className={inputClass} placeholder="Ej: Ramirez" /></Field>
                <Field label="Correo de acceso" hint="Correo con el que la empresa podrá iniciar sesión en NUVVI y MATIAS." error={form.email && !fieldChecks.email ? existingEmail ? "Ya existe una empresa con este correo." : "Correo inválido." : undefined}><input type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} className={inputClass} placeholder="administracion@empresademo.com" /></Field>
                <div />
                <Field label="Contraseña temporal" hint="Se usará para crear el usuario Empresa en NUVVI y la subcuenta en MATIAS."><input type="password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} className={inputClass} placeholder="ClaveTemporalSegura2026!" /></Field>
                <Field label="Confirmar contraseña" hint="Debe coincidir exactamente con la contraseña temporal." error={form.password_confirmation && form.password !== form.password_confirmation ? "Las contraseñas no coinciden." : undefined}><input type="password" value={form.password_confirmation} onChange={(e) => setForm((c) => ({ ...c, password_confirmation: e.target.value }))} className={inputClass} placeholder="ClaveTemporalSegura2026!" /></Field>
              </div>
              <LiveChecks checks={fieldChecks} />
            </div>
          )}

          {formStep === 3 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-3 md:grid-cols-2"><Info label="Empresa" value={form.company_name} /><Info label="Tipo identificación" value={optionLabel(selectedIdentityDocument)} /><Info label="Identificación" value={form.nit} /><Info label="DV calculado" value={form.verification_digit || "No aplica"} /><Info label="Tipo contribuyente" value={optionLabel(selectedOrganizationType)} /><Info label="Régimen contable" value={optionLabel(selectedAccountingRegime)} /><Info label="Responsabilidad" value={optionLabel(selectedFiscalRegime)} /><Info label="País" value="🇨🇴 Colombia" /><Info label="Departamento" value={optionLabel(selectedDepartment)} /><Info label="Ciudad" value={optionLabel(selectedCity)} /><Info label="Dirección" value={form.address} /><Info label="Celular" value={form.mobile} /><Info label="Teléfono" value={form.phone} /><Info label="Responsable" value={`${form.first_name} ${form.last_name}`} /><Info label="Correo" value={form.email} /><Info label="Ambiente" value={environment === "sandbox" ? "Sandbox" : "Producción"} /></div>
              <LiveChecks checks={fieldChecks} />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => formStep === 1 ? setCreating(false) : setFormStep((step) => step - 1)} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]">{formStep === 1 ? "Cancelar" : "Atrás"}</Button>
            {formStep < 3 ? <Button onClick={() => setFormStep((step) => step + 1)} disabled={formStep === 1 ? !canCreateStep1 : !canCreateStep2} className="rounded-xl">Continuar</Button> : <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !canCreateStep1 || !canCreateStep2 || !fieldChecks.provider} className="rounded-xl"><CheckCircle2 size={16} className="mr-2" />Crear empresa</Button>}
          </div>
        </Modal>
      )}

      {selected && <DetailModal company={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} onStats={() => setStatsCompany(selected)} onSettings={() => setSettingsCompany(selected)} />}
      {editing && <EditModal company={editing} onClose={() => setEditing(null)} onSave={(payload) => updateMutation.mutate({ ...payload, id: editing.id })} busy={updateMutation.isPending} />}
      {statsCompany && <RemoteJsonModal title={`Estadísticas MATIAS · ${statsCompany.legal_name}`} endpoint={`/admin/companies/${statsCompany.id}/stats/`} environment={environment} onClose={() => setStatsCompany(null)} />}
      {settingsCompany && <SettingsModal company={settingsCompany} environment={environment} onClose={() => setSettingsCompany(null)} />}
      {isBusy && <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#102F4B] px-4 py-3 text-sm font-semibold text-white shadow-2xl"><Loader2 size={16} className="animate-spin" />Procesando acción...</div>}
    </motion.div>
  );
}

function LiveChecks({ checks }: { checks: Record<string, boolean> }) {
  return <aside className="space-y-2 rounded-2xl border border-[#D9ECFA] bg-[#F8FCFF] p-3"><p className="text-sm font-extrabold text-[#102F4B] font-manrope">Verificación automática</p><VerificationItem ok={checks.companyName} label="Razón social" detail="Mínimo 3 caracteres." /><VerificationItem ok={checks.identityDocument} label="Tipo identificación" detail="Seleccionado desde /identity-documents." /><VerificationItem ok={checks.nit} label="Identificación" detail="Numérica, única y enviada como dni." /><VerificationItem ok={checks.verificationDigit} label="Dígito verificación" detail="Opcional, solo local." /><VerificationItem ok={checks.organizationType} label="Tipo contribuyente" detail="Seleccionado desde /organization-type." /><VerificationItem ok={checks.accountingRegime} label="Régimen contable" detail="Seleccionado desde /accounting-regime." /><VerificationItem ok={checks.fiscalRegime} label="Responsabilidad" detail="Seleccionada desde /fiscal-regime." /><VerificationItem ok={checks.country} label="País" detail="Colombia seleccionado desde catálogo MATIAS." /><VerificationItem ok={checks.department} label="Departamento" detail="Seleccionado desde catálogo MATIAS." /><VerificationItem ok={checks.city} label="Ciudad" detail="Corresponde al departamento seleccionado." /><VerificationItem ok={checks.mobile} label="Celular" detail="Prefijo +57 y 10 dígitos." /><VerificationItem ok={checks.phone} label="Teléfono" detail="Prefijo +57 y 10 dígitos." /><VerificationItem ok={checks.email} label="Correo" detail="Formato válido y único en NUVVI." /><VerificationItem ok={checks.password} label="Contraseña" detail="Temporal y confirmada." /><VerificationItem ok={checks.provider} label="MATIAS" detail="Conexión lista para registrar empresas." /></aside>;
}

function IconAction({ title, icon, onClick, danger = false }: { title: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return <button title={title} onClick={onClick} className={cn("rounded-xl p-2 transition-colors", danger ? "text-[#C94455] hover:bg-[#FDE8E8]" : "text-[#39566F] hover:bg-[#E8F0FE] hover:text-[#246FC1]")}>{icon}</button>;
}

function CompaniesTable({ companies, busy, syncStatus, onView, onEdit, onStats, onSync, onEnable, onDisable, onArchive }: { companies: Company[]; busy: boolean; syncStatus?: { operational_status: string; ready: boolean; linked_companies_count: number }; onView: (company: Company) => void; onEdit: (company: Company) => void; onStats: (company: Company) => void; onSync: (id: string) => void; onEnable: (id: string) => void; onDisable: (id: string) => void; onArchive: (id: string) => void }) {
  return <section className="overflow-hidden rounded-3xl border border-[#D9ECFA] bg-white shadow-[0_2px_18px_rgba(79,159,240,0.08)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF6FC] px-5 py-4"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#E8F0FE] p-3 text-[#246FC1]"><FileCheck2 size={20} /></div><div><p className="font-bold text-[#102F4B]">Empresas vinculadas: {syncStatus?.linked_companies_count ?? 0}</p><p className="text-xs text-[#6C8398]">Estado proveedor: {syncStatus?.operational_status || "Sin diagnóstico"}</p></div></div><StatusPill value={syncStatus?.ready ? "REGISTERED" : "PENDING_CREATION"} label={syncStatus?.ready ? "Listo para registrar empresas" : "Conexión pendiente"} /></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#F8FCFF] text-xs uppercase tracking-wide text-[#6C8398]"><tr><th className="px-5 py-3">Empresa</th><th className="px-5 py-3">NIT</th><th className="px-5 py-3">Estado MATIAS</th><th className="px-5 py-3">Facturación</th><th className="px-5 py-3">Última sincronización</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-[#EEF6FC]">{companies.map((company) => <tr key={company.id} className="hover:bg-[#F8FCFF]"><td className="px-5 py-4"><p className="font-bold text-[#102F4B]">{company.legal_name}</p><p className="text-xs text-[#6C8398]">{company.email}</p></td><td className="px-5 py-4 font-semibold text-[#39566F]">{company.nit}</td><td className="px-5 py-4"><StatusPill value={company.provider_link?.provider_status} label={company.provider_link?.provider_status_label} /></td><td className="px-5 py-4"><StatusPill value={company.onboarding_status} label={company.onboarding_status_label} /></td><td className="px-5 py-4 text-[#6C8398]">{formatDate(company.provider_link?.last_sync_at)}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><IconAction title="Ver" onClick={() => onView(company)} icon={<Eye size={16} />} /><IconAction title="Editar" onClick={() => onEdit(company)} icon={<Pencil size={16} />} /><IconAction title="Sincronizar" onClick={() => onSync(company.id)} icon={<RefreshCw size={16} />} /><IconAction title="Estadísticas" onClick={() => onStats(company)} icon={<BarChart3 size={16} />} /><IconAction title="Habilitar" onClick={() => onEnable(company.id)} icon={<Power size={16} />} /><IconAction title="Desactivar MATIAS" danger onClick={() => window.confirm("Se llamará DELETE en MATIAS. Usa esta acción solo si entiendes que puede desactivar o eliminar remotamente según Sandbox.") && onDisable(company.id)} icon={<Trash2 size={16} />} /><IconAction title="Archivar local" danger onClick={() => window.confirm("La empresa se archivará solo en NUVVI y conservará auditoría e identificadores.") && onArchive(company.id)} icon={<Archive size={16} />} /></div></td></tr>)}{!busy && !companies.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#6C8398]">No hay empresas registradas para los filtros actuales.</td></tr>}</tbody></table></div></section>;
}

function DetailModal({ company, onClose, onEdit, onStats, onSettings }: { company: Company; onClose: () => void; onEdit: () => void; onStats: () => void; onSettings: () => void }) {
  const [tab, setTab] = useState("resumen");
  const link = company.provider_link;
  return <Modal title={company.legal_name} onClose={onClose} wide><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#39566F]">NIT {company.nit}</p><div className="mt-2 flex flex-wrap gap-2"><StatusPill value={link?.provider_status} label={`MATIAS: ${link?.provider_status_label || "Sin registro"}`} /><StatusPill value={company.onboarding_status} label={`Facturación: ${company.onboarding_status_label}`} /></div></div><div className="flex gap-2"><Button onClick={onEdit} className="rounded-xl"><Pencil size={16} className="mr-2" />Editar</Button><Button variant="outline" onClick={onStats} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]"><BarChart3 size={16} className="mr-2" />Estadísticas</Button><Button variant="outline" onClick={onSettings} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]"><Settings size={16} className="mr-2" />Configuración</Button></div></div><div className="mb-5 flex flex-wrap gap-2">{["resumen", "empresa", "matias", "dian", "actividad"].map((item) => <button key={item} onClick={() => setTab(item)} className={cn("rounded-xl px-3 py-2 text-sm font-bold capitalize", tab === item ? "bg-[#E8F0FE] text-[#246FC1]" : "bg-[#F8FCFF] text-[#6C8398] hover:text-[#102F4B]")}>{item}</button>)}</div>{tab === "resumen" && <div className="grid gap-3 md:grid-cols-2"><Info label="Correo" value={company.email} /><Info label="Responsable" value={`${company.owner_first_name} ${company.owner_last_name}`} /><Info label="Dirección" value={company.address} /><Info label="Celular" value={company.mobile} /></div>}{tab === "empresa" && <div className="grid gap-3 md:grid-cols-2"><Info label="País" value={company.country_id} /><Info label="Departamento" value={company.department_id} /><Info label="Ciudad" value={company.city_id} /><Info label="Ejecutivo" value={company.assigned_executive} /><Info label="Notas" value={company.notes} /></div>}{tab === "matias" && <div className="grid gap-3 md:grid-cols-2"><Info label="MATIAS company ID" value={link?.matias_company_id} /><Info label="Client UUID" value={link?.matias_client_uuid} /><Info label="Empresa padre" value={link?.parent_company_uuid} /><Info label="Ambiente" value={link?.environment} /><Info label="Última sincronización" value={formatDate(link?.last_sync_at)} /><Info label="Último error" value={link?.last_error_message || "Ninguno"} /><div className="md:col-span-2"><pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#F8FCFF] p-4 text-xs text-[#39566F]">{JSON.stringify(link?.last_remote_snapshot || {}, null, 2)}</pre></div></div>}{tab === "dian" && <div className="space-y-2">{["Empresa creada en MATIAS", "Datos tributarios", "Software DIAN", "Resolución", "Certificado", "Factura de prueba"].map((item, index) => <div key={item} className="flex items-center justify-between rounded-2xl bg-[#F8FCFF] p-4 text-sm font-bold text-[#102F4B]"><span>{index + 1}. {item}</span><span className={index === 0 && link?.provider_status === "REGISTERED" ? "text-[#178C68]" : "text-[#B97812]"}>{index === 0 && link?.provider_status === "REGISTERED" ? "Completado" : "Pendiente"}</span></div>)}</div>}{tab === "actividad" && <div className="space-y-2">{company.recent_attempts.map((attempt) => <div key={attempt.id} className="rounded-2xl border border-[#D9ECFA] p-3 text-sm"><div className="flex justify-between gap-3"><b className="text-[#102F4B]">{attempt.operation}</b><StatusPill value={attempt.successful ? "REGISTERED" : "SYNC_ERROR"} label={attempt.successful ? "Correcto" : "Error"} /></div><p className="mt-1 text-xs text-[#6C8398]">{attempt.http_method} {attempt.endpoint} · HTTP {attempt.http_status ?? "-"} · {formatDate(attempt.created_at)}</p>{attempt.error_message && <p className="mt-1 text-xs font-semibold text-[#C94455]">{attempt.error_message}</p>}</div>)}</div>}</Modal>;
}

function EditModal({ company, onClose, onSave, busy }: { company: Company; onClose: () => void; onSave: (payload: any) => void; busy: boolean }) {
  const [form, setForm] = useState({ company_name: company.legal_name, nit: company.nit, email: company.email, owner_first_name: company.owner_first_name, owner_last_name: company.owner_last_name, address: company.address, mobile: company.mobile, phone: company.phone, notes: company.notes, assigned_executive: company.assigned_executive });
  const nitChanged = form.nit !== company.nit;
  return <Modal title="Editar empresa" onClose={onClose} wide><div className="mb-4 rounded-2xl bg-[#FFF3E0] p-4 text-sm font-semibold text-[#B97812]">Solo razón social, NIT y correo se sincronizan con MATIAS según documentación oficial. Los demás datos se guardan localmente.</div><div className="grid gap-4 md:grid-cols-2"><Field label="Razón social"><input value={form.company_name} onChange={(e) => setForm((c) => ({ ...c, company_name: e.target.value }))} className={inputClass} /></Field><Field label="NIT" hint="Solo números, sin dígito de verificación."><input inputMode="numeric" value={form.nit} onChange={(e) => setForm((c) => ({ ...c, nit: onlyNumbers(e.target.value, 15) }))} className={inputClass} /></Field><Field label="Correo"><input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} className={inputClass} /></Field><Field label="Nombres responsable"><input value={form.owner_first_name} onChange={(e) => setForm((c) => ({ ...c, owner_first_name: e.target.value }))} className={inputClass} /></Field><Field label="Apellidos responsable"><input value={form.owner_last_name} onChange={(e) => setForm((c) => ({ ...c, owner_last_name: e.target.value }))} className={inputClass} /></Field><Field label="Dirección"><input value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} className={inputClass} /></Field><Field label="Celular"><input value={form.mobile} onChange={(e) => setForm((c) => ({ ...c, mobile: e.target.value }))} className={inputClass} /></Field><Field label="Ejecutivo asignado"><input value={form.assigned_executive} onChange={(e) => setForm((c) => ({ ...c, assigned_executive: e.target.value }))} className={inputClass} /></Field><Field label="Notas internas"><textarea value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} className="min-h-24 w-full rounded-xl border border-[#D9ECFA] bg-white px-3 py-2 text-sm outline-none" /></Field></div>{nitChanged && <p className="mt-4 rounded-xl bg-[#FDE8E8] px-3 py-2 text-sm font-semibold text-[#C94455]">Cambiar el NIT afecta la identidad fiscal. Confirma antes de guardar.</p>}<div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={onClose} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]">Cancelar</Button><Button disabled={busy} onClick={() => (!nitChanged || window.confirm("Confirmo el cambio de NIT de esta empresa.")) && onSave(form)} className="rounded-xl">Guardar cambios</Button></div></Modal>;
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
