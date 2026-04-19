// Service to handle authentication from the frontend
interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
}

interface LoginResponse {
  accessToken: string;
  expiresIn: string;
  user: User;
}

class AuthService {
  private baseURL: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null; // Timestamp de expiración del token
  private user: User | null = null;
  private refreshPromise: Promise<string> | null = null;
  private pendingRequests: Array<() => void> = []; // Cola de peticiones esperando refresh

  constructor() {
    this.baseURL = (process.env.NEXT_PUBLIC_API_URL ?? '') + '/api';
    
    // Cargar datos desde sessionStorage al inicializar
    this.loadFromStorage();
  }

  // Load data from sessionStorage (access token only, refresh token in HttpOnly cookie)
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = sessionStorage.getItem('access_token');
      const expiryStr = sessionStorage.getItem('token_expiry');
      this.tokenExpiry = expiryStr ? parseInt(expiryStr, 10) : null;
      const userData = sessionStorage.getItem('user_data');
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

  // Save data to sessionStorage
  private saveToStorage(token: string, user: User, expiresInMinutes: number = 15): void {
    // Calcular expiración (restar 1 minuto como margen de seguridad)
    const expiry = Date.now() + ((expiresInMinutes - 1) * 60 * 1000);
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('token_expiry', expiry.toString());
      sessionStorage.setItem('user_data', JSON.stringify(user));
    }
    this.accessToken = token;
    this.tokenExpiry = expiry;
    this.user = user;
  }

  // Limpiar sessionStorage
  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('token_expiry');
      sessionStorage.removeItem('user_data');
    }
    this.accessToken = null;
    this.tokenExpiry = null;
    this.user = null;
  }

  // Verificar si el token está por expirar o ya expiró
  private isTokenExpiredOrExpiring(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return true;
    }
    // Si quedan menos de 30 segundos, considerarlo expirado
    return Date.now() >= (this.tokenExpiry - 30000);
  }

  // Asegurar token válido antes de peticiones
  private async ensureValidToken(): Promise<string | null> {
    if (this.isTokenExpiredOrExpiring() && this.accessToken) {
      console.log('🔄 Token próximo a expirar, renovando proactivamente...');
      try {
        const newToken = await this.refreshAccessToken();
        return newToken;
      } catch (error) {
        console.warn('No se pudo renovar token proactivamente:', error);
        return this.accessToken; // Intentar con el token actual
      }
    }
    return this.accessToken;
  }

  // Refresh access token using refresh token from HttpOnly cookie
  private async refreshAccessToken(): Promise<string> {
    // Si ya hay una petición de refresh en curso, esperar a que termine
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Include HttpOnly cookie
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // If refresh token is invalid, clear everything
          if (errorData.code === 'INVALID_REFRESH_TOKEN' || errorData.code === 'NO_REFRESH_TOKEN') {
            this.clearStorage();
            throw new Error('SESSION_EXPIRED');
          }
          
          throw new Error(errorData.error || 'Error al renovar token');
        }

        const data = await response.json();
        
        // Save new access token (15 minutos de expiración)
        if (data.accessToken && data.user) {
          this.saveToStorage(data.accessToken, data.user, 15);
          console.log('✅ Token renovado, nueva expiración:', new Date(this.tokenExpiry!).toLocaleTimeString());
        }

        return data.accessToken;
      } catch (error) {
        this.clearStorage();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Perform HTTP request with authentication and automatic token refresh
  private async request(url: string, options: RequestInit = {}, retryOnTokenExpired = true): Promise<any> {
    // Asegurar token válido antes de hacer la petición (renovación proactiva)
    const currentToken = await this.ensureValidToken();

    const config: RequestInit = {
      credentials: 'include', // Always include cookies for refresh token
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token if it exists
    if (currentToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${currentToken}`,
      };
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If token expired or any 401 error and we haven't retried yet, try to refresh
        const shouldRefresh = response.status === 401 && 
          (errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'INVALID_TOKEN' || errorData.code === 'NO_TOKEN') && 
          retryOnTokenExpired;
          
        if (shouldRefresh) {
          console.log('🔄 Token expirado, intentando refresh...');
          try {
            // Try to refresh token
            const newToken = await this.refreshAccessToken();
            console.log('✅ Token renovado exitosamente');
            
            // Retry original request with new token
            const retryConfig: RequestInit = {
              ...config,
              headers: {
                ...config.headers,
                'Authorization': `Bearer ${newToken}`,
              },
            };
            
            const retryResponse = await fetch(`${this.baseURL}${url}`, retryConfig);
            
            if (!retryResponse.ok) {
              const retryError = await retryResponse.json().catch(() => ({}));
              throw new Error(retryError.error || `HTTP error! status: ${retryResponse.status}`);
            }
            
            return await retryResponse.json();
          } catch (refreshError) {
            console.error('❌ Error al renovar token:', refreshError);
            // If refresh fails, clear storage and throw specific error
            this.clearStorage();
            const error = new Error('SESSION_EXPIRED');
            (error as any).code = 'SESSION_EXPIRED';
            throw error;
          }
        }
        
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
      // Limpiar cualquier token viejo antes del login (migración de localStorage a sessionStorage)
      this.clearStorage();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }

      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Include cookies for refresh token
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.accessToken && data.user) {
        // Parsear expiresIn (ej: "15m" -> 15 minutos)
        const expiresInMinutes = data.expiresIn ? parseInt(data.expiresIn) : 15;
        this.saveToStorage(data.accessToken, data.user, expiresInMinutes);
        console.log('✅ Login exitoso, token expira:', new Date(this.tokenExpiry!).toLocaleTimeString());
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error en login: ${errorMessage}`);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          credentials: 'include', // Include cookies to revoke refresh token
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearStorage();
    }
  }

  // Logout from all devices
  async logoutAll(): Promise<void> {
    try {
      if (this.accessToken) {
        await this.request('/auth/logout-all', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Error during logout all:', error);
    } finally {
      this.clearStorage();
    }
  }
  // Check if user is authenticated
  async verifyAuth(): Promise<boolean> {
    if (!this.accessToken) {
      // Try to refresh if we have a refresh token (HttpOnly cookie)
      try {
        await this.refreshAccessToken();
        return true;
      } catch (error) {
        return false;
      }
    }

    try {
      await this.request('/auth/verify');
      return true;
    } catch (error) {
      // Try to refresh token if verification fails
      try {
        await this.refreshAccessToken();
        return true;
      } catch (refreshError) {
        this.clearStorage();
        return false;
      }
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
    return !!this.accessToken && !!this.user;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.user;
  }

  // Obtener token actual
  getToken(): string | null {
    return this.accessToken;
  }
}

// Singleton service instance
const authService = new AuthService();

export default authService;
