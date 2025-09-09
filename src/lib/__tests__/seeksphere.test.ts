import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  searchWithSeeksphere,
  getSearchSuggestions,
  isSeeksphereAvailable
} from '../seeksphere';

// Mock the seeksphere SDK
const mockSeekSphereClient = {
  search: vi.fn(),
  getSuggestions: vi.fn(),
};

vi.mock('seeksphere-sdk', () => ({
  SeekSphereClient: vi.fn().mockImplementation(() => mockSeekSphereClient),
}));

// Mock database functions
vi.mock('../database', () => ({
  query: vi.fn(),
  getPropertyById: vi.fn(),
  searchProperties: vi.fn(),
  createPaginationParams: vi.fn().mockReturnValue({ page: 1, limit: 20, offset: 0 }),
}));

describe('Seeksphere Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.SEEKSPHERE_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isSeeksphereAvailable', () => {
    it('should return true when SDK and API key are available', () => {
      process.env.SEEKSPHERE_API_KEY = 'test-key';
      expect(isSeeksphereAvailable()).toBe(true);
    });

    it('should return false when API key is missing', () => {
      delete process.env.SEEKSPHERE_API_KEY;
      expect(isSeeksphereAvailable()).toBe(false);
    });
  });

  describe('searchWithSeeksphere', () => {
    it('should return search results when seeksphere succeeds', async () => {
      const mockSearchResult = {
        success: true,
        sql_query: 'SELECT * FROM properties WHERE title ILIKE \'%house%\'',
      };

      const mockProperties = [
        { id: '1', title: 'Test House', price: 500000 }
      ];

      mockSeekSphereClient.search.mockResolvedValue(mockSearchResult);

      // Mock database query execution
      const { query, getPropertyById } = await import('../database');
      (query as any).mockResolvedValue({ rows: [{ id: '1' }] });
      (getPropertyById as any).mockResolvedValue(mockProperties[0]);

      const result = await searchWithSeeksphere('find me a house', 1, 20);

      expect(result.properties).toEqual(mockProperties);
      expect(result.total).toBe(1);
      expect(result.sql_query).toBe(mockSearchResult.sql_query);
      expect(result.fallback_used).toBeUndefined();
    });

    it('should fall back to traditional search when seeksphere fails', async () => {
      mockSeekSphereClient.search.mockRejectedValue(new Error('Seeksphere API error'));

      const mockSearchResult = {
        properties: [{ id: '1', title: 'Fallback Property' }],
        total: 1,
        page: 1,
        limit: 20,
        filters: { query: 'house' }
      };

      const { searchProperties } = await import('../database');
      (searchProperties as any).mockResolvedValue(mockSearchResult);

      const result = await searchWithSeeksphere('house', 1, 20);

      expect(result.properties).toEqual(mockSearchResult.properties);
      expect(result.fallback_used).toBe(true);
      expect(result.error).toBe('Seeksphere API error');
    });

    it('should handle seeksphere unavailable gracefully', async () => {
      delete process.env.SEEKSPHERE_API_KEY;

      const mockSearchResult = {
        properties: [{ id: '1', title: 'Fallback Property' }],
        total: 1,
        page: 1,
        limit: 20,
        filters: { query: 'house' }
      };

      const { searchProperties } = await import('../database');
      (searchProperties as any).mockResolvedValue(mockSearchResult);

      const result = await searchWithSeeksphere('house', 1, 20);

      expect(result.fallback_used).toBe(true);
      expect(result.error).toBe('Seeksphere service is not available');
    });

    it('should return empty results when both seeksphere and fallback fail', async () => {
      mockSeekSphereClient.search.mockRejectedValue(new Error('Seeksphere error'));

      const { searchProperties } = await import('../database');
      (searchProperties as any).mockRejectedValue(new Error('Database error'));

      const result = await searchWithSeeksphere('house', 1, 20);

      expect(result.properties).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.fallback_used).toBe(true);
    });

    it('should handle unsuccessful seeksphere response', async () => {
      const mockSearchResult = {
        success: false,
        error: 'Invalid query format',
      };

      mockSeekSphereClient.search.mockResolvedValue(mockSearchResult);

      const { query } = await import('../database');
      (query as any).mockResolvedValue({ rows: [] });

      const result = await searchWithSeeksphere('invalid query', 1, 20);

      expect(result.properties).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return suggestions from seeksphere', async () => {
      const mockSuggestions = {
        suggestions: ['modern house with garage', 'family home near schools']
      };

      mockSeekSphereClient.getSuggestions.mockResolvedValue(mockSuggestions);

      const result = await getSearchSuggestions('house');

      expect(result).toEqual(mockSuggestions.suggestions);
      expect(mockSeekSphereClient.getSuggestions).toHaveBeenCalledWith({
        query: 'house',
        limit: 5
      });
    });

    it('should return empty array for empty query', async () => {
      const result = await getSearchSuggestions('');
      expect(result).toEqual([]);
    });

    it('should return fallback suggestions when seeksphere fails', async () => {
      mockSeekSphereClient.getSuggestions.mockRejectedValue(new Error('API error'));

      const result = await getSearchSuggestions('house');

      expect(result).toEqual([
        'Modern house with garage',
        'Family home near schools'
      ]);
    });

    it('should generate appropriate fallback suggestions for different queries', async () => {
      mockSeekSphereClient.getSuggestions.mockRejectedValue(new Error('API error'));

      const condoResult = await getSearchSuggestions('condo');
      expect(condoResult).toContain('Downtown condo with parking');

      const downtownResult = await getSearchSuggestions('downtown');
      expect(downtownResult).toContain('Downtown properties with transit access');

      const parkingResult = await getSearchSuggestions('parking');
      expect(parkingResult).toContain('Properties with parking included');
    });
  });
});