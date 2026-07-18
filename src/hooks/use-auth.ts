import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/client";
import type { User } from "@/types";

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<User>("/auth/me/");
      return data;
    },
    retry: false,
    enabled: !!localStorage.getItem("access_token"),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post("/auth/token/", credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (userData: {
      nombres: string;
      apellidos: string;
      email: string;
      tipo_identificacion: string;
      password: string;
    }) => {
      const { data } = await apiClient.post("/auth/register/", userData);
      return data;
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return {
    logout: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      queryClient.clear();
      window.location.href = "/login";
    },
  };
}
