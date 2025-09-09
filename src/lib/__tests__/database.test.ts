import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Pool } from 'pg';
import { 
  testConnection, 
  checkTables, 
  getClient, 
  query, 
  transaction,
  getPropertyById,
  searchProperties,
  getPropertyTypes,
  getListingTypes,
  getProvinces
} from '../database';

// Mock pg module
vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    query: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
  })),
}));

describe('Database Module', () => {
  let mockPool: any;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };

    mockPool = {
      connect: vi.fn().mockResolvedValue(mockClient),
      query: vi.fn(),
      end: vi.fn(),
      on: vi.fn(),
    };

    (Pool as any).mockImplementation(() => mockPool);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ current_time: new Date() }]
      });

      const result = await testConnection();
      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT NOW() as current_time');
    });

    it('should return false when connection fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Connection failed'));

      const result = await testConnection();
      expect(result).toBe(false);
    });

    it('should release client even when query fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      await testConnection();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('checkTables', () => {
    it('should return true when all required tables exist', async () => {
      const requiredTables = [
        'provinces', 'cities', 'neighborhoods', 'property_types', 
        'listing_types', 'property_status', 'agents', 'properties',
        'property_features', 'property_feature_mappings', 'property_images',
        'property_history'
      ];

      mockClient.query.mockResolvedValue({
        rows: requiredTables.map(name => ({ table_name: name }))
      });

      const result = await checkTables();
      expect(result).toBe(true);
    });

    it('should return false when tables are missing', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ table_name: 'provinces' }] // Only one table exists
      });

      const result = await checkTables();
      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      mockClient.query.mockRejectedValue(new Error('Database error'));

      const result = await checkTables();
      expect(result).toBe(false);
    });
  });

  describe('getClient', () => {
    it('should return a client from the pool', async () => {
      const client = await getClient();
      expect(client).toBe(mockClient);
      expect(mockPool.connect).toHaveBeenCalled();
    });

    it('should throw descriptive error when connection fails', async () => {
      mockPool.connect.mockRejectedValue(new Error('Pool exhausted'));

      await expect(getClient()).rejects.toThrow('Database connection failed: Pool exhausted');
    });
  });

  describe('query', () => {
    it('should execute query and return results', async () => {
      const mockResult = { rows: [{ id: 1, name: 'test' }] };
      mockClient.query.mockResolvedValue(mockResult);

      const result = await query('SELECT * FROM test', []);
      expect(result).toBe(mockResult);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM test', []);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw descriptive error when query fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Syntax error'));

      await expect(query('INVALID SQL')).rejects.toThrow('Query execution failed: Syntax error');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('transaction', () => {
    it('should execute multiple queries in transaction', async () => {
      const queries = [
        { text: 'INSERT INTO test (name) VALUES ($1)', params: ['test1'] },
        { text: 'INSERT INTO test (name) VALUES ($1)', params: ['test2'] }
      ];

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // First query
        .mockResolvedValueOnce({ rows: [] }) // Second query
        .mockResolvedValueOnce(undefined); // COMMIT

      const results = await transaction(queries);
      expect(results).toHaveLength(2);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback on error', async () => {
      const queries = [
        { text: 'INSERT INTO test (name) VALUES ($1)', params: ['test1'] }
      ];

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(new Error('Constraint violation')); // Query fails

      await expect(transaction(queries)).rejects.toThrow();
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getPropertyById', () => {
    it('should return null when property not found', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await getPropertyById('nonexistent');
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Database error'));

      await expect(getPropertyById('test-id')).rejects.toThrow('Failed to fetch property with ID test-id');
    });
  });

  describe('searchProperties', () => {
    it('should handle empty search filters', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] }) // Count query
        .mockResolvedValueOnce({ rows: [] }) // Search query
        .mockResolvedValueOnce({ rows: [] }); // Images query

      const result = await searchProperties({}, { page: 1, limit: 20, offset: 0 });
      expect(result.properties).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should throw error when search fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Search failed'));

      await expect(searchProperties({})).rejects.toThrow('Failed to search properties');
    });
  });

  describe('getPropertyTypes', () => {
    it('should return property types', async () => {
      const mockTypes = [
        { id: 1, name: 'House' },
        { id: 2, name: 'Condo' }
      ];
      mockClient.query.mockResolvedValue({ rows: mockTypes });

      const result = await getPropertyTypes();
      expect(result).toEqual(mockTypes);
    });

    it('should throw error when query fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Database error'));

      await expect(getPropertyTypes()).rejects.toThrow('Failed to fetch property types');
    });
  });

  describe('getListingTypes', () => {
    it('should return listing types', async () => {
      const mockTypes = [
        { id: 1, name: 'For Sale' },
        { id: 2, name: 'For Rent' }
      ];
      mockClient.query.mockResolvedValue({ rows: mockTypes });

      const result = await getListingTypes();
      expect(result).toEqual(mockTypes);
    });

    it('should throw error when query fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Database error'));

      await expect(getListingTypes()).rejects.toThrow('Failed to fetch listing types');
    });
  });

  describe('getProvinces', () => {
    it('should return provinces', async () => {
      const mockProvinces = [
        { id: 1, code: 'ON', name: 'Ontario' },
        { id: 2, code: 'BC', name: 'British Columbia' }
      ];
      mockClient.query.mockResolvedValue({ rows: mockProvinces });

      const result = await getProvinces();
      expect(result).toEqual(mockProvinces);
    });

    it('should throw error when query fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Database error'));

      await expect(getProvinces()).rejects.toThrow('Failed to fetch provinces');
    });
  });
});