import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, KeyRound, Lock, Mail, MapPin, Phone, Save, ShieldCheck, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

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

type ProfileForm = {
  first_name: string;
  last_name: string;
  username: string;
  identification_type: string;
  identification_number: string;
  email: string;
  country: string;
  department: string;
  city: string;
  address: string;
  phone_country_code: string;
  phone_number: string;
};

type PasswordForm = {
  current_password: string;
  password: string;
  password_confirm: string;
};

const emptyProfile: ProfileForm = {
  first_name: "",
  last_name: "",
  username: "",
  identification_type: "cc",
  identification_number: "",
  email: "",
  country: "Colombia",
  department: "",
  city: "",
  address: "",
  phone_country_code: "+57",
  phone_number: "",
};

const emptyPassword: PasswordForm = {
  current_password: "",
  password: "",
  password_confirm: "",
};

function onlyNumbers(value: string, maxLength?: number) {
  const cleaned = value.replace(/\D/g, "");
  return maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

function validateProfile(form: ProfileForm) {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  if (form.first_name.trim().length < 2) errors.first_name = "Escribe al menos 2 caracteres.";
  if (form.last_name.trim().length < 2) errors.last_name = "Escribe al menos 2 caracteres.";
  if (!/^[a-zA-Z0-9._-]{3,}$/.test(form.username.trim())) errors.username = "Mínimo 3 caracteres. Usa letras, números, punto, guion o guion bajo.";
  if (!form.identification_type) errors.identification_type = "Selecciona un tipo.";
  if (!/^\d+$/.test(form.identification_number)) errors.identification_number = "Solo números.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Correo inválido.";
  if (!form.department) errors.department = "Selecciona un departamento.";
  if (!form.city) errors.city = "Selecciona una ciudad.";
  if (form.address.trim().length < 5) errors.address = "Agrega una dirección válida.";
  if (!/^\d{10}$/.test(form.phone_number)) errors.phone_number = "Debe tener 10 números.";
  return errors;
}

function validatePassword(form: PasswordForm) {
  const errors: Partial<Record<keyof PasswordForm, string>> = {};
  if (!form.current_password) errors.current_password = "Ingresa tu contraseña actual.";
  if (form.password.length < 8) errors.password = "La nueva contraseña debe tener mínimo 8 caracteres.";
  if (form.password !== form.password_confirm) errors.password_confirm = "Las contraseñas no coinciden.";
  if (!form.password_confirm) errors.password_confirm = "Confirma la nueva contraseña.";
  return errors;
}

function FieldError({ message, show }: { message?: string; show?: boolean }) {
  if (!message || !show) return null;
  return <p className="text-[11px] font-medium text-[#C94455]">{message}</p>;
}

function inputClass(hasError?: boolean) {
  return cn(
    "h-11 w-full rounded-xl border bg-white px-3 text-sm text-[#102F4B] outline-none transition-all placeholder:text-[#8EA3B5] focus:ring-2 focus:ring-[#4F9FF0]/20",
    hasError ? "border-[#C94455]/60" : "border-[#D9ECFA]"
  );
}

function ColombiaFlag() {
  return (
    <span className="block h-4 w-6 overflow-hidden rounded-[3px] border border-[#D9ECFA] shadow-sm" aria-label="Bandera de Colombia">
      <span className="block h-1/2 bg-[#FCD116]" />
      <span className="block h-1/4 bg-[#003893]" />
      <span className="block h-1/4 bg-[#CE1126]" />
    </span>
  );
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

export function AdminProfilePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { data: user, isLoading } = useCurrentUser();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPassword);
  const [profileTouched, setProfileTouched] = useState<Record<string, boolean>>({});
  const [passwordTouched, setPasswordTouched] = useState<Record<string, boolean>>({});

  const locationsQuery = useQuery({
    queryKey: ["locations", "colombia"],
    queryFn: async () => {
      const { data } = await apiClient.get<ColombiaLocations>("/locations/colombia/");
      return data;
    },
  });

  const departments = locationsQuery.data?.departments ?? [];
  const cities = useMemo(() => departments.find((department) => department.name === profile.department)?.cities ?? [], [departments, profile.department]);
  const profileErrors = validateProfile(profile);
  const passwordErrors = validatePassword(passwordForm);

  useEffect(() => {
    if (!user) return;
    setProfile({
      first_name: user.first_name || user.full_name?.split(" ")[0] || "",
      last_name: user.last_name || user.full_name?.split(" ").slice(1).join(" ") || "",
      username: user.username || "",
      identification_type: user.identification_type || "cc",
      identification_number: user.identification_number || "",
      email: user.email || "",
      country: "Colombia",
      department: user.department || "",
      city: user.city || "",
      address: user.address || "",
      phone_country_code: "+57",
      phone_number: user.phone_number || "",
    });
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...profile, country: "Colombia", phone_country_code: "+57" };
      const { data } = await apiClient.put<User>("/auth/profile/", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Perfil actualizado correctamente");
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, "No se pudo actualizar el perfil. Revisa los campos."));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => apiClient.post("/auth/change-password/", passwordForm),
    onSuccess: () => {
      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      logout();
      navigate("/login", { replace: true });
    },
    onError: (error: any) => {
      const data = error?.response?.data;
      const detail = data?.detail || data?.current_password?.[0] || data?.password?.[0] || data?.password_confirm?.[0];
      toast.error(detail || "No se pudo cambiar la contraseña.");
    },
  });

  const setProfileField = (field: keyof ProfileForm, value: string) => {
    setProfile((current) => {
      const next = { ...current, [field]: value };
      if (field === "department") next.city = "";
      return next;
    });
    setProfileTouched((current) => ({ ...current, [field]: true }));
  };

  const saveProfile = () => {
    setProfileTouched(Object.keys(profile).reduce<Record<string, boolean>>((acc, key) => ({ ...acc, [key]: true }), {}));
    if (Object.keys(profileErrors).length) {
      toast.error("Revisa los campos marcados antes de guardar.");
      return;
    }
    updateProfileMutation.mutate();
  };

  const savePassword = () => {
    setPasswordTouched(Object.keys(passwordForm).reduce<Record<string, boolean>>((acc, key) => ({ ...acc, [key]: true }), {}));
    if (Object.keys(passwordErrors).length) {
      toast.error("Revisa los campos de contraseña.");
      return;
    }
    changePasswordMutation.mutate();
  };

  if (isLoading) {
    return <div className="rounded-2xl border border-[#D9ECFA] bg-white p-6 text-sm text-[#6C8398]">Cargando perfil...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope">Mi perfil</h1>
          <p className="mt-1 text-sm text-[#6C8398]">Actualiza tu información personal y administra tu contraseña de acceso.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#D9ECFA] bg-white p-3 shadow-[0_2px_12px_rgba(79,159,240,0.04)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F0FE] text-base font-bold text-[#246FC1]">{user?.full_name?.charAt(0)?.toUpperCase() || "A"}</div>
          <div>
            <p className="text-sm font-bold text-[#102F4B]">{user?.full_name || "Administrador"}</p>
            <p className="text-xs text-[#6C8398]">@{user?.username || "sin-usuario"} · {user?.admin_role_label || "Administrador"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-[#D9ECFA] bg-white shadow-[0_2px_12px_rgba(79,159,240,0.04)]">
          <div className="border-b border-[#D9ECFA] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#246FC1]"><UserCircle size={22} /></div>
              <div>
                <h2 className="text-lg font-extrabold text-[#102F4B] font-manrope">Información personal</h2>
                <p className="text-sm text-[#6C8398]">Datos básicos, contacto y ubicación.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6C8398]">Datos personales</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Nombres</span><input value={profile.first_name} onChange={(event) => setProfileField("first_name", event.target.value)} placeholder="Ej: Laura" className={inputClass(profileTouched.first_name && !!profileErrors.first_name)} /><FieldError message={profileErrors.first_name} show={profileTouched.first_name} /></label>
                <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Apellidos</span><input value={profile.last_name} onChange={(event) => setProfileField("last_name", event.target.value)} placeholder="Ej: Gómez Ríos" className={inputClass(profileTouched.last_name && !!profileErrors.last_name)} /><FieldError message={profileErrors.last_name} show={profileTouched.last_name} /></label>
                <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Nombre de usuario</span><input value={profile.username} onChange={(event) => setProfileField("username", event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))} placeholder="Ej: laura.gomez" className={inputClass(profileTouched.username && !!profileErrors.username)} /><FieldError message={profileErrors.username} show={profileTouched.username} /></label>
                <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Tipo de identificación</span><select value={profile.identification_type} onChange={(event) => setProfileField("identification_type", event.target.value)} className={inputClass(profileTouched.identification_type && !!profileErrors.identification_type)}><option value="cc">Cédula de ciudadanía</option><option value="ce">Cédula de extranjería</option><option value="nit">NIT</option><option value="passport">Pasaporte</option></select><FieldError message={profileErrors.identification_type} show={profileTouched.identification_type} /></label>
                <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Número de identificación</span><input value={profile.identification_number} onChange={(event) => setProfileField("identification_number", onlyNumbers(event.target.value))} placeholder="Ej: 1020304050" inputMode="numeric" className={inputClass(profileTouched.identification_number && !!profileErrors.identification_number)} /><FieldError message={profileErrors.identification_number} show={profileTouched.identification_number} /></label>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6C8398]">Contacto y ubicación</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Correo electrónico</span><div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input value={profile.email} onChange={(event) => setProfileField("email", event.target.value)} placeholder="nombre@nuvvi.com" className={cn(inputClass(profileTouched.email && !!profileErrors.email), "pl-9")} /></div><FieldError message={profileErrors.email} show={profileTouched.email} /></label>
                <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Celular</span><div className="flex gap-2"><div className="flex h-11 items-center gap-2 rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-bold text-[#102F4B]"><ColombiaFlag /><span>+57</span></div><div className="relative flex-1"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input value={profile.phone_number} onChange={(event) => setProfileField("phone_number", onlyNumbers(event.target.value, 10))} placeholder="3001234567" inputMode="numeric" maxLength={10} className={cn(inputClass(profileTouched.phone_number && !!profileErrors.phone_number), "pl-9")} /></div></div><FieldError message={profileErrors.phone_number} show={profileTouched.phone_number} /></label>
                <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">País</span><input value="Colombia" readOnly className="h-11 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] px-3 text-sm font-semibold text-[#102F4B]" /></label>
                <SearchableSelect label="Departamento" value={profile.department} placeholder="Selecciona un departamento" options={departments.map((department) => department.name)} error={profileErrors.department} touched={profileTouched.department} onChange={(value) => setProfileField("department", value)} />
                <SearchableSelect label="Ciudad" value={profile.city} placeholder={profile.department ? "Selecciona una ciudad" : "Primero selecciona un departamento"} options={cities} disabled={!profile.department} error={profileErrors.city} touched={profileTouched.city} onChange={(value) => setProfileField("city", value)} />
                <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Dirección</span><div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input value={profile.address} onChange={(event) => setProfileField("address", event.target.value)} placeholder="Ej: Calle 10 # 20-30" className={cn(inputClass(profileTouched.address && !!profileErrors.address), "pl-9")} /></div><FieldError message={profileErrors.address} show={profileTouched.address} /></label>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#EEF6FC] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[#6C8398]">Estos datos son personales y se usan para identificar tu acceso administrativo.</p>
              <Button onClick={saveProfile} disabled={updateProfileMutation.isPending} className="h-11 rounded-xl bg-[#4F9FF0] px-5 hover:bg-[#246FC1]"><Save size={16} className="mr-2" />{updateProfileMutation.isPending ? "Guardando..." : "Guardar cambios"}</Button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[#D9ECFA] bg-white p-5 shadow-[0_2px_12px_rgba(79,159,240,0.04)] sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3E0] text-[#B97812]"><KeyRound size={22} /></div>
              <div>
                <h2 className="text-lg font-extrabold text-[#102F4B] font-manrope">Cambiar contraseña</h2>
                <p className="text-sm text-[#6C8398]">Se cerrará la sesión al finalizar.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Contraseña actual</span><div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input type="password" value={passwordForm.current_password} onChange={(event) => { setPasswordForm((current) => ({ ...current, current_password: event.target.value })); setPasswordTouched((current) => ({ ...current, current_password: true })); }} placeholder="Ingresa tu contraseña actual" className={cn(inputClass(passwordTouched.current_password && !!passwordErrors.current_password), "pl-9")} /></div><FieldError message={passwordErrors.current_password} show={passwordTouched.current_password} /></label>
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Nueva contraseña</span><div className="relative"><ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input type="password" value={passwordForm.password} onChange={(event) => { setPasswordForm((current) => ({ ...current, password: event.target.value })); setPasswordTouched((current) => ({ ...current, password: true })); }} placeholder="Mínimo 8 caracteres" className={cn(inputClass(passwordTouched.password && !!passwordErrors.password), "pl-9")} /></div><FieldError message={passwordErrors.password} show={passwordTouched.password} /></label>
              <label className="space-y-1.5"><span className="text-xs font-semibold text-[#39566F]">Confirmar contraseña</span><div className="relative"><CheckCircle2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" /><input type="password" value={passwordForm.password_confirm} onChange={(event) => { setPasswordForm((current) => ({ ...current, password_confirm: event.target.value })); setPasswordTouched((current) => ({ ...current, password_confirm: true })); }} placeholder="Repite la nueva contraseña" className={cn(inputClass(passwordTouched.password_confirm && !!passwordErrors.password_confirm), "pl-9")} /></div><FieldError message={passwordErrors.password_confirm} show={passwordTouched.password_confirm} /></label>
            </div>

            <div className="mt-5 rounded-2xl border border-[#FFF3E0] bg-[#FFF9F0] p-4 text-xs leading-5 text-[#8A6416]"><AlertCircle size={16} className="mb-2" />Al cambiar la contraseña se invalidan tus sesiones activas y tendrás que iniciar sesión nuevamente.</div>

            <Button onClick={savePassword} disabled={changePasswordMutation.isPending} className="mt-5 h-11 w-full rounded-xl bg-[#102F4B] hover:bg-[#246FC1]"><KeyRound size={16} className="mr-2" />{changePasswordMutation.isPending ? "Actualizando..." : "Cambiar contraseña"}</Button>
          </section>
        </aside>
      </div>
    </motion.div>
  );
}
