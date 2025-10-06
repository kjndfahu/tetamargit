import { useState, useEffect } from 'react';

export interface Locale {
  code: string;
  name: string;
  flag?: string;
  direction: 'ltr' | 'rtl';
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nConfig {
  defaultLocale: string;
  fallbackLocale: string;
  supportedLocales: string[];
  loadPath: string;
  debug: boolean;
}

export class I18n {
  private config: I18nConfig;
  private currentLocale: string;
  private translations: Map<string, Translation> = new Map();
  private fallbackTranslations: Translation = {};

  constructor(config: Partial<I18nConfig> = {}) {
    this.config = {
      defaultLocale: 'sk',
      fallbackLocale: 'en',
      supportedLocales: ['sk', 'en'],
      loadPath: '/locales',
      debug: false,
      ...config
    };
    
    this.currentLocale = this.config.defaultLocale;
  }

  async setLocale(locale: string): Promise<void> {
    if (!this.config.supportedLocales.includes(locale)) {
      throw new Error(`Locale ${locale} is not supported`);
    }

    this.currentLocale = locale;
    
    if (!this.translations.has(locale)) {
      await this.loadTranslations(locale);
    }

    document.documentElement.lang = locale;
    document.documentElement.dir = this.getLocaleDirection(locale);
    
    // Уведомляем о смене локали
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }

  async loadTranslations(locale: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.loadPath}/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
      }
      
      const translations = await response.json();
      this.translations.set(locale, translations);
      
      if (this.config.debug) {
        console.log(`Loaded translations for locale: ${locale}`, translations);
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${locale}:`, error);
      
      // Загружаем fallback переводы если они еще не загружены
      if (locale !== this.config.fallbackLocale && !this.translations.has(this.config.fallbackLocale)) {
        await this.loadTranslations(this.config.fallbackLocale);
      }
    }
  }

  t(key: string, params?: Record<string, any>): string {
    const translation = this.getTranslation(key);
    
    if (!translation) {
      if (this.config.debug) {
        console.warn(`Translation key not found: ${key}`);
      }
      return key;
    }

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  private getTranslation(key: string): string | null {
    // Ищем перевод в текущей локали
    const currentTranslations = this.translations.get(this.currentLocale);
    if (currentTranslations) {
      const translation = this.getNestedValue(currentTranslations, key);
      if (translation) return translation;
    }

    // Ищем в fallback локали
    if (this.currentLocale !== this.config.fallbackLocale) {
      const fallbackTranslations = this.translations.get(this.config.fallbackLocale);
      if (fallbackTranslations) {
        const translation = this.getNestedValue(fallbackTranslations, key);
        if (translation) return translation;
      }
    }

    return null;
  }

  private getNestedValue(obj: any, path: string): string | null {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }

    return typeof value === 'string' ? value : null;
  }

  private interpolate(text: string, params: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  private getLocaleDirection(locale: string): 'ltr' | 'rtl' {
    // Для большинства языков используется LTR
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
  }

  getSupportedLocales(): string[] {
    return [...this.config.supportedLocales];
  }

  isLocaleSupported(locale: string): boolean {
    return this.config.supportedLocales.includes(locale);
  }

  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(number);
  }

  formatCurrency(amount: number, currency: string = 'EUR', options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency,
      ...options
    }).format(amount);
  }

  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(this.currentLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(dateObj);
  }

  formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(this.currentLocale, {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    }).format(dateObj);
  }

  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions): string {
    return new Intl.RelativeTimeFormat(this.currentLocale, options).format(value, unit);
  }

  getPluralForm(count: number, forms: Record<string, string>): string {
    const rules = {
      sk: (count: number) => {
        if (count === 1) return 'one';
        if (count >= 2 && count <= 4) return 'few';
        return 'other';
      },
      en: (count: number) => {
        return count === 1 ? 'one' : 'other';
      }
    };

    const rule = rules[this.currentLocale as keyof typeof rules] || rules.en;
    const form = rule(count);
    
    return forms[form] || forms.other || '';
  }
}

// Создаем глобальный экземпляр i18n
export const i18n = new I18n();

// Утилиты для быстрого перевода
export const t = (key: string, params?: Record<string, any>): string => {
  return i18n.t(key, params);
};

export const setLocale = (locale: string): Promise<void> => {
  return i18n.setLocale(locale);
};

export const getCurrentLocale = (): string => {
  return i18n.getCurrentLocale();
};

// Утилиты для форматирования
export const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
  return i18n.formatNumber(number, options);
};

export const formatCurrency = (amount: number, currency?: string, options?: Intl.NumberFormatOptions): string => {
  return i18n.formatCurrency(amount, currency, options);
};

export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  return i18n.formatDate(date, options);
};

export const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  return i18n.formatTime(date, options);
};

export const formatRelativeTime = (
  value: number, 
  unit: Intl.RelativeTimeFormatUnit, 
  options?: Intl.RelativeTimeFormatOptions
): string => {
  return i18n.formatRelativeTime(value, unit, options);
};

export const plural = (count: number, forms: Record<string, string>): string => {
  return i18n.getPluralForm(count, forms);
};

// Хук для React компонентов
export const useTranslation = () => {
  const [locale, setLocaleState] = useState(getCurrentLocale());

  useEffect(() => {
    const handleLocaleChange = (event: CustomEvent) => {
      setLocaleState(event.detail.locale);
    };
    
    window.addEventListener('localeChanged', handleLocaleChange as EventListener);
    
    return () => {
      window.removeEventListener('localeChanged', handleLocaleChange as EventListener);
    };
  }, []);
  
  return {
    t,
    locale,
    setLocale,
    formatNumber,
    formatCurrency,
    formatDate,
    formatTime,
    formatRelativeTime,
    plural
  };
};

// Утилиты для валидации переводов
export const validateTranslations = (
  translations: Translation,
  requiredKeys: string[]
): { missing: string[]; extra: string[] } => {
  const missing: string[] = [];
  const extra: string[] = [];
  
  // Проверяем отсутствующие ключи
  for (const key of requiredKeys) {
    if (!hasNestedKey(translations, key)) {
      missing.push(key);
    }
  }
  
  // Проверяем лишние ключи
  const allKeys = getAllKeys(translations);
  for (const key of allKeys) {
    if (!requiredKeys.includes(key)) {
      extra.push(key);
    }
  }
  
  return { missing, extra };
};

const hasNestedKey = (obj: any, path: string): boolean => {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return false;
    }
  }
  
  return true;
};

const getAllKeys = (obj: any, prefix: string = ''): string[] => {
  const keys: string[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
};

