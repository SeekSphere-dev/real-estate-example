export interface Property {
    id: string
    mlsNumber: string | null
    title: string
    streetAddress: string
    unitNumber: string | null
    postalCode: string
    latitude: string
    longitude: string
    bedrooms: number
    bathrooms: string
    totalAreaSqft: number
    listPrice: string
    monthlyRent: string | null
    listedDate: string
    propertyType: {
        id: number
        name: string
        category: string
    }
    listingType: {
        id: number
        name: string
    }
    status: {
        id: number
        name: string
        isAvailable: boolean
    }
    city: {
        id: number
        name: string
    }
    province: {
        id: number
        name: string
        code: string
    }
    neighborhood: {
        id: number
        name: string
    }
    agent: {
        id: number
        firstName: string
        lastName: string
        phone: string
        email: string
    }
    image: {
        id: number
        imageUrl: string
        caption: string
    }
}
