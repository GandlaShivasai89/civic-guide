const API_BASE = '/api';

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  role: 'citizen' | 'admin';
  state?: string;
  district?: string;
  preferred_language?: string;
}

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('civic_auth_token');
  }

  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- Services ---
  public static async getServices(params?: { category?: string; state?: string; audience?: string; mode?: string }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') searchParams.append('category', params.category);
    if (params?.state && params.state !== 'ALL') searchParams.append('state', params.state);
    if (params?.audience && params.audience !== 'ALL') searchParams.append('audience', params.audience);
    if (params?.mode && params.mode !== 'ALL') searchParams.append('mode', params.mode);

    const res = await fetch(`${API_BASE}/services?${searchParams.toString()}`);
    const data = await res.json();
    return data.data || [];
  }

  public static async getServiceById(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/services/${id}`);
    const data = await res.json();
    return data.data;
  }

  public static async searchServices(query: string, filters?: any): Promise<any[]> {
    const searchParams = new URLSearchParams({ q: query });
    if (filters?.category && filters.category !== 'ALL') searchParams.append('category', filters.category);
    if (filters?.state && filters.state !== 'ALL') searchParams.append('state', filters.state);

    const res = await fetch(`${API_BASE}/services/search?${searchParams.toString()}`);
    const data = await res.json();
    return data.data || [];
  }

  public static async getCategories(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/services/categories`);
    const data = await res.json();
    return data.data || [];
  }

  public static async getDepartments(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/services/departments`);
    const data = await res.json();
    return data.data || [];
  }

  // --- AI Assistant ---
  public static async askAi(query: string, options?: { serviceId?: string; state?: string; language?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        query,
        serviceId: options?.serviceId,
        state: options?.state || 'Telangana',
        language: options?.language || 'en'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch AI response');
    return data.data;
  }

  public static async explainTerm(term: string, language: string = 'en'): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/explain`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ term, language })
    });
    return res.json();
  }

  public static async getPersonalizedGuidance(profile: any): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/guidance`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    return data;
  }

  // --- Applications Tracker ---
  public static async getApplications(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/applications`, { headers: this.getHeaders() });
    const data = await res.json();
    return data.data || [];
  }

  public static async createApplication(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.data;
  }

  public static async updateApplication(id: string, payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  public static async deleteApplication(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.ok;
  }

  public static async updateDocumentStatus(docId: string, status: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/applications/documents/${docId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return res.json();
  }

  // --- Saved Services ---
  public static async getSavedServices(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/applications/saved`, { headers: this.getHeaders() });
    const data = await res.json();
    return data.data || [];
  }

  public static async toggleSavedService(serviceId: string): Promise<{ isSaved: boolean }> {
    const res = await fetch(`${API_BASE}/applications/saved/toggle`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ serviceId })
    });
    const data = await res.json();
    return data;
  }

  // --- Reminders ---
  public static async getReminders(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/reminders`, { headers: this.getHeaders() });
    const data = await res.json();
    return data.data || [];
  }

  public static async createReminder(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.data;
  }

  public static async toggleReminder(id: string, isCompleted: boolean): Promise<any> {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ is_completed: isCompleted })
    });
    return res.json();
  }

  public static async deleteReminder(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.ok;
  }

  // --- Auth ---
  public static async login(credentials: { email: string; password: string }): Promise<{ token: string; user: ApiUser }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('civic_auth_token', data.data.token);
    localStorage.setItem('civic_user', JSON.stringify(data.data.user));
    return data.data;
  }

  public static async register(payload: any): Promise<{ token: string; user: ApiUser }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    localStorage.setItem('civic_auth_token', data.data.token);
    localStorage.setItem('civic_user', JSON.stringify(data.data.user));
    return data.data;
  }

  public static logout(): void {
    localStorage.removeItem('civic_auth_token');
    localStorage.removeItem('civic_user');
  }

  public static getCurrentUser(): ApiUser | null {
    const saved = localStorage.getItem('civic_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  // --- Admin ---
  public static async getAdminStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: this.getHeaders() });
    const data = await res.json();
    return data.data;
  }

  public static async createAdminService(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  }

  public static async updateAdminService(id: string, payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  }

  public static async recordVerificationAction(id: string, action: { status: string; findings: string; source_url: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/services/${id}/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(action)
    });
    const data = await res.json();
    return data.data;
  }

  public static async getVerificationHistory(serviceId?: string): Promise<any[]> {
    const query = serviceId ? `?serviceId=${serviceId}` : '';
    const res = await fetch(`${API_BASE}/admin/verification-history${query}`, { headers: this.getHeaders() });
    const data = await res.json();
    return data.data || [];
  }
}
