export const createMockData = <T>(template: Partial<T>, count: number = 1): T[] => {
  const result: T[] = [];
  
  for (let i = 0; i < count; i++) {
    const item = { ...template } as T;
    
    // Добавляем уникальные идентификаторы
    if ('id' in item) {
      (item as any).id = i + 1;
    }
    
    result.push(item);
  }
  
  return result;
};

export const createMockCartItem = (overrides: Partial<any> = {}) => ({
  id: Math.floor(Math.random() * 1000),
  name: 'Test Product',
  price: 10.00,
  oldPrice: 12.00,
  image: 'https://via.placeholder.com/150',
  quantity: 1,
  category: 'Test Category',
  ...overrides
});

export const createMockContactFormData = (overrides: Partial<any> = {}) => ({
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '+421123456789',
  address: 'Test Address 123',
  city: 'Test City',
  zipCode: '12345',
  pickupDate: '',
  pickupTime: '',
  deliveryDate: '',
  deliveryTime: '',
  notes: '',
  ...overrides
});

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const mockApiResponse = <T>(data: T, success: boolean = true): any => ({
  data,
  success,
  message: success ? 'Success' : 'Error',
  errors: success ? undefined : { field: ['Error message'] }
});

export const mockApiError = (message: string = 'API Error', status: number = 500): Error => {
  const error = new Error(message);
  (error as any).status = status;
  return error;
};

export const createTestWrapper = (component: React.ReactElement) => {
  return component;
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

export const mockSessionStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

