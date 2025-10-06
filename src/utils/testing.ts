export interface TestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  verbose: boolean;
}

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: Error;
  retries: number;
  skip?: boolean;
}

export interface TestSuite {
  name: string;
  tests: Test[];
  test?: any;
  beforeAll?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
}

export interface Test {
  name: string;
  fn: () => void | Promise<void>;
  timeout?: number;
  retries?: number;
  skip?: boolean;
  only?: boolean;
}

export class TestRunner {
  private config: TestConfig;
  private results: TestResult[] = [];

  constructor(config: Partial<TestConfig> = {}) {
    this.config = {
      timeout: 5000,
      retries: 0,
      parallel: false,
      verbose: true,
      ...config
    };
  }

  async runTest(test: Test, context?: any): Promise<TestResult> {
    const startTime = performance.now();
    let lastError: Error | undefined;
    let retries = 0;
    const maxRetries = test.retries ?? this.config.retries;

    while (retries <= maxRetries) {
      try {
        if (context?.beforeEach) {
          await context.beforeEach();
        }

        await Promise.race([
          test.fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), test.timeout ?? this.config.timeout)
          )
        ]);

        if (context?.afterEach) {
          await context.afterEach();
        }

        const duration = performance.now() - startTime;
        return { name: test.name, passed: true, duration, retries };
      } catch (error) {
        lastError = error as Error;
        retries++;
        
        if (retries > maxRetries) {
          break;
        }
        
        if (this.config.verbose) {
          console.warn(`Test "${test.name}" failed, retrying... (${retries}/${maxRetries})`);
        }
      }
    }

    const duration = performance.now() - startTime;
    return { 
      name: test.name, 
      passed: false, 
      duration, 
      error: lastError, 
      retries 
    };
  }

  async runSuite(suite: TestSuite): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    if (this.config.verbose) {
      console.log(`\n🧪 Running test suite: ${suite.name}`);
    }

    try {
      if (suite.beforeAll) {
        await suite.beforeAll();
      }

      const testsToRun = suite.tests.filter(test => !test.skip);
      
      if (this.config.parallel) {
        const testPromises = testsToRun.map(test => 
          this.runTest(test, { beforeEach: suite.beforeEach, afterEach: suite.afterEach })
        );
        const testResults = await Promise.all(testPromises);
        results.push(...testResults);
      } else {
        for (const test of testsToRun) {
          const result = await this.runTest(test, { 
            beforeEach: suite.beforeEach, 
            afterEach: suite.afterEach 
          });
          results.push(result);
        }
      }

      if (suite.afterAll) {
        await suite.afterAll();
      }
    } catch (error) {
      console.error(`Test suite "${suite.name}" failed:`, error);
    }

    this.results.push(...results);
    return results;
  }

  async runSuites(suites: TestSuite[]): Promise<TestResult[]> {
    const allResults: TestResult[] = [];
    
    for (const suite of suites) {
      const results = await this.runSuite(suite);
      allResults.push(...results);
    }
    
    return allResults;
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  getSummary(): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    totalDuration: number;
    averageDuration: number;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const skipped = this.results.filter(r => r.skip).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = total > 0 ? totalDuration / total : 0;

    return {
      total,
      passed,
      failed,
      skipped,
      totalDuration,
      averageDuration
    };
  }

  printSummary(): void {
    const summary = this.getSummary();
    
    console.log('\n📊 Test Summary:');
    console.log(`Total: ${summary.total}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ❌`);
    console.log(`Skipped: ${summary.skipped} ⏭️`);
    console.log(`Total Duration: ${summary.totalDuration.toFixed(2)}ms`);
    console.log(`Average Duration: ${summary.averageDuration.toFixed(2)}ms`);
    
    if (summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error?.message || 'Unknown error'}`);
        });
    }
  }

  clearResults(): void {
    this.results = [];
  }
}

// Утилиты для создания тестов
export const describe = (name: string, fn: () => void): TestSuite => {
  const tests: Test[] = [];
  const suite: TestSuite = { name, tests };
  
  const test = (testName: string, testFn: () => void | Promise<void>, options?: Partial<Test>): void => {
    tests.push({
      name: testName,
      fn: testFn,
      ...options
    });
  };
  
  test.skip = (testName: string, testFn: () => void | Promise<void>, options?: Partial<Test>): void => {
    tests.push({
      name: testName,
      fn: testFn,
      skip: true,
      ...options
    });
  };
  
  test.only = (testName: string, testFn: () => void | Promise<void>, options?: Partial<Test>): void => {
    tests.push({
      name: testName,
      fn: testFn,
      only: true,
      ...options
    });
  };
  
  suite.test = test;
  
  fn();
  
  return suite;
};

export const it = describe;

// Утилиты для утверждений
export const expect = (actual: any) => {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    
    toEqual: (expected: any) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
    },
    
    toContain: (expected: any) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`);
      }
    },
    
    toHaveLength: (expected: number) => {
      if (actual.length !== expected) {
        throw new Error(`Expected ${actual} to have length ${expected}, but got ${actual.length}`);
      }
    },
    
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error(`Expected ${actual} to be defined`);
      }
    },
    
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(`Expected ${actual} to be null`);
      }
    },
    
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    
    toBeFalsy: () => {
      if (actual) {
        throw new Error(`Expected ${actual} to be falsy`);
      }
    },
    
    toThrow: (expectedError?: string | RegExp) => {
      try {
        if (typeof actual === 'function') {
          actual();
        }
        throw new Error('Expected function to throw an error');
      } catch (error) {
        if (expectedError) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (typeof expectedError === 'string') {
            if (errorMessage !== expectedError) {
              throw new Error(`Expected error message "${errorMessage}" to be "${expectedError}"`);
            }
          } else {
            if (!expectedError.test(errorMessage)) {
              throw new Error(`Expected error message "${errorMessage}" to match ${expectedError}`);
            }
          }
        }
      }
    }
  };
};

// Утилиты для моков
export const mock = <T>(obj: T): T => {
  return obj;
};

export const spyOn = <T extends object, K extends keyof T>(
  obj: T,
  method: K
): any => {
  const original = obj[method];
  const spy = ((...args: any[]) => (original as any)(...args)) as any;
  spy.mockImplementation = (fn: any) => { obj[method] = fn as T[K]; return spy; };
  obj[method] = spy as T[K];
  return spy;
};

// Утилиты для асинхронного тестирования
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const waitForElement = (selector: string, timeout: number = 5000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        return;
      }
      
      requestAnimationFrame(check);
    };
    
    check();
  });
};

export const waitForCondition = (
  condition: () => boolean,
  timeout: number = 5000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
        return;
      }
      
      requestAnimationFrame(check);
    };
    
    check();
  });
};

