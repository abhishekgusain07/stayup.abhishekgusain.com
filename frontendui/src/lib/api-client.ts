import { 
  CreateMonitor, 
  UpdateMonitor, 
  Monitor, 
  CreateAlertRecipient, 
  AlertRecipient,
  ApiResponse,
  PaginatedResponse
} from '@/types/shared';

type MonitorsPaginatedData = {
  items: Monitor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token from wherever you store it (cookies, localStorage, etc.)
    const token = this.getAuthToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for better-auth session
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private getAuthToken(): string | null {
    // For better-auth integration, we don't need to manually set Authorization header
    // The session token will be sent via cookies automatically
    return null;
  }

  // Monitor API methods
  async getMonitors(page = 1, limit = 10): Promise<ApiResponse<MonitorsPaginatedData>> {
    return this.request<MonitorsPaginatedData>(`/monitors?page=${page}&limit=${limit}`);
  }

  async getMonitor(id: string): Promise<ApiResponse<Monitor>> {
    return this.request<Monitor>(`/monitors/${id}`);
  }

  async createMonitor(data: CreateMonitor): Promise<ApiResponse<Monitor>> {
    return this.request<Monitor>('/monitors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMonitor(id: string, data: UpdateMonitor): Promise<ApiResponse<Monitor>> {
    return this.request<Monitor>(`/monitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMonitor(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/monitors/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleMonitor(id: string): Promise<ApiResponse<Monitor>> {
    return this.request<Monitor>(`/monitors/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // Alert Recipients API methods
  async getAlertRecipients(monitorId: string): Promise<ApiResponse<AlertRecipient[]>> {
    return this.request<AlertRecipient[]>(`/monitors/${monitorId}/alert-recipients`);
  }

  async addAlertRecipient(
    monitorId: string, 
    data: { email: string }
  ): Promise<ApiResponse<AlertRecipient>> {
    return this.request<AlertRecipient>(`/monitors/${monitorId}/alert-recipients`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeAlertRecipient(
    monitorId: string, 
    recipientId: string
  ): Promise<ApiResponse<null>> {
    return this.request<null>(`/monitors/${monitorId}/alert-recipients/${recipientId}`, {
      method: 'DELETE',
    });
  }

  async toggleAlertRecipient(
    monitorId: string, 
    recipientId: string
  ): Promise<ApiResponse<AlertRecipient>> {
    return this.request<AlertRecipient>(`/monitors/${monitorId}/alert-recipients/${recipientId}/toggle`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient();