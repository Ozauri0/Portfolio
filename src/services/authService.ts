// Service to handle authentication from the frontend
interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface LoginResponse {
  session: {
    access_token: string;
  };
  user: User;
}

class AuthService {
  private baseURL: string;
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://tu-dominio-api.com/api' 
      : 'http://localhost:5000/api';
    
    // Cargar token desde localStorage al inicializar
    this.loadFromStorage();
  }
  // Load data from localStorage
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          this.user = JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          this.clearStorage();
        }
      }
    }
  }
  // Save data to localStorage
  private saveToStorage(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    this.token = token;
    this.user = user;
  }

  // Limpiar localStorage
  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    this.token = null;
    this.user = null;
  }
  // Perform HTTP request with authentication
  private async request(url: string, options: RequestInit = {}): Promise<any> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };    // Add authorization token if it exists
    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }
  // Registration DISABLED - Exclusive access for administrator
  async register(email: string, password: string, fullName?: string): Promise<never> {
    throw new Error('Registro deshabilitado - Acceso restringido al administrador');
  }
  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.session && response.user) {
        this.saveToStorage(response.session.access_token, response.user);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error en login: ${errorMessage}`);
    }
  }
  // Logout
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.request('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearStorage();
    }
  }
  // Check if user is authenticated
  async verifyAuth(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      await this.request('/auth/verify');
      return true;
    } catch (error) {
      this.clearStorage();
      return false;
    }
  }
  // Get user profile
  async getProfile(): Promise<User> {
    try {
      const response = await this.request('/auth/profile');
      return response.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error obteniendo perfil: ${errorMessage}`);
    }
  }
  // Check if user is administrator
  async isAdmin(): Promise<boolean> {
    try {
      await this.request('/admin/dashboard');
      return true;
    } catch (error) {
      return false;
    }
  }
  // Get admin dashboard
  async getAdminDashboard(): Promise<any> {
    try {
      const response = await this.request('/admin/dashboard');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error obteniendo dashboard: ${errorMessage}`);
    }
  }
  // Get authentication status
  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }
  // Get current user
  getCurrentUser(): User | null {
    return this.user;
  }

  // Obtener token actual
  getToken(): string | null {
    return this.token;
  }
}

// Singleton service instance
const authService = new AuthService();

export default authService;
