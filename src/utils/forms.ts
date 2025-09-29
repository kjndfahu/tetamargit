import React from 'react';

export interface FormField {
  name: string;
  value: any;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: any; label: string; disabled?: boolean }>;
  validation?: any[];
  error?: string;
  touched?: boolean;
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onValidate?: (data: Record<string, any>) => Record<string, string[]>;
  initialValues?: Record<string, any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export class FormManager {
  private config: FormConfig;
  private fields: Map<string, FormField> = new Map();
  private values: Record<string, any> = {};
  private errors: Record<string, string[]> = {};
  private touched: Set<string> = new Set();
  private isSubmitting: boolean = false;

  constructor(config: FormConfig) {
    this.config = config;
    this.initializeForm();
  }

  private initializeForm(): void {
    // Инициализируем поля
    for (const field of this.config.fields) {
      this.fields.set(field.name, { ...field });
    }

    // Устанавливаем начальные значения
    this.values = { ...this.config.initialValues };
    for (const field of this.config.fields) {
      if (this.values[field.name] === undefined) {
        this.values[field.name] = this.getDefaultValue(field);
      }
    }
  }

  private getDefaultValue(field: FormField): any {
    switch (field.type) {
      case 'checkbox':
        return false;
      case 'select':
        return field.options?.[0]?.value || '';
      case 'textarea':
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
      case 'date':
      case 'time':
        return '';
      default:
        return '';
    }
  }

  getField(name: string): FormField | undefined {
    return this.fields.get(name);
  }

  getValue(name: string): any {
    return this.values[name];
  }

  setValue(name: string, value: any): void {
    this.values[name] = value;
    
    if (this.config.validateOnChange) {
      this.validateField(name);
    }
  }

  getValues(): Record<string, any> {
    return { ...this.values };
  }

  setValues(values: Record<string, any>): void {
    this.values = { ...this.values, ...values };
    
    if (this.config.validateOnChange) {
      this.validateAll();
    }
  }

  getError(name: string): string[] {
    return this.errors[name] || [];
  }

  getErrors(): Record<string, string[]> {
    return { ...this.errors };
  }

  isTouched(name: string): boolean {
    return this.touched.has(name);
  }

  isFieldValid(name: string): boolean {
    return !this.getError(name).length;
  }

  isFormValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  isSubmittingForm(): boolean {
    return this.isSubmitting;
  }

  private validateField(name: string): void {
    const field = this.fields.get(name);
    if (!field || !field.validation) {
      return;
    }

    const value = this.values[name];
    const fieldErrors: string[] = [];

    for (const rule of field.validation) {
      const result = this.validateRule(value, rule);
      if (result) {
        fieldErrors.push(result);
      }
    }

    if (fieldErrors.length > 0) {
      this.errors[name] = fieldErrors;
    } else {
      delete this.errors[name];
    }
  }

  private validateRule(value: any, rule: any): string | null {
    switch (rule.type) {
      case 'required':
        if (rule.value && !value) {
          return rule.message || 'Toto pole je povinné';
        }
        break;
      
      case 'minLength':
        if (value && String(value).length < rule.value) {
          return rule.message || `Minimálna dĺžka je ${rule.value} znakov`;
        }
        break;
      
      case 'maxLength':
        if (value && String(value).length > rule.value) {
          return rule.message || `Maximálna dĺžka je ${rule.value} znakov`;
        }
        break;
      
      case 'pattern':
        if (value && !rule.value.test(String(value))) {
          return rule.message || 'Neplatný formát';
        }
        break;
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return rule.message || 'Neplatný formát emailu';
        }
        break;
      
      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value);
          if (result !== true) {
            return result || rule.message || 'Neplatná hodnota';
          }
        }
        break;
    }

    return null;
  }

  private validateAll(): void {
    this.errors = {};
    
    for (const field of this.config.fields) {
      this.validateField(field.name);
    }
  }

  async validateForm(): Promise<boolean> {
    if (this.config.onValidate) {
      this.errors = this.config.onValidate(this.values);
    } else {
      this.validateAll();
    }

    return this.isFormValid();
  }

  async submit(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      const isValid = await this.validateForm();
      
      if (!isValid) {
        throw new Error('Form validation failed');
      }

      await this.config.onSubmit(this.values);
    } finally {
      this.isSubmitting = false;
    }
  }

  reset(): void {
    this.values = { ...this.config.initialValues };
    this.errors = {};
    this.touched.clear();
    this.isSubmitting = false;

    // Устанавливаем значения по умолчанию для полей без начальных значений
    for (const field of this.config.fields) {
      if (this.values[field.name] === undefined) {
        this.values[field.name] = this.getDefaultValue(field);
      }
    }
  }

  setFieldTouched(name: string): void {
    this.touched.add(name);
    
    if (this.config.validateOnBlur) {
      this.validateField(name);
    }
  }

  setFieldError(name: string, error: string): void {
    this.errors[name] = [error];
  }

  clearFieldError(name: string): void {
    delete this.errors[name];
  }

  clearAllErrors(): void {
    this.errors = {};
  }

  getFieldProps(name: string): {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error: string[];
    touched: boolean;
    disabled: boolean;
  } {
    const field = this.fields.get(name);
    
    return {
      value: this.values[name],
      onChange: (value: any) => this.setValue(name, value),
      onBlur: () => this.setFieldTouched(name),
      error: this.getError(name),
      touched: this.isTouched(name),
      disabled: field?.disabled || false
    };
  }

  // Утилиты для работы с массивами полей
  addArrayField(name: string, value: any): void {
    if (!Array.isArray(this.values[name])) {
      this.values[name] = [];
    }
    
    this.values[name].push(value);
    
    if (this.config.validateOnChange) {
      this.validateField(name);
    }
  }

  removeArrayField(name: string, index: number): void {
    if (Array.isArray(this.values[name])) {
      this.values[name].splice(index, 1);
      
      if (this.config.validateOnChange) {
        this.validateField(name);
      }
    }
  }

  updateArrayField(name: string, index: number, value: any): void {
    if (Array.isArray(this.values[name])) {
      this.values[name][index] = value;
      
      if (this.config.validateOnChange) {
        this.validateField(name);
      }
    }
  }

  // Утилиты для работы с зависимыми полями
  setFieldDependency(name: string, dependsOn: string, condition: (value: any) => boolean): void {
    const field = this.fields.get(name);
    if (field) {
      field.disabled = !condition(this.values[dependsOn]);
      
      if (field.disabled) {
        this.values[name] = this.getDefaultValue(field);
        delete this.errors[name];
      }
    }
  }

  // Утилиты для работы с условными полями
  setFieldCondition(name: string, condition: (values: Record<string, any>) => boolean): void {
    const field = this.fields.get(name);
    if (field) {
      field.disabled = !condition(this.values);
      
      if (field.disabled) {
        this.values[name] = this.getDefaultValue(field);
        delete this.errors[name];
      }
    }
  }
}

// Хук для React компонентов
export const useForm = (config: FormConfig) => {
  const [formManager] = React.useState(() => new FormManager(config));
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const updateForm = React.useCallback(() => {
    forceUpdate();
  }, []);

  React.useEffect(() => {
    // Подписываемся на изменения формы
    const handleFormChange = () => {
      updateForm();
    };

    // Здесь можно добавить подписку на события формы
    // formManager.on('change', handleFormChange);

    return () => {
      // formManager.off('change', handleFormChange);
    };
  }, [formManager, updateForm]);

  return {
    // Значения и ошибки
    values: formManager.getValues(),
    errors: formManager.getErrors(),
    touched: formManager.touched,
    
    // Методы
    setValue: formManager.setValue.bind(formManager),
    setValues: formManager.setValues.bind(formManager),
    getValue: formManager.getValue.bind(formManager),
    getFieldProps: formManager.getFieldProps.bind(formManager),
    
    // Валидация
    validateField: formManager.validateField.bind(formManager),
    validateForm: formManager.validateForm.bind(formManager),
    isFieldValid: formManager.isFieldValid.bind(formManager),
    isFormValid: formManager.isFormValid.bind(formManager),
    
    // Состояние
    isSubmitting: formManager.isSubmittingForm(),
    
    // Действия
    submit: formManager.submit.bind(formManager),
    reset: formManager.reset.bind(formManager),
    
    // Утилиты
    setFieldTouched: formManager.setFieldTouched.bind(formManager),
    setFieldError: formManager.setFieldError.bind(formManager),
    clearFieldError: formManager.clearFieldError.bind(formManager),
    clearAllErrors: formManager.clearAllErrors.bind(formManager),
    
    // Массивы
    addArrayField: formManager.addArrayField.bind(formManager),
    removeArrayField: formManager.removeArrayField.bind(formManager),
    updateArrayField: formManager.updateArrayField.bind(formManager),
    
    // Зависимости
    setFieldDependency: formManager.setFieldDependency.bind(formManager),
    setFieldCondition: formManager.setFieldCondition.bind(formManager)
  };
};

// Утилиты для создания полей формы
export const createField = (
  name: string,
  type: FormField['type'],
  label: string,
  options?: Partial<FormField>
): FormField => ({
  name,
  type,
  label,
  value: '',
  required: false,
  disabled: false,
  touched: false,
  ...options
});

export const createTextField = (
  name: string,
  label: string,
  options?: Partial<FormField>
): FormField => createField(name, 'text', label, options);

export const createEmailField = (
  name: string,
  label: string,
  options?: Partial<FormField>
): FormField => createField(name, 'email', label, options);

export const createPasswordField = (
  name: string,
  label: string,
  options?: Partial<FormField>
): FormField => createField(name, 'password', label, options);

export const createSelectField = (
  name: string,
  label: string,
  options: Array<{ value: any; label: string; disabled?: boolean }>,
  fieldOptions?: Partial<FormField>
): FormField => createField(name, 'select', label, { options, ...fieldOptions });

export const createCheckboxField = (
  name: string,
  label: string,
  options?: Partial<FormField>
): FormField => createField(name, 'checkbox', label, { value: false, ...options });

export const createTextareaField = (
  name: string,
  label: string,
  options?: Partial<FormField>
): FormField => createField(name, 'textarea', label, options);

// Утилиты для валидации
export const required = (message?: string) => ({
  type: 'required' as const,
  value: true,
  message: message || 'Toto pole je povinné'
});

export const minLength = (length: number, message?: string) => ({
  type: 'minLength' as const,
  value: length,
  message: message || `Minimálna dĺžka je ${length} znakov`
});

export const maxLength = (length: number, message?: string) => ({
  type: 'maxLength' as const,
  value: length,
  message: message || `Maximálna dĺžka je ${length} znakov`
});

export const pattern = (regex: RegExp, message?: string) => ({
  type: 'pattern' as const,
  value: regex,
  message: message || 'Neplatný formát'
});

export const email = (message?: string) => ({
  type: 'email' as const,
  message: message || 'Neplatný formát emailu'
});

export const custom = (validator: (value: any) => boolean | string, message?: string) => ({
  type: 'custom' as const,
  validator,
  message: message || 'Neplatná hodnota'
});

