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
import { eq, and, gte, lte, count, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const skip = (page - 1) * limit
    
    const cityId = searchParams.get('cityId') ? parseInt(searchParams.get('cityId')!) : undefined
    const provinceId = searchParams.get('provinceId') ? parseInt(searchParams.get('provinceId')!) : undefined
    const propertyTypeId = searchParams.get('propertyTypeId') ? parseInt(searchParams.get('propertyTypeId')!) : undefined
    const listingTypeId = searchParams.get('listingTypeId') ? parseInt(searchParams.get('listingTypeId')!) : undefined
    const statusId = searchParams.get('statusId') ? parseInt(searchParams.get('statusId')!) : undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined

    const where = {
      ...(cityId && { cityId }),
      ...(provinceId && { provinceId }),
      ...(propertyTypeId && { propertyTypeId }),
      ...(listingTypeId && { listingTypeId }),
      ...(statusId && { statusId }),
      ...(bedrooms && { bedrooms }),
      ...(minPrice || maxPrice) && {
        listPrice: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        },
      },
    }

    // Build where conditions
    const conditions = []
    if (cityId) conditions.push(eq(properties.cityId, cityId))
    if (provinceId) conditions.push(eq(properties.provinceId, provinceId))
    if (propertyTypeId) conditions.push(eq(properties.propertyTypeId, propertyTypeId))
    if (listingTypeId) conditions.push(eq(properties.listingTypeId, listingTypeId))
    if (statusId) conditions.push(eq(properties.statusId, statusId))
    if (bedrooms) conditions.push(eq(properties.bedrooms, bedrooms))
    if (minPrice) conditions.push(gte(properties.listPrice, minPrice.toString()))
    if (maxPrice) conditions.push(lte(properties.listPrice, maxPrice.toString()))

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
      .limit(limit)
      .offset(skip),
      
      db.select({ count: count() })
      .from(properties)
      .where(whereCondition)
      .then(result => result[0].count)
    ])

    const totalPages = Math.ceil(totalCountResult / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      data: propertiesResult,
      pagination: {
        page,
        limit,
        totalCount: totalCountResult,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}