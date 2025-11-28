import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  integer, 
  decimal, 
  boolean, 
  timestamp, 
  date,
  uuid
} from 'drizzle-orm/pg-core'

export const provinces = pgTable('provinces', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 2 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  countryCode: varchar('country_code', { length: 2 }).default('CA').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  provinceId: integer('province_id').notNull(),
  population: integer('population'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const neighborhoods = pgTable('neighborhoods', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  cityId: integer('city_id').notNull(),
  averageIncome: integer('average_income'),
  walkabilityScore: integer('walkability_score'),
  safetyRating: integer('safety_rating'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const propertyTypes = pgTable('property_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const listingTypes = pgTable('listing_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const propertyStatus = pgTable('property_status', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  description: text('description'),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).unique(),
  phone: varchar('phone', { length: 20 }),
  licenseNumber: varchar('license_number', { length: 50 }).unique(),
  agencyName: varchar('agency_name', { length: 100 }),
  yearsExperience: integer('years_experience'),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  totalReviews: integer('total_reviews').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  mlsNumber: varchar('mls_number', { length: 50 }).unique(),
  propertyTypeId: integer('property_type_id').notNull(),
  listingTypeId: integer('listing_type_id').notNull(),
  statusId: integer('status_id').notNull(),
  agentId: integer('agent_id'),
  streetAddress: varchar('street_address', { length: 200 }).notNull(),
  unitNumber: varchar('unit_number', { length: 20 }),
  neighborhoodId: integer('neighborhood_id'),
  cityId: integer('city_id').notNull(),
  provinceId: integer('province_id').notNull(),
  postalCode: varchar('postal_code', { length: 10 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  yearBuilt: integer('year_built'),
  totalAreaSqft: integer('total_area_sqft'),
  lotSizeSqft: integer('lot_size_sqft'),
  bedrooms: integer('bedrooms'),
  bathrooms: decimal('bathrooms', { precision: 3, scale: 1 }),
  halfBathrooms: integer('half_bathrooms').default(0).notNull(),
  floors: integer('floors'),
  listPrice: decimal('list_price', { precision: 12, scale: 2 }),
  pricePerSqft: decimal('price_per_sqft', { precision: 8, scale: 2 }),
  monthlyRent: decimal('monthly_rent', { precision: 10, scale: 2 }),
  maintenanceFee: decimal('maintenance_fee', { precision: 8, scale: 2 }),
  propertyTaxesAnnual: decimal('property_taxes_annual', { precision: 10, scale: 2 }),
  heatingType: varchar('heating_type', { length: 50 }),
  coolingType: varchar('cooling_type', { length: 50 }),
  parkingSpaces: integer('parking_spaces').default(0).notNull(),
  parkingType: varchar('parking_type', { length: 50 }),
  petFriendly: boolean('pet_friendly').default(false).notNull(),
  furnished: boolean('furnished').default(false).notNull(),
  listedDate: date('listed_date'),
  availableDate: date('available_date'),
  soldDate: date('sold_date'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const propertyFeatures = pgTable('property_features', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  category: varchar('category', { length: 50 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const propertyFeatureMappings = pgTable('property_feature_mappings', {
  id: serial('id').primaryKey(),
  propertyId: uuid('property_id').notNull(),
  featureId: integer('feature_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const propertyImages = pgTable('property_images', {
  id: serial('id').primaryKey(),
  propertyId: uuid('property_id').notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  imageType: varchar('image_type', { length: 50 }),
  caption: text('caption'),
  displayOrder: integer('display_order').default(0).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const propertyHistory = pgTable('property_history', {
  id: serial('id').primaryKey(),
  propertyId: uuid('property_id').notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  priceChange: decimal('price_change', { precision: 12, scale: 2 }),
  statusChange: varchar('status_change', { length: 100 }),
  eventDate: timestamp('event_date').defaultNow().notNull(),
  notes: text('notes'),
})