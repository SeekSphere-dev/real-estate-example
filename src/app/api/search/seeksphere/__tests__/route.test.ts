import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock the seeksphere module
vi.mock('@/lib/seeksphere', () => ({
  searchWithSeeksphere: vi.fn(),
  isSeeksphereAvailable: vi.fn(),
}));

describe('/api/search/seeksphere', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should handle valid seeksphere search request', async () => {
      const { searchWithSeeksphere, isSeeksphereAvailable } = await import('@/lib/seeksphere');

      (isSeeksphereAvailable as any).mockReturnValue(true);
      (searchWithSeeksphere as any).mockResolvedValue({
        properties: [{ id: '1', title: 'Test Property' }],
        total: 1,
        page: 1,
        limit: 20,
        filters: { query: 'house' },
        search_time_ms: 150
      });

      const requestBody = {
        query: 'find me a house',
        page: 1,
        limit: 20
      };

      const request = new NextRequest('http://localhost/api/search/seeksphere', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.properties).toHaveLength(1);
      expect(searchWithSeeksphere).toHaveBeenCalledWith('find me a house', 1, 20);
    });

    it('should return 400 for empty query', async () => {
      const requestBody = {
        query: '',
        page: 1,
        limit: 20
      };

      const request = new NextRequest('http://localhost/api/search/seeksphere', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid query');
    });

    it('should return 400 for missing query', async () => {
      const requestBody = {
        page: 1,
        limit: 20
      };

      const request = new NextRequest('http://localhost/api/search/seeksphere', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid query');
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const requestBody = {
        query: 'house',
        page: 0,
        limit: 200
      };

      const request = new NextRequest('http://localhost/api/search/seeksphere', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid pagination parameters');
    });

    it('should handle seeksphere search errors gracefully', async () => {
      const { searchWithSeeksphere } = await import('@/lib/seeksphere');

      (searchWithSeeksphere as any).mockRejectedValue(new Error('Seeksphere API error'));

      const requestBody = {
        query: 'house',
        page: 1,
        limit: 20
      };

      const request = new NextRequest('http://localhost/api/search/seeksphere', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Search failed');
      expect(data.message).toBe('Seeksphere API error');
    });

    it('should trim whitespace from query', async () => {
      const { searchWithSeeksphere } = await import('@/lib/seeksphere');

      (searchWithSeeksphere as any).mockResolvedValue({
        properties: [],
        total: 0,
        page: 1,
        limit: 20
      });

      const requestBody = {
        query: '  house with garage  ',
        page: 1,
        limit: 20
      };

      const request = new NextRequest('http://localhost/api/search/seeksphere', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      await POST(request);

      expect(searchWithSeeksphere).toHaveBeenCalledWith('house with garage', 1, 20);
    });
  });

  describe('GET', () => {
    it('should handle valid GET request', async () => {
      const { searchWithSeeksphere } = await import('@/lib/seeksphere');

      (searchWithSeeksphere as any).mockResolvedValue({
        properties: [],
        total: 0,
        page: 1,
        limit: 20
      });

      const request = new NextRequest('http://localhost/api/search/seeksphere?q=house&page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(searchWithSeeksphere).toHaveBeenCalledWith('house', 1, 20);
    });

    it('should return 400 for missing query parameter', async () => {
      const request = new NextRequest('http://localhost/api/search/seeksphere?page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid query');
    });

    it('should return 400 for empty query parameter', async () => {
      const request = new NextRequest('http://localhost/api/search/seeksphere?q=&page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid query');
    });

    it('should return 400 for invalid pagination in GET', async () => {
      const request = new NextRequest('http://localhost/api/search/seeksphere?q=house&page=invalid&limit=abc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid pagination parameters');
    });

    it('should use default pagination values', async () => {
      const { searchWithSeeksphere } = await import('@/lib/seeksphere');

      (searchWithSeeksphere as any).mockResolvedValue({
        properties: [],
        total: 0,
        page: 1,
        limit: 20
      });

      const request = new NextRequest('http://localhost/api/search/seeksphere?q=house');
      await GET(request);

      expect(searchWithSeeksphere).toHaveBeenCalledWith('house', 1, 20);
    });

    it('should trim whitespace from query parameter', async () => {
      const { searchWithSeeksphere } = await import('@/lib/seeksphere');

      (searchWithSeeksphere as any).mockResolvedValue({
        properties: [],
        total: 0,
        page: 1,
        limit: 20
      });

      const request = new NextRequest('http://localhost/api/search/seeksphere?q=%20%20house%20%20');
      await GET(request);

      expect(searchWithSeeksphere).toHaveBeenCalledWith('house', 1, 20);
    });
  });
});