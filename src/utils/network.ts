export interface NetworkConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
  withCredentials: boolean;
}

export interface RequestConfig extends Partial<NetworkConfig> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  signal?: AbortSignal;
}

export interface Response<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

export interface NetworkError extends Error {
  config: RequestConfig;
  response?: Response;
  isNetworkError: boolean;
  isTimeoutError: boolean;
  isAbortError: boolean;
}

export class NetworkManager {
  private config: NetworkConfig;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];
  private errorInterceptors: Array<(error: NetworkError) => NetworkError | Promise<NetworkError>> = [];
  private pendingRequests: Map<string, AbortController> = new Map();

  constructor(config: Partial<NetworkConfig> = {}) {
    this.config = {
      baseURL: '',
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
      ...config
    };
  }

  // Конфигурация
  setConfig(config: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): NetworkConfig {
    return { ...this.config };
  }

  // Интерцепторы
  addRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  ): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>
  ): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  addErrorInterceptor(
    interceptor: (error: NetworkError) => NetworkError | Promise<NetworkError>
  ): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  // Основные HTTP методы
  async get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  // Основной метод запроса
  async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    const fullConfig = this.mergeConfig(config);
    const requestId = this.generateRequestId(fullConfig);

    try {
      // Применяем request interceptors
      let processedConfig = fullConfig;
      for (const interceptor of this.requestInterceptors) {
        processedConfig = await interceptor(processedConfig);
      }

      // Создаем AbortController для отмены запроса
      const abortController = new AbortController();
      this.pendingRequests.set(requestId, abortController);

      // Выполняем запрос с retry логикой
      const response = await this.executeRequest<T>(processedConfig, abortController.signal);
      
      // Применяем response interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }

      this.pendingRequests.delete(requestId);
      return processedResponse;

    } catch (error) {
      this.pendingRequests.delete(requestId);
      
      const networkError = this.createNetworkError(error as Error, fullConfig);
      
      // Применяем error interceptors
      let processedError = networkError;
      for (const interceptor of this.errorInterceptors) {
        processedError = await interceptor(processedError);
      }

      throw processedError;
    }
  }

  private async executeRequest<T>(
    config: RequestConfig,
    signal: AbortSignal,
    attempt: number = 1
  ): Promise<Response<T>> {
    try {
      const response = await this.makeRequest<T>(config, signal);
      return response;
    } catch (error) {
      if (this.shouldRetry(error as Error, attempt, config)) {
        await this.delay(config.retryDelay * attempt);
        return this.executeRequest<T>(config, signal, attempt + 1);
      }
      throw error;
    }
  }

  private async makeRequest<T>(config: RequestConfig, signal: AbortSignal): Promise<Response<T>> {
    const { method, url, data, params, headers, timeout, withCredentials } = config;
    const fullUrl = this.buildUrl(url, params);

    const fetchConfig: RequestInit = {
      method,
      headers: this.mergeHeaders(headers),
      credentials: withCredentials ? 'include' : 'same-origin',
      signal,
    };

    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        fetchConfig.body = data;
        // Убираем Content-Type для FormData, чтобы браузер сам установил правильный
        delete (fetchConfig.headers as any)['Content-Type'];
      } else if (typeof data === 'string') {
        fetchConfig.body = data;
      } else {
        fetchConfig.body = JSON.stringify(data);
      }
    }

    const timeoutId = setTimeout(() => {
      signal.abort();
    }, timeout);

    try {
      const response = await fetch(fullUrl, fetchConfig);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await this.parseResponse<T>(response);
      
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers),
        config
      };

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private shouldRetry(error: Error, attempt: number, config: RequestConfig): boolean {
    if (attempt >= config.retries!) {
      return false;
    }

    // Повторяем только для определенных ошибок
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      return false;
    }

    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private mergeConfig(config: RequestConfig): RequestConfig {
    return {
      ...this.config,
      ...config,
      headers: { ...this.config.headers, ...config.headers }
    };
  }

  private mergeHeaders(headers?: Record<string, string>): Record<string, string> {
    return { ...this.config.headers, ...headers };
  }

  private buildUrl(url: string, params?: Record<string, any>): string {
    let fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }
    
    return fullUrl;
  }

  private async parseResponse<T>(response: globalThis.Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    } else if (contentType?.includes('text/')) {
      return response.text() as T;
    } else {
      return response.blob() as T;
    }
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private createNetworkError(error: Error, config: RequestConfig): NetworkError {
    const networkError = error as NetworkError;
    networkError.config = config;
    networkError.isNetworkError = true;
    networkError.isTimeoutError = error.name === 'AbortError';
    networkError.isAbortError = error.name === 'AbortError';
    return networkError;
  }

  private generateRequestId(config: RequestConfig): string {
    return `${config.method}_${config.url}_${Date.now()}_${Math.random()}`;
  }

  // Управление запросами
  cancelRequest(requestId: string): boolean {
    const controller = this.pendingRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.pendingRequests.delete(requestId);
      return true;
    }
    return false;
  }

  cancelAllRequests(): void {
    this.pendingRequests.forEach(controller => controller.abort());
    this.pendingRequests.clear();
  }

  getPendingRequests(): string[] {
    return Array.from(this.pendingRequests.keys());
  }

  // Утилиты для работы с URL
  static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    return searchParams.toString();
  }

  static parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  // Утилиты для работы с заголовками
  static parseHeaders(headers: string): Record<string, string> {
    const result: Record<string, string> = {};
    headers.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        result[key.trim()] = valueParts.join(':').trim();
      }
    });
    return result;
  }

  static formatHeaders(headers: Record<string, string>): string {
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  // Утилиты для работы с данными
  static isFormData(data: any): boolean {
    return data instanceof FormData;
  }

  static isURLSearchParams(data: any): boolean {
    return data instanceof URLSearchParams;
  }

  static serializeData(data: any): string | FormData | URLSearchParams {
    if (this.isFormData(data) || this.isURLSearchParams(data)) {
      return data;
    }
    
    if (typeof data === 'string') {
      return data;
    }
    
    return JSON.stringify(data);
  }

  // Утилиты для работы с ошибками
  static isNetworkError(error: any): error is NetworkError {
    return error && error.isNetworkError === true;
  }

  static isTimeoutError(error: any): error is NetworkError {
    return error && error.isTimeoutError === true;
  }

  static isAbortError(error: any): error is NetworkError {
    return error && error.isAbortError === true;
  }

  static getErrorMessage(error: any): string {
    if (this.isNetworkError(error)) {
      if (error.response) {
        return `HTTP ${error.response.status}: ${error.response.statusText}`;
      }
      return error.message || 'Network error occurred';
    }
    return error.message || 'Unknown error occurred';
  }
}

// Создание экземпляра по умолчанию
export const networkManager = new NetworkManager();

// Экспорт основных методов для удобства
export const { get, post, put, delete: del, patch, request } = networkManager;

// Утилиты для работы с WebSocket
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  heartbeatMessage: string;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private eventHandlers: Map<string, (event: Event) => void> = new Map();

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      heartbeatMessage: 'ping',
      ...config
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.triggerEvent('open');
          resolve();
        };

        this.ws.onclose = (event) => {
          this.stopHeartbeat();
          this.triggerEvent('close', event);
          this.handleReconnect();
        };

        this.ws.onerror = (event) => {
          this.triggerEvent('error', event);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: string | ArrayBuffer | Blob): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  sendJSON(data: any): void {
    this.send(JSON.stringify(data));
  }

  on(event: string, handler: (data?: any) => void): () => void {
    this.messageHandlers.set(event, handler);
    return () => {
      this.messageHandlers.delete(event);
    };
  }

  onEvent(event: string, handler: (event: Event) => void): () => void {
    this.eventHandlers.set(event, handler);
    return () => {
      this.eventHandlers.delete(event);
    };
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      const { type, payload } = data;
      
      if (type && this.messageHandlers.has(type)) {
        this.messageHandlers.get(type)!(payload);
      }
    } catch (error) {
      // Если не JSON, обрабатываем как обычное сообщение
      if (this.messageHandlers.has('message')) {
        this.messageHandlers.get('message')!(event.data);
      }
    }
  }

  private triggerEvent(event: string, data?: any): void {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event)!(data as Event);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.config.reconnectAttempts) {
      this.reconnectAttempts++;
      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch(() => {
          // Рекурсивно пытаемся переподключиться
          this.handleReconnect();
        });
      }, this.config.reconnectDelay * this.reconnectAttempts);
    }
  }

  private startHeartbeat(): void {
    if (this.config.heartbeatInterval > 0) {
      this.heartbeatInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.send(this.config.heartbeatMessage);
        }
      }, this.config.heartbeatInterval);
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  get readyState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  get isConnected(): boolean {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

