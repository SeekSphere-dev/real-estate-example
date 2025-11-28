import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  properties, 
  propertyTypes, 
  listingTypes, 
  propertyStatus, 
  cities, 
  provinces, 
  neighborhoods, 
  agents,
  propertyImages 
} from '@/lib/db/schema'
import { eq, and, gte, lte, count, desc, ilike, or, inArray } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      searchText = '',
      listingTypes: filterListingTypes = [],
      propertyTypes: filterPropertyTypes = [],
      priceRange = [0, 10000000],
      bedrooms,
      bathrooms,
      sqftRange = [0, 50000],
      status: filterStatus = [],
      cityId,
      provinceId,
      page = 1,
      limit = 10
    } = body

    const skip = (page - 1) * Math.min(limit, 50)
    const take = Math.min(limit, 50)

    // Build where conditions
    const conditions = []

    // Search text - search only in property title
    if (searchText) {
      conditions.push(ilike(properties.title, `%${searchText}%`))
    }

    // Price range
    if (priceRange[0] > 0) {
      conditions.push(gte(properties.listPrice, priceRange[0].toString()))
    }
    if (priceRange[1] < 10000000) {
      conditions.push(lte(properties.listPrice, priceRange[1].toString()))
    }

    // Square footage range
    if (sqftRange[0] > 0) {
      conditions.push(gte(properties.totalAreaSqft, sqftRange[0]))
    }
    if (sqftRange[1] < 50000) {
      conditions.push(lte(properties.totalAreaSqft, sqftRange[1]))
    }

    // Bedrooms (if provided and not "Any")
    if (bedrooms && bedrooms !== 'Any' && bedrooms !== 'any') {
      const bedroomCount = typeof bedrooms === 'string' 
        ? parseInt(bedrooms.replace('+', ''))
        : bedrooms
      
      if (!isNaN(bedroomCount)) {
        if (typeof bedrooms === 'string' && bedrooms.includes('+')) {
          conditions.push(gte(properties.bedrooms, bedroomCount))
        } else {
          conditions.push(eq(properties.bedrooms, bedroomCount))
        }
      }
    }

    // Bathrooms (if provided and not "Any")
    if (bathrooms && bathrooms !== 'Any' && bathrooms !== 'any') {
      const bathroomCount = typeof bathrooms === 'string' 
        ? parseFloat(bathrooms.replace('+', ''))
        : bathrooms
      
      if (!isNaN(bathroomCount)) {
        if (typeof bathrooms === 'string' && bathrooms.includes('+')) {
          conditions.push(gte(properties.bathrooms, bathroomCount.toString()))
        } else {
          conditions.push(eq(properties.bathrooms, bathroomCount.toString()))
        }
      }
    }

    // City filter
    if (cityId) {
      conditions.push(eq(properties.cityId, cityId))
    }

    // Province filter
    if (provinceId) {
      conditions.push(eq(properties.provinceId, provinceId))
    }

    // Property types filter
    if (filterPropertyTypes && filterPropertyTypes.length > 0) {
      // Get property type IDs by name
      const propertyTypeRecords = await db
        .select({ id: propertyTypes.id })
        .from(propertyTypes)
        .where(inArray(propertyTypes.name, filterPropertyTypes))
      
      if (propertyTypeRecords.length > 0) {
        const typeIds = propertyTypeRecords.map(pt => pt.id)
        conditions.push(inArray(properties.propertyTypeId, typeIds))
      }
    }

    // Listing types filter
    if (filterListingTypes && filterListingTypes.length > 0) {
      // Get listing type IDs by name
      const listingTypeRecords = await db
        .select({ id: listingTypes.id })
        .from(listingTypes)
        .where(inArray(listingTypes.name, filterListingTypes))
      
      if (listingTypeRecords.length > 0) {
        const typeIds = listingTypeRecords.map(lt => lt.id)
        conditions.push(inArray(properties.listingTypeId, typeIds))
      }
    }

    // Status filter
    if (filterStatus && filterStatus.length > 0) {
      // Get status IDs by name
      const statusRecords = await db
        .select({ id: propertyStatus.id })
        .from(propertyStatus)
        .where(inArray(propertyStatus.name, filterStatus))
      
      if (statusRecords.length > 0) {
        const statusIds = statusRecords.map(s => s.id)
        conditions.push(inArray(properties.statusId, statusIds))
      }
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    const [propertiesResult, totalCountResult] = await Promise.all([
      db.select({
        id: properties.id,
        mlsNumber: properties.mlsNumber,
        title: properties.title,
        streetAddress: properties.streetAddress,
        unitNumber: properties.unitNumber,
        postalCode: properties.postalCode,
        latitude: properties.latitude,
        longitude: properties.longitude,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        totalAreaSqft: properties.totalAreaSqft,
        listPrice: properties.listPrice,
        monthlyRent: properties.monthlyRent,
        listedDate: properties.listedDate,
        propertyType: {
          id: propertyTypes.id,
          name: propertyTypes.name,
          category: propertyTypes.category,
        },
        listingType: {
          id: listingTypes.id,
          name: listingTypes.name,
        },
        status: {
          id: propertyStatus.id,
          name: propertyStatus.name,
          isAvailable: propertyStatus.isAvailable,
        },
        city: {
          id: cities.id,
          name: cities.name,
        },
        province: {
          id: provinces.id,
          name: provinces.name,
          code: provinces.code,
        },
        neighborhood: {
          id: neighborhoods.id,
          name: neighborhoods.name,
        },
        agent: {
          id: agents.id,
          firstName: agents.firstName,
          lastName: agents.lastName,
          phone: agents.phone,
          email: agents.email,
        },
        image: {
          id: propertyImages.id,
          imageUrl: propertyImages.imageUrl,
          caption: propertyImages.caption,
        },
      })
      .from(properties)
      .leftJoin(propertyTypes, eq(properties.propertyTypeId, propertyTypes.id))
      .leftJoin(listingTypes, eq(properties.listingTypeId, listingTypes.id))
      .leftJoin(propertyStatus, eq(properties.statusId, propertyStatus.id))
      .leftJoin(cities, eq(properties.cityId, cities.id))
      .leftJoin(provinces, eq(properties.provinceId, provinces.id))
      .leftJoin(neighborhoods, eq(properties.neighborhoodId, neighborhoods.id))
      .leftJoin(agents, eq(properties.agentId, agents.id))
      .leftJoin(propertyImages, and(
        eq(properties.id, propertyImages.propertyId),
        eq(propertyImages.isPrimary, true)
      ))
      .where(whereCondition)
      .orderBy(desc(properties.createdAt))
      .limit(take)
      .offset(skip),
      
      db.select({ count: count() })
      .from(properties)
      .leftJoin(cities, eq(properties.cityId, cities.id))
      .where(whereCondition)
      .then(result => result[0].count)
    ])

    const totalPages = Math.ceil(totalCountResult / take)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      data: propertiesResult,
      pagination: {
        page,
        limit: take,
        totalCount: totalCountResult,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        searchText,
        listingTypes: filterListingTypes,
        propertyTypes: filterPropertyTypes,
        priceRange,
        bedrooms,
        bathrooms,
        sqftRange,
        status: filterStatus,
        cityId,
        provinceId,
      }
    })
  } catch (error) {
    console.error('Error filtering properties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}