import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.SEEKSPHERE_API_KEY = 'test_api_key';

// Global test utilities
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};