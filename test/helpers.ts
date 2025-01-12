import { vi } from 'vitest';
import { config } from '../src/config/config.js';

export function mockConsole() {
  const logs: string[] = [];
  const errors: string[] = [];

  const consoleMock = {
    log: vi.fn((...args) => logs.push(args.join(' '))),
    error: vi.fn((...args) => errors.push(args.join(' '))),
    clear: () => {
      logs.length = 0;
      errors.length = 0;
    },
    getLogs: () => logs,
    getErrors: () => errors
  };

  vi.spyOn(console, 'log').mockImplementation(consoleMock.log);
  vi.spyOn(console, 'error').mockImplementation(consoleMock.error);

  return consoleMock;
}

export function mockConfig() {
  const originalConfig = { ...config };
  
  beforeEach(() => {
    Object.assign(config, originalConfig);
  });
  
  afterEach(() => {
    Object.assign(config, originalConfig);
  });
  
  return config;
}

export function mockAxios() {
  vi.mock('axios', () => ({
    default: {
      post: vi.fn()
    }
  }));
  
  return (await import('axios')).default;
}
