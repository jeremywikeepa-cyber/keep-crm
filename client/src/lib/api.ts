export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<any> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (password: string) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  logout: () => apiRequest("/api/auth/logout", { method: "POST" }),
  me: () => apiRequest("/api/auth/me"),

  // Users
  getUsers: () => apiRequest("/api/users"),
  createUser: (data: any) =>
    apiRequest("/api/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) =>
    apiRequest(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Leads
  getLeads: (params?: { archived?: boolean; stage?: string }) => {
    const query = new URLSearchParams();
    if (params?.archived) query.set("archived", "true");
    if (params?.stage) query.set("stage", params.stage);
    const qs = query.toString();
    return apiRequest(`/api/leads${qs ? `?${qs}` : ""}`);
  },
  getLead: (id: number) => apiRequest(`/api/leads/${id}`),
  createLead: (data: any) =>
    apiRequest("/api/leads", { method: "POST", body: JSON.stringify(data) }),
  updateLead: (id: number, data: any) =>
    apiRequest(`/api/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  archiveLead: (id: number) =>
    apiRequest(`/api/leads/${id}`, { method: "DELETE" }),
  scoreLead: (id: number) =>
    apiRequest(`/api/leads/${id}/score`, { method: "POST" }),
  getLeadStats: () => apiRequest("/api/leads/stats"),

  // Activities
  getActivities: (leadId: number) =>
    apiRequest(`/api/leads/${leadId}/activities`),
  createActivity: (leadId: number, data: any) =>
    apiRequest(`/api/leads/${leadId}/activities`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Notes
  getNotes: (leadId: number) => apiRequest(`/api/leads/${leadId}/notes`),
  createNote: (leadId: number, data: any) =>
    apiRequest(`/api/leads/${leadId}/notes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateNote: (id: number, data: any) =>
    apiRequest(`/api/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  completeNote: (id: number) =>
    apiRequest(`/api/notes/${id}/complete`, { method: "POST" }),
  deleteNote: (id: number) =>
    apiRequest(`/api/notes/${id}`, { method: "DELETE" }),

  // Stats
  getStats: () => apiRequest("/api/stats"),
};
