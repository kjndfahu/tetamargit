export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createAriaLabel = (text: string, context?: string): string => {
  return context ? `${text} ${context}` : text;
};

export const createAriaDescribedBy = (description: string): string => {
  const id = generateId('desc');
  return { id, description };
};

export const createAriaLabelledBy = (label: string): string => {
  const id = generateId('label');
  return { id, label };
};

export const focusTrap = (container: HTMLElement): (() => void) => {
  const focusableElements = Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ) as HTMLElement[];

  if (focusableElements.length === 0) return () => {};

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  
  document.body.appendChild(announcement);
  
  // Используем setTimeout для обеспечения асинхронности
  setTimeout(() => {
    announcement.textContent = message;
    
    // Удаляем элемент после объявления
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }, 100);
};

export const createSkipLink = (targetId: string, text: string = 'Skip to main content'): HTMLAnchorElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link sr-only focus:not-sr-only';
  skipLink.setAttribute('aria-label', text);
  
  return skipLink;
};

export const addSkipLink = (targetId: string, text?: string): void => {
  const skipLink = createSkipLink(targetId, text);
  document.body.insertBefore(skipLink, document.body.firstChild);
};

export const validateAriaAttributes = (element: HTMLElement): string[] => {
  const errors: string[] = [];
  
  // Проверяем обязательные атрибуты для ролей
  const role = element.getAttribute('role');
  if (role) {
    switch (role) {
      case 'button':
        if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
          errors.push('Button with role="button" must have aria-label or text content');
        }
        break;
      case 'link':
        if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
          errors.push('Element with role="link" must have aria-label or text content');
        }
        break;
      case 'img':
        if (!element.getAttribute('alt') && !element.getAttribute('aria-label')) {
          errors.push('Image must have alt attribute or aria-label');
        }
        break;
    }
  }
  
  // Проверяем aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (!labelElement) {
      errors.push(`aria-labelledby references non-existent element: ${labelledBy}`);
    }
  }
  
  // Проверяем aria-describedby
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const descElement = document.getElementById(describedBy);
    if (!descElement) {
      errors.push(`aria-describedby references non-existent element: ${describedBy}`);
    }
  }
  
  return errors;
};

export const createLiveRegion = (
  type: 'polite' | 'assertive' | 'off' = 'polite',
  atomic: boolean = true
): HTMLDivElement => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', type);
  liveRegion.setAttribute('aria-atomic', atomic.toString());
  liveRegion.className = 'sr-only';
  
  return liveRegion;
};

export const addLiveRegion = (
  type: 'polite' | 'assertive' | 'off' = 'polite',
  atomic: boolean = true
): HTMLDivElement => {
  const liveRegion = createLiveRegion(type, atomic);
  document.body.appendChild(liveRegion);
  return liveRegion;
};

export const announceLiveRegion = (
  message: string,
  type: 'polite' | 'assertive' = 'polite',
  atomic: boolean = true
): void => {
  const liveRegion = addLiveRegion(type, atomic);
  
  setTimeout(() => {
    liveRegion.textContent = message;
    
    setTimeout(() => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    }, 1000);
  }, 100);
};

export const createProgressIndicator = (
  current: number,
  total: number,
  label?: string
): HTMLDivElement => {
  const progress = document.createElement('div');
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-valuenow', current.toString());
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', total.toString());
  
  if (label) {
    progress.setAttribute('aria-label', label);
  }
  
  const percentage = Math.round((current / total) * 100);
  progress.setAttribute('aria-valuetext', `${percentage}%`);
  
  return progress;
};

export const enhanceFormAccessibility = (form: HTMLFormElement): void => {
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach((input, index) => {
    const inputElement = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    
    // Добавляем уникальные ID если их нет
    if (!inputElement.id) {
      inputElement.id = `input-${index}`;
    }
    
    // Связываем label с input если есть
    const label = form.querySelector(`label[for="${inputElement.id}"]`);
    if (label) {
      inputElement.setAttribute('aria-labelledby', label.id || label.textContent || '');
    }
    
    // Добавляем aria-required для обязательных полей
    if (inputElement.hasAttribute('required')) {
      inputElement.setAttribute('aria-required', 'true');
    }
    
    // Добавляем aria-invalid для полей с ошибками
    if (inputElement.classList.contains('error')) {
      inputElement.setAttribute('aria-invalid', 'true');
    }
  });
};

