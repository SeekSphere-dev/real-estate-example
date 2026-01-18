import {SeekSphereClient} from 'seeksphere-sdk';
import {db} from "@/lib/db";
import { sql } from 'drizzle-orm'
import type { Property } from "@/lib/property-data";

// Initialize the client
const client = new SeekSphereClient({
    apiKey: 'org_38P3GCeN8XMMIrsc187bKx2WdeH',
    timeout: 30000
});

interface SearchTableRow {
    id: string;
    mls_number: string | null;
    street_address: string | null;
    unit_number: string | null;
    title: string | null;
    total_area_sqft: number | null;
    bedrooms: number | null;
    bathrooms: string | null;
    list_price: string | null;
    monthly_rent: string | null;
    listed_date: string | null;
    latitude: string | null;
    longitude: string | null;
    province_code: string | null;
    province_name: string | null;
    city_name: string | null;
    neighborhood_name: string | null;
    property_type_name: string | null;
    property_type_category: string | null;
    listing_type_name: string | null;
    property_status_name: string | null;
    property_status_is_available: boolean | null;
    agent_first_name: string | null;
    agent_last_name: string | null;
    agent_email: string | null;
    agent_phone: string | null;
}

const transformSearchResult = (row: SearchTableRow): Property => ({
    id: row.id || "",
    mlsNumber: row.mls_number || null,
    title: row.title || "",
    streetAddress: row.street_address || "",
    unitNumber: row.unit_number || null,
    postalCode: "",
    latitude: row.latitude?.toString() || "",
    longitude: row.longitude?.toString() || "",
    bedrooms: row.bedrooms || 0,
    bathrooms: row.bathrooms?.toString() || "0",
    totalAreaSqft: row.total_area_sqft || 0,
    listPrice: row.list_price?.toString() || "0",
    monthlyRent: row.monthly_rent?.toString() || null,
    listedDate: row.listed_date?.toString() || "",
    propertyType: {
        id: 0,
        name: row.property_type_name || "",
        category: row.property_type_category || "",
    },
    listingType: {
        id: 0,
        name: row.listing_type_name || "",
    },
    status: {
        id: 0,
        name: row.property_status_name || "",
        isAvailable: row.property_status_is_available || false,
    },
    city: {
        id: 0,
        name: row.city_name || "",
    },
    province: {
        id: 0,
        name: row.province_name || "",
        code: row.province_code || "",
    },
    neighborhood: {
        id: 0,
        name: row.neighborhood_name || "",
    },
    agent: {
        id: 0,
        firstName: row.agent_first_name || "",
        lastName: row.agent_last_name || "",
        phone: row.agent_phone || "",
        email: row.agent_email || "",
    },
    image: {
        id: 0,
        imageUrl: "",
        caption: "",
    },
});

const callSeeksphere = async (query: string) => {
    const searchResponse =  await client.search({query}, 'sql_only')
    if (!searchResponse.success && searchResponse.mode !== 'sql_only' && !searchResponse.sql) {
        return null
    }
    return searchResponse.sql;
}

export const search = async (query: string): Promise<Property[]> => {
    const sqlResponse = await callSeeksphere(query);
    if (sqlResponse) {
        const result = await db.execute(sql.raw(sqlResponse));
        const rows = result.rows as unknown as SearchTableRow[];
        return rows.map(transformSearchResult);
    }
    return [];
}
