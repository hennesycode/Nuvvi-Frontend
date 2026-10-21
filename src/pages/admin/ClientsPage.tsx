import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Building2, CheckCircle2, CircleHelp, Eye, FileCheck2, Loader2, Pencil, Power, PowerOff, RefreshCw, Search, Settings, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Company } from "@/types";

type Environment = "sandbox" | "production";
type CatalogItem = Record<string, any>;

type ConfirmConfig = {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "danger" | "info";
  onConfirm: () => void;
};

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
  if (typeof data.message === "string") return data.message;
  if (data.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors).flat()[0];
    if (typeof firstError === "string") return firstError;
  }
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

function ColombiaFlag() {
  return <span className="block h-4 w-6 overflow-hidden rounded-[3px] border border-[#D9ECFA] shadow-sm" aria-label="Bandera de Colombia"><span className="block h-1/2 bg-[#FCD116]" /><span className="block h-1/4 bg-[#003893]" /><span className="block h-1/4 bg-[#CE1126]" /></span>;
}

const fieldHelp: Record<string, string> = {
  "Razón social": "Nombre legal registrado de la empresa, tal como aparece en sus documentos tributarios.",
  "Tipo de identificación": "Selecciona el documento fiscal que corresponde a la empresa o persona.",
  "Identificación": "Escribe el número de NIT o documento sin puntos, espacios ni dígito de verificación.",
  "Identificación (NIT)": "Escribe el número de NIT o documento sin puntos, espacios ni dígito de verificación.",
  "Dígito de verificación": "Se calcula automáticamente a partir del NIT cuando el tipo de documento lo requiere.",
  "Tipo de contribuyente": "Elige la clasificación tributaria que corresponde a la empresa.",
  "Régimen contable": "Selecciona el régimen contable registrado para la empresa.",
  "Responsabilidad fiscal": "Selecciona la responsabilidad fiscal aplicable según el registro tributario.",
  País: "Selecciona el país de domicilio fiscal de la empresa.",
  Departamento: "Selecciona el departamento donde está ubicada la empresa.",
  Ciudad: "Selecciona la ciudad correspondiente al departamento elegido.",
  Dirección: "Ingresa la dirección física principal de la empresa, incluyendo nomenclatura.",
  Celular: "Número móvil de contacto con indicativo internacional +57 y 10 dígitos.",
  "Teléfono fijo o alternativo": "Teléfono de contacto adicional con indicativo +57 y 10 dígitos.",
  "Nombres del responsable": "Nombres de la persona responsable de la cuenta de esta empresa.",
  "Apellidos del responsable": "Apellidos de la persona responsable de la cuenta de esta empresa.",
  "Correo de acceso": "Correo principal para notificaciones y acceso de la empresa.",
  "Correo de contacto": "Correo principal para notificaciones y contacto de la empresa.",
  "Teléfono alternativo": "Número adicional de contacto con indicativo internacional +57.",
  "Ejecutivo asignado": "Persona del equipo NUVVI encargada de acompañar a esta empresa.",
  "Notas internas": "Observaciones de uso interno; no se envían al proveedor ni aparecen en documentos.",
  Clave: "Nombre del parámetro de configuración que deseas actualizar.",
  Valor: "Nuevo valor que se guardará para el parámetro seleccionado.",
};

function Field({ label, hint, error, help, required = false, children }: { label: string; hint?: string; error?: string; help?: string; required?: boolean; children: React.ReactNode }) {
  const tooltip = help || fieldHelp[label] || hint;
  return (
    <label className="space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#39566F]">{label}{required && <> <span className="text-[#C94455]" aria-hidden="true">*</span><span className="sr-only"> obligatorio</span></>}{tooltip && <span className="group/help relative inline-flex"><button type="button" aria-label={`Ayuda: ${label}`} className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#7890A5] transition-colors hover:text-[#246FC1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9FF0]"><CircleHelp size={14} /></button><span role="tooltip" className="pointer-events-none absolute left-0 top-full z-[80] mt-2 w-56 translate-y-1 rounded-xl border border-[#D9ECFA] bg-white px-3 py-2 text-left text-xs font-medium leading-relaxed text-[#39566F] opacity-0 shadow-[0_10px_28px_rgba(16,47,75,0.18)] transition-all duration-150 group-hover/help:translate-y-0 group-hover/help:opacity-100 group-focus-within/help:translate-y-0 group-focus-within/help:opacity-100">{tooltip}</span></span>}</span>
      {children}
      {hint && !error ? <p className="text-[11px] font-medium text-[#6C8398]">{hint}</p> : null}
      {error ? <p className="text-[11px] font-semibold text-[#C94455]">{error}</p> : null}
    </label>
  );
}

function SearchableObjectSelect({ id, label, value, options, placeholder, disabled, required = false, error, openSelect, setOpenSelect, onChange }: { id: string; label: string; value: string; options: CatalogItem[]; placeholder: string; disabled?: boolean; required?: boolean; error?: string; openSelect: string | null; setOpenSelect: (value: string | null) => void; onChange: (value: string) => void }) {
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
    <Field label={label} required={required} error={error}>
      <div ref={wrapperRef} className="relative">
        <button type="button" aria-required={required} aria-invalid={!!error} disabled={disabled} onClick={() => { setQuery(""); setOpenSelect(open ? null : id); }} className={cn(inputClass, "flex items-center justify-between text-left disabled:bg-[#F8FCFF] disabled:text-[#8EA3B5]")}>
          <span className={cn("truncate", !selected && "text-[#8EA3B5]")}>{selected ? optionLabel(selected) : placeholder}</span>
          <Search size={15} className="text-[#6C8398]" />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[#D9ECFA] bg-white shadow-[0_18px_45px_rgba(16,47,75,0.16)]">
            <div className="border-b border-[#EEF6FC] p-2">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por código o nombre..." className="h-10 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm text-[#102F4B] outline-none placeholder:text-[#8EA3B5]" />
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

function ConfirmDialog({ config, onClose }: { config: ConfirmConfig; onClose: () => void }) {
  const danger = config.tone === "danger";
  return (
    <Modal title={config.title} onClose={onClose}>
      <div className={cn("rounded-2xl p-4 text-sm font-semibold", danger ? "bg-[#FDE8E8] text-[#C94455]" : "bg-[#E8F0FE] text-[#246FC1]")}>{config.message}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]">Cancelar</Button>
        <Button onClick={() => { config.onConfirm(); onClose(); }} className={cn("rounded-xl", danger && "bg-[#C94455] hover:bg-[#A83342]")}>{config.confirmLabel}</Button>
      </div>
    </Modal>
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
  const [dianCompany, setDianCompany] = useState<{ company: Company; resource: DianResource } | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [form, setForm] = useState<CompanyForm>(emptyForm(environment));
  const [checkedIdentity, setCheckedIdentity] = useState({ nit: "", email: "" });
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const companiesQuery = useQuery({
    queryKey: ["companies", environment, search, providerStatus, localStatus],
    queryFn: async () => (await apiClient.get<Company[]>("/admin/companies/", { params: { environment, search, provider_status: providerStatus, local_status: localStatus } })).data,
  });
  const catalogsQuery = useQuery({ queryKey: ["company-catalogs", environment], queryFn: async () => (await apiClient.get<{ countries: CatalogItem[]; departments: CatalogItem[]; cities: CatalogItem[]; identity_documents: CatalogItem[]; organization_types: CatalogItem[]; accounting_regimes: CatalogItem[]; fiscal_regimes: CatalogItem[] }>("/admin/companies/catalogs/", { params: { environment } })).data });
  const syncStatusQuery = useQuery({ queryKey: ["company-provider-status", environment], queryFn: async () => (await apiClient.get<{ ready: boolean; operational_status: string; linked_companies_count: number }>("/admin/companies/provider-sync-status/", { params: { environment } })).data });
  const identityCheckQuery = useQuery({
    queryKey: ["company-identity-check", environment, form.request_id, checkedIdentity.nit, checkedIdentity.email],
    queryFn: async () => (await apiClient.get<{ nit_exists: boolean; email_exists: boolean }>("/admin/companies/identity-check/", { params: { environment, request_id: form.request_id, nit: checkedIdentity.nit, email: checkedIdentity.email } })).data,
    enabled: !!checkedIdentity.nit || !!checkedIdentity.email,
  });

  const catalogs = catalogsQuery.data || { countries: [], departments: [], cities: [], identity_documents: [], organization_types: [], accounting_regimes: [], fiscal_regimes: [] };
  const colombia = useMemo(() => catalogs.countries.find((country) => optionName(country).toLowerCase() === "colombia" || String(country.abbreviation_A2 || "").toUpperCase() === "CO"), [catalogs.countries]);
  const selectedCountry = catalogs.countries.find((item) => optionId(item) === form.country_id);
  const selectedIdentityDocument = catalogs.identity_documents.find((item) => optionId(item) === form.identity_document_id);
  const selectedDepartment = catalogs.departments.find((item) => optionId(item) === form.department_id);
  const selectedCity = catalogs.cities.find((item) => optionId(item) === form.city_id);
  const selectedOrganizationType = catalogs.organization_types.find((item) => optionId(item) === form.organization_type_id);
  const selectedAccountingRegime = catalogs.accounting_regimes.find((item) => optionId(item) === form.accounting_regime_id);
  const selectedFiscalRegime = catalogs.fiscal_regimes.find((item) => optionId(item) === form.fiscal_regime_id);
  const documentAbbreviation = String(selectedIdentityDocument?.abbreviation || "").toUpperCase();
  const documentCode = String(selectedIdentityDocument?.code || "");
  const requiresVerificationDigit = ["NIT", "CC"].includes(documentAbbreviation) || ["31", "13"].includes(documentCode);
  const filteredCities = catalogs.cities.filter((city) => !form.department_id || cityDepartmentId(city) === form.department_id);
  const mobileDigits = form.mobile.replace(/^\+57/, "").replace(/\D/g, "").slice(0, 10);
  const phoneDigits = form.phone.replace(/^\+57/, "").replace(/\D/g, "").slice(0, 10);
  const existingNit = checkedIdentity.nit === form.nit && !!identityCheckQuery.data?.nit_exists;
  const existingEmail = checkedIdentity.email === normalizeEmail(form.email) && !!identityCheckQuery.data?.email_exists;
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
    }));
  }, [colombia, form.country_id]);

  useEffect(() => {
    const calculated = requiresVerificationDigit ? calculateNitDv(form.nit) : "";
    if (form.verification_digit !== calculated) setForm((current) => ({ ...current, verification_digit: calculated }));
  }, [form.nit, form.verification_digit, requiresVerificationDigit]);

  useEffect(() => {
    const timer = window.setTimeout(() => setCheckedIdentity({
      nit: /^\d{5,15}$/.test(form.nit) ? form.nit : "",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? normalizeEmail(form.email) : "",
    }), 350);
    return () => window.clearTimeout(timer);
  }, [form.nit, form.email, environment]);

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
    onMutate: () => toast.loading("Creando empresa y conectando con el proveedor…"),
    onSuccess: (company, _variables, toastId) => {
      if (toastId) toast.dismiss(toastId);
      toast.success("Empresa creada exitosamente.");
      const providerStatus = company.provider_link?.provider_status;
      if (providerStatus === "REGISTERED") toast.success("Sincronización con el proveedor completada.");
      else toast.warning("Empresa creada; el proveedor aún no confirmó sus identificadores. Puedes volver a sincronizarla.");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-provider-status"] });
      setCreating(false); setSelected(company); setForm(emptyForm(environment)); setFormStep(1);
    },
    onError: (error: any, _variables, toastId) => { if (toastId) toast.dismiss(toastId); queryClient.invalidateQueries({ queryKey: ["companies"] }); queryClient.invalidateQueries({ queryKey: ["company-identity-check"] }); toast.error(getApiErrorMessage(error, "No se pudo crear la empresa.")); },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<CompanyForm> & { id: string }) => (await apiClient.patch<Company>(`/admin/companies/${payload.id}/`, { ...payload, environment })).data,
    onMutate: () => toast.loading("Guardando cambios de la empresa…"),
    onSuccess: (company, _variables, toastId) => { if (toastId) toast.dismiss(toastId); toast.success("Empresa actualizada correctamente."); queryClient.invalidateQueries({ queryKey: ["companies"] }); setEditing(null); setSelected(company); },
    onError: (error: any, _variables, toastId) => { if (toastId) toast.dismiss(toastId); toast.error(getApiErrorMessage(error, "No se pudieron guardar los cambios.")); },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "sync" | "enable-provider" | "disable-provider" | "archive" }) => (await apiClient.post<Company>(`/admin/companies/${id}/${action}/`, { environment })).data,
    onSuccess: (company, variables) => { toast.success(variables.action === "archive" ? "Empresa eliminada de NUVVI y deshabilitada en el proveedor." : "Acción completada en el proveedor."); queryClient.invalidateQueries({ queryKey: ["companies"] }); queryClient.invalidateQueries({ queryKey: ["company-provider-status"] }); setSelected(variables.action === "archive" ? null : company); },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo ejecutar la acción.")),
  });

  const reconcileMutation = useMutation({
    mutationFn: async () => (await apiClient.post("/admin/companies/reconcile/", { environment })).data,
    onSuccess: (data: any) => { toast.success(`Sincronización completada: ${data.imported} nuevas, ${data.updated} actualizadas${data.skipped ? ` y ${data.skipped} omitidas por datos incompletos` : ""}. ${data.remote_count} empresas encontradas en el proveedor.`); queryClient.invalidateQueries({ queryKey: ["companies"] }); queryClient.invalidateQueries({ queryKey: ["company-provider-status"] }); },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo sincronizar con el proveedor.")),
  });
  const isBusy = createMutation.isPending || updateMutation.isPending || actionMutation.isPending || reconcileMutation.isPending;

  const confirmCompanyAction = (company: Company, action: "sync" | "enable-provider" | "disable-provider" | "archive") => {
    const config: Record<typeof action, ConfirmConfig> = {
      sync: { title: "Sincronizar empresa", message: `Se consultará el proveedor y se actualizarán los identificadores y el estado de ${company.legal_name}.`, confirmLabel: "Sincronizar", tone: "info", onConfirm: () => actionMutation.mutate({ id: company.id, action }) },
      "enable-provider": { title: "Habilitar en el proveedor", message: `La empresa ${company.legal_name} volverá a quedar habilitada en el proveedor.`, confirmLabel: "Habilitar", tone: "info", onConfirm: () => actionMutation.mutate({ id: company.id, action }) },
      "disable-provider": { title: "Deshabilitar en el proveedor", message: `Se deshabilitará ${company.legal_name} en el proveedor. El registro de NUVVI se conservará.`, confirmLabel: "Deshabilitar", tone: "danger", onConfirm: () => actionMutation.mutate({ id: company.id, action }) },
      archive: { title: "Eliminar empresa", message: `Se deshabilitará ${company.legal_name} en el proveedor y se archivará en NUVVI. El proveedor documenta esta operación como deshabilitación, no como borrado físico. Se conservará el historial de auditoría y se bloqueará el acceso del usuario asociado.`, confirmLabel: "Eliminar empresa", tone: "danger", onConfirm: () => actionMutation.mutate({ id: company.id, action }) },
    };
    setConfirmConfig(config[action]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope">Empresas facturadoras</h1><p className="mt-1 text-sm text-[#6C8398]">Empresas cliente administradas en NUVVI y vinculadas con el proveedor. Cada empresa requerirá su propia configuración DIAN antes de emitir documentos.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setForm(emptyForm(environment)); setFormStep(1); setCreating(true); }} className="h-11 rounded-xl bg-[#4F9FF0] hover:bg-[#246FC1]"><Building2 size={16} className="mr-2" />Crear empresa</Button>
          <Button variant="outline" onClick={() => reconcileMutation.mutate()} disabled={isBusy} className="h-11 rounded-xl border-[#D9ECFA] bg-white text-[#39566F] hover:bg-[#F8FCFF]"><RefreshCw size={16} className="mr-2" />Sincronizar proveedor</Button>
        </div>
      </div>

      <section className="grid gap-4 rounded-3xl border border-[#D9ECFA] bg-white p-5 shadow-[0_2px_18px_rgba(79,159,240,0.08)] lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por razón social, NIT o correo" className="h-11 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] pl-9 pr-3 text-sm outline-none" /></div>
        <select value={localStatus} onChange={(event) => setLocalStatus(event.target.value)} className={inputClass}><option value="">Estado local</option><option value="ACTIVE">Activa</option><option value="SUSPENDED">Suspendida</option><option value="ARCHIVED">Archivada</option></select>
        <select value={providerStatus} onChange={(event) => setProviderStatus(event.target.value)} className={inputClass}><option value="">Estado del proveedor</option><option value="REGISTERED">Registrada</option><option value="PENDING_CREATION">Creación pendiente</option><option value="SYNC_ERROR">Error</option><option value="REMOTE_DISABLED">Deshabilitada</option></select>
        <select value={environment} onChange={(event) => setEnvironment(event.target.value as Environment)} className={inputClass}><option value="sandbox">Sandbox</option><option value="production">Producción</option></select>
      </section>

      <CompaniesTable companies={companiesQuery.data || []} busy={busy} onView={setSelected} onEdit={setEditing} onStats={setStatsCompany} onSync={(company) => confirmCompanyAction(company, "sync")} onEnable={(company) => confirmCompanyAction(company, "enable-provider")} onDisable={(company) => confirmCompanyAction(company, "disable-provider")} onArchive={(company) => confirmCompanyAction(company, "archive")} />

      {creating && (
        <Modal title="Crear empresa" onClose={() => setCreating(false)} wide>
          <div className="mb-5 grid gap-2 sm:grid-cols-3">
            {[1, 2, 3].map((step) => <div key={step} className={cn("rounded-2xl border p-3 text-sm font-bold", formStep === step ? "border-[#4F9FF0] bg-[#E8F0FE] text-[#246FC1]" : "border-[#D9ECFA] bg-[#F8FCFF] text-[#6C8398]")}>Paso {step}: {step === 1 ? "Empresa" : step === 2 ? "Responsable" : "Verificación"}</div>)}
          </div>

          {formStep === 1 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Razón social" required error={form.company_name && !fieldChecks.companyName ? "Escribe al menos 3 caracteres." : undefined}>
                  <input value={form.company_name} onChange={(e) => setForm((c) => ({ ...c, company_name: e.target.value }))} className={inputClass} placeholder="EMPRESA DEMO SAS" />
                </Field>
                <SearchableObjectSelect id="identity" label="Tipo de identificación" required value={form.identity_document_id} options={catalogs.identity_documents} placeholder="Seleccionar tipo" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, identity_document_id: value }))} />
                <Field label="Identificación" required hint="Número fiscal o documento; se envía al proveedor como identificación." error={form.nit && !fieldChecks.nit ? existingNit ? "Ya existe una empresa con esta identificación." : "Escribe solo números, entre 5 y 15 dígitos." : undefined}>
                  <input inputMode="numeric" value={form.nit} onChange={(e) => setForm((c) => ({ ...c, nit: onlyNumbers(e.target.value, 15) }))} className={inputClass} placeholder="Ej: 901999991" />
                </Field>
                <Field label="Dígito de verificación" hint={requiresVerificationDigit ? "Calculado automáticamente para NIT o cédula. Solo se guarda localmente." : "No aplica para este tipo de identificación."}>
                  <input readOnly value={form.verification_digit} className={cn(inputClass, "bg-[#F8FCFF] font-bold text-[#102F4B]")} placeholder={requiresVerificationDigit ? "Se calcula al escribir la identificación" : "No aplica"} />
                </Field>
                <Field label="País" required hint="Colombia queda fijo para facturación electrónica nacional.">
                  <div className="flex h-11 items-center justify-between rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-semibold text-[#102F4B]"><span className="flex items-center gap-2"><ColombiaFlag />Colombia</span><span className="text-xs text-[#6C8398]">Fijo</span></div>
                </Field>
                <SearchableObjectSelect id="department" label="Departamento" required value={form.department_id} options={catalogs.departments} placeholder="Seleccionar departamento" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, department_id: value, city_id: "" }))} />
                <SearchableObjectSelect id="city" label="Ciudad" required value={form.city_id} options={filteredCities} placeholder={form.department_id ? "Seleccionar ciudad" : "Selecciona primero departamento"} disabled={!form.department_id} openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, city_id: value }))} />
                <SearchableObjectSelect id="organization" label="Tipo de contribuyente" required value={form.organization_type_id} options={catalogs.organization_types} placeholder="Seleccionar tipo" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, organization_type_id: value }))} />
                <SearchableObjectSelect id="accounting" label="Régimen contable" required value={form.accounting_regime_id} options={catalogs.accounting_regimes} placeholder="Seleccionar régimen" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, accounting_regime_id: value }))} />
                <SearchableObjectSelect id="fiscal" label="Tipo de responsabilidad" required value={form.fiscal_regime_id} options={catalogs.fiscal_regimes} placeholder="Seleccionar responsabilidad" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((c) => ({ ...c, fiscal_regime_id: value }))} />
                <Field label="Dirección" required hint="Dirección principal de la empresa." error={form.address && !fieldChecks.address ? "Agrega una dirección más completa." : undefined}>
                  <input value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} className={inputClass} placeholder="Calle 123 #45-67" />
                </Field>
                <Field label="Celular" required hint="Número colombiano de 10 dígitos.">
                  <div className="flex h-11 overflow-hidden rounded-xl border border-[#D9ECFA] bg-white focus-within:ring-2 focus-within:ring-[#4F9FF0]/20"><span className="flex items-center gap-2 border-r border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-bold text-[#102F4B]"><ColombiaFlag />+57</span><input inputMode="numeric" value={mobileDigits} onChange={(e) => setForm((c) => ({ ...c, mobile: `+57${onlyNumbers(e.target.value, 10)}` }))} className="min-w-0 flex-1 px-3 text-sm text-[#102F4B] outline-none" placeholder="3001234567" /></div>
                </Field>
                <Field label="Teléfono fijo o alternativo" required hint="Usa el indicativo +57 y 10 dígitos.">
                  <div className="flex h-11 overflow-hidden rounded-xl border border-[#D9ECFA] bg-white focus-within:ring-2 focus-within:ring-[#4F9FF0]/20"><span className="flex items-center gap-2 border-r border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-bold text-[#102F4B]"><ColombiaFlag />+57</span><input inputMode="numeric" value={phoneDigits} onChange={(e) => setForm((c) => ({ ...c, phone: `+57${onlyNumbers(e.target.value, 10)}` }))} className="min-w-0 flex-1 px-3 text-sm text-[#102F4B] outline-none" placeholder="6011234567" /></div>
                </Field>
              </div>
              <LiveChecks checks={fieldChecks} />
            </div>
          )}

          {formStep === 2 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid content-start gap-4 self-start md:grid-cols-2">
                <Field label="Nombres del responsable" required hint="Nombres del usuario propietario o administrador inicial." error={form.first_name && form.first_name.trim().length < 2 ? "Escribe al menos 2 caracteres." : undefined}><input value={form.first_name} onChange={(e) => setForm((c) => ({ ...c, first_name: e.target.value }))} className={inputClass} placeholder="Ej: Laura" /></Field>
                <Field label="Apellidos del responsable" required hint="Apellidos del usuario propietario." error={form.last_name && form.last_name.trim().length < 2 ? "Escribe al menos 2 caracteres." : undefined}><input value={form.last_name} onChange={(e) => setForm((c) => ({ ...c, last_name: e.target.value }))} className={inputClass} placeholder="Ej: Ramírez" /></Field>
                <div className="md:col-span-2">
                  <Field label="Correo de acceso" required hint="Correo con el que la empresa podrá iniciar sesión en NUVVI y el proveedor." error={form.email && !fieldChecks.email ? existingEmail ? "Ya existe una empresa con este correo." : "Correo inválido." : undefined}><input type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} className={inputClass} placeholder="administracion@empresademo.com" /></Field>
                </div>
                <Field label="Contraseña temporal" required hint="Se usa para crear el usuario inicial en NUVVI y el acceso de empresa en el proveedor."><input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} className={inputClass} placeholder="Ingresa una contraseña segura" /></Field>
                <Field label="Confirmar contraseña" required hint="Debe coincidir exactamente con la contraseña temporal." error={form.password_confirmation && form.password !== form.password_confirmation ? "Las contraseñas no coinciden." : undefined}><input type="password" autoComplete="new-password" value={form.password_confirmation} onChange={(e) => setForm((c) => ({ ...c, password_confirmation: e.target.value }))} className={inputClass} placeholder="Repite la contraseña" /></Field>
              </div>
              <LiveChecks checks={fieldChecks} />
            </div>
          )}

          {formStep === 3 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-3 md:grid-cols-2"><Info label="Empresa" value={form.company_name} /><Info label="Tipo identificación" value={optionLabel(selectedIdentityDocument)} /><Info label="Identificación" value={form.nit} /><Info label="DV calculado" value={form.verification_digit || "No aplica"} /><Info label="Tipo contribuyente" value={optionLabel(selectedOrganizationType)} /><Info label="Régimen contable" value={optionLabel(selectedAccountingRegime)} /><Info label="Responsabilidad" value={optionLabel(selectedFiscalRegime)} /><Info label="País" value={<span className="flex items-center gap-2"><ColombiaFlag />Colombia</span>} /><Info label="Departamento" value={optionLabel(selectedDepartment)} /><Info label="Ciudad" value={optionLabel(selectedCity)} /><Info label="Dirección" value={form.address} /><Info label="Celular" value={form.mobile} /><Info label="Teléfono" value={form.phone} /><Info label="Responsable" value={`${form.first_name} ${form.last_name}`} /><Info label="Correo" value={form.email} /><Info label="Ambiente" value={environment === "sandbox" ? "Sandbox" : "Producción"} /></div>
              <LiveChecks checks={fieldChecks} />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => formStep === 1 ? setCreating(false) : setFormStep((step) => step - 1)} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]">{formStep === 1 ? "Cancelar" : "Atrás"}</Button>
            {formStep < 3 ? <Button onClick={() => setFormStep((step) => step + 1)} disabled={formStep === 1 ? !canCreateStep1 : !canCreateStep2} className="rounded-xl">Continuar</Button> : <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !canCreateStep1 || !canCreateStep2 || !fieldChecks.provider} className="rounded-xl"><CheckCircle2 size={16} className="mr-2" />Crear empresa</Button>}
          </div>
        </Modal>
      )}

      {selected && <DetailModal company={selected} environment={environment} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} onStats={() => setStatsCompany(selected)} onSettings={() => setSettingsCompany(selected)} onDian={(resource) => setDianCompany({ company: selected, resource })} />}
      {editing && <EditModal company={editing} catalogs={catalogs} onClose={() => setEditing(null)} onSave={(payload) => updateMutation.mutate({ ...payload, id: editing.id })} busy={updateMutation.isPending} />}
      {statsCompany && <RemoteJsonModal title={`Estadísticas proveedor · ${statsCompany.legal_name}`} endpoint={`/admin/companies/${statsCompany.id}/stats/`} environment={environment} onClose={() => setStatsCompany(null)} />}
      {settingsCompany && <SettingsModal company={settingsCompany} environment={environment} onClose={() => setSettingsCompany(null)} />}
      {dianCompany && <DianConfigurationModal company={dianCompany.company} initialResource={dianCompany.resource} environment={environment} onChanged={async () => { const { data } = await apiClient.get<Company>(`/admin/companies/${dianCompany.company.id}/`, { params: { environment } }); setSelected(data); }} onClose={() => setDianCompany(null)} />}
      {confirmConfig && <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />}
      {isBusy && <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#102F4B] px-4 py-3 text-sm font-semibold text-white shadow-2xl"><Loader2 size={16} className="animate-spin" />Procesando acción...</div>}
    </motion.div>
  );
}

function LiveChecks({ checks }: { checks: Record<string, boolean> }) {
  return <aside className="space-y-2 rounded-2xl border border-[#D9ECFA] bg-[#F8FCFF] p-3"><p className="text-sm font-extrabold text-[#102F4B] font-manrope">Verificación automática</p><VerificationItem ok={checks.companyName} label="Razón social" detail="Mínimo 3 caracteres." /><VerificationItem ok={checks.identityDocument} label="Tipo identificación" detail="Seleccionado desde /identity-documents." /><VerificationItem ok={checks.nit} label="Identificación" detail="Numérica, única y enviada como dni." /><VerificationItem ok={checks.verificationDigit} label="Dígito verificación" detail="Opcional, solo local." /><VerificationItem ok={checks.organizationType} label="Tipo contribuyente" detail="Seleccionado desde /organization-type." /><VerificationItem ok={checks.accountingRegime} label="Régimen contable" detail="Seleccionado desde /accounting-regime." /><VerificationItem ok={checks.fiscalRegime} label="Responsabilidad" detail="Seleccionada desde /fiscal-regime." /><VerificationItem ok={checks.country} label="País" detail="Colombia seleccionado desde catálogo proveedor." /><VerificationItem ok={checks.department} label="Departamento" detail="Seleccionado desde catálogo proveedor." /><VerificationItem ok={checks.city} label="Ciudad" detail="Corresponde al departamento seleccionado." /><VerificationItem ok={checks.mobile} label="Celular" detail="Prefijo +57 y 10 dígitos." /><VerificationItem ok={checks.phone} label="Teléfono" detail="Prefijo +57 y 10 dígitos." /><VerificationItem ok={checks.email} label="Correo" detail="Formato válido y único en NUVVI." /><VerificationItem ok={checks.password} label="Contraseña" detail="Temporal y confirmada." /><VerificationItem ok={checks.provider} label="proveedor" detail="Conexión lista para registrar empresas." /></aside>;
}

function IconAction({ title, icon, onClick, danger = false }: { title: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return <button type="button" aria-label={title} onClick={onClick} className={cn("group/action relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246FC1] focus-visible:ring-offset-2", danger ? "text-[#B42335] hover:bg-[#FDE8E8] focus-visible:bg-[#FDE8E8]" : "text-[#39566F] hover:bg-[#E8F0FE] hover:text-[#246FC1] focus-visible:bg-[#E8F0FE]")}>
    {icon}
    <span aria-hidden="true" className={cn("pointer-events-none absolute right-full top-1/2 z-30 mr-2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold opacity-0 shadow-[0_6px_18px_rgba(16,47,75,0.16)] transition-all duration-200 ease-out group-hover/action:translate-x-0 group-hover/action:opacity-100 group-focus-visible/action:translate-x-0 group-focus-visible/action:opacity-100", danger ? "border-[#F5C6CB] text-[#A51D30]" : "border-[#D9ECFA] text-[#244A6B]")}>{title}</span>
  </button>;
}

function CompaniesTable({ companies, busy, onView, onEdit, onStats, onSync, onEnable, onDisable, onArchive }: { companies: Company[]; busy: boolean; onView: (company: Company) => void; onEdit: (company: Company) => void; onStats: (company: Company) => void; onSync: (company: Company) => void; onEnable: (company: Company) => void; onDisable: (company: Company) => void; onArchive: (company: Company) => void }) {
  return <section className="overflow-hidden rounded-3xl border border-[#D9ECFA] bg-white shadow-[0_2px_18px_rgba(79,159,240,0.08)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF6FC] px-5 py-4"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#E8F0FE] p-3 text-[#246FC1]"><FileCheck2 size={20} /></div><div><p className="font-bold text-[#102F4B]">Empresas en NUVVI: {companies.length}</p><p className="text-xs text-[#6C8398]">Empresas registradas en esta vista y ambiente.</p></div></div></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="bg-[#F8FCFF] text-center text-xs uppercase tracking-wide text-[#6C8398]"><tr><th className="whitespace-nowrap px-5 py-3">Empresa</th><th className="whitespace-nowrap px-5 py-3">NIT</th><th className="px-5 py-3">Estado proveedor</th><th className="px-5 py-3">Facturación</th><th className="px-5 py-3">Última sincronización</th><th className="whitespace-nowrap px-5 py-3">Acciones</th></tr></thead><tbody className="divide-y divide-[#EEF6FC]">{companies.map((company) => <tr key={company.id} className="hover:bg-[#F8FCFF]"><td className="px-5 py-4 text-left"><p className="font-bold text-[#102F4B]">{company.legal_name}</p><p className="text-xs text-[#6C8398]">{company.email}</p></td><td className="px-5 py-4 text-center font-semibold text-[#39566F]">{company.nit}</td><td className="px-5 py-4 text-center"><StatusPill value={company.provider_link?.provider_status} label={company.provider_link?.provider_status_label} /></td><td className="px-5 py-4 text-center"><StatusPill value={company.onboarding_status} label={company.onboarding_status_label} /></td><td className="px-5 py-4 text-center text-[#6C8398]">{formatDate(company.provider_link?.last_sync_at)}</td><td className="px-5 py-4"><div className="flex justify-center gap-1"><IconAction title="Ver" onClick={() => onView(company)} icon={<Eye size={16} />} /><IconAction title="Editar" onClick={() => onEdit(company)} icon={<Pencil size={16} />} /><IconAction title="Sincronizar" onClick={() => onSync(company)} icon={<RefreshCw size={16} />} /><IconAction title="Estadísticas" onClick={() => onStats(company)} icon={<BarChart3 size={16} />} />{company.provider_link?.enabled_in_provider ? <IconAction title="Desactivar proveedor" danger onClick={() => onDisable(company)} icon={<PowerOff size={16} />} /> : <IconAction title="Habilitar" onClick={() => onEnable(company)} icon={<Power size={16} />} />}<IconAction title="Eliminar empresa" danger onClick={() => onArchive(company)} icon={<Trash2 size={16} />} /></div></td></tr>)}{!busy && !companies.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#6C8398]">No hay empresas registradas para los filtros actuales.</td></tr>}</tbody></table></div></section>;
}

function DetailModal({ company, environment, onClose, onEdit, onStats, onSettings, onDian }: { company: Company; environment: Environment; onClose: () => void; onEdit: () => void; onStats: () => void; onSettings: () => void; onDian: (resource: DianResource) => void }) {
  const [tab, setTab] = useState("resumen");
  const link = company.provider_link;
  return <Modal title={company.legal_name} onClose={onClose} wide><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#39566F]">NIT {company.nit}</p><div className="mt-2 flex flex-wrap gap-2"><StatusPill value={link?.provider_status} label={`Proveedor: ${link?.provider_status_label || "Sin registro"}`} /><StatusPill value={company.onboarding_status} label={`Facturación: ${company.onboarding_status_label}`} /></div></div><div className="flex gap-2"><Button onClick={onEdit} className="rounded-xl"><Pencil size={16} className="mr-2" />Editar</Button><Button variant="outline" onClick={onStats} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]"><BarChart3 size={16} className="mr-2" />Estadísticas</Button><Button variant="outline" onClick={onSettings} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]"><Settings size={16} className="mr-2" />Configuración</Button></div></div><div className="mb-5 flex flex-wrap gap-2">{["resumen", "empresa", "proveedor", "dian", "actividad"].map((item) => <button key={item} onClick={() => setTab(item)} className={cn("rounded-xl px-3 py-2 text-sm font-bold capitalize", tab === item ? "bg-[#E8F0FE] text-[#246FC1]" : "bg-[#F8FCFF] text-[#6C8398] hover:text-[#102F4B]")}>{item}</button>)}</div>{tab === "resumen" && <div className="grid gap-3 md:grid-cols-2"><Info label="Correo" value={company.email} /><Info label="Responsable" value={`${company.owner_first_name} ${company.owner_last_name}`} /><Info label="Dirección" value={company.address} /><Info label="Celular" value={company.mobile} /></div>}{tab === "empresa" && <div className="grid gap-3 md:grid-cols-2"><Info label="País" value={company.country_id} /><Info label="Departamento" value={company.department_id} /><Info label="Ciudad" value={company.city_id} /><Info label="Ejecutivo" value={company.assigned_executive} /><Info label="Notas" value={company.notes} /></div>}{tab === "proveedor" && <div className="grid gap-3 md:grid-cols-2"><Info label="ID de empresa en proveedor" value={link?.matias_company_id} /><Info label="Identificador de cliente" value={link?.matias_client_uuid} /><Info label="Empresa principal" value={link?.parent_company_uuid} /><Info label="Ambiente" value={link?.environment} /><Info label="Última sincronización" value={formatDate(link?.last_sync_at)} /><Info label="Último error" value={link?.last_error_message || "Ninguno"} /><div className="md:col-span-2"><pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#F8FCFF] p-4 text-xs text-[#39566F]">{JSON.stringify(link?.last_remote_snapshot || {}, null, 2)}</pre></div></div>}{tab === "dian" && <DianChecklist company={company} environment={environment} onConfigure={onDian} />}{tab === "actividad" && <div className="space-y-2">{company.recent_attempts.map((attempt) => <div key={attempt.id} className="rounded-2xl border border-[#D9ECFA] p-3 text-sm"><div className="flex justify-between gap-3"><b className="text-[#102F4B]">{attempt.operation}</b><StatusPill value={attempt.successful ? "REGISTERED" : "SYNC_ERROR"} label={attempt.successful ? "Correcto" : "Error"} /></div><p className="mt-1 text-xs text-[#6C8398]">{attempt.http_method} {attempt.endpoint} · HTTP {attempt.http_status ?? "-"} · {formatDate(attempt.created_at)}</p>{attempt.error_message && <p className="mt-1 text-xs font-semibold text-[#C94455]">{attempt.error_message}</p>}</div>)}</div>}</Modal>;
}

type DianResource = "software" | "resolutions" | "numbering-range" | "certificate";

function DianChecklist({ company, environment, onConfigure }: { company: Company; environment: Environment; onConfigure: (resource: DianResource) => void }) {
  const setupQuery = useQuery({ queryKey: ["company-dian-checklist", company.id, environment], queryFn: async () => {
    const endpoint = `/admin/companies/${company.id}/dian/`;
    const [software, resolutions, ranges, certificate] = await Promise.all([
      apiClient.get(endpoint, { params: { resource: "software", environment } }),
      apiClient.get(endpoint, { params: { resource: "resolutions", environment, type_id: 1 } }),
      apiClient.get(endpoint, { params: { resource: "numbering-range", environment, type_id: 1, sync: 1 } }),
      apiClient.get(endpoint, { params: { resource: "certificate", environment } }),
    ]);
    return { software: extractProviderRows(software.data), resolutions: extractProviderRows(resolutions.data), ranges: extractProviderRows(ranges.data), certificate: certificate.data };
  }, enabled: !!company.provider_link?.enabled_in_provider, retry: false });
  const taxDataReady = !!company.identity_document_code && !!company.organization_type_code && !!company.accounting_regime_code && !!company.fiscal_regime_code && !!company.city_id && !!company.address;
  const rows = [
    { title: "Empresa registrada y habilitada en MATIAS", resource: null, done: !!company.provider_link?.enabled_in_provider, detail: company.provider_link?.enabled_in_provider ? "La empresa está habilitada en el ambiente seleccionado." : "Registra y habilita primero la empresa desde la pestaña Proveedor." },
    { title: "Datos tributarios de la empresa", resource: null, done: taxDataReady, detail: "Verifica identificación, tipo de organización, régimen fiscal y contable, ciudad y dirección." },
    { title: "Software DIAN", resource: "software" as const, done: !!setupQuery.data?.software.length, detail: "Consultar o registrar el software vinculado al cliente." },
    { title: "Pruebas DIAN", resource: "software" as const, done: false, detail: "Iniciar el set de pruebas del software registrado." },
    { title: "Resolución y rango", resource: "resolutions" as const, done: !!setupQuery.data?.resolutions.length, detail: "Revisar autorización, prefijo, consecutivos y vigencia." },
    { title: "Certificado de firma", resource: "certificate" as const, done: environment === "sandbox" || !!(setupQuery.data?.certificate && Object.keys(setupQuery.data.certificate).length), detail: environment === "sandbox" ? "MATIAS asigna automáticamente un certificado de prueba en Sandbox." : "Consultar certificado productivo y controlar su fecha real de expiración." },
    { title: "Rangos sincronizados con DIAN", resource: "numbering-range" as const, done: !!setupQuery.data?.ranges.length, detail: "Consultar la numeración autorizada y su vigencia oficial." },
  ];
  return <div className="space-y-3"><div className="rounded-2xl border border-[#D9ECFA] bg-[#F8FCFF] p-4 text-sm leading-relaxed text-[#39566F]">{environment === "sandbox" ? "Sandbox simula el proceso y no habilita legalmente a facturar en Producción." : "La configuración MATIAS no sustituye los pasos regulatorios que correspondan ante la DIAN."} {setupQuery.isLoading ? "Consultando estados reales del cliente…" : setupQuery.isError ? <button className="font-bold underline" onClick={() => setupQuery.refetch()}>No se pudieron consultar los estados remotos. Reintentar.</button> : "Los estados remotos se consultan en MATIAS; los datos tributarios se verifican con la ficha de la empresa."}</div>{rows.map((row, index) => <div key={row.title} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F8FCFF] p-4"><div className="flex items-start gap-3"><span className={cn("mt-0.5", row.done ? "text-[#178C68]" : "text-[#B97812]")}><CheckCircle2 size={18} /></span><div><p className="text-sm font-bold text-[#102F4B]">{index + 1}. {row.title}</p><p className="mt-1 text-xs text-[#6C8398]">{row.detail}</p></div></div><div className="flex items-center gap-3"><span className={cn("text-xs font-bold", row.done ? "text-[#178C68]" : "text-[#B97812]")}>{row.resource && setupQuery.isLoading ? "Consultando" : row.done ? "Configurado" : "Pendiente"}</span>{row.resource ? <button type="button" aria-label={`Configurar ${row.title}`} title={`Configurar ${row.title}`} onClick={() => onConfigure(row.resource!)} disabled={!company.provider_link?.enabled_in_provider} className="group/config relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[#246FC1] transition hover:bg-[#E8F0FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246FC1] disabled:cursor-not-allowed disabled:opacity-40"><Settings size={18} /><span className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg border border-[#D9ECFA] bg-white px-3 py-2 text-xs font-semibold text-[#244A6B] opacity-0 shadow-lg transition-all duration-200 group-hover/config:translate-x-0 group-hover/config:opacity-100 group-focus-visible/config:translate-x-0 group-focus-visible/config:opacity-100">Configurar {row.title}</span></button> : <span className="text-xs font-semibold text-[#6C8398]">Revisar ficha</span>}</div></div>)}</div>;
}

function extractProviderRows(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.dataRecords?.data)) return value.dataRecords.data;
  for (const key of ["data", "results", "resolutions", "software", "items"]) {
    if (Array.isArray(value[key])) return value[key];
    if (value[key] && typeof value[key] === "object") {
      const nested = extractProviderRows(value[key]);
      if (nested.length) return nested;
    }
  }
  return [];
}

function DianConfigurationModal({ company, initialResource, environment, onChanged, onClose }: { company: Company; initialResource: DianResource; environment: Environment; onChanged: () => Promise<void>; onClose: () => void }) {
  const [resource, setResource] = useState<DianResource>(initialResource);
  const [payloadText, setPayloadText] = useState('{\n  \n}');
  const [softwareId, setSoftwareId] = useState("");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePassword, setCertificatePassword] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const queryClient = useQueryClient();
  const endpoint = `/admin/companies/${company.id}/dian/`;
  const queries = useQuery({ queryKey: ["company-dian", company.id, environment, resource], queryFn: async () => (await apiClient.get(endpoint, { params: { resource, environment, ...(resource === "numbering-range" ? { type_id: 1, sync: 1 } : {}) } })).data, retry: false });
  const mutation = useMutation({ mutationFn: async ({ action, id }: { action?: string; id?: string } = {}) => {
    let payload: Record<string, unknown> = { environment, resource };
    if (action === "run-test") payload = { ...payload, action, software_id: Number(softwareId) };
    else if (action === "expiration") payload = { ...payload, action };
    else if (action === "upload" || action === "renew") {
      if (!certificateFile) throw new Error("Selecciona un certificado .p12 o .pfx.");
      if (!/\.p12$|\.pfx$/i.test(certificateFile.name) || certificateFile.size > 10 * 1024 * 1024) throw new Error("El certificado debe ser .p12/.pfx y no superar el límite de 10 MB.");
      const base64Certificate = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(`data:application/x-pkcs12;base64,${String(reader.result || "").split(",")[1] || ""}`);
        reader.onerror = () => reject(new Error("No fue posible leer el certificado."));
        reader.readAsDataURL(certificateFile);
      });
      payload = { ...payload, action, ...(action === "renew" ? { id: certificateId } : {}), certificate: base64Certificate, password: certificatePassword, description: `Certificado ${environment}` };
    }
    else if (action === "save" || action === "delete") payload = { ...payload, ...JSON.parse(payloadText), ...(id ? { id } : {}) };
    const response = action === "delete" ? await apiClient.delete(endpoint, { params: { resource, environment, id: payload.id } }) : action === "save" && payload.id ? await apiClient.put(endpoint, payload) : await apiClient.post(endpoint, payload);
    return response.data;
  }, onSuccess: async (data, variables) => { toast.success(variables.action === "run-test" ? "Pruebas DIAN iniciadas en MATIAS" : "Operación completada en MATIAS"); queryClient.invalidateQueries({ queryKey: ["company-dian", company.id, environment] }); queryClient.invalidateQueries({ queryKey: ["companies"] }); try { await onChanged(); } catch { toast.error("No se pudo actualizar la vista del historial; vuelve a abrir la empresa para ver los cambios."); } setPayloadText(JSON.stringify(data?.data || data || {}, null, 2)); }, onError: (error: any) => toast.error(getApiErrorMessage(error, error?.message || "No se pudo completar la operación con MATIAS.")) });
  const items = Array.isArray(queries.data?.data) ? queries.data.data : Array.isArray(queries.data?.results) ? queries.data.results : queries.data;
  const expirations = findExpiryDates(items);
  const nearestExpiry = expirations.sort((left, right) => left.getTime() - right.getTime())[0];
  const daysToExpiry = nearestExpiry ? Math.ceil((nearestExpiry.getTime() - Date.now()) / 86_400_000) : null;
  return <Modal title={`Configuración DIAN · ${company.legal_name}`} onClose={onClose} wide>
    <div className="mb-4 rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] p-3 text-sm text-[#39566F]">Ambiente: <b>{environment === "sandbox" ? "Sandbox" : "Producción"}</b>. Operaciones aplicadas al cliente en MATIAS.</div>
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{([["software", "Software DIAN"], ["resolutions", "Resoluciones"], ["numbering-range", "Rangos DIAN"], ["certificate", "Certificado"]] as [DianResource, string][]).map(([key, label]) => <button key={key} onClick={() => setResource(key)} className={cn("min-h-11 rounded-xl px-3 text-sm font-bold", resource === key ? "bg-[#E8F0FE] text-[#246FC1]" : "bg-[#F8FCFF] text-[#39566F]")}>{label}</button>)}</div>
    {queries.isLoading ? <div className="flex items-center gap-2 py-8 text-sm text-[#6C8398]"><Loader2 className="animate-spin" size={18} />Consultando MATIAS…</div> : queries.isError ? <div role="alert" className="rounded-xl bg-[#FFF3E0] p-3 text-sm text-[#8A5700]">{getApiErrorMessage(queries.error, "No fue posible consultar este recurso.")} <button className="ml-2 underline" onClick={() => queries.refetch()}>Reintentar</button></div> : <>
      <div className="max-h-56 overflow-auto rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] p-3"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6C8398]">Información obtenida del proveedor</p><pre className="whitespace-pre-wrap break-all text-xs text-[#244A6B]">{JSON.stringify(items ?? {}, null, 2)}</pre></div>
      {(resource === "resolutions" || resource === "numbering-range" || resource === "certificate") && nearestExpiry && <div role="status" className={cn("mt-3 rounded-xl p-3 text-sm font-semibold", daysToExpiry !== null && daysToExpiry <= 21 ? "bg-[#FFF3E0] text-[#8A5700]" : "bg-[#D8F5EB] text-[#176B53]")}>{daysToExpiry !== null && daysToExpiry < 0 ? `Vigencia vencida desde ${nearestExpiry.toLocaleDateString("es-CO")}.` : daysToExpiry !== null && daysToExpiry <= 21 ? `Aviso preventivo: la vigencia vence el ${nearestExpiry.toLocaleDateString("es-CO")}. Confirma anticipadamente el trámite correspondiente con DIAN o MATIAS.` : `Próximo vencimiento identificado: ${nearestExpiry.toLocaleDateString("es-CO")}.`}</div>}
      {resource === "software" && <div className="mt-4 flex flex-wrap items-end gap-3"><label className="min-w-48 flex-1 space-y-1 text-xs font-semibold text-[#39566F]">ID de software para pruebas<input value={softwareId} onChange={(event) => setSoftwareId(event.target.value)} inputMode="numeric" className="h-11 w-full rounded-xl border border-[#D9ECFA] px-3 text-sm" /></label><Button disabled={!softwareId || mutation.isPending} onClick={() => { apiClient.get(endpoint, { params: { resource: "software", action: "test-set", id: softwareId, environment } }).then(({ data }) => setPayloadText(JSON.stringify(data, null, 2))).catch((error) => toast.error(getApiErrorMessage(error, "No se pudo consultar el set de pruebas."))); }} variant="outline" className="rounded-xl">Consultar set de pruebas</Button><Button disabled={!softwareId || mutation.isPending} onClick={() => mutation.mutate({ action: "run-test" })} className="rounded-xl">Iniciar pruebas DIAN</Button></div>}
      {resource === "certificate" && <div className="mt-3 space-y-3"><div className="flex flex-wrap items-center gap-3"><Button variant="outline" className="rounded-xl" disabled={mutation.isPending} onClick={() => mutation.mutate({ action: "expiration" })}>Consultar expiración</Button>{environment === "sandbox" && <p className="text-xs text-[#39566F]">MATIAS asigna automáticamente el Test Cert en Sandbox. No se requiere certificado real para las pruebas normales.</p>}</div><details className="rounded-xl border border-[#D9ECFA] p-3"><summary className="cursor-pointer text-sm font-bold text-[#39566F]">Cargar o renovar certificado (.p12 / .pfx)</summary><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="space-y-1 text-xs font-semibold text-[#39566F]">Archivo de certificado<input type="file" accept=".p12,.pfx,application/x-pkcs12" onChange={(event) => setCertificateFile(event.target.files?.[0] || null)} className="block min-h-11 w-full rounded-xl border border-[#D9ECFA] p-2 text-sm" /></label><label className="space-y-1 text-xs font-semibold text-[#39566F]">Contraseña del certificado<input type="password" autoComplete="new-password" value={certificatePassword} onChange={(event) => setCertificatePassword(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9ECFA] px-3 text-sm" /></label></div><p className="mt-2 text-xs text-[#6C8398]">El archivo se codifica en memoria y se envía por HTTPS a MATIAS. NUVVI no lo guarda ni registra su contraseña.</p><div className="mt-3 flex flex-wrap gap-2"><Button className="rounded-xl" disabled={!certificateFile || !certificatePassword || mutation.isPending} onClick={() => mutation.mutate({ action: "upload" })}>Cargar certificado</Button></div><label className="mt-3 block space-y-1 text-xs font-semibold text-[#39566F]">ID del certificado activo, requerido para PUT /certificate/{"{id}"}<input value={certificateId} onChange={(event) => setCertificateId(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9ECFA] px-3 text-sm" /></label><Button variant="outline" className="mt-2 rounded-xl" disabled={!certificateFile || !certificatePassword || !certificateId || mutation.isPending} onClick={() => mutation.mutate({ action: "renew" })}>Renovar certificado</Button></details></div>}
      {resource !== "certificate" && <div className="mt-4 space-y-2"><label className="block text-xs font-semibold text-[#39566F]">JSON de creación/actualización<textarea value={payloadText} onChange={(event) => setPayloadText(event.target.value)} rows={7} spellCheck={false} className="mt-1 w-full rounded-xl border border-[#D9ECFA] p-3 font-mono text-xs" /></label><p className="text-xs text-[#6C8398]">La documentación pública lista los métodos, pero no publica el esquema completo de todos los bodies. Consulta <a className="font-bold text-[#246FC1] underline" href="https://docs.matias-api.com/docs/endpoints/dian-software/" target="_blank" rel="noreferrer">Software DIAN</a> y <a className="font-bold text-[#246FC1] underline" href="https://docs.matias-api.com/docs/endpoints/dian-resolutions/" target="_blank" rel="noreferrer">Resoluciones</a> para el contrato vigente. Para actualizar/eliminar incluye el `id` del registro.</p><div className="flex flex-wrap gap-2"><Button disabled={mutation.isPending} onClick={() => { try { JSON.parse(payloadText); mutation.mutate({ action: "save" }); } catch { toast.error("El contenido debe ser JSON válido."); } }} className="rounded-xl">Enviar a MATIAS</Button><Button variant="outline" disabled={mutation.isPending} onClick={() => { try { const parsed = JSON.parse(payloadText); if (!parsed.id) { toast.error("Incluye el id del registro que deseas eliminar."); return; } if (window.confirm("¿Eliminar este registro DIAN en MATIAS?")) mutation.mutate({ action: "delete" }); } catch { toast.error("El contenido debe ser JSON válido."); } }}>Eliminar registro</Button></div></div>}
    </>}
  </Modal>;
}

function findExpiryDates(value: unknown, key = ""): Date[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap((item) => findExpiryDates(item, key));
  return Object.entries(value as Record<string, unknown>).flatMap(([field, item]) => {
    const name = field.toLowerCase();
    const isExpiry = ["expiration", "expires", "valid_until", "validity_end", "date_to", "date_end", "end_date", "valid_to", "fecha_fin", "fecha_vencimiento", "vigencia_hasta"].some((marker) => name.includes(marker));
    if (isExpiry && typeof item === "string") {
      const date = new Date(item);
      return Number.isNaN(date.getTime()) ? [] : [date];
    }
    return findExpiryDates(item, field || key);
  });
}

function EditModal({ company, catalogs, onClose, onSave, busy }: { company: Company; catalogs: { countries: CatalogItem[]; departments: CatalogItem[]; cities: CatalogItem[]; identity_documents: CatalogItem[]; organization_types: CatalogItem[]; accounting_regimes: CatalogItem[]; fiscal_regimes: CatalogItem[] }; onClose: () => void; onSave: (payload: Record<string, string>) => void; busy: boolean }) {
  const [form, setForm] = useState({
    company_name: company.legal_name, nit: company.nit, email: company.email,
    owner_first_name: company.owner_first_name, owner_last_name: company.owner_last_name,
    identity_document_id: company.identity_document_id || "", verification_digit: company.verification_digit || "",
    organization_type_id: company.organization_type_id || "", accounting_regime_id: company.accounting_regime_id || "",
    fiscal_regime_id: company.fiscal_regime_id || "", country_id: company.country_id || "",
    department_id: company.department_id || "", city_id: company.city_id || "", address: company.address || "",
    mobile: company.mobile || "+57", phone: company.phone || "+57", notes: company.notes || "",
    assigned_executive: company.assigned_executive || "",
  });
  const [step, setStep] = useState(1);
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [confirmNitChange, setConfirmNitChange] = useState(false);
  const nitChanged = form.nit !== company.nit;
  const picked = (key: keyof typeof form) => catalogs.identity_documents.find((item) => optionId(item) === form[key]) || undefined;
  const identity = picked("identity_document_id");
  const organization = catalogs.organization_types.find((item) => optionId(item) === form.organization_type_id);
  const accounting = catalogs.accounting_regimes.find((item) => optionId(item) === form.accounting_regime_id);
  const fiscal = catalogs.fiscal_regimes.find((item) => optionId(item) === form.fiscal_regime_id);
  const department = catalogs.departments.find((item) => optionId(item) === form.department_id);
  const city = catalogs.cities.find((item) => optionId(item) === form.city_id);
  const cities = catalogs.cities.filter((item) => !form.department_id || cityDepartmentId(item) === form.department_id);
  const identityCode = optionCode(identity);
  const identityName = optionName(identity);
  const organizationCode = optionCode(organization);
  const organizationName = optionName(organization);
  const accountingCode = optionCode(accounting);
  const accountingName = optionName(accounting);
  const fiscalCode = optionCode(fiscal);
  const fiscalName = optionName(fiscal);
  useEffect(() => {
    const documentAbbreviation = String(identity?.abbreviation || "").toUpperCase();
    const documentCode = String(identity?.code || "");
    const applies = ["NIT", "CC"].includes(documentAbbreviation) || ["31", "13"].includes(documentCode);
    const calculatedDigit = applies ? calculateNitDv(form.nit) : "";
    setForm((current) => current.verification_digit === calculatedDigit ? current : { ...current, verification_digit: calculatedDigit });
  }, [form.nit, identity?.abbreviation, identity?.code]);
  const validIdentity = !!identity && /^\d{5,15}$/.test(form.nit);
  const validBusiness = form.company_name.trim().length >= 3 && validIdentity && !!organization && !!accounting && !!fiscal && !!form.country_id && !!department && !!city && form.address.trim().length >= 5;
  const validContact = form.owner_first_name.trim().length >= 2 && form.owner_last_name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && /^\+57\d{10}$/.test(form.mobile) && /^\+57\d{10}$/.test(form.phone);
  const save = () => onSave({
    ...form, email: normalizeEmail(form.email), verification_digit: form.verification_digit,
    identity_document_code: identityCode, identity_document_name: identityName,
    organization_type_code: organizationCode, organization_type_name: organizationName,
    accounting_regime_code: accountingCode, accounting_regime_name: accountingName,
    fiscal_regime_code: fiscalCode, fiscal_regime_name: fiscalName,
  });
  return <Modal title={`Editar empresa · ${company.legal_name}`} onClose={onClose} wide>
    <div className="mb-5 grid gap-2 sm:grid-cols-2">{["Datos de empresa y tributarios", "Responsable y contacto"].map((label, index) => <div key={label} className={cn("rounded-2xl border p-3 text-sm font-bold", step === index + 1 ? "border-[#4F9FF0] bg-[#E8F0FE] text-[#246FC1]" : "border-[#D9ECFA] bg-[#F8FCFF] text-[#6C8398]")}>Paso {index + 1}: {label}</div>)}</div>
    <div className="mb-5 rounded-2xl border border-[#D9ECFA] bg-[#F8FCFF] px-4 py-3 text-sm text-[#39566F]">Los datos de identificación, empresa y contacto se guardan en NUVVI. Razón social, NIT y correo también se sincronizan con el proveedor.</div>
    {step === 1 ? <div className="grid gap-4 md:grid-cols-2">
      <Field label="Razón social" required error={form.company_name.trim().length < 3 ? "Escribe al menos 3 caracteres." : undefined}><input value={form.company_name} onChange={(event) => setForm((current) => ({ ...current, company_name: event.target.value }))} className={inputClass} /></Field>
      <SearchableObjectSelect id="edit-identity" label="Tipo de identificación" required value={form.identity_document_id} options={catalogs.identity_documents} placeholder="Seleccionar tipo" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((current) => ({ ...current, identity_document_id: value }))} />
      <Field label="Identificación (NIT)" required hint="Solo números, entre 5 y 15 dígitos." error={form.nit && !/^\d{5,15}$/.test(form.nit) ? "Verifica el número de identificación." : undefined}><input inputMode="numeric" value={form.nit} onChange={(event) => setForm((current) => ({ ...current, nit: onlyNumbers(event.target.value, 15) }))} className={inputClass} /></Field>
      <Field label="Dígito de verificación" hint="Se calcula automáticamente cuando aplica."><input readOnly value={form.verification_digit} className={cn(inputClass, "bg-[#F8FCFF] font-bold")} /></Field>
      <SearchableObjectSelect id="edit-organization" label="Tipo de contribuyente" required value={form.organization_type_id} options={catalogs.organization_types} placeholder="Seleccionar tipo" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((current) => ({ ...current, organization_type_id: value }))} />
      <SearchableObjectSelect id="edit-accounting" label="Régimen contable" required value={form.accounting_regime_id} options={catalogs.accounting_regimes} placeholder="Seleccionar régimen" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((current) => ({ ...current, accounting_regime_id: value }))} />
      <SearchableObjectSelect id="edit-fiscal" label="Responsabilidad fiscal" required value={form.fiscal_regime_id} options={catalogs.fiscal_regimes} placeholder="Seleccionar responsabilidad" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((current) => ({ ...current, fiscal_regime_id: value }))} />
      <SearchableObjectSelect id="edit-country" label="País" required value={form.country_id} options={catalogs.countries} placeholder="Seleccionar país" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((current) => ({ ...current, country_id: value }))} />
      <SearchableObjectSelect id="edit-department" label="Departamento" required value={form.department_id} options={catalogs.departments} placeholder="Seleccionar departamento" openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((current) => ({ ...current, department_id: value, city_id: "" }))} />
      <SearchableObjectSelect id="edit-city" label="Ciudad" required value={form.city_id} options={cities} placeholder="Seleccionar ciudad" disabled={!form.department_id} openSelect={openSelect} setOpenSelect={setOpenSelect} onChange={(value) => setForm((current) => ({ ...current, city_id: value }))} />
      <Field label="Dirección" required error={form.address.trim().length < 5 ? "Escribe una dirección válida." : undefined}><input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className={inputClass} /></Field>
    </div> : <div className="grid gap-4 md:grid-cols-2">
      <Field label="Nombres del responsable" required error={form.owner_first_name.trim().length < 2 ? "Escribe al menos 2 caracteres." : undefined}><input value={form.owner_first_name} onChange={(event) => setForm((current) => ({ ...current, owner_first_name: event.target.value }))} className={inputClass} /></Field>
      <Field label="Apellidos del responsable" required error={form.owner_last_name.trim().length < 2 ? "Escribe al menos 2 caracteres." : undefined}><input value={form.owner_last_name} onChange={(event) => setForm((current) => ({ ...current, owner_last_name: event.target.value }))} className={inputClass} /></Field>
      <Field label="Correo de contacto" required error={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Escribe un correo válido." : undefined}><input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={inputClass} /></Field>
      <Field label="Celular" required hint="Indicativo +57 y 10 dígitos." error={!/^\+57\d{10}$/.test(form.mobile) ? "Ingresa un celular colombiano válido." : undefined}><input inputMode="tel" value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: `+57${onlyNumbers(event.target.value.replace(/^\+57/, ""), 10)}` }))} className={inputClass} /></Field>
      <Field label="Teléfono alternativo" required hint="Indicativo +57 y 10 dígitos." error={!/^\+57\d{10}$/.test(form.phone) ? "Ingresa un teléfono válido." : undefined}><input inputMode="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: `+57${onlyNumbers(event.target.value.replace(/^\+57/, ""), 10)}` }))} className={inputClass} /></Field>
      <Field label="Ejecutivo asignado"><input value={form.assigned_executive} onChange={(event) => setForm((current) => ({ ...current, assigned_executive: event.target.value }))} className={inputClass} /></Field>
      <div className="md:col-span-2"><Field label="Notas internas"><textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-24 w-full rounded-xl border border-[#D9ECFA] bg-white px-3 py-2 text-sm text-[#102F4B] outline-none focus:ring-2 focus:ring-[#4F9FF0]/20" /></Field></div>
    </div>}
    {nitChanged && <p className="mt-4 rounded-xl bg-[#FFF3E0] px-3 py-2 text-sm font-semibold text-[#9A5B00]">El cambio de identificación se sincronizará con el proveedor y puede afectar la identidad fiscal.</p>}
    <div className="mt-6 flex flex-wrap justify-between gap-2"><Button variant="outline" onClick={step === 1 ? onClose : () => setStep(1)} disabled={busy} className="rounded-xl border-[#D9ECFA] bg-white text-[#39566F]">{step === 1 ? "Cancelar" : "Atrás"}</Button><div className="flex gap-2">{step === 1 ? <Button onClick={() => setStep(2)} disabled={!validBusiness || busy} className="rounded-xl">Continuar</Button> : <Button onClick={() => nitChanged ? setConfirmNitChange(true) : save()} disabled={!validBusiness || !validContact || busy} className="rounded-xl"><CheckCircle2 size={16} className="mr-2" />Guardar cambios</Button>}</div></div>
    {confirmNitChange && <ConfirmDialog config={{ title: "Confirmar cambio de identificación", message: "La identificación fiscal se actualizará en NUVVI y se sincronizará con el proveedor. Confirma que el nuevo número es correcto.", confirmLabel: "Confirmar y guardar", tone: "danger", onConfirm: save }} onClose={() => setConfirmNitChange(false)} />}
  </Modal>;
}

function RemoteJsonModal({ title, endpoint, environment, onClose }: { title: string; endpoint: string; environment: Environment; onClose: () => void }) {
  const query = useQuery({ queryKey: [endpoint, environment], queryFn: async () => (await apiClient.get(endpoint, { params: { environment } })).data });
  return <Modal title={title} onClose={onClose} wide>{query.isLoading ? <p className="text-sm text-[#6C8398]">Consultando proveedor...</p> : <pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-[#F8FCFF] p-4 text-xs text-[#39566F]">{JSON.stringify(query.data || {}, null, 2)}</pre>}</Modal>;
}

function SettingsModal({ company, environment, onClose }: { company: Company; environment: Environment; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [key, setKey] = useState("invoice_prefix");
  const [value, setValue] = useState("");
  const query = useQuery({ queryKey: ["company-settings", company.id, environment], queryFn: async () => (await apiClient.get(`/admin/companies/${company.id}/settings/`, { params: { environment } })).data });
  const mutation = useMutation({ mutationFn: async () => (await apiClient.put(`/admin/companies/${company.id}/settings/`, { environment, setting_key: key, setting_value: value })).data, onSuccess: () => { toast.success("Configuración actualizada en proveedor"); queryClient.invalidateQueries({ queryKey: ["company-settings", company.id, environment] }); }, onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo actualizar configuración.")) });
  return <Modal title={`Configuración proveedor · ${company.legal_name}`} onClose={onClose} wide><div className="mb-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><Field label="Clave"><input value={key} onChange={(e) => setKey(e.target.value)} className={inputClass} /></Field><Field label="Valor"><input value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} /></Field><div className="flex items-end"><Button onClick={() => mutation.mutate()} disabled={!key || mutation.isPending} className="h-11 rounded-xl">Actualizar</Button></div></div>{query.isLoading ? <p className="text-sm text-[#6C8398]">Consultando proveedor...</p> : <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-[#F8FCFF] p-4 text-xs text-[#39566F]">{JSON.stringify(query.data || {}, null, 2)}</pre>}</Modal>;
}
