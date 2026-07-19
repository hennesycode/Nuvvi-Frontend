import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Edit3, Mail, MapPin, Phone, Plus, Search, ShieldCheck, Trash2, UserCog, X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { cn } from "@/lib/utils";
import type { ApiResponse, User } from "@/types";

type AdminRole = "superadmin" | "finance" | "support";

type ColombiaDepartment = {
  id: number;
  name: string;
  cities: string[];
};

type ColombiaLocations = {
  country: string;
  country_code: string;
  phone_prefix: string;
  departments: ColombiaDepartment[];
};

type AdminUserForm = {
  first_name: string;
  last_name: string;
  username: string;
  admin_role: AdminRole;
  identification_type: string;
  identification_number: string;
  email: string;
  country: string;
  department: string;
  city: string;
  address: string;
  phone_country_code: string;
  phone_number: string;
  is_active: boolean;
};

const emptyForm: AdminUserForm = {
  first_name: "",
  last_name: "",
  username: "",
  admin_role: "support",
  identification_type: "cc",
  identification_number: "",
  email: "",
  country: "Colombia",
  department: "",
  city: "",
  address: "",
  phone_country_code: "+57",
  phone_number: "",
  is_active: true,
};

const roleLabels: Record<AdminRole, string> = {
  superadmin: "Superadministrador",
  finance: "Finanzas y cartera",
  support: "Soporte",
};

const roleDescriptions: Record<AdminRole, string> = {
  superadmin: "Mayor autoridad administrativa dentro de Nuvvi.",
  finance: "Controla la relación económica con empresas clientes.",
  support: "Atiende incidentes y solicitudes de los clientes.",
};

function formatDate(value?: string | null) {
  if (!value) return "Sin registro";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function validateForm(form: AdminUserForm) {
  const errors: Partial<Record<keyof AdminUserForm, string>> = {};
  if (form.first_name.trim().length < 2) errors.first_name = "Escribe al menos 2 caracteres.";
  if (form.last_name.trim().length < 2) errors.last_name = "Escribe al menos 2 caracteres.";
  if (!/^[a-zA-Z0-9._-]{3,}$/.test(form.username.trim())) errors.username = "Mínimo 3 caracteres. Usa letras, números, punto, guion o guion bajo.";
  if (!form.admin_role) errors.admin_role = "Selecciona un rol.";
  if (!form.identification_type) errors.identification_type = "Selecciona un tipo.";
  if (!/^\d+$/.test(form.identification_number)) errors.identification_number = "Solo números.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Correo inválido.";
  if (!form.department) errors.department = "Selecciona un departamento.";
  if (!form.city) errors.city = "Selecciona una ciudad.";
  if (form.address.trim().length < 5) errors.address = "Agrega una dirección válida.";
  if (!/^\d{10}$/.test(form.phone_number)) errors.phone_number = "Debe tener 10 números.";
  return errors;
}

function onlyNumbers(value: string, maxLength?: number) {
  const cleaned = value.replace(/\D/g, "");
  return maxLength ? cleaned.slice(0, maxLength) : cleaned;
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

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [form, setForm] = useState<AdminUserForm>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User> | User[]>("/admin-users/");
      return Array.isArray(data) ? data : data.results;
    },
  });

  const locationsQuery = useQuery({
    queryKey: ["locations", "colombia"],
    queryFn: async () => {
      const { data } = await apiClient.get<ColombiaLocations>("/locations/colombia/");
      return data;
    },
  });

  const departments = locationsQuery.data?.departments ?? [];
  const cities = useMemo(() => departments.find((department) => department.name === form.department)?.cities ?? [], [departments, form.department]);
  const errors = validateForm(form);
  const isValid = Object.keys(errors).length === 0;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return usersQuery.data ?? [];
    return (usersQuery.data ?? []).filter((user) => [user.full_name, user.username, user.email, user.admin_role_label, user.identification_number]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch)));
  }, [search, usersQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, country: "Colombia", phone_country_code: "+57" };
      if (modalMode === "edit" && selectedUser) {
        const { data } = await apiClient.put<User>(`/admin-users/${selectedUser.id}/`, payload);
        return data;
      }
      const { data } = await apiClient.post<User>("/admin-users/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(modalMode === "edit" ? "Usuario actualizado" : "Usuario creado e invitación enviada");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, "No se pudo guardar el usuario. Revisa los campos."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => apiClient.delete(`/admin-users/${userId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuario eliminado correctamente");
      setDeleteUser(null);
    },
    onError: () => toast.error("No se pudo eliminar el usuario."),
  });

  const openCreate = () => {
    setSelectedUser(null);
    setForm(emptyForm);
    setTouched({});
    setModalMode("create");
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setForm({
      first_name: user.first_name || user.full_name?.split(" ")[0] || "",
      last_name: user.last_name || user.full_name?.split(" ").slice(1).join(" ") || "",
      username: user.username || "",
      admin_role: (user.admin_role || "superadmin") as AdminRole,
      identification_type: user.identification_type || "cc",
      identification_number: user.identification_number || "",
      email: user.email,
      country: "Colombia",
      department: user.department || "",
      city: user.city || "",
      address: user.address || "",
      phone_country_code: "+57",
      phone_number: user.phone_number || "",
      is_active: user.is_active,
    });
    setTouched({});
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setTouched({});
  };

  const updateForm = (field: keyof AdminUserForm, value: string | boolean) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "department") next.city = "";
      return next;
    });
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const submitForm = () => {
    setTouched(Object.keys(form).reduce<Record<string, boolean>>((acc, key) => ({ ...acc, [key]: true }), {}));
    if (!isValid) {
      toast.error("Revisa los campos marcados antes de guardar.");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope">Usuarios administrativos</h1>
          <p className="text-sm text-[#6C8398] mt-1">Crea y administra únicamente Superadministradores, Finanzas y cartera, y Soporte.</p>
        </div>
        <Button onClick={openCreate} className="h-11 rounded-xl bg-[#4F9FF0] hover:bg-[#246FC1]">
          <Plus size={17} className="mr-2" /> Nuevo usuario
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(Object.keys(roleLabels) as AdminRole[]).map((role) => (
          <div key={role} className="bg-white rounded-2xl border border-[#D9ECFA] p-5 shadow-[0_2px_12px_rgba(79,159,240,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#246FC1] flex items-center justify-center"><ShieldCheck size={20} /></div>
              <div>
                <p className="text-sm font-bold text-[#102F4B] font-manrope">{roleLabels[role]}</p>
                <p className="text-xs text-[#6C8398]">{(usersQuery.data ?? []).filter((user) => (user.admin_role || "superadmin") === role).length} usuarios</p>
              </div>
            </div>
            <p className="text-xs leading-5 text-[#6C8398]">{roleDescriptions[role]}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#D9ECFA] shadow-[0_2px_12px_rgba(79,159,240,0.04)] overflow-hidden">
        <div className="p-5 border-b border-[#D9ECFA] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#102F4B] font-manrope">Listado de usuarios</h2>
            <p className="text-xs text-[#6C8398] mt-1">Creación, edición y eliminación con validaciones en tiempo real.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo o documento" className="w-full h-10 rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] pl-9 pr-3 text-sm text-[#102F4B] outline-none focus:ring-2 focus:ring-[#4F9FF0]/20" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-[#F8FCFF] text-xs uppercase tracking-wide text-[#6C8398]">
              <tr>
                <th className="px-5 py-3 text-left font-bold">Usuario</th>
                <th className="px-5 py-3 text-left font-bold">Nombre de usuario</th>
                <th className="px-5 py-3 text-left font-bold">Rol</th>
                <th className="px-5 py-3 text-left font-bold">Contacto</th>
                <th className="px-5 py-3 text-left font-bold">Ubicación</th>
                <th className="px-5 py-3 text-left font-bold">Creación</th>
                <th className="px-5 py-3 text-left font-bold">Último inicio</th>
                <th className="px-5 py-3 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF6FC]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#F8FCFF]/70 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#246FC1] flex items-center justify-center font-bold">{user.full_name?.charAt(0)?.toUpperCase() || "U"}</div>
                      <div>
                        <p className="font-semibold text-[#102F4B]">{user.full_name}</p>
                        <p className="text-xs text-[#6C8398]">{user.identification_number || "Sin documento"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#39566F]"><span className="font-semibold text-[#102F4B]">@{user.username || "sin-usuario"}</span></td>
                  <td className="px-5 py-4"><span className="inline-flex items-center rounded-full bg-[#E8F0FE] px-3 py-1 text-xs font-bold text-[#246FC1]">{user.admin_role_label || roleLabels[(user.admin_role || "superadmin") as AdminRole]}</span></td>
                  <td className="px-5 py-4 text-[#39566F]"><p>{user.email}</p><p className="text-xs text-[#6C8398]">+57 {user.phone_number || ""}</p></td>
                  <td className="px-5 py-4 text-[#39566F]"><p>{user.city || "-"}</p><p className="text-xs text-[#6C8398]">{user.department || "Colombia"}</p></td>
                  <td className="px-5 py-4 text-xs text-[#6C8398]">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4 text-xs text-[#6C8398]">{formatDate(user.last_login)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(user)} className="p-2 rounded-lg text-[#246FC1] hover:bg-[#E8F0FE] transition-colors" title="Editar"><Edit3 size={17} /></button>
                      <button onClick={() => setDeleteUser(user)} className="p-2 rounded-lg text-[#C94455] hover:bg-[#FDE8E8] transition-colors" title="Eliminar"><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!usersQuery.isLoading && filteredUsers.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-[#6C8398]">No hay usuarios administrativos para mostrar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalMode && (
          <UserModal
            mode={modalMode}
            form={form}
            departments={departments}
            cities={cities}
            errors={errors}
            touched={touched}
            saving={saveMutation.isPending}
            onChange={updateForm}
            onClose={closeModal}
            onSubmit={submitForm}
          />
        )}
        {deleteUser && (
          <ConfirmDeleteModal
            user={deleteUser}
            loading={deleteMutation.isPending}
            onClose={() => setDeleteUser(null)}
            onConfirm={() => deleteMutation.mutate(deleteUser.id)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FieldError({ message, show }: { message?: string; show?: boolean }) {
  if (!message || !show) return null;
  return <p className="text-[11px] font-medium text-[#C94455]">{message}</p>;
}

function UserModal({ mode, form, departments, cities, errors, touched, saving, onChange, onClose, onSubmit }: {
  mode: "create" | "edit";
  form: AdminUserForm;
  departments: ColombiaDepartment[];
  cities: string[];
  errors: Partial<Record<keyof AdminUserForm, string>>;
  touched: Record<string, boolean>;
  saving: boolean;
  onChange: (field: keyof AdminUserForm, value: string | boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const inputClass = (field: keyof AdminUserForm) => cn("w-full h-11 rounded-xl border bg-white px-3 text-sm text-[#102F4B] outline-none transition-all focus:ring-2 focus:ring-[#4F9FF0]/20", touched[field] && errors[field] ? "border-[#C94455]/60" : "border-[#D9ECFA]");

  return (
    <motion.div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-[#0C1E33]/45 p-2 backdrop-blur-sm sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 18 }} transition={{ duration: 0.22 }} className="flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] border border-[#D9ECFA] bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3 border-b border-[#D9ECFA] bg-white p-4 sm:gap-4 sm:p-6">
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E8F0FE] text-[#246FC1] flex items-center justify-center"><UserCog size={22} /></div>
            <div>
              <h2 className="text-xl font-extrabold text-[#102F4B] font-manrope">{mode === "create" ? "Crear usuario administrativo" : "Editar usuario administrativo"}</h2>
              <p className="text-sm text-[#6C8398] mt-1">Los campos se validan en tiempo real y la invitación se envía al crear la cuenta.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#6C8398] hover:bg-[#F8FCFF]"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-7 sm:p-6 sm:pb-8">
          <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6C8398]">Datos personales</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Nombres</span><input value={form.first_name} onChange={(event) => onChange("first_name", event.target.value)} placeholder="Ej: Laura" className={inputClass("first_name")} /><FieldError message={errors.first_name} show={touched.first_name} /></label>
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Apellidos</span><input value={form.last_name} onChange={(event) => onChange("last_name", event.target.value)} placeholder="Ej: Gómez Ríos" className={inputClass("last_name")} /><FieldError message={errors.last_name} show={touched.last_name} /></label>
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Nombre de usuario</span><input value={form.username} onChange={(event) => onChange("username", event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))} placeholder="Ej: laura.gomez" className={inputClass("username")} /><FieldError message={errors.username} show={touched.username} /></label>
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Tipo de identificación</span><select value={form.identification_type} onChange={(event) => onChange("identification_type", event.target.value)} className={inputClass("identification_type")}><option value="cc">Cédula de ciudadanía</option><option value="ce">Cédula de extranjería</option><option value="nit">NIT</option><option value="passport">Pasaporte</option></select><FieldError message={errors.identification_type} show={touched.identification_type} /></label>
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Número de identificación</span><input value={form.identification_number} onChange={(event) => onChange("identification_number", onlyNumbers(event.target.value))} placeholder="Ej: 1020304050" inputMode="numeric" className={inputClass("identification_number")} /><FieldError message={errors.identification_number} show={touched.identification_number} /></label>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6C8398]">Rol y permisos</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {(Object.keys(roleLabels) as AdminRole[]).map((role) => (
                <button key={role} type="button" onClick={() => onChange("admin_role", role)} className={cn("rounded-2xl border p-4 text-left transition-all", form.admin_role === role ? "border-[#4F9FF0] bg-[#E8F0FE] shadow-[0_8px_24px_rgba(79,159,240,0.16)]" : "border-[#D9ECFA] hover:bg-[#F8FCFF]")}> 
                  <span className="flex items-center gap-2 text-sm font-bold text-[#102F4B]"><CheckCircle2 size={16} className={form.admin_role === role ? "text-[#178C68]" : "text-[#D9ECFA]"} />{roleLabels[role]}</span>
                  <span className="mt-2 block text-xs leading-5 text-[#6C8398]">{roleDescriptions[role]}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6C8398]">Contacto y ubicación</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Correo electrónico</span><div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input value={form.email} onChange={(event) => onChange("email", event.target.value)} placeholder="nombre@nuvvi.com" className={cn(inputClass("email"), "pl-9")} /></div><FieldError message={errors.email} show={touched.email} /></label>
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Celular</span><div className="flex gap-2"><div className="flex h-11 items-center gap-2 rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-bold text-[#102F4B]"><span className="block h-4 w-6 overflow-hidden rounded-[3px] border border-[#D9ECFA] shadow-sm" aria-label="Bandera de Colombia"><span className="block h-1/2 bg-[#FCD116]" /><span className="block h-1/4 bg-[#003893]" /><span className="block h-1/4 bg-[#CE1126]" /></span><span>+57</span></div><div className="relative flex-1"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input value={form.phone_number} onChange={(event) => onChange("phone_number", onlyNumbers(event.target.value, 10))} placeholder="3001234567" inputMode="numeric" maxLength={10} className={cn(inputClass("phone_number"), "pl-9")} /></div></div><FieldError message={errors.phone_number} show={touched.phone_number} /></label>
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">País</span><input value="Colombia" readOnly className="w-full h-11 rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-semibold text-[#102F4B]" /></label>
              <SearchableSelect label="Departamento" value={form.department} placeholder="Selecciona un departamento" options={departments.map((department) => department.name)} error={errors.department} touched={touched.department} onChange={(value) => onChange("department", value)} />
              <SearchableSelect label="Ciudad" value={form.city} placeholder={form.department ? "Selecciona una ciudad" : "Primero selecciona un departamento"} options={cities} disabled={!form.department} error={errors.city} touched={touched.city} onChange={(value) => onChange("city", value)} />
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Dirección</span><div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input value={form.address} onChange={(event) => onChange("address", event.target.value)} placeholder="Ej: Calle 10 # 20-30" className={cn(inputClass("address"), "pl-9")} /></div><FieldError message={errors.address} show={touched.address} /></label>
            </div>
          </section>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D9ECFA] bg-white p-4 sm:flex-row sm:justify-end sm:p-5">
          <button onClick={onClose} className="h-11 rounded-xl border border-[#D9ECFA] px-5 text-sm font-semibold text-[#39566F] hover:bg-[#F8FCFF]">Cancelar</button>
          <Button onClick={onSubmit} disabled={saving} className="h-11 rounded-xl bg-[#4F9FF0] px-5 hover:bg-[#246FC1]">{saving ? "Guardando..." : mode === "create" ? "Crear y enviar invitación" : "Guardar cambios"}</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ConfirmDeleteModal({ user, loading, onClose, onConfirm }: { user: User; loading: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-[#0C1E33]/45 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 18 }} className="w-full max-w-md rounded-[28px] border border-[#D9ECFA] bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDE8E8] text-[#C94455]"><Trash2 size={26} /></div>
        <h2 className="text-xl font-extrabold text-[#102F4B] font-manrope">¿Eliminar usuario?</h2>
        <p className="mt-2 text-sm leading-6 text-[#6C8398]">Esta acción eliminará a <strong className="text-[#102F4B]">{user.full_name}</strong> del equipo administrativo. Confirma solo si estás seguro.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-11 rounded-xl border border-[#D9ECFA] text-sm font-semibold text-[#39566F] hover:bg-[#F8FCFF]">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="h-11 rounded-xl bg-[#C94455] text-sm font-bold text-white hover:bg-[#A93644] disabled:opacity-70">{loading ? "Eliminando..." : "Sí, eliminar"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
