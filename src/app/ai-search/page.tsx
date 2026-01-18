import { AiSearchWrapper } from "@/components/ai-listing-ui/aiSearchWrapper";
import { db } from "@/lib/db";
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
import { eq, and, desc, count } from "drizzle-orm";
import type { Property } from "@/lib/property-data";

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

async function fetchProperties(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

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
    .orderBy(desc(properties.createdAt))
    .limit(limit)
    .offset(skip),
    
    db.select({ count: count() })
    .from(properties)
    .then(result => result[0].count)
  ]);

  const totalPages = Math.ceil(totalCountResult / limit);
  const hasNextPage = page < totalPages;

  // Transform database results to Property type
  const transformedProperties: Property[] = propertiesResult.map((prop) => {
    return {
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
    };
  });

  return {
    properties: transformedProperties,
    totalCount: totalCountResult,
    page,
    hasNextPage,
  };
}

export default async function AiSearch() {
  const { properties, totalCount, page, hasNextPage } = await fetchProperties(1, 10);

  return (
    <AiSearchWrapper
      initialProperties={properties}
      initialTotalCount={totalCount}
      initialPage={page}
      initialHasNextPage={hasNextPage}
    />
  );
}