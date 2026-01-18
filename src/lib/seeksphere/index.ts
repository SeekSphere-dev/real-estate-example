import {SeekSphereClient} from 'seeksphere-sdk';
import {db} from "@/lib/db";
import { sql, eq, and, inArray } from 'drizzle-orm'
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
} from "@/lib/db/schema";
import type { Property } from "@/lib/property-data";

// Initialize the client
const client = new SeekSphereClient({
    apiKey: 'org_38P3GCeN8XMMIrsc187bKx2WdeH',
    timeout: 30000
});

interface SearchIdRow {
    id: string;
}

const callSeeksphere = async (query: string) => {
    const searchResponse = await client.search({query}, 'sql_only')
    if (!searchResponse.success && searchResponse.mode !== 'sql_only' && !searchResponse.sql) {
        return null
    }
    return searchResponse.sql;
}

const fetchPropertiesByIds = async (ids: string[]): Promise<Property[]> => {
    if (ids.length === 0) return [];

    const propertiesResult = await db.select({
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
    .where(inArray(properties.id, ids));

    // Create a map to preserve the order from the original search
    const propertyMap = new Map<string, Property>();

    for (const prop of propertiesResult) {
        propertyMap.set(prop.id, {
            id: prop.id || "",
            mlsNumber: prop.mlsNumber || null,
            title: prop.title || "",
            streetAddress: prop.streetAddress || "",
            unitNumber: prop.unitNumber || null,
            postalCode: prop.postalCode || "",
            latitude: prop.latitude?.toString() || "",
            longitude: prop.longitude?.toString() || "",
            bedrooms: prop.bedrooms ?? 0,
            bathrooms: prop.bathrooms?.toString() || "0",
            totalAreaSqft: prop.totalAreaSqft ?? 0,
            listPrice: prop.listPrice?.toString() || "0",
            monthlyRent: prop.monthlyRent?.toString() || null,
            listedDate: prop.listedDate?.toString() || "",
            propertyType: prop.propertyType ? {
                id: prop.propertyType.id ?? 0,
                name: prop.propertyType.name ?? "",
                category: prop.propertyType.category ?? "",
            } : { id: 0, name: "", category: "" },
            listingType: prop.listingType ? {
                id: prop.listingType.id ?? 0,
                name: prop.listingType.name ?? "",
            } : { id: 0, name: "" },
            status: prop.status ? {
                id: prop.status.id ?? 0,
                name: prop.status.name ?? "",
                isAvailable: prop.status.isAvailable ?? false,
            } : { id: 0, name: "", isAvailable: false },
            city: prop.city ? {
                id: prop.city.id ?? 0,
                name: prop.city.name ?? "",
            } : { id: 0, name: "" },
            province: prop.province ? {
                id: prop.province.id ?? 0,
                name: prop.province.name ?? "",
                code: prop.province.code ?? "",
            } : { id: 0, name: "", code: "" },
            neighborhood: prop.neighborhood ? {
                id: prop.neighborhood.id ?? 0,
                name: prop.neighborhood.name ?? "",
            } : { id: 0, name: "" },
            agent: prop.agent ? {
                id: prop.agent.id ?? 0,
                firstName: prop.agent.firstName ?? "",
                lastName: prop.agent.lastName ?? "",
                phone: prop.agent.phone ?? "",
                email: prop.agent.email ?? "",
            } : { id: 0, firstName: "", lastName: "", phone: "", email: "" },
            image: prop.image ? {
                id: prop.image.id ?? 0,
                imageUrl: prop.image.imageUrl ?? "",
                caption: prop.image.caption ?? "",
            } : { id: 0, imageUrl: "", caption: "" },
        });
    }

    // Return properties in the same order as the input IDs
    return ids.map(id => propertyMap.get(id)).filter((p): p is Property => p !== undefined);
}

export const search = async (query: string): Promise<Property[]> => {
    const sqlResponse = await callSeeksphere(query);
    console.log('sqlResponse', sqlResponse);
    if (sqlResponse) {
        const result = await db.execute(sql.raw(sqlResponse));
        const rows = result.rows as unknown as SearchIdRow[];

        // Extract IDs, filtering out any null/undefined values
        const ids = rows
            .map(row => row.id)
            .filter((id): id is string => id != null && id !== '');

        if (ids.length === 0) {
            console.log('No valid IDs found in search result');
            return [];
        }

        return fetchPropertiesByIds(ids);
    }
    return [];
}
