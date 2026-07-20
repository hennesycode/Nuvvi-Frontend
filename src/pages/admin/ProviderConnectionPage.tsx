import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, PlugZap, RefreshCw, RotateCcw, Save, Server, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MatiasConnection } from "@/types";

const defaultUrls = {
  sandbox: "https://sandbox-api.matias-api.com/api/ubl2.1",
  production: "https://api-v2.matias-api.com/api/ubl2.1",
};

type FormState = {
  enabled: boolean;
  environment: "sandbox" | "production";
  base_url: string;
  timeout_seconds: number;
  retry_attempts: number;
  token_generation_endpoint: string;
  account_email: string;
  token_name: string;
  parent_company_uuid: string;
};

const emptyForm: FormState = {
  enabled: false,
  environment: "sandbox",
  base_url: defaultUrls.sandbox,
  timeout_seconds: 20,
  retry_attempts: 2,
  token_generation_endpoint: "/tokens",
  account_email: "",
  token_name: "",
  parent_company_uuid: "",
};

function formatDate(value?: string | null) {
  if (!value) return "Sin registro";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusStyle(status: string) {
  if (["CONNECTED", "READY_TO_REGISTER_COMPANIES", "synced"].includes(status)) return "bg-[#D8F5EB] text-[#178C68]";
  if (["DISABLED", "NOT_CONFIGURED", "INACTIVE", "PAT_REQUIRED", "DISCONNECTED", "pending", "CATALOGS_NOT_SYNCHRONIZED"].includes(status)) return "bg-[#FFF3E0] text-[#B97812]";
  return "bg-[#FDE8E8] text-[#C94455]";
}

function getApiErrorMessage(error: any, fallback: string) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  const firstField = Object.keys(data)[0];
  const firstMessage = firstField ? data[firstField] : null;
  if (Array.isArray(firstMessage)) return firstMessage[0];
  if (typeof firstMessage === "string") return firstMessage;
  return fallback;
}

function StatusPill({ value }: { value: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", statusStyle(value))}>{value}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#D9ECFA] bg-white p-5 shadow-[0_2px_12px_rgba(79,159,240,0.04)] sm:p-6">
      <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-[#102F4B] font-manrope">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">{label}</span>{children}</label>;
}

const inputClass = "h-11 w-full rounded-xl border border-[#D9ECFA] bg-white px-3 text-sm text-[#102F4B] outline-none transition-all focus:ring-2 focus:ring-[#4F9FF0]/20";

export function ProviderConnectionPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [newToken, setNewToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [generateForm, setGenerateForm] = useState({ email: "", password: "", token_name: "Integración Nuvvi", description: "Token principal del servidor de facturación", expires_in_days: 90 });

  const connectionQuery = useQuery({
    queryKey: ["matias-connection"],
    queryFn: async () => {
      const { data } = await apiClient.get<MatiasConnection>("/matias/connection/");
      return data;
    },
  });

  const connection = connectionQuery.data;

  useEffect(() => {
    if (!connection) return;
    setForm({
      enabled: connection.enabled,
      environment: connection.environment,
      base_url: connection.base_url,
      timeout_seconds: connection.timeout_seconds,
      retry_attempts: connection.retry_attempts,
      token_generation_endpoint: connection.token_generation_endpoint || "/tokens",
      account_email: connection.account_email || "",
      token_name: connection.token_name || "",
      parent_company_uuid: connection.parent_company_uuid || "",
    });
  }, [connection]);

  const saveMutation = useMutation<MatiasConnection, unknown, boolean>({
    mutationFn: async (testAfter = false) => {
      const { data } = await apiClient.put<MatiasConnection>("/matias/connection/", form);
      if (testAfter) {
        const tested = await apiClient.post<MatiasConnection>("/matias/test/");
        return tested.data;
      }
      return data;
    },
    onSuccess: (data, testAfter) => {
      queryClient.setQueryData(["matias-connection"], data);
      toast.success(testAfter ? "Configuración guardada y prueba ejecutada correctamente" : "Configuración MATIAS guardada correctamente");
    },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo guardar la configuración MATIAS.")),
  });

  const tokenMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<MatiasConnection>("/matias/token/", { access_token: newToken, token_name: form.token_name, account_email: form.account_email });
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["matias-connection"], data);
      setNewToken("");
      toast.success("PAT guardado cifrado correctamente");
    },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo guardar el PAT de MATIAS.")),
  });

  const testMutation = useMutation({
    mutationFn: async () => (await apiClient.post<MatiasConnection>("/matias/test/")).data,
    onSuccess: (data) => { queryClient.setQueryData(["matias-connection"], data); toast.success("Prueba de conexión finalizada y registrada en actividad"); },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo probar la conexión MATIAS.")),
  });

  const syncMutation = useMutation({
    mutationFn: async () => (await apiClient.post<MatiasConnection>("/matias/sync-catalogs/")).data,
    onSuccess: (data) => { queryClient.setQueryData(["matias-connection"], data); toast.success("Sincronización de catálogos finalizada y registrada en actividad"); },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudieron sincronizar los catálogos MATIAS.")),
  });

  const generateMutation = useMutation({
    mutationFn: async () => (await apiClient.post<MatiasConnection>("/matias/generate-pat/", generateForm)).data,
    onSuccess: (data) => { queryClient.setQueryData(["matias-connection"], data); setGenerateForm((current) => ({ ...current, password: "" })); toast.success("PAT generado y guardado cifrado correctamente"); },
    onError: (error: any) => toast.error(getApiErrorMessage(error, "No se pudo generar el PAT de MATIAS.")),
  });

  const canAct = !!connection && !connectionQuery.isLoading;
  const busy = saveMutation.isPending || tokenMutation.isPending || testMutation.isPending || syncMutation.isPending || generateMutation.isPending;
  const testResults = connection?.last_test_results ?? [];

  const changeEnvironment = (environment: "sandbox" | "production") => {
    if (environment !== form.environment && form.environment === "production" && !window.confirm("Vas a cambiar de Producción a Sandbox. Confirma que entiendes el impacto operativo.")) return;
    if (environment !== form.environment && environment === "production" && !window.confirm("Producción tiene efectos reales. ¿Deseas continuar?")) return;
    setForm((current) => ({ ...current, environment, base_url: defaultUrls[environment] }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope">Conexión proveedor</h1>
          <p className="mt-1 text-sm text-[#6C8398]">MATIAS se valida con solicitudes HTTP usando Authorization: Bearer PAT; no mantiene una conexión permanente.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => saveMutation.mutate(true)} disabled={!canAct || busy} className="h-11 rounded-xl bg-[#4F9FF0] hover:bg-[#246FC1]"><Save size={16} className="mr-2" />Guardar y probar</Button>
          <Button variant="outline" onClick={() => syncMutation.mutate()} disabled={!canAct || busy} className="h-11 rounded-xl border-[#D9ECFA] bg-white text-[#39566F] hover:bg-[#F8FCFF] disabled:text-[#6C8398]"><RefreshCw size={16} className="mr-2" />Sincronizar catálogos</Button>
          <Button variant="outline" onClick={() => setShowDiagnostics((current) => !current)} className="h-11 rounded-xl border-[#D9ECFA] bg-white text-[#39566F] hover:bg-[#F8FCFF]">Ver diagnóstico</Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-[#D9ECFA] bg-white shadow-[0_2px_18px_rgba(79,159,240,0.08)]">
        <div className="bg-gradient-to-br from-[#0C1E33] to-[#246FC1] p-5 text-white sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12"><PlugZap size={25} /></div>
              <div>
                <h2 className="text-xl font-extrabold font-manrope">MATIAS API</h2>
                <p className="text-sm text-white/75">{connection?.environment_label || "Sandbox"} · PAT {connection?.token_preview === "Sin configurar" ? "pendiente" : "configurado"} · {connection?.operational_status || "Sin diagnóstico"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold"><span className={cn("h-2.5 w-2.5 rounded-full", connection?.connection_status === "CONNECTED" ? "bg-[#66E3B4]" : "bg-[#FFB4B4]")} />{connection?.connection_status || "DISCONNECTED"}</div>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
          <Info label="Ambiente" value={connection?.environment_label || "Sandbox"} />
          <Info label="Autenticación" value={connection?.token_preview === "Sin configurar" ? "PAT pendiente" : "PAT configurado"} />
          <Info label="Cuenta principal" value={connection?.external_company_name || "No detectada"} />
          <Info label="NIT" value={connection?.external_company_nit || "-"} />
          <Info label="UUID empresa principal" value={connection?.parent_company_uuid ? `${connection.parent_company_uuid.slice(0, 8)}-****-****` : "-"} />
          <Info label="Permiso multiempresa" value={connection?.multicompany_verified ? "Verificado" : "Pendiente"} />
          <Info label="Catálogos" value={`${connection?.catalogs_synced_count || 0}/${connection?.catalogs_total_count || 18} sincronizados`} />
          <Info label="Tiempo respuesta" value={connection?.last_response_time_ms ? `${connection.last_response_time_ms} ms` : "-"} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Section title="1. Estado general">
            <div className="grid gap-3 sm:grid-cols-2"><Info label="Estado técnico" value={<StatusPill value={connection?.connection_status || "DISCONNECTED"} />} /><Info label="Estado operativo" value={<StatusPill value={connection?.operational_status || "CATALOGS_NOT_SYNCHRONIZED"} />} /><Info label="Última prueba" value={formatDate(connection?.last_test_at)} /><Info label="Última conexión exitosa" value={formatDate(connection?.last_success_at)} /></div>
          </Section>

          <Section title="2. Configuración del ambiente">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Integración activa"><button type="button" onClick={() => setForm((c) => ({ ...c, enabled: !c.enabled }))} className={cn("flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-bold", form.enabled ? "border-[#178C68] bg-[#D8F5EB] text-[#178C68]" : "border-[#D9ECFA] bg-[#F8FCFF] text-[#6C8398]")}><span>{form.enabled ? "Activa" : "Desactivada"}</span><span className={cn("h-6 w-11 rounded-full p-1 transition", form.enabled ? "bg-[#178C68]" : "bg-[#B8CBDC]")}><span className={cn("block h-4 w-4 rounded-full bg-white transition", form.enabled && "translate-x-5")} /></span></button></Field>
              <Field label="Ambiente"><div className="grid grid-cols-2 gap-2"><button onClick={() => changeEnvironment("sandbox")} className={cn("rounded-xl border p-3 text-left text-sm font-semibold text-[#102F4B]", form.environment === "sandbox" ? "border-[#4F9FF0] bg-[#E8F0FE] text-[#246FC1]" : "border-[#D9ECFA] bg-white hover:bg-[#F8FCFF]")}>Sandbox<p className="mt-1 text-xs font-normal text-[#6C8398]">No envía documentos reales.</p></button><button onClick={() => changeEnvironment("production")} className={cn("rounded-xl border p-3 text-left text-sm font-semibold text-[#102F4B]", form.environment === "production" ? "border-[#C94455] bg-[#FDE8E8] text-[#C94455]" : "border-[#D9ECFA] bg-white hover:bg-[#F8FCFF]")}>Producción<p className="mt-1 text-xs font-normal text-[#6C8398]">Tiene efectos reales.</p></button></div></Field>
              <Field label="URL base"><input value={form.base_url} onChange={(e) => setForm((c) => ({ ...c, base_url: e.target.value }))} className={inputClass} /></Field>
              <div className="flex items-end"><button onClick={() => setForm((c) => ({ ...c, base_url: defaultUrls[c.environment] }))} className="h-11 rounded-xl border border-[#D9ECFA] px-4 text-sm font-semibold text-[#39566F] hover:bg-[#F8FCFF]"><RotateCcw size={15} className="mr-2 inline" />Restablecer URL predeterminada</button></div>
              <Field label="Tiempo máximo de espera (segundos)"><input type="number" min={5} max={120} value={form.timeout_seconds} onChange={(e) => setForm((c) => ({ ...c, timeout_seconds: Number(e.target.value) }))} className={inputClass} /><p className="text-xs text-[#6C8398]">Tiempo límite de cada petición a MATIAS. Ejemplo: 20 segundos.</p></Field>
              <Field label="Reintentos automáticos"><input type="number" min={0} max={5} value={form.retry_attempts} onChange={(e) => setForm((c) => ({ ...c, retry_attempts: Number(e.target.value) }))} className={inputClass} /><p className="text-xs text-[#6C8398]">Cantidad de nuevos intentos ante errores temporales o timeout.</p></Field>
              <Field label="Endpoint creación PAT"><input value={form.token_generation_endpoint} onChange={(e) => setForm((c) => ({ ...c, token_generation_endpoint: e.target.value }))} className={inputClass} /><p className="text-xs text-[#6C8398]">Default /tokens. Solo se intenta /auth/token si /tokens devuelve 404.</p></Field>
            </div>
          </Section>

          <Section title="3. Autenticación">
            <div className="grid gap-4 md:grid-cols-2"><Field label="Método"><input readOnly value="Personal Access Token — PAT" className="h-11 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-bold text-[#102F4B]" /></Field><Field label="Correo de la cuenta"><input value={form.account_email} onChange={(e) => setForm((c) => ({ ...c, account_email: e.target.value }))} className={inputClass} /></Field><Field label="Nombre del token"><input value={form.token_name} onChange={(e) => setForm((c) => ({ ...c, token_name: e.target.value }))} className={inputClass} /></Field><Field label="ID externo del token"><div className="flex h-11 items-center rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-semibold text-[#102F4B]">{connection?.token_external_id || "Devuelto por MATIAS"}</div></Field><Field label="Fecha de expiración"><div className="flex h-11 items-center rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-semibold text-[#102F4B]">{connection?.token_expires_at ? formatDate(connection.token_expires_at) : "Devuelta por MATIAS"}</div></Field><Field label="Token actual"><div className="flex h-11 items-center rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-semibold text-[#102F4B]">{connection?.token_preview || "Sin configurar"}</div></Field></div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><input type={showToken ? "text" : "password"} value={newToken} onChange={(e) => setNewToken(e.target.value)} placeholder="Pegar o reemplazar PAT existente" className={inputClass} /><div className="flex gap-2"><button onClick={() => setShowToken((v) => !v)} className="h-11 rounded-xl border border-[#D9ECFA] px-4 text-[#39566F]">{showToken ? <EyeOff size={16} /> : <Eye size={16} />}</button><Button onClick={() => tokenMutation.mutate()} disabled={!newToken || busy} className="h-11 rounded-xl">Reemplazar PAT</Button></div></div>
          </Section>

          <Section title="4. Cuenta principal">
            <div className="grid gap-4 md:grid-cols-2"><Field label="UUID empresa desarrolladora"><input value={form.parent_company_uuid} onChange={(e) => setForm((c) => ({ ...c, parent_company_uuid: e.target.value }))} className={inputClass} /></Field><Info label="Empresa autenticada" value={connection?.external_company_name || "No detectada"} /><Info label="NIT" value={connection?.external_company_nit || "-"} /><Info label="Correo" value={connection?.account_main_email || connection?.account_email || "-"} /><Info label="Modalidad" value={connection?.multicompany_verified ? "Casa de software / Multiempresa verificada" : "Pendiente de validación"} /><Info label="Empresas vinculadas" value={String(connection?.linked_companies_count || 0)} /></div>
            <Button onClick={() => testMutation.mutate()} disabled={busy} className="mt-4 h-11 rounded-xl"><ShieldCheck size={16} className="mr-2" />Detectar cuenta automáticamente</Button>
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Generar token MATIAS"><div className="space-y-3"><input placeholder="Correo" value={generateForm.email} onChange={(e) => setGenerateForm((c) => ({ ...c, email: e.target.value }))} className={inputClass} /><input type="password" placeholder="Contraseña temporal (no se guarda)" value={generateForm.password} onChange={(e) => setGenerateForm((c) => ({ ...c, password: e.target.value }))} className={inputClass} /><input placeholder="Nombre del token" value={generateForm.token_name} onChange={(e) => setGenerateForm((c) => ({ ...c, token_name: e.target.value }))} className={inputClass} /><input placeholder="Descripción" value={generateForm.description} onChange={(e) => setGenerateForm((c) => ({ ...c, description: e.target.value }))} className={inputClass} /><input type="number" min={1} max={365} value={generateForm.expires_in_days} onChange={(e) => setGenerateForm((c) => ({ ...c, expires_in_days: Number(e.target.value) }))} className={inputClass} /><Button onClick={() => generateMutation.mutate()} disabled={busy || !generateForm.email || !generateForm.password} className="h-11 w-full rounded-xl"><KeyRound size={16} className="mr-2" />Iniciar sesión y generar token</Button></div></Section>

          <Section title="5. Sincronización de catálogos"><div className="space-y-3"><div className="rounded-2xl bg-[#F8FCFF] p-4"><p className="text-sm font-bold text-[#102F4B]">Catálogos: {connection?.catalogs_synced_count || 0}/{connection?.catalogs_total_count || 18} sincronizados</p><p className="mt-1 text-xs text-[#6C8398]">Los catálogos DIAN de MATIAS son públicos y no requieren PAT. Última carga: {formatDate(connection?.catalogs_last_synced_at)}</p></div><Button onClick={() => syncMutation.mutate()} disabled={busy} className="h-11 w-full rounded-xl"><RefreshCw size={16} className="mr-2" />Sincronizar ahora</Button><div className="max-h-72 overflow-y-auto rounded-2xl border border-[#D9ECFA]">{(connection?.catalogs_detail || []).map((item) => <div key={item.endpoint} className="flex items-center justify-between gap-3 border-b border-[#EEF6FC] px-3 py-2 last:border-0"><div><p className="text-sm font-semibold text-[#102F4B]">{item.name}</p><p className="text-xs text-[#6C8398]">{item.records ?? "—"} registros</p></div><StatusPill value={item.status === "Sincronizado" ? "synced" : "error"} /></div>)}</div></div></Section>

          <Section title="6. Diagnóstico y registros"><div className="space-y-3"><Info label="Última prueba" value={formatDate(connection?.last_test_at)} /><Info label="Último error" value={connection?.last_error_message || "Ninguno"} /><Info label="Ambiente detectado" value={connection?.environment_detected || "-"} /><Button variant="outline" onClick={() => setShowDiagnostics((v) => !v)} className="h-11 w-full rounded-xl border-[#D9ECFA] bg-white text-[#39566F] hover:bg-[#F8FCFF]">{showDiagnostics ? "Ocultar diagnóstico" : "Ver diagnóstico"}</Button>{showDiagnostics && <div className="space-y-2">{testResults.map((result) => <div key={result.label} className="rounded-xl border border-[#D9ECFA] p-3"><div className="flex items-center gap-2">{result.status === "success" ? <CheckCircle2 className="text-[#178C68]" size={16} /> : result.status === "warning" ? <AlertTriangle className="text-[#B97812]" size={16} /> : <XCircle className="text-[#C94455]" size={16} />}<p className="text-sm font-bold text-[#102F4B]">{result.label}</p></div><p className="mt-1 text-xs text-[#6C8398]">{result.detail}</p></div>)}</div>}</div></Section>
        </aside>
      </div>

      {busy && <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#102F4B] px-4 py-3 text-sm font-semibold text-white shadow-2xl"><Loader2 size={16} className="animate-spin" />Procesando acción MATIAS...</div>}
    </motion.div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl bg-[#F8FCFF] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#6C8398]">{label}</p><div className="mt-1 break-words text-sm font-semibold text-[#102F4B]">{value}</div></div>;
}
