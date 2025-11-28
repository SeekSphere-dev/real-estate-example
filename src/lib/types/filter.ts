export interface PropertyFilters {
  searchText?: string
  listingTypes?: string[]
  propertyTypes?: string[]
  priceRange?: [number, number]
  bedrooms?: string | number
  bathrooms?: string | number
  sqftRange?: [number, number]
  status?: string[]
  cityId?: number
  provinceId?: number
  page?: number
  limit?: number
}

export interface FilterResponse {
  data: Property[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: PropertyFilters
}

// Property interface to match the API response
export interface Property {
  id: string
  mlsNumber: string | null
  title: string
  streetAddress: string
  unitNumber: string | null
  postalCode: string | null
  latitude: string | null
  longitude: string | null
  bedrooms: number | null
  bathrooms: string | null
  totalAreaSqft: number | null
  listPrice: string | null
  monthlyRent: string | null
  listedDate: Date | null
  propertyType: {
    id: number
    name: string
    category: string | null
  } | null
  listingType: {
    id: number
    name: string
  } | null
  status: {
    id: number
    name: string
    isAvailable: boolean
  } | null
  city: {
    id: number
    name: string
  } | null
  province: {
    id: number
    name: string
    code: string
  } | null
  neighborhood: {
    id: number
    name: string
  } | null
  agent: {
    id: number
    firstName: string
    lastName: string
    phone: string | null
    email: string | null
  } | null
  image: {
    id: number
    imageUrl: string
    caption: string | null
  } | null
}