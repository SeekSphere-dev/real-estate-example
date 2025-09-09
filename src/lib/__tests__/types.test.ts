import { describe, it, expect } from 'vitest';
import { 
  validateSearchFilters, 
  validatePagination, 
  createPaginationParams 
} from '../types';

describe('Types Module', () => {
  describe('validateSearchFilters', () => {
    it('should validate valid search filters', () => {
      const filters = {
        query: 'house',
        min_price: 100000,
        max_price: 500000,
        bedrooms: 3,
        bathrooms: 2
      };

      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative prices', () => {
      const filters = {
        min_price: -100,
        max_price: -50
      };

      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe('min_price');
      expect(result.errors[1].field).toBe('max_price');
    });

    it('should reject invalid price range', () => {
      const filters = {
        min_price: 500000,
        max_price: 100000
      };

      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('price_range');
    });

    it('should reject invalid bedroom count', () => {
      const filters = {
        bedrooms: -1
      };

      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('bedrooms');
    });

    it('should reject invalid bathroom count', () => {
      const filters = {
        bathrooms: 25
      };

      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('bathrooms');
    });

    it('should reject invalid square footage range', () => {
      const filters = {
        min_sqft: 2000,
        max_sqft: 1000
      };

      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('sqft_range');
    });

    it('should reject invalid parking spaces', () => {
      const filters = {
        parking_spaces: -1
      };

      const result = validateSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('parking_spaces');
    });
  });

  describe('validatePagination', () => {
    it('should validate valid pagination', () => {
      const pagination = {
        page: 1,
        limit: 20,
        offset: 0
      };

      const result = validatePagination(pagination);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid page number', () => {
      const pagination = {
        page: 0,
        limit: 20,
        offset: 0
      };

      const result = validatePagination(pagination);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('page');
    });

    it('should reject invalid limit', () => {
      const pagination = {
        page: 1,
        limit: 0,
        offset: 0
      };

      const result = validatePagination(pagination);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('limit');
    });

    it('should reject limit too high', () => {
      const pagination = {
        page: 1,
        limit: 200,
        offset: 0
      };

      const result = validatePagination(pagination);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('limit');
    });

    it('should reject negative offset', () => {
      const pagination = {
        page: 1,
        limit: 20,
        offset: -10
      };

      const result = validatePagination(pagination);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('offset');
    });
  });

  describe('createPaginationParams', () => {
    it('should create valid pagination params', () => {
      const result = createPaginationParams(2, 10);
      
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(10);
    });

    it('should handle invalid page numbers', () => {
      const result = createPaginationParams(0, 20);
      
      expect(result.page).toBe(1);
      expect(result.offset).toBe(0);
    });

    it('should handle invalid limits', () => {
      const result = createPaginationParams(1, 0);
      
      expect(result.limit).toBe(1);
    });

    it('should cap limit at maximum', () => {
      const result = createPaginationParams(1, 200);
      
      expect(result.limit).toBe(100);
    });

    it('should use defaults when no parameters provided', () => {
      const result = createPaginationParams();
      
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });
  });
});