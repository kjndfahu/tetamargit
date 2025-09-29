export interface EventHandler<T = any> {
  id: string;
  handler: (data: T) => void;
  once: boolean;
  priority: number;
  context?: any;
}

export interface EventConfig {
  maxListeners: number;
  enableWarnings: boolean;
  enableDebug: boolean;
}

export interface EventStats {
  eventCount: number;
  listenerCount: number;
  totalEmissions: number;
  averageListenersPerEvent: number;
  mostPopularEvents: Array<{ event: string; count: number }>;
}

export class EventEmitter {
  private events: Map<string, EventHandler[]> = new Map();
  private config: EventConfig;
  private stats = {
    totalEmissions: 0,
    eventCount: 0
  };

  constructor(config: Partial<EventConfig> = {}) {
    this.config = {
      maxListeners: 10,
      enableWarnings: true,
      enableDebug: false,
      ...config
    };
  }

  // Основные методы для работы с событиями
  on<T = any>(event: string, handler: (data: T) => void, options?: {
    once?: boolean;
    priority?: number;
    context?: any;
  }): string {
    const { once = false, priority = 0, context } = options || {};
    
    if (!this.events.has(event)) {
      this.events.set(event, []);
      this.stats.eventCount++;
    }

    const handlers = this.events.get(event)!;
    
    if (handlers.length >= this.config.maxListeners) {
      if (this.config.enableWarnings) {
        console.warn(`Event '${event}' has reached max listeners limit (${this.config.maxListeners})`);
      }
    }

    const handlerId = this.generateHandlerId();
    const eventHandler: EventHandler<T> = {
      id: handlerId,
      handler,
      once,
      priority,
      context
    };

    // Вставляем с учетом приоритета
    const insertIndex = handlers.findIndex(h => h.priority < priority);
    if (insertIndex === -1) {
      handlers.push(eventHandler);
    } else {
      handlers.splice(insertIndex, 0, eventHandler);
    }

    if (this.config.enableDebug) {
      console.log(`Added listener for event '${event}' with ID: ${handlerId}`);
    }

    return handlerId;
  }

  once<T = any>(event: string, handler: (data: T) => void, options?: {
    priority?: number;
    context?: any;
  }): string {
    return this.on(event, handler, { ...options, once: true });
  }

  off(event: string, handlerOrId: string | ((data: any) => void)): boolean {
    const handlers = this.events.get(event);
    if (!handlers) {
      return false;
    }

    let removed = false;
    
    if (typeof handlerOrId === 'string') {
      // Удаляем по ID
      const index = handlers.findIndex(h => h.id === handlerOrId);
      if (index !== -1) {
        handlers.splice(index, 1);
        removed = true;
      }
    } else {
      // Удаляем по функции
      const index = handlers.findIndex(h => h.handler === handlerOrId);
      if (index !== -1) {
        handlers.splice(index, 1);
        removed = true;
      }
    }

    if (handlers.length === 0) {
      this.events.delete(event);
      this.stats.eventCount--;
    }

    if (this.config.enableDebug && removed) {
      console.log(`Removed listener from event '${event}'`);
    }

    return removed;
  }

  emit<T = any>(event: string, data?: T): boolean {
    const handlers = this.events.get(event);
    if (!handlers || handlers.length === 0) {
      return false;
    }

    this.stats.totalEmissions++;

    if (this.config.enableDebug) {
      console.log(`Emitting event '${event}' with data:`, data);
    }

    // Создаем копию массива для безопасного удаления
    const handlersCopy = [...handlers];
    const toRemove: string[] = [];

    handlersCopy.forEach(({ id, handler, once, context }) => {
      try {
        if (context) {
          handler.call(context, data);
        } else {
          handler(data);
        }

        if (once) {
          toRemove.push(id);
        }
      } catch (error) {
        console.error(`Error in event handler for '${event}':`, error);
      }
    });

    // Удаляем одноразовые обработчики
    toRemove.forEach(id => {
      this.off(event, id);
    });

    return true;
  }

  // Методы для работы с несколькими событиями
  onMultiple(events: string[], handler: (event: string, data: any) => void, options?: {
    once?: boolean;
    priority?: number;
    context?: any;
  }): string[] {
    return events.map(event => this.on(event, (data) => handler(event, data), options));
  }

  offMultiple(events: string[], handlerOrId: string | ((data: any) => void)): number {
    let removedCount = 0;
    events.forEach(event => {
      if (this.off(event, handlerOrId)) {
        removedCount++;
      }
    });
    return removedCount;
  }

  emitMultiple(events: string[], data?: any): number {
    let emittedCount = 0;
    events.forEach(event => {
      if (this.emit(event, data)) {
        emittedCount++;
      }
    });
    return emittedCount;
  }

  // Методы для работы с группами событий
  createGroup(name: string): EventGroup {
    return new EventGroup(name, this);
  }

  // Методы для получения информации о событиях
  listenerCount(event: string): number {
    const handlers = this.events.get(event);
    return handlers ? handlers.length : 0;
  }

  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }

  getListeners(event: string): EventHandler[] {
    const handlers = this.events.get(event);
    return handlers ? [...handlers] : [];
  }

  // Методы для управления конфигурацией
  setMaxListeners(max: number): void {
    this.config.maxListeners = max;
  }

  getMaxListeners(): number {
    return this.config.maxListeners;
  }

  enableWarnings(enable: boolean): void {
    this.config.enableWarnings = enable;
  }

  enableDebug(enable: boolean): void {
    this.config.enableDebug = enable;
  }

  // Методы для получения статистики
  getStats(): EventStats {
    const eventCount = this.stats.eventCount;
    let totalListeners = 0;
    const eventListenerCounts: Array<{ event: string; count: number }> = [];

    this.events.forEach((handlers, event) => {
      totalListeners += handlers.length;
      eventListenerCounts.push({ event, count: handlers.length });
    });

    eventListenerCounts.sort((a, b) => b.count - a.count);

    return {
      eventCount,
      listenerCount: totalListeners,
      totalEmissions: this.stats.totalEmissions,
      averageListenersPerEvent: eventCount > 0 ? totalListeners / eventCount : 0,
      mostPopularEvents: eventListenerCounts.slice(0, 5)
    };
  }

  // Методы для очистки
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
      this.stats.eventCount--;
    } else {
      this.events.clear();
      this.stats.eventCount = 0;
    }
  }

  // Методы для работы с контекстом
  bindContext(event: string, context: any): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        handler.context = context;
      });
    }
  }

  // Методы для работы с приоритетами
  setPriority(event: string, handlerId: string, priority: number): boolean {
    const handlers = this.events.get(event);
    if (!handlers) {
      return false;
    }

    const handlerIndex = handlers.findIndex(h => h.id === handlerId);
    if (handlerIndex === -1) {
      return false;
    }

    const handler = handlers[handlerIndex];
    handler.priority = priority;

    // Пересортировываем массив
    handlers.splice(handlerIndex, 1);
    const insertIndex = handlers.findIndex(h => h.priority < priority);
    if (insertIndex === -1) {
      handlers.push(handler);
    } else {
      handlers.splice(insertIndex, 0, handler);
    }

    return true;
  }

  // Приватные методы
  private generateHandlerId(): string {
    return `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Группа событий для организации связанных событий
export class EventGroup {
  private prefix: string;
  private emitter: EventEmitter;

  constructor(name: string, emitter: EventEmitter) {
    this.prefix = `${name}:`;
    this.emitter = emitter;
  }

  private getFullEventName(event: string): string {
    return `${this.prefix}${event}`;
  }

  on<T = any>(event: string, handler: (data: T) => void, options?: {
    once?: boolean;
    priority?: number;
    context?: any;
  }): string {
    return this.emitter.on(this.getFullEventName(event), handler, options);
  }

  once<T = any>(event: string, handler: (data: T) => void, options?: {
    priority?: number;
    context?: any;
  }): string {
    return this.emitter.once(this.getFullEventName(event), handler, options);
  }

  off(event: string, handlerOrId: string | ((data: any) => void)): boolean {
    return this.emitter.off(this.getFullEventName(event), handlerOrId);
  }

  emit<T = any>(event: string, data?: T): boolean {
    return this.emitter.emit(this.getFullEventName(event), data);
  }

  listenerCount(event: string): number {
    return this.emitter.listenerCount(this.getFullEventName(event));
  }

  hasListeners(event: string): boolean {
    return this.emitter.hasListeners(this.getFullEventName(event));
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.emitter.removeAllListeners(this.getFullEventName(event));
    } else {
      // Удаляем все события группы
      const events = this.emitter.eventNames().filter(name => name.startsWith(this.prefix));
      events.forEach(eventName => {
        this.emitter.removeAllListeners(eventName);
      });
    }
  }
}

// Утилиты для работы с событиями
export const createEventEmitter = (config?: Partial<EventConfig>): EventEmitter => {
  return new EventEmitter(config);
};

export const createEventGroup = (name: string, emitter: EventEmitter): EventGroup => {
  return new EventGroup(name, emitter);
};

export const createEventHandler = <T = any>(
  handler: (data: T) => void,
  options?: {
    once?: boolean;
    priority?: number;
    context?: any;
  }
): EventHandler<T> => {
  return {
    id: `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    handler,
    once: options?.once || false,
    priority: options?.priority || 0,
    context: options?.context
  };
};

// Утилиты для работы с событиями DOM
export const addDOMEventListener = (
  element: EventTarget,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void => {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
};

export const addDOMEventListeners = (
  element: EventTarget,
  events: Array<{ event: string; handler: EventListener; options?: AddEventListenerOptions }>
): (() => void)[] => {
  return events.map(({ event, handler, options }) => 
    addDOMEventListener(element, event, handler, options)
  );
};

// Утилиты для работы с событиями клавиатуры
export const createKeyboardHandler = (
  key: string,
  handler: (event: KeyboardEvent) => void,
  options?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  }
) => {
  return (event: KeyboardEvent) => {
    if (event.key === key &&
        (!options?.ctrl || event.ctrlKey) &&
        (!options?.shift || event.shiftKey) &&
        (!options?.alt || event.altKey) &&
        (!options?.meta || event.metaKey)) {
      handler(event);
    }
  };
};

// Утилиты для работы с событиями мыши
export const createMouseHandler = (
  button: number,
  handler: (event: MouseEvent) => void
) => {
  return (event: MouseEvent) => {
    if (event.button === button) {
      handler(event);
    }
  };
};

// Утилиты для работы с событиями прокрутки
export const createScrollHandler = (
  handler: (event: Event) => void,
  options?: {
    throttle?: number;
    debounce?: number;
  }
) => {
  let timeoutId: NodeJS.Timeout;
  let lastCall = 0;

  return (event: Event) => {
    if (options?.throttle) {
      const now = Date.now();
      if (now - lastCall >= options.throttle) {
        handler(event);
        lastCall = now;
      }
    } else if (options?.debounce) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handler(event), options.debounce);
    } else {
      handler(event);
    }
  };
};

// Утилиты для работы с событиями изменения размера
export const createResizeHandler = (
  handler: (event: Event) => void,
  options?: {
    throttle?: number;
    debounce?: number;
  }
) => {
  return createScrollHandler(handler, options);
};

// Утилиты для работы с событиями фокуса
export const createFocusHandler = (
  onFocus?: (event: FocusEvent) => void,
  onBlur?: (event: FocusEvent) => void
) => {
  return {
    onFocus: onFocus || (() => {}),
    onBlur: onBlur || (() => {})
  };
};

// Утилиты для работы с событиями формы
export const createFormHandler = (
  onSubmit?: (event: SubmitEvent) => void,
  onChange?: (event: Event) => void,
  onInput?: (event: Event) => void
) => {
  return {
    onSubmit: onSubmit || (() => {}),
    onChange: onChange || (() => {}),
    onInput: onInput || (() => {})
  };
};

// Создание экземпляра по умолчанию
export const defaultEventEmitter = new EventEmitter();


