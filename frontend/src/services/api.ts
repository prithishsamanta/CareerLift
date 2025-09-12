// API service for communicating with the backend
const API_BASE_URL = "http://localhost:5001/api";

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("sessionToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Resume endpoints
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append("resume", file);

    const token = localStorage.getItem("sessionToken");
    const response = await fetch(`${API_BASE_URL}/resume/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async getResumes() {
    const response = await fetch(`${API_BASE_URL}/resumes`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Job description endpoints
  async parseJobDescription(data: {
    job_description: string;
    title?: string;
    company?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/job-description/parse`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getJobDescriptions() {
    const response = await fetch(`${API_BASE_URL}/job-descriptions`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // AI suggestions endpoints
  async getAISuggestions(filters?: { type?: string; isRead?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.isRead !== undefined)
      params.append("isRead", filters.isRead.toString());

    const response = await fetch(`${API_BASE_URL}/ai-suggestions?${params}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createAISuggestion(data: {
    suggestionType: string;
    title: string;
    content: string;
    priority?: string;
    resumeId?: number;
    jobDescriptionId?: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/ai-suggestions`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async markSuggestionAsRead(suggestionId: number) {
    const response = await fetch(
      `${API_BASE_URL}/ai-suggestions/${suggestionId}/read`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;
