export interface PropertyDetail {
    id: string
    mlsNumber: string | null
    propertyTypeId: number
    listingTypeId: number
    statusId: number
    agentId: number
    streetAddress: string
    unitNumber: string | null
    neighborhoodId: number
    cityId: number
    provinceId: number
    postalCode: string
    latitude: string
    longitude: string
    title: string
    description: string
    yearBuilt: number
    totalAreaSqft: number
    lotSizeSqft: number
    bedrooms: number
    bathrooms: string
    halfBathrooms: number
    floors: number
    listPrice: string
    pricePerSqft: string
    monthlyRent: string | null
    maintenanceFee: string | null
    propertyTaxesAnnual: string
    heatingType: string
    coolingType: string
    parkingSpaces: number
    parkingType: string
    petFriendly: boolean
    furnished: boolean
    listedDate: string
    availableDate: string
    soldDate: string | null
    lastUpdated: string
    createdAt: string
    propertyType: {
        id: number
        name: string
        description: string
        category: string
    }
    listingType: {
        id: number
        name: string
        description: string
    }
    status: {
        id: number
        name: string
        description: string
        isAvailable: boolean
    }
    agent: {
        id: number
        firstName: string
        lastName: string
        email: string
        phone: string
        licenseNumber: string
        agencyName: string
        yearsExperience: number
        rating: string
        totalReviews: number
    }
    neighborhood: {
        id: number
        name: string
        averageIncome: number
        walkabilityScore: number
        safetyRating: number
    }
    city: {
        id: number
        name: string
        population: number
        latitude: string
        longitude: string
    }
    province: {
        id: number
        name: string
        code: string
        countryCode: string
    }
    features: {
        id: number
        name: string
        category: string
        description: string
    }[]
    images: {
        id: number
        imageUrl: string
        imageType: string
        caption: string
        displayOrder: number
        isPrimary: boolean
    }[]
    history: {
        date: string
        event: string
        price?: string
    }[]
}
