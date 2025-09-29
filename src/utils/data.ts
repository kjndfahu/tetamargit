export interface DataConfig {
  enableValidation: boolean;
  enableTransformation: boolean;
  enableSerialization: boolean;
  defaultDateFormat: string;
  defaultNumberFormat: Intl.NumberFormatOptions;
}

export interface DataValidator<T = any> {
  validate(data: T): boolean;
  getErrors(): string[];
  clearErrors(): void;
}

export interface DataTransformer<T = any> {
  transform(data: T): T;
  transformBack(data: T): T;
}

export interface DataSerializer<T = any> {
  serialize(data: T): string;
  deserialize(data: string): T;
}

// Утилиты для работы с объектами
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
};

export const deepMerge = <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();
  if (source === undefined) {
    return target;
  }

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

export const isObject = (item: any): item is Record<string, any> => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const isArray = (item: any): item is any[] => {
  return Array.isArray(item);
};

export const isFunction = (item: any): item is Function => {
  return typeof item === 'function';
};

export const isString = (item: any): item is string => {
  return typeof item === 'string';
};

export const isNumber = (item: any): item is number => {
  return typeof item === 'number' && !isNaN(item);
};

export const isBoolean = (item: any): item is boolean => {
  return typeof item === 'boolean';
};

export const isNull = (item: any): item is null => {
  return item === null;
};

export const isUndefined = (item: any): item is undefined => {
  return item === undefined;
};

export const isEmpty = (item: any): boolean => {
  if (isNull(item) || isUndefined(item)) {
    return true;
  }

  if (isString(item) || isArray(item)) {
    return item.length === 0;
  }

  if (isObject(item)) {
    return Object.keys(item).length === 0;
  }

  return false;
};

// Утилиты для работы с массивами
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T>(array: T[], key?: keyof T | ((item: T) => any)): T[] => {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const groupBy = <T>(array: T[], key: keyof T | ((item: T) => any)): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T | ((item: T) => any), order: 'asc' | 'desc' = 'asc'): T[] => {
  const sorted = [...array].sort((a, b) => {
    const aValue = typeof key === 'function' ? key(a) : a[key];
    const bValue = typeof key === 'function' ? key(b) : b[key];

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return sorted;
};

export const filterBy = <T>(array: T[], predicate: (item: T, index: number) => boolean): T[] => {
  return array.filter(predicate);
};

export const findIndex = <T>(array: T[], predicate: (item: T, index: number) => boolean): number => {
  return array.findIndex(predicate);
};

export const find = <T>(array: T[], predicate: (item: T, index: number) => boolean): T | undefined => {
  return array.find(predicate);
};

export const flatten = <T>(array: T[][]): T[] => {
  return array.reduce((flat, item) => flat.concat(item), [] as T[]);
};

export const flattenDeep = <T>(array: any[]): T[] => {
  return array.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenDeep(item) : item);
  }, [] as T[]);
};

export const intersection = <T>(...arrays: T[][]): T[] => {
  if (arrays.length === 0) {
    return [];
  }

  return arrays.reduce((result, array) => {
    return result.filter(item => array.includes(item));
  });
};

export const union = <T>(...arrays: T[][]): T[] => {
  return unique(flatten(arrays));
};

export const difference = <T>(array1: T[], array2: T[]): T[] => {
  return array1.filter(item => !array2.includes(item));
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const sample = <T>(array: T[], size: number = 1): T[] => {
  if (size >= array.length) {
    return [...array];
  }

  const shuffled = shuffle(array);
  return shuffled.slice(0, size);
};

// Утилиты для работы с объектами
export const pick = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

export const keys = <T extends Record<string, any>>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};

export const values = <T extends Record<string, any>>(obj: T): T[keyof T][] => {
  return Object.values(obj);
};

export const entries = <T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] => {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};

export const mapValues = <T extends Record<string, any>, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> => {
  const result = {} as Record<keyof T, R>;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = fn(obj[key], key);
    }
  }
  return result;
};

export const invert = <T extends Record<string, any>>(obj: T): Record<string, keyof T> => {
  const result: Record<string, keyof T> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[String(obj[key])] = key;
    }
  }
  return result;
};

// Утилиты для работы с типами данных
export const getType = (value: any): string => {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
};

export const isPrimitive = (value: any): boolean => {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  );
};

export const isDate = (value: any): value is Date => {
  return value instanceof Date;
};

export const isRegExp = (value: any): value is RegExp => {
  return value instanceof RegExp;
};

export const isError = (value: any): value is Error => {
  return value instanceof Error;
};

export const isPromise = (value: any): value is Promise<any> => {
  return value && typeof value.then === 'function';
};

// Утилиты для валидации данных
export class DataValidator<T = any> implements DataValidator<T> {
  private errors: string[] = [];
  private rules: Array<(data: T) => boolean | string> = [];

  addRule(rule: (data: T) => boolean | string): this {
    this.rules.push(rule);
    return this;
  }

  validate(data: T): boolean {
    this.errors = [];
    
    for (const rule of this.rules) {
      const result = rule(data);
      if (result !== true) {
        this.errors.push(typeof result === 'string' ? result : 'Validation failed');
      }
    }

    return this.errors.length === 0;
  }

  getErrors(): string[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

// Предопределенные правила валидации
export const validationRules = {
  required: (message?: string) => (value: any) => {
    if (isEmpty(value)) {
      return message || 'Value is required';
    }
    return true;
  },

  minLength: (min: number, message?: string) => (value: any) => {
    if (isString(value) && value.length < min) {
      return message || `Minimum length is ${min} characters`;
    }
    return true;
  },

  maxLength: (max: number, message?: string) => (value: any) => {
    if (isString(value) && value.length > max) {
      return message || `Maximum length is ${max} characters`;
    }
    return true;
  },

  min: (min: number, message?: string) => (value: any) => {
    if (isNumber(value) && value < min) {
      return message || `Minimum value is ${min}`;
    }
    return true;
  },

  max: (max: number, message?: string) => (value: any) => {
    if (isNumber(value) && value > max) {
      return message || `Maximum value is ${max}`;
    }
    return true;
  },

  pattern: (regex: RegExp, message?: string) => (value: any) => {
    if (isString(value) && !regex.test(value)) {
      return message || 'Value does not match required pattern';
    }
    return true;
  },

  email: (message?: string) => (value: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isString(value) && !emailRegex.test(value)) {
      return message || 'Invalid email format';
    }
    return true;
  },

  url: (message?: string) => (value: any) => {
    try {
      new URL(value);
      return true;
    } catch {
      return message || 'Invalid URL format';
    }
  },

  custom: <T>(validator: (value: T) => boolean | string, message?: string) => (value: T) => {
    const result = validator(value);
    if (result !== true) {
      return message || (typeof result === 'string' ? result : 'Custom validation failed');
    }
    return true;
  }
};

// Утилиты для трансформации данных
export class DataTransformer<T = any> implements DataTransformer<T> {
  private transformers: Array<(data: T) => T> = [];

  addTransformer(transformer: (data: T) => T): this {
    this.transformers.push(transformer);
    return this;
  }

  transform(data: T): T {
    let result = data;
    for (const transformer of this.transformers) {
      result = transformer(result);
    }
    return result;
  }

  transformBack(data: T): T {
    const reversed = [...this.transformers].reverse();
    let result = data;
    for (const transformer of reversed) {
      result = transformer(result);
    }
    return result;
  }
}

// Предопределенные трансформеры
export const transformers = {
  trim: <T extends string>(value: T): T => {
    return value.trim() as T;
  },

  toLowerCase: <T extends string>(value: T): T => {
    return value.toLowerCase() as T;
  },

  toUpperCase: <T extends string>(value: T): T => {
    return value.toUpperCase() as T;
  },

  capitalize: <T extends string>(value: T): T => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() as T;
  },

  round: (value: number, decimals: number = 0): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  floor: (value: number): number => {
    return Math.floor(value);
  },

  ceil: (value: number): number => {
    return Math.ceil(value);
  },

  abs: (value: number): number => {
    return Math.abs(value);
  },

  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  }
};

// Утилиты для сериализации данных
export class DataSerializer<T = any> implements DataSerializer<T> {
  private config: DataConfig;

  constructor(config: Partial<DataConfig> = {}) {
    this.config = {
      enableValidation: true,
      enableTransformation: true,
      enableSerialization: true,
      defaultDateFormat: 'YYYY-MM-DD',
      defaultNumberFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      ...config
    };
  }

  serialize(data: T): string {
    if (this.config.enableSerialization) {
      try {
        return JSON.stringify(data, null, 2);
      } catch (error) {
        throw new Error(`Serialization failed: ${error}`);
      }
    }
    return String(data);
  }

  deserialize(data: string): T {
    if (this.config.enableSerialization) {
      try {
        return JSON.parse(data);
      } catch (error) {
        throw new Error(`Deserialization failed: ${error}`);
      }
    }
    return data as T;
  }
}

// Утилиты для работы с данными
export const createValidator = <T>(): DataValidator<T> => {
  return new DataValidator<T>();
};

export const createTransformer = <T>(): DataTransformer<T> => {
  return new DataTransformer<T>();
};

export const createSerializer = <T>(config?: Partial<DataConfig>): DataSerializer<T> => {
  return new DataSerializer<T>(config);
};

export const validateData = <T>(data: T, rules: Array<(data: T) => boolean | string>): { isValid: boolean; errors: string[] } => {
  const validator = createValidator<T>();
  rules.forEach(rule => validator.addRule(rule));
  
  const isValid = validator.validate(data);
  return { isValid, errors: validator.getErrors() };
};

export const transformData = <T>(data: T, transformers: Array<(data: T) => T>): T => {
  const transformer = createTransformer<T>();
  transformers.forEach(t => transformer.addTransformer(t));
  
  return transformer.transform(data);
};

export const serializeData = <T>(data: T, config?: Partial<DataConfig>): string => {
  const serializer = createSerializer<T>(config);
  return serializer.serialize(data);
};

export const deserializeData = <T>(data: string, config?: Partial<DataConfig>): T => {
  const serializer = createSerializer<T>(config);
  return serializer.deserialize(data);
};


