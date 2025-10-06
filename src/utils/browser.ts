export interface BrowserInfo {
  userAgent: string;
  browser: string;
  version: string;
  os: string;
  device: 'desktop' | 'mobile' | 'tablet';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  supportsTouch: boolean;
  supportsWebP: boolean;
  supportsWebGL: boolean;
  supportsServiceWorker: boolean;
  supportsPushNotifications: boolean;
  language: string;
  languages: string[];
  timezone: string;
  screenResolution: { width: number; height: number };
  viewportSize: { width: number; height: number };
  colorDepth: number;
  pixelRatio: number;
}

export interface BrowserCapabilities {
  cookies: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webWorkers: boolean;
  webSockets: boolean;
  geolocation: boolean;
  notifications: boolean;
  camera: boolean;
  microphone: boolean;
  bluetooth: boolean;
  nfc: boolean;
}

export interface BrowserPerformance {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  timing: PerformanceTiming | null;
  navigation: PerformanceNavigation | null;
  paint: PerformanceEntry[] | null;
  resource: PerformanceEntry[] | null;
}

export class BrowserDetector {
  private static instance: BrowserDetector;
  private browserInfo: BrowserInfo;
  private capabilities: BrowserCapabilities;

  private constructor() {
    this.browserInfo = this.detectBrowserInfo();
    this.capabilities = this.detectCapabilities();
  }

  static getInstance(): BrowserDetector {
    if (!BrowserDetector.instance) {
      BrowserDetector.instance = new BrowserDetector();
    }
    return BrowserDetector.instance;
  }

  getBrowserInfo(): BrowserInfo {
    return { ...this.browserInfo };
  }

  getCapabilities(): BrowserCapabilities {
    return { ...this.capabilities };
  }

  private detectBrowserInfo(): BrowserInfo {
    const userAgent = navigator.userAgent;
    const language = navigator.language || 'en';
    const languages = navigator.languages || [language];
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screen = window.screen;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Определение браузера
    let browser = 'Unknown';
    let version = 'Unknown';

    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      if (match) version = match[1];
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      if (match) version = match[1];
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      if (match) version = match[1];
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      if (match) version = match[1];
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      browser = 'Internet Explorer';
      const match = userAgent.match(/MSIE (\d+)/);
      if (match) version = match[1];
    }

    // Определение ОС
    let os = 'Unknown';
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS')) {
      os = 'iOS';
    }

    // Определение устройства
    let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    let isMobile = false;
    let isTablet = false;
    let isDesktop = true;

    if (userAgent.includes('Mobile')) {
      device = 'mobile';
      isMobile = true;
      isDesktop = false;
    } else if (userAgent.includes('Tablet') || (screen.width >= 768 && screen.width <= 1024)) {
      device = 'tablet';
      isTablet = true;
      isDesktop = false;
    }

    return {
      userAgent,
      browser,
      version,
      os,
      device,
      isMobile,
      isTablet,
      isDesktop,
      supportsTouch: 'ontouchstart' in window,
      supportsWebP: this.supportsWebP(),
      supportsWebGL: this.supportsWebGL(),
      supportsServiceWorker: 'serviceWorker' in navigator,
      supportsPushNotifications: 'PushManager' in window,
      language,
      languages: Array.from(languages),
      timezone,
      screenResolution: {
        width: screen.width,
        height: screen.height
      },
      viewportSize: viewport,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    };
  }

  private detectCapabilities(): BrowserCapabilities {
    return {
      cookies: navigator.cookieEnabled,
      localStorage: this.testLocalStorage(),
      sessionStorage: this.testSessionStorage(),
      indexedDB: this.testIndexedDB(),
      webWorkers: typeof Worker !== 'undefined',
      webSockets: typeof WebSocket !== 'undefined',
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      bluetooth: 'bluetooth' in navigator,
      nfc: 'NDEFReader' in window
    };
  }

  private testLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private testSessionStorage(): boolean {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private testIndexedDB(): boolean {
    try {
      return 'indexedDB' in window;
    } catch {
      return false;
    }
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  }
}

// Утилиты для работы с URL
export const parseURL = (url: string): URL => {
  try {
    return new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
};

export const getURLParams = (url: string): URLSearchParams => {
  return parseURL(url).searchParams;
};

export const buildURL = (base: string, params: Record<string, any>): string => {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

export const updateURLParams = (params: Record<string, any>, replace: boolean = false): void => {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  });

  if (replace) {
    window.history.replaceState({}, '', url.toString());
  } else {
    window.history.pushState({}, '', url.toString());
  }
};

export const getURLParam = (name: string): string | null => {
  return new URLSearchParams(window.location.search).get(name);
};

export const setURLParam = (name: string, value: string, replace: boolean = false): void => {
  updateURLParams({ [name]: value }, replace);
};

export const removeURLParam = (name: string, replace: boolean = false): void => {
  updateURLParams({ [name]: undefined }, replace);
};

// Утилиты для работы с cookies
export const setCookie = (name: string, value: string, options: {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
} = {}): void => {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    if (typeof options.expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
      cookie += `; expires=${date.toUTCString()}`;
    } else {
      cookie += `; expires=${options.expires.toUTCString()}`;
    }
  }

  if (options.path) cookie += `; path=${options.path}`;
  if (options.domain) cookie += `; domain=${options.domain}`;
  if (options.secure) cookie += '; secure';
  if (options.sameSite) cookie += `; samesite=${options.sameSite}`;

  document.cookie = cookie;
};

export const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

export const removeCookie = (name: string, options: {
  path?: string;
  domain?: string;
} = {}): void => {
  setCookie(name, '', { ...options, expires: new Date(0) });
};

export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });
  return cookies;
};

// Утилиты для работы с localStorage и sessionStorage
export const storage = {
  local: {
    set: (key: string, value: any): void => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    },

    get: <T = any>(key: string, defaultValue?: T): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        return defaultValue || null;
      }
    },

    remove: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    },

    clear: (): void => {
      try {
        localStorage.clear();
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    },

    has: (key: string): boolean => {
      return localStorage.getItem(key) !== null;
    },

    size: (): number => {
      return localStorage.length;
    },

    keys: (): string[] => {
      return Object.keys(localStorage);
    }
  },

  session: {
    set: (key: string, value: any): void => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to save to sessionStorage:', error);
      }
    },

    get: <T = any>(key: string, defaultValue?: T): T | null => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch (error) {
        console.warn('Failed to read from sessionStorage:', error);
        return defaultValue || null;
      }
    },

    remove: (key: string): void => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove from sessionStorage:', error);
      }
    },

    clear: (): void => {
      try {
        sessionStorage.clear();
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error);
      }
    },

    has: (key: string): boolean => {
      return sessionStorage.getItem(key) !== null;
    },

    size: (): number => {
      return sessionStorage.length;
    },

    keys: (): string[] => {
      return Object.keys(sessionStorage);
    }
  }
};

// Утилиты для работы с геолокацией
export const getCurrentPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

export const watchPosition = (
  successCallback: PositionCallback,
  errorCallback?: PositionErrorCallback,
  options?: PositionOptions
): number => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported');
  }

  return navigator.geolocation.watchPosition(successCallback, errorCallback, options);
};

export const clearWatch = (watchId: number): void => {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Утилиты для работы с уведомлениями
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported');
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

export const showNotification = (
  title: string,
  options?: NotificationOptions
): Notification | null => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  return new Notification(title, options);
};

// Утилиты для работы с медиа
export const getUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('getUserMedia is not supported');
  }

  return navigator.mediaDevices.getUserMedia(constraints);
};

export const enumerateDevices = async (): Promise<MediaDeviceInfo[]> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    throw new Error('enumerateDevices is not supported');
  }

  return navigator.mediaDevices.enumerateDevices();
};

// Утилиты для работы с производительностью
export const getPerformanceInfo = (): BrowserPerformance => {
  const performance = window.performance;
  
  return {
    memory: 'memory' in performance ? (performance as any).memory : null,
    timing: performance.timing || null,
    navigation: performance.navigation || null,
    paint: performance.getEntriesByType ? performance.getEntriesByType('paint') : null,
    resource: performance.getEntriesByType ? performance.getEntriesByType('resource') : null
  };
};

export const measurePerformance = <T>(fn: () => T, name: string): T => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start}ms`);
  return result;
};

export const measureAsyncPerformance = async <T>(fn: () => Promise<T>, name: string): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start}ms`);
  return result;
};

// Утилиты для работы с сетью
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const getConnectionInfo = (): any => {
  if ('connection' in navigator) {
    return (navigator as any).connection;
  }
  return null;
};

// Утилиты для работы с вкладками
export const isPageVisible = (): boolean => {
  return !document.hidden;
};

export const onPageVisibilityChange = (callback: (isVisible: boolean) => void): () => void => {
  const handleVisibilityChange = () => {
    callback(!document.hidden);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

// Утилиты для работы с фокусом
export const isPageFocused = (): boolean => {
  return document.hasFocus();
};

export const onPageFocusChange = (callback: (isFocused: boolean) => void): () => void => {
  const handleFocus = () => callback(true);
  const handleBlur = () => callback(false);

  window.addEventListener('focus', handleFocus);
  window.addEventListener('blur', handleBlur);
  
  return () => {
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('blur', handleBlur);
  };
};

// Создание экземпляра по умолчанию
export const browserDetector = BrowserDetector.getInstance();


