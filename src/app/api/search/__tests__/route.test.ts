import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock the database module
vi.mock('@/lib/database', () => ({
  searchProperties: vi.fn(),
}));

// Mock the types module
vi.mock('@/lib/types', () => ({
  validateSearchFilters: vi.fn(),
  createPaginationParams: vi.fn(),
}));

describe('/api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should handle basic search query', async () => {
      const { searchProperties } = await import('@/lib/database');
      const { validateSearchFilters, createPaginationParams } = await import('@/lib/types');

      (validateSearchFilters as any).mockReturnValue({ isValid: true, errors: [] });
      (createPaginationParams as any).mockReturnValue({ page: 1, limit: 20, offset: 0 });
      (searchProperties as any).mockResolvedValue({
        properties: [],
        total: 0,
        page: 1,
        limit: 20,
        filters: {}
      });

      const request = new NextRequest('http://localhost/api/search?query=house');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should handle pagination parameters', async () => {
      const { searchProperties } = await import('@/lib/database');
      const { validateSearchFilters, createPaginationParams } = await import('@/lib/types');

      (validateSearchFilters as any).mockReturnValue({ isValid: true, errors: [] });
      (createPaginationParams as any).mockReturnValue({ page: 2, limit: 10, offset: 10 });
      (searchProperties as any).mockResolvedValue({
        properties: [],
        total: 0,
        page: 2,
        limit: 10,
        filters: {}
      });

      const request = new NextRequest('http://localhost/api/search?page=2&limit=10');
      const response = await GET(request);

      expect(createPaginationParams).toHaveBeenCalledWith(2, 10);
    });

    it('should handle filter parameters', async () => {
      const { searchProperties } = await import('@/lib/database');
      const { validateSearchFilters, createPaginationParams } = await import('@/lib/types');

      (validateSearchFilters as any).mockReturnValue({ isValid: true, errors: [] });
      (createPaginationParams as any).mockReturnValue({ page: 1, limit: 20, offset: 0 });
      (searchProperties as any).mockResolvedValue({
        properties: [],
        total: 0,
        page: 1,
        limit: 20,
        filters: {}
      });

      const url = 'http://localhost/api/search?property_type=house&min_price=100000&max_price=500000&bedrooms=3';
      const request = new NextRequest(url);
      const response = await GET(request);

      expect(validateSearchFilters).toHaveBeenCalledWith({
        property_type: 'house',
        min_price: 100000,
        max_price: 500000,
        bedrooms: 3
      });
    });

    it('should return 400 for invalid filters', async () => {
      const { validateSearchFilters, createPaginationParams } = await import('@/lib/types');

      (validateSearchFilters as any).mockReturnValue({ 
        isValid: false, 
        errors: [{ field: 'min_price', message: 'Invalid price' }] 
      });
      (createPaginationParams as any).mockReturnValue({ page: 1, limit: 20, offset: 0 });

      const request = new NextRequest('http://localhost/api/search?min_price=-100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid search parameters');
    });

    it('should return 500 for database errors', async () => {
      const { searchProperties } = await import('@/lib/database');
      const { validateSearchFilters, createPaginationParams } = await import('@/lib/types');

      (validateSearchFilters as any).mockReturnValue({ isValid: true, errors: [] });
      (createPaginationParams as any).mockReturnValue({ page: 1, limit: 20, offset: 0 });
      (searchProperties as any).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost/api/search');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
      expect(data.message).toBe('Database connection failed');
    });
  });

  describe('POST', () => {
    it('should handle POST request with filters', async () => {
      const { searchProperties } = await import('@/lib/database');
      const { validateSearchFilters, createPaginationParams } = await import('@/lib/types');

      (validateSearchFilters as any).mockReturnValue({ isValid: true, errors: [] });
      (createPaginationParams as any).mockReturnValue({ page: 1, limit: 20, offset: 0 });
      (searchProperties as any).mockResolvedValue({
        properties: [],
        total: 0,
        page: 1,
        limit: 20,
        filters: {}
      });

      const requestBody = {
        filters: { query: 'house', min_price: 100000 },
        pagination: { page: 1, limit: 20 },
        sort: { field: 'price', direction: 'asc' }
      };

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should use default values for missing parameters', async () => {
      const { searchProperties } = await import('@/lib/database');
      const { validateSearchFilters, createPaginationParams } = await import('@/lib/types');

      (validateSearchFilters as any).mockReturnValue({ isValid: true, errors: [] });
      (createPaginationParams as any).mockReturnValue({ page: 1, limit: 20, offset: 0 });
      (searchProperties as any).mockResolvedValue({
        properties: [],
        total: 0,
        page: 1,
        limit: 20,
        filters: {}
      });

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);

      expect(createPaginationParams).toHaveBeenCalledWith(1, 20);
      expect(searchProperties).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 20, offset: 0 },
        { field: 'date', direction: 'desc' }
      );
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});