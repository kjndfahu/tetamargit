export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Разрешаем только HTTP и HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

export const validateInput = (input: string, type: 'email' | 'url' | 'phone' | 'text'): boolean => {
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/.+/,
    phone: /^(\+421|0)[0-9]{9}$/,
    text: /^[\w\s\-.,!?()]+$/
  };
  
  return patterns[type].test(input);
};

export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

export const hashPassword = async (password: string): Promise<string> => {
  // В реальном приложении используйте bcrypt или подобную библиотеку
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  // Длина пароля
  if (password.length >= 8) score += 1;
  else feedback.push('Пароль должен содержать минимум 8 символов');
  
  // Наличие цифр
  if (/\d/.test(password)) score += 1;
  else feedback.push('Пароль должен содержать цифры');
  
  // Наличие букв в нижнем регистре
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Пароль должен содержать буквы в нижнем регистре');
  
  // Наличие букв в верхнем регистре
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Пароль должен содержать буквы в верхнем регистре');
  
  // Наличие специальных символов
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Пароль должен содержать специальные символы');
  
  const isValid = score >= 4;
  
  return { isValid, score, feedback };
};

export const preventXSS = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const createSecureHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  };
};

export const validateJWT = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Проверяем формат (базовая валидация)
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    // Проверяем срок действия
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export const rateLimit = (
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // В реальном приложении используйте Redis или базу данных
  const requests = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validRequests));
  
  return true;
};

export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  allowedKeys: (keyof T)[]
): Partial<T> => {
  const sanitized: Partial<T> = {};
  
  allowedKeys.forEach(key => {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = escapeHtml(obj[key]) as T[keyof T];
      } else {
        sanitized[key] = obj[key];
      }
    }
  });
  
  return sanitized;
};

