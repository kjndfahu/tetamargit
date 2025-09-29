export const createFormData = <T extends Record<string, any>>(data: T): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value.toString());
    }
  });
  
  return formData;
};

export const getFormValues = <T extends Record<string, any>>(form: HTMLFormElement): T => {
  const formData = new FormData(form);
  const values: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    values[key] = value;
  }
  
  return values as T;
};

export const validateForm = <T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => string | null>
): Record<keyof T, string | null> => {
  const errors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
  
  Object.keys(data).forEach((key) => {
    const validator = validators[key as keyof T];
    if (validator) {
      errors[key as keyof T] = validator(data[key as keyof T]);
    }
  });
  
  return errors;
};

export const hasFormErrors = (errors: Record<string, string | null>): boolean => {
  return Object.values(errors).some(error => error !== null);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

