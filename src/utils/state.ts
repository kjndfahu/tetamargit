export interface StateConfig<T> {
  initialState: T;
  name?: string;
  persist?: boolean;
  storageKey?: string;
  storage?: 'localStorage' | 'sessionStorage';
  serialize?: (state: T) => string;
  deserialize?: (data: string) => T;
  middleware?: StateMiddleware<T>[];
}

export interface StateMiddleware<T> {
  name: string;
  before?: (action: string, payload: any, state: T) => T | void;
  after?: (action: string, payload: any, state: T, newState: T) => T | void;
  error?: (action: string, payload: any, error: Error, state: T) => T | void;
}

export interface StateAction<T> {
  type: string;
  payload?: any;
  timestamp: number;
  id: string;
}

export interface StateHistory<T> {
  past: T[];
  present: T;
  future: T[];
  maxSize: number;
}

export class StateManager<T> {
  private state: T;
  private config: StateConfig<T>;
  private middleware: StateMiddleware<T>[] = [];
  private history: StateHistory<T>;
  private subscribers: Set<(state: T, action: StateAction<T>) => void> = new Set();
  private actionId = 0;

  constructor(config: StateConfig<T>) {
    this.config = {
      persist: false,
      storage: 'localStorage',
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      middleware: [],
      ...config
    };

    this.state = this.loadState();
    this.middleware = this.config.middleware || [];
    this.history = {
      past: [],
      present: this.state,
      future: [],
      maxSize: 50
    };
  }

  private loadState(): T {
    if (!this.config.persist) {
      return this.config.initialState;
    }

    try {
      const storage = this.config.storage === 'sessionStorage' ? sessionStorage : localStorage;
      const key = this.config.storageKey || `state_${this.config.name || 'default'}`;
      const stored = storage.getItem(key);
      
      if (stored && this.config.deserialize) {
        return this.config.deserialize(stored);
      }
    } catch (error) {
      console.warn('Failed to load state from storage:', error);
    }

    return this.config.initialState;
  }

  private saveState(state: T): void {
    if (!this.config.persist) {
      return;
    }

    try {
      const storage = this.config.storage === 'sessionStorage' ? sessionStorage : localStorage;
      const key = this.config.storageKey || `state_${this.config.name || 'default'}`;
      const serialized = this.config.serialize ? this.config.serialize(state) : JSON.stringify(state);
      
      storage.setItem(key, serialized);
    } catch (error) {
      console.warn('Failed to save state to storage:', error);
    }
  }

  private addToHistory(state: T): void {
    this.history.past.push(this.history.present);
    this.history.present = state;
    this.history.future = [];

    if (this.history.past.length > this.history.maxSize) {
      this.history.past.shift();
    }
  }

  private notifySubscribers(action: StateAction<T>): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(this.state, action);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });
  }

  getState(): T {
    return this.state;
  }

  setState(newState: T | ((prevState: T) => T), actionType: string = 'SET_STATE'): void {
    const prevState = this.state;
    const newStateValue = typeof newState === 'function' ? (newState as (prevState: T) => T)(prevState) : newState;

    const action: StateAction<T> = {
      type: actionType,
      payload: newStateValue,
      timestamp: Date.now(),
      id: `action_${++this.actionId}`
    };

    // Выполняем middleware до изменения состояния
    let currentState = prevState;
    for (const mw of this.middleware) {
      if (mw.before) {
        const result = mw.before(action.type, action.payload, currentState);
        if (result !== undefined) {
          currentState = result;
        }
      }
    }

    // Обновляем состояние
    this.state = newStateValue;
    this.addToHistory(this.state);
    this.saveState(this.state);

    // Выполняем middleware после изменения состояния
    for (const mw of this.middleware) {
      if (mw.after) {
        const result = mw.after(action.type, action.payload, currentState, this.state);
        if (result !== undefined) {
          this.state = result;
          this.saveState(this.state);
        }
      }
    }

    // Уведомляем подписчиков
    this.notifySubscribers(action);
  }

  dispatch(actionType: string, payload?: any): void {
    this.setState(payload || this.state, actionType);
  }

  subscribe(callback: (state: T, action: StateAction<T>) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  unsubscribe(callback: (state: T, action: StateAction<T>) => void): void {
    this.subscribers.delete(callback);
  }

  // История состояний
  canUndo(): boolean {
    return this.history.past.length > 0;
  }

  canRedo(): boolean {
    return this.history.future.length > 0;
  }

  undo(): void {
    if (!this.canUndo()) {
      return;
    }

    const previous = this.history.past.pop()!;
    const current = this.history.present;
    
    this.history.future.unshift(current);
    this.history.present = previous;
    
    this.state = previous;
    this.saveState(this.state);
    
    const action: StateAction<T> = {
      type: 'UNDO',
      payload: previous,
      timestamp: Date.now(),
      id: `action_${++this.actionId}`
    };
    
    this.notifySubscribers(action);
  }

  redo(): void {
    if (!this.canRedo()) {
      return;
    }

    const next = this.history.future.shift()!;
    const current = this.history.present;
    
    this.history.past.push(current);
    this.history.present = next;
    
    this.state = next;
    this.saveState(this.state);
    
    const action: StateAction<T> = {
      type: 'REDO',
      payload: next,
      timestamp: Date.now(),
      id: `action_${++this.actionId}`
    };
    
    this.notifySubscribers(action);
  }

  // Middleware
  use(middleware: StateMiddleware<T>): void {
    this.middleware.push(middleware);
  }

  // Утилиты для работы с частями состояния
  update<K extends keyof T>(key: K, value: T[K]): void {
    this.setState(prevState => ({
      ...prevState,
      [key]: value
    }), `UPDATE_${String(key).toUpperCase()}`);
  }

  updateMultiple(updates: Partial<T>): void {
    this.setState(prevState => ({
      ...prevState,
      ...updates
    }), 'UPDATE_MULTIPLE');
  }

  reset(): void {
    this.setState(this.config.initialState, 'RESET');
    this.history = {
      past: [],
      present: this.config.initialState,
      future: [],
      maxSize: 50
    };
  }

  // Селекторы
  select<K extends keyof T>(key: K): T[K] {
    return this.state[key];
  }

  selectMultiple<K extends keyof T>(keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      result[key] = this.state[key];
    });
    return result;
  }

  // Асинхронные действия
  async dispatchAsync(
    actionType: string,
    asyncAction: (state: T) => Promise<any>
  ): Promise<void> {
    try {
      const result = await asyncAction(this.state);
      this.setState(result, actionType);
    } catch (error) {
      // Выполняем middleware для ошибок
      for (const mw of this.middleware) {
        if (mw.error) {
          const result = mw.error(actionType, undefined, error as Error, this.state);
          if (result !== undefined) {
            this.setState(result, `${actionType}_ERROR`);
          }
        }
      }
      throw error;
    }
  }

  // Группировка действий
  batch(actions: Array<{ type: string; payload?: any }>): void {
    const batchId = `batch_${++this.actionId}`;
    
    actions.forEach((action, index) => {
      const isLast = index === actions.length - 1;
      this.setState(action.payload || this.state, `${batchId}_${action.type}`);
      
      if (isLast) {
        // Уведомляем о завершении батча
        const batchAction: StateAction<T> = {
          type: `${batchId}_COMPLETE`,
          payload: this.state,
          timestamp: Date.now(),
          id: batchId
        };
        this.notifySubscribers(batchAction);
      }
    });
  }
}

// Предопределенные middleware
export const createLoggerMiddleware = <T>(name?: string): StateMiddleware<T> => ({
  name: 'logger',
  before: (action, payload, state) => {
    console.group(`🔍 ${name || 'State'} - ${action}`);
    console.log('Previous State:', state);
    console.log('Action:', { type: action, payload });
    console.groupEnd();
  },
  after: (action, payload, state, newState) => {
    console.group(`✅ ${name || 'State'} - ${action} - Result`);
    console.log('New State:', newState);
    console.log('State Diff:', getStateDiff(state, newState));
    console.groupEnd();
  },
  error: (action, payload, error, state) => {
    console.error(`❌ ${name || 'State'} - ${action} - Error:`, error);
    console.log('Current State:', state);
  }
});

export const createPersistMiddleware = <T>(
  key: string,
  storage: 'localStorage' | 'sessionStorage' = 'localStorage'
): StateMiddleware<T> => ({
  name: 'persist',
  after: (action, payload, state, newState) => {
    try {
      const storageInstance = storage === 'sessionStorage' ? sessionStorage : localStorage;
      storageInstance.setItem(key, JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }
});

export const createThrottleMiddleware = <T>(delay: number): StateMiddleware<T> => {
  let lastUpdate = 0;
  
  return {
    name: 'throttle',
    before: (action, payload, state) => {
      const now = Date.now();
      if (now - lastUpdate < delay) {
        return state; // Возвращаем текущее состояние без изменений
      }
      lastUpdate = now;
    }
  };
};

export const createDebounceMiddleware = <T>(delay: number): StateMiddleware<T> => {
  let timeoutId: NodeJS.Timeout;
  
  return {
    name: 'debounce',
    before: (action, payload, state) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Действие будет выполнено после задержки
      }, delay);
      return state; // Возвращаем текущее состояние без изменений
    }
  };
};

// Утилиты для работы с состоянием
export const getStateDiff = <T>(oldState: T, newState: T): Partial<T> => {
  const diff: Partial<T> = {};
  
  for (const key in newState) {
    if (oldState[key] !== newState[key]) {
      diff[key] = newState[key];
    }
  }
  
  return diff;
};

export const createSelector = <T, R>(
  selector: (state: T) => R,
  equalityFn?: (a: R, b: R) => boolean
) => {
  let lastResult: R;
  let lastState: T;
  
  return (state: T): R => {
    if (lastState === state) {
      return lastResult;
    }
    
    const newResult = selector(state);
    
    if (equalityFn ? equalityFn(lastResult, newResult) : lastResult === newResult) {
      return lastResult;
    }
    
    lastState = state;
    lastResult = newResult;
    
    return newResult;
  };
};

export const createAsyncSelector = <T, R>(
  selector: (state: T) => Promise<R>
) => {
  let lastPromise: Promise<R> | null = null;
  let lastResult: R | null = null;
  let lastState: T | null = null;
  
  return async (state: T): Promise<R> => {
    if (lastState === state && lastPromise) {
      return lastPromise;
    }
    
    lastState = state;
    lastPromise = selector(state);
    
    try {
      lastResult = await lastPromise;
      return lastResult;
    } catch (error) {
      lastPromise = null;
      throw error;
    }
  };
};

// Утилиты для создания действий
export const createAction = <T>(type: string) => {
  return (payload?: T) => ({
    type,
    payload,
    timestamp: Date.now(),
    id: `action_${Math.random().toString(36).substr(2, 9)}`
  });
};

export const createAsyncAction = <T, R>(
  type: string,
  asyncFn: (payload: T) => Promise<R>
) => {
  return async (payload: T) => {
    try {
      const result = await asyncFn(payload);
      return { type: `${type}_SUCCESS`, payload: result };
    } catch (error) {
      return { type: `${type}_ERROR`, payload: error };
    }
  };
};

