import { test, expect } from '@playwright/test';

export { expect };
export const describe = test.describe;
export const afterEach = test.afterEach;
export const beforeEach = test.beforeEach;

// A small test-registration adapter; all tests run under Playwright's real
// runner, never through a home-made assertion or test-execution engine.
type TestBody = () => unknown | Promise<unknown>;
function each<T extends unknown[] = any[]>(rows: readonly unknown[]) {
  return (pattern: string, body: (...args: T) => unknown): void => {
    rows.forEach((row, index) => {
      const args = (Array.isArray(row) ? row : [row]) as T;
      let cursor = 0;
      const title = pattern.replace(/%[sdj]/g, (format) => {
        const value = args[cursor++];
        return format === '%j' ? JSON.stringify(value) ?? 'undefined' : String(value);
      });
      test(`${title} [${index + 1}]`, async () => { await body(...args); });
    });
  };
}
export const it = Object.assign(
  (name: string, body: TestBody): void => { test(name, async () => { await body(); }); },
  { each },
);

interface MockedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  mock: { calls: Parameters<T>[] };
  mockImplementation(implementation: T): MockedFunction<T>;
  mockRestore(): void;
}
function makeMock<T extends (...args: any[]) => any>(implementation: T): MockedFunction<T> {
  const calls: Parameters<T>[] = [];
  let current = implementation;
  const wrapper = ((...args: Parameters<T>) => {
    calls.push(args);
    return current(...args);
  }) as MockedFunction<T>;
  wrapper.mock = { calls };
  wrapper.mockImplementation = (next: T) => { current = next; return wrapper; };
  wrapper.mockRestore = () => {};
  return wrapper;
}
const restore = new Set<() => void>();
export const vi = {
  fn<T extends (...args: any[]) => any>(implementation: T): MockedFunction<T> {
    return makeMock(implementation);
  },
  spyOn<T extends object, K extends keyof T>(object: T, key: K) {
    const original = object[key];
    if (typeof original !== 'function') throw new TypeError('Cannot spy on non-function');
    const originalFunction = original as (...args: any[]) => any;
    const spy = makeMock((...args: any[]) => originalFunction.apply(object, args));
    const ownDescriptor = Object.getOwnPropertyDescriptor(object, key);
    Object.defineProperty(object, key, { configurable: true, writable: true, value: spy });
    const restoreSpy = () => {
      if (ownDescriptor) Object.defineProperty(object, key, ownDescriptor);
      else Reflect.deleteProperty(object, key);
      restore.delete(restoreSpy);
    };
    spy.mockRestore = restoreSpy;
    restore.add(restoreSpy);
    return spy;
  },
};
test.afterEach(() => {
  for (const undo of [...restore]) undo();
});
