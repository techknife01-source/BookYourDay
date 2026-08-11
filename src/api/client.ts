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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
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
    let requestUrl = url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
    const requestUrl = url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
    const requestUrl = url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
    const requestUrl = url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
    const requestUrl = url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
