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
  propertyImages,
  propertyHistory,
  propertyFeatureMappings,
  propertyFeatures
} from '@/lib/db/schema'
import { eq, desc, asc } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Get the main property data
    const [property] = await db
      .select({
        id: properties.id,
        mlsNumber: properties.mlsNumber,
        propertyTypeId: properties.propertyTypeId,
        listingTypeId: properties.listingTypeId,
        statusId: properties.statusId,
        agentId: properties.agentId,
        streetAddress: properties.streetAddress,
        unitNumber: properties.unitNumber,
        neighborhoodId: properties.neighborhoodId,
        cityId: properties.cityId,
        provinceId: properties.provinceId,
        postalCode: properties.postalCode,
        latitude: properties.latitude,
        longitude: properties.longitude,
        title: properties.title,
        description: properties.description,
        yearBuilt: properties.yearBuilt,
        totalAreaSqft: properties.totalAreaSqft,
        lotSizeSqft: properties.lotSizeSqft,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        halfBathrooms: properties.halfBathrooms,
        floors: properties.floors,
        listPrice: properties.listPrice,
        pricePerSqft: properties.pricePerSqft,
        monthlyRent: properties.monthlyRent,
        maintenanceFee: properties.maintenanceFee,
        propertyTaxesAnnual: properties.propertyTaxesAnnual,
        heatingType: properties.heatingType,
        coolingType: properties.coolingType,
        parkingSpaces: properties.parkingSpaces,
        parkingType: properties.parkingType,
        petFriendly: properties.petFriendly,
        furnished: properties.furnished,
        listedDate: properties.listedDate,
        availableDate: properties.availableDate,
        soldDate: properties.soldDate,
        lastUpdated: properties.lastUpdated,
        createdAt: properties.createdAt,
        propertyType: {
          id: propertyTypes.id,
          name: propertyTypes.name,
          description: propertyTypes.description,
          category: propertyTypes.category,
        },
        listingType: {
          id: listingTypes.id,
          name: listingTypes.name,
          description: listingTypes.description,
        },
        status: {
          id: propertyStatus.id,
          name: propertyStatus.name,
          description: propertyStatus.description,
          isAvailable: propertyStatus.isAvailable,
        },
        agent: {
          id: agents.id,
          firstName: agents.firstName,
          lastName: agents.lastName,
          email: agents.email,
          phone: agents.phone,
          licenseNumber: agents.licenseNumber,
          agencyName: agents.agencyName,
          yearsExperience: agents.yearsExperience,
          rating: agents.rating,
          totalReviews: agents.totalReviews,
        },
        neighborhood: {
          id: neighborhoods.id,
          name: neighborhoods.name,
          averageIncome: neighborhoods.averageIncome,
          walkabilityScore: neighborhoods.walkabilityScore,
          safetyRating: neighborhoods.safetyRating,
        },
        city: {
          id: cities.id,
          name: cities.name,
          population: cities.population,
          latitude: cities.latitude,
          longitude: cities.longitude,
        },
        province: {
          id: provinces.id,
          name: provinces.name,
          code: provinces.code,
          countryCode: provinces.countryCode,
        },
      })
      .from(properties)
      .leftJoin(propertyTypes, eq(properties.propertyTypeId, propertyTypes.id))
      .leftJoin(listingTypes, eq(properties.listingTypeId, listingTypes.id))
      .leftJoin(propertyStatus, eq(properties.statusId, propertyStatus.id))
      .leftJoin(agents, eq(properties.agentId, agents.id))
      .leftJoin(neighborhoods, eq(properties.neighborhoodId, neighborhoods.id))
      .leftJoin(cities, eq(properties.cityId, cities.id))
      .leftJoin(provinces, eq(properties.provinceId, provinces.id))
      .where(eq(properties.id, id))

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Get property images
    const images = await db
      .select({
        id: propertyImages.id,
        imageUrl: propertyImages.imageUrl,
        imageType: propertyImages.imageType,
        caption: propertyImages.caption,
        displayOrder: propertyImages.displayOrder,
        isPrimary: propertyImages.isPrimary,
      })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id))
      .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.displayOrder))

    // Get property features
    const featuresData = await db
      .select({
        id: propertyFeatures.id,
        name: propertyFeatures.name,
        category: propertyFeatures.category,
        description: propertyFeatures.description,
      })
      .from(propertyFeatureMappings)
      .leftJoin(propertyFeatures, eq(propertyFeatureMappings.featureId, propertyFeatures.id))
      .where(eq(propertyFeatureMappings.propertyId, id))

    // Get property history
    const history = await db
      .select({
        id: propertyHistory.id,
        eventType: propertyHistory.eventType,
        oldValue: propertyHistory.oldValue,
        newValue: propertyHistory.newValue,
        priceChange: propertyHistory.priceChange,
        statusChange: propertyHistory.statusChange,
        eventDate: propertyHistory.eventDate,
        notes: propertyHistory.notes,
      })
      .from(propertyHistory)
      .where(eq(propertyHistory.propertyId, id))
      .orderBy(desc(propertyHistory.eventDate))
      .limit(20)

    const transformedProperty = {
      ...property,
      features: featuresData,
      images,
      history,
    }

    return NextResponse.json({
      data: transformedProperty,
    })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}