export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code: string;
    details: string;
  };
}

export interface ClientResponse<T = any> {
  data: T;
  status: number;
}

export function resolveApiBaseUrl(): string {
  // Read VITE_API_URL from Vite environment if available
  const metaEnv: any = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const envUrl = (metaEnv.VITE_API_URL ? String(metaEnv.VITE_API_URL) : '').trim();

  let base = envUrl;
  if (!base) {
    // If in production and no VITE_API_URL is provided, default to the production Render backend
    if (metaEnv.PROD) {
      base = 'https://bookyourday.onrender.com/api';
    } else {
      base = '/api';
    }
  }

  // Remove trailing slashes
  base = base.replace(/\/+$/, '');

  // If base is an absolute URL (e.g. https://bookyourday.onrender.com), ensure it ends with /api
  if (base.startsWith('http://') || base.startsWith('https://')) {
    if (!base.endsWith('/api')) {
      base = `${base}/api`;
    }
  } else if (!base.startsWith('/')) {
    base = `/${base}`;
  }

  return base;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || resolveApiBaseUrl();
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  private buildRequestUrl(endpoint: string): string {
    // If already absolute URL, use as-is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Prevent duplicate /api if both baseUrl ends with /api and endpoint starts with /api/
    if (this.baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      return `${this.baseUrl.slice(0, -4)}${cleanEndpoint}`;
    }

    return `${this.baseUrl}${cleanEndpoint}`;
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem('byd_auth_token') || localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T = any>(url: string, config?: { headers?: Record<string, string>; params?: any }): Promise<ClientResponse<T>> {
    let requestUrl = this.buildRequestUrl(url);
    if (config?.params) {
      const query = new URLSearchParams(config.params).toString();
      if (query) {
        requestUrl += (requestUrl.includes('?') ? '&' : '?') + query;
      }
    }
    const res = await fetch(requestUrl, {
      method: 'GET',
      headers: this.getHeaders(config?.headers)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || `Request failed with status ${res.status}`);
      err.response = { data, status: res.status };
      throw err;
    }
    return { data, status: res.status };
  }

  async post<T = any>(url: string, body?: any, config?: { headers?: Record<string, string> }): Promise<ClientResponse<T>> {
    const requestUrl = this.buildRequestUrl(url);
    const res = await fetch(requestUrl, {
      method: 'POST',
      headers: this.getHeaders(config?.headers),
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || `Request failed with status ${res.status}`);
      err.response = { data, status: res.status };
      throw err;
    }
    return { data, status: res.status };
  }

  async put<T = any>(url: string, body?: any, config?: { headers?: Record<string, string> }): Promise<ClientResponse<T>> {
    const requestUrl = this.buildRequestUrl(url);
    const res = await fetch(requestUrl, {
      method: 'PUT',
      headers: this.getHeaders(config?.headers),
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || `Request failed with status ${res.status}`);
      err.response = { data, status: res.status };
      throw err;
    }
    return { data, status: res.status };
  }

  async patch<T = any>(url: string, body?: any, config?: { headers?: Record<string, string> }): Promise<ClientResponse<T>> {
    const requestUrl = this.buildRequestUrl(url);
    const res = await fetch(requestUrl, {
      method: 'PATCH',
      headers: this.getHeaders(config?.headers),
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || `Request failed with status ${res.status}`);
      err.response = { data, status: res.status };
      throw err;
    }
    return { data, status: res.status };
  }

  async delete<T = any>(url: string, config?: { headers?: Record<string, string> }): Promise<ClientResponse<T>> {
    const requestUrl = this.buildRequestUrl(url);
    const res = await fetch(requestUrl, {
      method: 'DELETE',
      headers: this.getHeaders(config?.headers)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || `Request failed with status ${res.status}`);
      err.response = { data, status: res.status };
      throw err;
    }
    return { data, status: res.status };
  }
}

export const apiClient = new ApiClient();
export default apiClient;
