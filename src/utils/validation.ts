export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'phone' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FieldValidation {
  field: string;
  value: any;
  rules: ValidationRule[];
}

export class Validator {
  private static patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/.+/,
    phone: /^(\+421|0)[0-9]{9}$/,
    zipCode: /^[0-9]{5}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  };

  static validateField(field: FieldValidation): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of field.rules) {
      const result = this.validateRule(field.value, rule);
      
      if (typeof result === 'string') {
        if (rule.type === 'required') {
          errors.push(result);
        } else {
          warnings.push(result);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateForm(fields: FieldValidation[]): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const field of fields) {
      const result = this.validateField(field);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  private static validateRule(value: any, rule: ValidationRule): string | null {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value, rule.message);
      
      case 'minLength':
        return this.validateMinLength(value, rule.value, rule.message);
      
      case 'maxLength':
        return this.validateMaxLength(value, rule.value, rule.message);
      
      case 'pattern':
        return this.validatePattern(value, rule.value, rule.message);
      
      case 'email':
        return this.validateEmail(value, rule.message);
      
      case 'url':
        return this.validateUrl(value, rule.message);
      
      case 'phone':
        return this.validatePhone(value, rule.message);
      
      case 'custom':
        return this.validateCustom(value, rule.validator!, rule.message);
      
      default:
        return null;
    }
  }

  private static validateRequired(value: any, message: string): string | null {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    return null;
  }

  private static validateMinLength(value: any, minLength: number, message: string): string | null {
    if (value && String(value).length < minLength) {
      return message.replace('{min}', String(minLength));
    }
    return null;
  }

  private static validateMaxLength(value: any, maxLength: number, message: string): string | null {
    if (value && String(value).length > maxLength) {
      return message.replace('{max}', String(maxLength));
    }
    return null;
  }

  private static validatePattern(value: any, pattern: RegExp, message: string): string | null {
    if (value && !pattern.test(String(value))) {
      return message;
    }
    return null;
  }

  private static validateEmail(value: any, message: string): string | null {
    if (value && !this.patterns.email.test(String(value))) {
      return message;
    }
    return null;
  }

  private static validateUrl(value: any, message: string): string | null {
    if (value && !this.patterns.url.test(String(value))) {
      return message;
    }
    return null;
  }

  private static validatePhone(value: any, message: string): string | null {
    if (value && !this.patterns.phone.test(String(value))) {
      return message;
    }
    return null;
  }

  private static validateCustom(value: any, validator: (value: any) => boolean | string, message: string): string | null {
    const result = validator(value);
    if (result === false) {
      return message;
    }
    if (typeof result === 'string') {
      return result;
    }
    return null;
  }

  // Предопределенные правила валидации
  static rules = {
    required: (message: string = 'Toto pole je povinné'): ValidationRule => ({
      type: 'required',
      message
    }),

    minLength: (minLength: number, message?: string): ValidationRule => ({
      type: 'minLength',
      value: minLength,
      message: message || `Minimálna dĺžka je ${minLength} znakov`
    }),

    maxLength: (maxLength: number, message?: string): ValidationRule => ({
      type: 'maxLength',
      value: maxLength,
      message: message || `Maximálna dĺžka je ${maxLength} znakov`
    }),

    email: (message: string = 'Neplatný formát emailu'): ValidationRule => ({
      type: 'email',
      message
    }),

    url: (message: string = 'Neplatný formát URL'): ValidationRule => ({
      type: 'url',
      message
    }),

    phone: (message: string = 'Neplatný formát telefónu'): ValidationRule => ({
      type: 'phone',
      message
    }),

    pattern: (pattern: RegExp, message: string): ValidationRule => ({
      type: 'pattern',
      value: pattern,
      message
    }),

    custom: (validator: (value: any) => boolean | string, message: string): ValidationRule => ({
      type: 'custom',
      validator,
      message
    })
  };

  // Утилиты для создания сложных правил валидации
  static createFieldValidator(rules: ValidationRule[]) {
    return (value: any, fieldName: string): ValidationResult => {
      const field: FieldValidation = {
        field: fieldName,
        value,
        rules
      };
      
      return this.validateField(field);
    };
  }

  static createFormValidator(fieldValidators: Record<string, (value: any) => ValidationResult>) {
    return (formData: Record<string, any>): ValidationResult => {
      const fields: FieldValidation[] = [];
      
      for (const [fieldName, validator] of Object.entries(fieldValidators)) {
        const value = formData[fieldName];
        const result = validator(value);
        
        if (!result.isValid) {
          fields.push({
            field: fieldName,
            value,
            rules: [] // Правила не нужны для результата
          });
        }
      }
      
      return this.validateForm(fields);
    };
  }

  // Валидация объектов
  static validateObject<T extends Record<string, any>>(
    obj: T,
    schema: Record<keyof T, ValidationRule[]>
  ): Record<keyof T, ValidationResult> {
    const results: Record<keyof T, ValidationResult> = {} as Record<keyof T, ValidationResult>;
    
    for (const [key, rules] of Object.entries(schema)) {
      const field: FieldValidation = {
        field: key,
        value: obj[key],
        rules
      };
      
      results[key as keyof T] = this.validateField(field);
    }
    
    return results;
  }

  // Валидация массивов
  static validateArray<T>(
    array: T[],
    itemValidator: (item: T) => ValidationResult
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (let i = 0; i < array.length; i++) {
      const result = itemValidator(array[i]);
      
      if (!result.isValid) {
        errors.push(`Item ${i}: ${result.errors.join(', ')}`);
      }
      
      warnings.push(...result.warnings.map(w => `Item ${i}: ${w}`));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Асинхронная валидация
  static async validateFieldAsync(field: FieldValidation): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const rule of field.rules) {
      if (rule.validator && rule.validator.constructor.name === 'AsyncFunction') {
        try {
          const result = await rule.validator(field.value);
          if (typeof result === 'string') {
            warnings.push(result);
          }
        } catch (error) {
          errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        const result = this.validateRule(field.value, rule);
        if (typeof result === 'string') {
          if (rule.type === 'required') {
            errors.push(result);
          } else {
            warnings.push(result);
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Валидация с условиями
  static validateConditional(
    value: any,
    condition: (value: any) => boolean,
    rules: ValidationRule[]
  ): ValidationResult {
    if (!condition(value)) {
      return { isValid: true, errors: [], warnings: [] };
    }
    
    const field: FieldValidation = {
      field: 'conditional',
      value,
      rules
    };
    
    return this.validateField(field);
  }

  // Валидация с зависимостями
  static validateWithDependencies<T extends Record<string, any>>(
    obj: T,
    schema: Record<keyof T, {
      rules: ValidationRule[];
      dependsOn?: (keyof T)[];
      condition?: (dependencies: Partial<T>) => boolean;
    }>
  ): Record<keyof T, ValidationResult> {
    const results: Record<keyof T, ValidationResult> = {} as Record<keyof T, ValidationResult>;
    
    for (const [key, config] of Object.entries(schema)) {
      const fieldKey = key as keyof T;
      
      // Проверяем зависимости
      if (config.dependsOn) {
        const dependencies = config.dependsOn.reduce((acc, dep) => {
          acc[dep] = obj[dep];
          return acc;
        }, {} as Partial<T>);
        
        if (config.condition && !config.condition(dependencies)) {
          results[fieldKey] = { isValid: true, errors: [], warnings: [] };
          continue;
        }
      }
      
      const field: FieldValidation = {
        field: key,
        value: obj[fieldKey],
        rules: config.rules
      };
      
      results[fieldKey] = this.validateField(field);
    }
    
    return results;
  }
}

// Экспортируем предопределенные правила для удобства
export const { rules } = Validator;

// Утилиты для быстрой валидации
export const validate = (value: any, rules: ValidationRule[]): ValidationResult => {
  const field: FieldValidation = {
    field: 'value',
    value,
    rules
  };
  
  return Validator.validateField(field);
};

export const validateForm = (fields: FieldValidation[]): ValidationResult => {
  return Validator.validateForm(fields);
};

export const validateObject = <T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, ValidationRule[]>
): Record<keyof T, ValidationResult> => {
  return Validator.validateObject(obj, schema);
};

export const validateArray = <T>(
  array: T[],
  itemValidator: (item: T) => ValidationResult
): ValidationResult => {
  return Validator.validateArray(array, itemValidator);
};

export const validateAsync = async (value: any, rules: ValidationRule[]): Promise<ValidationResult> => {
  const field: FieldValidation = {
    field: 'value',
    value,
    rules
  };
  
  return Validator.validateFieldAsync(field);
};
