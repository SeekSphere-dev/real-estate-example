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

    // Transform nested objects to handle null values from leftJoin
    const transformedProperty = {
      ...property,
      propertyType: property.propertyType ? {
        id: property.propertyType.id ?? 0,
        name: property.propertyType.name ?? "",
        description: property.propertyType.description ?? "",
        category: property.propertyType.category ?? "",
      } : { id: 0, name: "", description: "", category: "" },
      listingType: property.listingType ? {
        id: property.listingType.id ?? 0,
        name: property.listingType.name ?? "",
        description: property.listingType.description ?? "",
      } : { id: 0, name: "", description: "" },
      status: property.status ? {
        id: property.status.id ?? 0,
        name: property.status.name ?? "",
        description: property.status.description ?? "",
        isAvailable: property.status.isAvailable ?? false,
      } : { id: 0, name: "", description: "", isAvailable: false },
      agent: property.agent ? {
        id: property.agent.id ?? 0,
        firstName: property.agent.firstName ?? "",
        lastName: property.agent.lastName ?? "",
        email: property.agent.email ?? "",
        phone: property.agent.phone ?? "",
        licenseNumber: property.agent.licenseNumber ?? "",
        agencyName: property.agent.agencyName ?? "",
        yearsExperience: property.agent.yearsExperience ?? 0,
        rating: property.agent.rating ?? "0",
        totalReviews: property.agent.totalReviews ?? 0,
      } : { id: 0, firstName: "", lastName: "", email: "", phone: "", licenseNumber: "", agencyName: "", yearsExperience: 0, rating: "0", totalReviews: 0 },
      neighborhood: property.neighborhood ? {
        id: property.neighborhood.id ?? 0,
        name: property.neighborhood.name ?? "",
        averageIncome: property.neighborhood.averageIncome ?? 0,
        walkabilityScore: property.neighborhood.walkabilityScore ?? 0,
        safetyRating: property.neighborhood.safetyRating ?? 0,
      } : { id: 0, name: "", averageIncome: 0, walkabilityScore: 0, safetyRating: 0 },
      city: property.city ? {
        id: property.city.id ?? 0,
        name: property.city.name ?? "",
        population: property.city.population ?? 0,
        latitude: property.city.latitude ?? null,
        longitude: property.city.longitude ?? null,
      } : { id: 0, name: "", population: 0, latitude: null, longitude: null },
      province: property.province ? {
        id: property.province.id ?? 0,
        name: property.province.name ?? "",
        code: property.province.code ?? "",
        countryCode: property.province.countryCode ?? "",
      } : { id: 0, name: "", code: "", countryCode: "" },
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