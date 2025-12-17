/**
 * Client HTTP centralisé avec gestion d'erreur, retry et logging
 */

import { API_CONFIG, getEnvironmentConfig } from './config';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private config = getEnvironmentConfig();

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultHeaders = { ...API_CONFIG.DEFAULT_HEADERS };
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Configuration des headers d'authentification
   */
  public setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  public removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Logs conditionnels selon l'environnement
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', ...args: any[]): void {
    const envConfig = getEnvironmentConfig();
    const logLevels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = logLevels.indexOf(envConfig.LOG_LEVEL);
    const requestedLevelIndex = logLevels.indexOf(level);

    if (requestedLevelIndex <= currentLevelIndex) {
      console[level](`[ApiClient]`, ...args);
    }
  }

  /**
   * Gestion du retry avec backoff exponentiel
   */
  private async retryRequest<T>(
    request: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (attempt >= API_CONFIG.RETRY.MAX_ATTEMPTS) {
        throw error;
      }

      const delay = API_CONFIG.RETRY.DELAY * Math.pow(API_CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt - 1);
      this.log('warn', `Tentative ${attempt} échouée, retry dans ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryRequest(request, attempt + 1);
    }
  }

  /**
   * Méthode générique pour les requêtes HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = API_CONFIG.TIMEOUT.DEFAULT
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    this.log('debug', `🚀 ${options.method || 'GET'} ${url}`);

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(timeout),
    };

    const makeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        const response = await fetch(url, requestOptions);
        
        let data: any;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const errorMessage = data?.message || data?.error || 'Erreur API inconnue';
          throw new ApiError(
            errorMessage,
            response.status,
            data?.code,
            data
          );
        }

        this.log('debug', `✅ ${options.method || 'GET'} ${url} - ${response.status}`);
        
        return {
          data,
          status: response.status,
          message: data?.message,
          errors: data?.errors
        };

      } catch (error) {
        this.log('error', `❌ ${options.method || 'GET'} ${url}:`, error);
        
        if (error instanceof ApiError) {
          throw error;
        }
        
        // Gestion des erreurs réseau
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new ApiError('Erreur de connexion réseau', 0, 'NETWORK_ERROR');
        }
        
        // Gestion du timeout
        if (error.name === 'AbortError') {
          throw new ApiError('Timeout de la requête', 408, 'TIMEOUT');
        }
        
        throw new ApiError('Erreur inattendue', 500, 'UNKNOWN_ERROR', error);
      }
    };

    return this.retryRequest(makeRequest);
  }

  /**
   * Méthodes HTTP publiques
   */
  public async get<T>(endpoint: string, timeout?: number): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, timeout);
  }

  public async post<T>(
    endpoint: string, 
    data?: any, 
    timeout?: number
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      timeout
    );
  }

  public async put<T>(
    endpoint: string, 
    data?: any, 
    timeout?: number
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      timeout
    );
  }

  public async patch<T>(
    endpoint: string, 
    data?: any, 
    timeout?: number
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      timeout
    );
  }

  public async delete<T>(endpoint: string, timeout?: number): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, timeout);
  }

  /**
   * Upload de fichiers
   */
  public async upload<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    this.log('debug', `📤 UPLOAD ${url}`);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            this.log('debug', `✅ UPLOAD ${url} - ${xhr.status}`);
            resolve({
              data,
              status: xhr.status,
              message: data?.message
            });
          } else {
            reject(new ApiError(
              data?.message || 'Erreur upload',
              xhr.status,
              data?.code,
              data
            ));
          }
        } catch (error) {
          reject(new ApiError('Erreur parsing réponse upload', xhr.status));
        }
      };

      xhr.onerror = () => {
        this.log('error', `❌ UPLOAD ${url}:`, xhr.statusText);
        reject(new ApiError('Erreur réseau upload', xhr.status));
      };

      xhr.timeout = API_CONFIG.TIMEOUT.UPLOAD;
      xhr.ontimeout = () => {
        reject(new ApiError('Timeout upload', 408));
      };

      xhr.open('POST', url);
      
      // Auth header si disponible
      if (this.defaultHeaders['Authorization']) {
        xhr.setRequestHeader('Authorization', this.defaultHeaders['Authorization']);
      }

      xhr.send(formData);
    });
  }
}

// Export de l'instance singleton
export const apiClient = ApiClient.getInstance();

// Classe d'erreur personnalisée
export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /**
   * Vérifie si l'erreur est due à un problème d'authentification
   */
  public isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Vérifie si l'erreur est due à un problème réseau
   */
  public isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.status === 0;
  }

  /**
   * Vérifie si l'erreur est due à un timeout
   */
  public isTimeoutError(): boolean {
    return this.code === 'TIMEOUT' || this.status === 408;
  }
}