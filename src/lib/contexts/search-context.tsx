"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { PropertyFilters } from '@/lib/types/filter'

interface SearchContextType {
  filters: PropertyFilters
  updateFilters: (newFilters: Partial<PropertyFilters>) => void
  resetFilters: () => void
  executeSearch: () => Promise<void>
  isLoading: boolean
  properties: any[]
  totalCount: number
  pagination: {
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const defaultFilters: PropertyFilters = {
  searchText: '',
  listingTypes: [],
  propertyTypes: [],
  priceRange: [0, 3000000],
  bedrooms: 'Any',
  bathrooms: 'Any',
  sqftRange: [0, 10000],
  status: [],
  cityId: undefined,
  provinceId: undefined,
  page: 1,
  limit: 20
}

interface SearchProviderProps {
  children: ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters)
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })

  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except when explicitly setting page)
      page: newFilters.page !== undefined ? newFilters.page : 1
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    setProperties([])
    setTotalCount(0)
    setPagination({
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    })
  }, [])

  const executeSearch = useCallback(async (searchFilters?: PropertyFilters) => {
    setIsLoading(true)
    const filtersToUse = searchFilters || filters
    
    try {
      const response = await fetch('/api/properties/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filtersToUse),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }

      const data = await response.json()
      setProperties(data.data)
      setTotalCount(data.pagination.totalCount)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Search error:', error)
      setProperties([])
      setTotalCount(0)
      setPagination({
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const value: SearchContextType = {
    filters,
    updateFilters,
    resetFilters,
    executeSearch,
    isLoading,
    properties,
    totalCount,
    pagination
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}