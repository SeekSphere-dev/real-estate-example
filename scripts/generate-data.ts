#!/usr/bin/env tsx

import { query, transaction, testConnection, checkTables } from '../src/lib/database';

// Configuration
const TOTAL_PROPERTIES = 20000;
const BATCH_SIZE = 1000;
const AGENTS_COUNT = 500;
const NEIGHBORHOODS_PER_CITY = 5;

// Canadian provinces and major cities data
const PROVINCES_DATA = [
  { code: 'ON', name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Kitchener', 'Windsor', 'Mississauga', 'Brampton'] },
  { code: 'QC', name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke'] },
  { code: 'BC', name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford'] },
  { code: 'AB', name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat'] },
  { code: 'MB', name: 'Manitoba', cities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson'] },
  { code: 'SK', name: 'Saskatchewan', cities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw'] },
  { code: 'NS', name: 'Nova Scotia', cities: ['Halifax', 'Sydney', 'Dartmouth', 'Truro'] },
  { code: 'NB', name: 'New Brunswick', cities: ['Saint John', 'Moncton', 'Fredericton', 'Dieppe'] },
  { code: 'NL', name: 'Newfoundland and Labrador', cities: ['St. Johns', 'Mount Pearl', 'Corner Brook'] },
  { code: 'PE', name: 'Prince Edward Island', cities: ['Charlottetown', 'Summerside'] }
];

const PROPERTY_TYPES_DATA = [
  { name: 'House', description: 'Single-family detached house', category: 'residential' },
  { name: 'Condo', description: 'Condominium unit', category: 'residential' },
  { name: 'Townhouse', description: 'Multi-level attached home', category: 'residential' },
  { name: 'Apartment', description: 'Rental apartment unit', category: 'residential' },
  { name: 'Duplex', description: 'Two-unit residential building', category: 'residential' },
  { name: 'Bungalow', description: 'Single-story house', category: 'residential' },
  { name: 'Loft', description: 'Open-concept living space', category: 'residential' },
  { name: 'Studio', description: 'Single-room living space', category: 'residential' }
];

const LISTING_TYPES_DATA = [
  { name: 'For Sale', description: 'Property available for purchase' },
  { name: 'For Rent', description: 'Property available for rental' },
  { name: 'Lease', description: 'Property available for lease' }
];

const PROPERTY_STATUS_DATA = [
  { name: 'Active', description: 'Currently available', is_available: true },
  { name: 'Pending', description: 'Offer accepted, pending completion', is_available: false },
  { name: 'Sold', description: 'Sale completed', is_available: false },
  { name: 'Rented', description: 'Currently rented', is_available: false },
  { name: 'Off Market', description: 'Temporarily unavailable', is_available: false }
];

const PROPERTY_FEATURES_DATA = [
  // Interior features
  { name: 'Hardwood Floors', category: 'interior', description: 'Beautiful hardwood flooring throughout' },
  { name: 'Granite Countertops', category: 'interior', description: 'Premium granite kitchen countertops' },
  { name: 'Stainless Steel Appliances', category: 'interior', description: 'Modern stainless steel kitchen appliances' },
  { name: 'Walk-in Closet', category: 'interior', description: 'Spacious walk-in closet in master bedroom' },
  { name: 'Fireplace', category: 'interior', description: 'Cozy fireplace in living area' },
  { name: 'Updated Kitchen', category: 'interior', description: 'Recently renovated modern kitchen' },
  { name: 'Ensuite Bathroom', category: 'interior', description: 'Private bathroom in master bedroom' },
  { name: 'High Ceilings', category: 'interior', description: 'Soaring high ceilings create spacious feel' },
  { name: 'In-Unit Laundry', category: 'interior', description: 'Washer and dryer in unit' },
  { name: 'Central Air', category: 'interior', description: 'Central air conditioning system' },
  
  // Exterior features
  { name: 'Balcony', category: 'exterior', description: 'Private outdoor balcony space' },
  { name: 'Patio', category: 'exterior', description: 'Outdoor patio area' },
  { name: 'Garden', category: 'exterior', description: 'Private garden space' },
  { name: 'Garage', category: 'exterior', description: 'Attached or detached garage' },
  { name: 'Driveway', category: 'exterior', description: 'Private driveway parking' },
  { name: 'Deck', category: 'exterior', description: 'Outdoor deck space' },
  { name: 'Fenced Yard', category: 'exterior', description: 'Fully fenced backyard' },
  { name: 'Pool', category: 'exterior', description: 'Swimming pool on property' },
  
  // Building amenities
  { name: 'Gym', category: 'building', description: 'On-site fitness facility' },
  { name: 'Concierge', category: 'building', description: '24/7 concierge service' },
  { name: 'Rooftop Terrace', category: 'building', description: 'Shared rooftop outdoor space' },
  { name: 'Storage Locker', category: 'building', description: 'Additional storage space' },
  { name: 'Bike Storage', category: 'building', description: 'Secure bicycle storage' },
  { name: 'Party Room', category: 'building', description: 'Shared entertainment space' },
  { name: 'Guest Suite', category: 'building', description: 'Guest accommodation available' },
  { name: 'Security System', category: 'building', description: 'Building security system' },
  
  // Neighborhood features
  { name: 'Near Transit', category: 'neighborhood', description: 'Close to public transportation' },
  { name: 'Near Schools', category: 'neighborhood', description: 'Walking distance to schools' },
  { name: 'Near Shopping', category: 'neighborhood', description: 'Close to shopping centers' },
  { name: 'Near Parks', category: 'neighborhood', description: 'Close to parks and recreation' },
  { name: 'Waterfront', category: 'neighborhood', description: 'Waterfront location' },
  { name: 'Downtown', category: 'neighborhood', description: 'Downtown location' }
];

// Utility functions
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;
const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const randomChoices = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generatePostalCode = (provinceCode: string): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const firstLetter = randomChoice(letters.split(''));
  const firstDigit = randomChoice(digits.split(''));
  const secondLetter = randomChoice(letters.split(''));
  const secondDigit = randomChoice(digits.split(''));
  const thirdLetter = randomChoice(letters.split(''));
  const thirdDigit = randomChoice(digits.split(''));
  
  return `${firstLetter}${firstDigit}${secondLetter} ${secondDigit}${thirdLetter}${thirdDigit}`;
};

const generateStreetAddress = (): string => {
  const streetNumbers = randomInt(1, 9999);
  const streetNames = [
    'Main St', 'Oak Ave', 'Maple Dr', 'Pine Rd', 'Cedar Blvd', 'Elm St', 'King St', 'Queen St',
    'First Ave', 'Second Ave', 'Park Ave', 'Church St', 'Mill Rd', 'Hill St', 'Lake Dr',
    'Forest Ave', 'Garden St', 'Spring St', 'River Rd', 'Mountain View Dr', 'Sunset Blvd',
    'Victoria St', 'Wellington St', 'Richmond St', 'York St', 'Bay St', 'College St'
  ];
  
  return `${streetNumbers} ${randomChoice(streetNames)}`;
};

const generatePropertyTitle = (propertyType: string, city: string): string => {
  const adjectives = [
    'Beautiful', 'Stunning', 'Modern', 'Spacious', 'Charming', 'Luxurious', 'Cozy', 'Bright',
    'Updated', 'Renovated', 'Contemporary', 'Classic', 'Elegant', 'Comfortable', 'Stylish'
  ];
  
  const features = [
    'with great views', 'in prime location', 'with modern amenities', 'near downtown',
    'with parking', 'newly renovated', 'move-in ready', 'with outdoor space',
    'in quiet neighborhood', 'with lots of natural light'
  ];
  
  const adjective = randomChoice(adjectives);
  const feature = Math.random() > 0.5 ? ` ${randomChoice(features)}` : '';
  
  return `${adjective} ${propertyType} in ${city}${feature}`;
};

const generatePropertyDescription = (property: any): string => {
  const descriptions = [
    `This ${property.bedrooms}-bedroom, ${property.bathrooms}-bathroom ${property.property_type} offers ${property.total_area_sqft} sq ft of comfortable living space.`,
    `Located in the heart of ${property.city}, this property features modern amenities and excellent access to local attractions.`,
    `Perfect for ${property.bedrooms <= 2 ? 'professionals or small families' : 'families'}, with ${property.parking_spaces > 0 ? 'parking included' : 'street parking available'}.`,
    `${property.pet_friendly ? 'Pet-friendly property' : 'No pets allowed'} with ${property.furnished ? 'furnished' : 'unfurnished'} accommodation.`
  ];
  
  return descriptions.slice(0, randomInt(2, 4)).join(' ');
};

// Data generation functions
async function insertLookupData() {
  console.log('Inserting lookup data...');
  
  // Insert provinces
  for (const province of PROVINCES_DATA) {
    await query(
      'INSERT INTO provinces (code, name, country_code) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
      [province.code, province.name, 'CA']
    );
  }
  
  // Insert cities
  for (const province of PROVINCES_DATA) {
    const provinceResult = await query('SELECT id FROM provinces WHERE code = $1', [province.code]);
    const provinceId = provinceResult.rows[0].id;
    
    for (const cityName of province.cities) {
      const population = randomInt(50000, 3000000);
      const latitude = randomFloat(42.0, 70.0);
      const longitude = randomFloat(-141.0, -52.0);
      
      await query(
        'INSERT INTO cities (name, province_id, population, latitude, longitude) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [cityName, provinceId, population, latitude, longitude]
      );
    }
  }
  
  // Insert neighborhoods
  const cities = await query('SELECT id, name FROM cities');
  for (const city of cities.rows) {
    const neighborhoodNames = [
      'Downtown', 'Uptown', 'Midtown', 'Old Town', 'New Town', 'Riverside', 'Hillside', 'Parkside',
      'Westside', 'Eastside', 'Northside', 'Southside', 'Central', 'Heights', 'Gardens'
    ];
    
    const selectedNeighborhoods = randomChoices(neighborhoodNames, NEIGHBORHOODS_PER_CITY);
    
    for (const neighborhoodName of selectedNeighborhoods) {
      const averageIncome = randomInt(40000, 150000);
      const walkabilityScore = randomInt(20, 100);
      const safetyRating = randomInt(1, 5);
      
      await query(
        'INSERT INTO neighborhoods (name, city_id, average_income, walkability_score, safety_rating) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [neighborhoodName, city.id, averageIncome, walkabilityScore, safetyRating]
      );
    }
  }
  
  // Insert property types
  for (const propertyType of PROPERTY_TYPES_DATA) {
    await query(
      'INSERT INTO property_types (name, description, category) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
      [propertyType.name, propertyType.description, propertyType.category]
    );
  }
  
  // Insert listing types
  for (const listingType of LISTING_TYPES_DATA) {
    await query(
      'INSERT INTO listing_types (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
      [listingType.name, listingType.description]
    );
  }
  
  // Insert property status
  for (const status of PROPERTY_STATUS_DATA) {
    await query(
      'INSERT INTO property_status (name, description, is_available) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
      [status.name, status.description, status.is_available]
    );
  }
  
  // Insert property features
  for (const feature of PROPERTY_FEATURES_DATA) {
    await query(
      'INSERT INTO property_features (name, category, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
      [feature.name, feature.category, feature.description]
    );
  }
  
  console.log('Lookup data inserted successfully');
}

async function generateAgents() {
  console.log(`Generating ${AGENTS_COUNT} agents...`);
  
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Jessica',
    'James', 'Ashley', 'Christopher', 'Amanda', 'Daniel', 'Melissa', 'Matthew', 'Michelle', 'Anthony', 'Kimberly',
    'Mark', 'Amy', 'Donald', 'Angela', 'Steven', 'Helen', 'Paul', 'Deborah', 'Andrew', 'Rachel'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
  ];
  
  const agencies = [
    'Royal LePage', 'RE/MAX', 'Century 21', 'Coldwell Banker', 'Keller Williams', 'Sutton Group',
    'HomeLife', 'Realty Executives', 'Exit Realty', 'Chestnut Park Real Estate', 'Bosley Real Estate',
    'Right at Home Realty', 'iPro Realty', 'Sage Real Estate'
  ];
  
  const agents = [];
  
  for (let i = 0; i < AGENTS_COUNT; i++) {
    const firstName = randomChoice(firstNames);
    const lastName = randomChoice(lastNames);
    
    // Generate unique email with index to ensure uniqueness
    const domain = randomChoice(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 1}@${domain}`;
    
    // Generate unique license number with index
    const licenseNumber = `RE${String(100000 + i).padStart(6, '0')}`;
    
    const phone = `${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
    const agencyName = randomChoice(agencies);
    const yearsExperience = randomInt(1, 30);
    const rating = randomFloat(3.0, 5.0);
    const totalReviews = randomInt(5, 200);
    
    agents.push([
      firstName, lastName, email, phone, licenseNumber, agencyName,
      yearsExperience, rating, totalReviews
    ]);
  }
  
  // Batch insert agents
  for (let i = 0; i < agents.length; i += BATCH_SIZE) {
    const batch = agents.slice(i, i + BATCH_SIZE);
    const values = batch.map((_, index) => {
      const baseIndex = index * 9;
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9})`;
    }).join(', ');
    
    const flatParams = batch.flat();
    
    await query(`
      INSERT INTO agents (first_name, last_name, email, phone, license_number, agency_name, years_experience, rating, total_reviews)
      VALUES ${values}
    `, flatParams);
    
    console.log(`Inserted agents batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(agents.length / BATCH_SIZE)}`);
  }
  
  console.log(`Generated ${AGENTS_COUNT} agents successfully`);
}

async function generateProperties() {
  console.log(`Generating ${TOTAL_PROPERTIES} properties...`);
  
  // Get lookup data
  const propertyTypes = await query('SELECT id, name FROM property_types');
  const listingTypes = await query('SELECT id, name FROM listing_types');
  const propertyStatuses = await query('SELECT id, name FROM property_status');
  const agents = await query('SELECT id FROM agents');
  const cities = await query('SELECT c.id, c.name, c.province_id, p.code as province_code FROM cities c JOIN provinces p ON c.province_id = p.id');
  const neighborhoods = await query('SELECT id, city_id FROM neighborhoods');
  const features = await query('SELECT id, name, category FROM property_features');
  
  const properties = [];
  const propertyImages = [];
  const propertyFeatureMappings = [];
  
  for (let i = 0; i < TOTAL_PROPERTIES; i++) {
    const propertyType = randomChoice(propertyTypes.rows);
    const listingType = randomChoice(listingTypes.rows);
    const status = randomChoice(propertyStatuses.rows);
    const agent = randomChoice(agents.rows);
    const city = randomChoice(cities.rows);
    const cityNeighborhoods = neighborhoods.rows.filter(n => n.city_id === city.id);
    const neighborhood = cityNeighborhoods.length > 0 ? randomChoice(cityNeighborhoods) : null;
    
    // Generate property details based on type
    let bedrooms, bathrooms, totalAreaSqft, listPrice, monthlyRent;
    
    switch (propertyType.name) {
      case 'Studio':
        bedrooms = 0;
        bathrooms = 1;
        totalAreaSqft = randomInt(300, 600);
        break;
      case 'Condo':
      case 'Apartment':
        bedrooms = randomInt(1, 3);
        bathrooms = randomFloat(1, 2.5);
        totalAreaSqft = randomInt(500, 1500);
        break;
      case 'Townhouse':
        bedrooms = randomInt(2, 4);
        bathrooms = randomFloat(1.5, 3.5);
        totalAreaSqft = randomInt(1000, 2500);
        break;
      case 'House':
      case 'Bungalow':
        bedrooms = randomInt(2, 5);
        bathrooms = randomFloat(1, 4);
        totalAreaSqft = randomInt(1200, 4000);
        break;
      case 'Duplex':
        bedrooms = randomInt(3, 6);
        bathrooms = randomFloat(2, 5);
        totalAreaSqft = randomInt(1500, 3500);
        break;
      default:
        bedrooms = randomInt(1, 4);
        bathrooms = randomFloat(1, 3);
        totalAreaSqft = randomInt(600, 2000);
    }
    
    // Generate pricing based on location and size
    const basePrice = totalAreaSqft * randomFloat(200, 800);
    const locationMultiplier = city.name.includes('Toronto') || city.name.includes('Vancouver') ? 
      randomFloat(1.5, 2.5) : randomFloat(0.8, 1.5);
    
    if (listingType.name === 'For Rent') {
      monthlyRent = Math.round(basePrice * locationMultiplier * 0.004); // ~0.4% of property value per month
      listPrice = null;
    } else {
      listPrice = Math.round(basePrice * locationMultiplier);
      monthlyRent = null;
    }
    
    const streetAddress = generateStreetAddress();
    const unitNumber = Math.random() > 0.7 ? `#${randomInt(1, 999)}` : null;
    const postalCode = generatePostalCode(city.province_code);
    const title = generatePropertyTitle(propertyType.name, city.name);
    
    const yearBuilt = randomInt(1950, 2024);
    const lotSizeSqft = ['House', 'Bungalow', 'Duplex'].includes(propertyType.name) ? 
      randomInt(2000, 10000) : null;
    const halfBathrooms = Math.random() > 0.6 ? randomInt(0, 2) : 0;
    const floors = ['Townhouse', 'House', 'Duplex'].includes(propertyType.name) ? 
      randomInt(1, 3) : 1;
    
    const pricePerSqft = listPrice ? Math.round(listPrice / totalAreaSqft) : null;
    const maintenanceFee = ['Condo', 'Apartment'].includes(propertyType.name) ? 
      randomInt(200, 800) : null;
    const propertyTaxesAnnual = listPrice ? Math.round(listPrice * randomFloat(0.008, 0.025)) : null;
    
    const heatingTypes = ['Gas', 'Electric', 'Oil', 'Heat Pump', 'Radiant', 'Forced Air'];
    const coolingTypes = ['Central Air', 'Window Units', 'Heat Pump', 'None'];
    const heatingType = randomChoice(heatingTypes);
    const coolingType = randomChoice(coolingTypes);
    
    const utilitiesOptions = ['Heat', 'Hydro', 'Water', 'Internet', 'Cable'];
    const utilitiesIncluded = Math.random() > 0.5 ? 
      randomChoices(utilitiesOptions, randomInt(1, 3)) : [];
    
    const parkingSpaces = Math.random() > 0.3 ? randomInt(1, 4) : 0;
    const parkingTypes = ['Garage', 'Driveway', 'Street', 'Covered', 'Underground'];
    const parkingType = parkingSpaces > 0 ? randomChoice(parkingTypes) : null;
    
    const petFriendly = Math.random() > 0.6;
    const furnished = Math.random() > 0.8;
    
    const listedDate = new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000);
    const availableDate = new Date(listedDate.getTime() + randomInt(0, 60) * 24 * 60 * 60 * 1000);
    
    const latitude = randomFloat(42.0, 70.0);
    const longitude = randomFloat(-141.0, -52.0);
    
    const property = {
      propertyTypeId: propertyType.id,
      listingTypeId: listingType.id,
      statusId: status.id,
      agentId: agent.id,
      streetAddress,
      unitNumber,
      neighborhoodId: neighborhood?.id || null,
      cityId: city.id,
      provinceId: city.province_id,
      postalCode,
      latitude,
      longitude,
      title,
      description: '', // Will be generated after we have the property data
      yearBuilt,
      totalAreaSqft,
      lotSizeSqft,
      bedrooms,
      bathrooms,
      halfBathrooms,
      floors,
      listPrice,
      pricePerSqft,
      monthlyRent,
      maintenanceFee,
      propertyTaxesAnnual,
      heatingType,
      coolingType,
      utilitiesIncluded,
      parkingSpaces,
      parkingType,
      petFriendly,
      furnished,
      listedDate,
      availableDate
    };
    
    // Generate description after we have all property data
    property.description = generatePropertyDescription({
      ...property,
      property_type: propertyType.name,
      city: city.name,
      pet_friendly: petFriendly,
      furnished: furnished
    });
    
    properties.push(property);
    
    // Generate property images (3-8 images per property)
    const imageCount = randomInt(3, 8);
    const imageTypes = ['exterior', 'interior', 'kitchen', 'bathroom', 'bedroom', 'living_room'];
    
    for (let j = 0; j < imageCount; j++) {
      const imageType = randomChoice(imageTypes);
      const imageUrl = `https://picsum.photos/800/600?random=${i * 10 + j}`;
      const caption = `${imageType.replace('_', ' ')} view`;
      const displayOrder = j;
      const isPrimary = j === 0;
      
      propertyImages.push({
        propertyIndex: i, // We'll use this to link to the property UUID after insertion
        imageUrl,
        imageType,
        caption,
        displayOrder,
        isPrimary
      });
    }
    
    // Generate property features (2-8 features per property)
    const featureCount = randomInt(2, 8);
    const selectedFeatures = randomChoices(features.rows, featureCount);
    
    for (const feature of selectedFeatures) {
      propertyFeatureMappings.push({
        propertyIndex: i,
        featureId: feature.id
      });
    }
    
    if ((i + 1) % 1000 === 0) {
      console.log(`Generated ${i + 1}/${TOTAL_PROPERTIES} properties...`);
    }
  }
  
  console.log('Inserting properties in batches...');
  
  // Insert properties in batches
  const propertyIds: string[] = [];
  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);
    
    const queries = batch.map(property => ({
      text: `
        INSERT INTO properties (
          property_type_id, listing_type_id, status_id, agent_id,
          street_address, unit_number, neighborhood_id, city_id, province_id, postal_code,
          latitude, longitude, title, description, year_built,
          total_area_sqft, lot_size_sqft, bedrooms, bathrooms, half_bathrooms, floors,
          list_price, price_per_sqft, monthly_rent, maintenance_fee, property_taxes_annual,
          heating_type, cooling_type, utilities_included,
          parking_spaces, parking_type, pet_friendly, furnished,
          listed_date, available_date
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
          $30, $31, $32, $33, $34, $35
        ) RETURNING id
      `,
      params: [
        property.propertyTypeId, property.listingTypeId, property.statusId, property.agentId,
        property.streetAddress, property.unitNumber, property.neighborhoodId, property.cityId, 
        property.provinceId, property.postalCode, property.latitude, property.longitude,
        property.title, property.description, property.yearBuilt, property.totalAreaSqft,
        property.lotSizeSqft, property.bedrooms, property.bathrooms, property.halfBathrooms,
        property.floors, property.listPrice, property.pricePerSqft, property.monthlyRent,
        property.maintenanceFee, property.propertyTaxesAnnual, property.heatingType,
        property.coolingType, property.utilitiesIncluded, property.parkingSpaces,
        property.parkingType, property.petFriendly, property.furnished,
        property.listedDate, property.availableDate
      ]
    }));
    
    const results = await transaction(queries);
    
    // Store property IDs for linking images and features
    results.forEach((result, index) => {
      propertyIds[i + index] = result.rows[0].id;
    });
    
    console.log(`Inserted properties batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(properties.length / BATCH_SIZE)}`);
  }
  
  console.log('Inserting property images...');
  
  // Insert property images in batches
  for (let i = 0; i < propertyImages.length; i += BATCH_SIZE) {
    const batch = propertyImages.slice(i, i + BATCH_SIZE);
    
    const queries = batch.map(image => ({
      text: `
        INSERT INTO property_images (property_id, image_url, image_type, caption, display_order, is_primary)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      params: [
        propertyIds[image.propertyIndex],
        image.imageUrl,
        image.imageType,
        image.caption,
        image.displayOrder,
        image.isPrimary
      ]
    }));
    
    await transaction(queries);
    
    console.log(`Inserted images batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(propertyImages.length / BATCH_SIZE)}`);
  }
  
  console.log('Inserting property feature mappings...');
  
  // Insert property feature mappings in batches
  for (let i = 0; i < propertyFeatureMappings.length; i += BATCH_SIZE) {
    const batch = propertyFeatureMappings.slice(i, i + BATCH_SIZE);
    
    const queries = batch.map(mapping => ({
      text: `
        INSERT INTO property_feature_mappings (property_id, feature_id)
        VALUES ($1, $2)
        ON CONFLICT (property_id, feature_id) DO NOTHING
      `,
      params: [
        propertyIds[mapping.propertyIndex],
        mapping.featureId
      ]
    }));
    
    await transaction(queries);
    
    console.log(`Inserted feature mappings batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(propertyFeatureMappings.length / BATCH_SIZE)}`);
  }
  
  console.log(`Generated ${TOTAL_PROPERTIES} properties successfully`);
}

async function generatePropertyHistory() {
  console.log('Generating property history...');
  
  const properties = await query('SELECT id, list_price, monthly_rent, status_id FROM properties LIMIT 5000');
  const statuses = await query('SELECT id, name FROM property_status');
  
  const historyEntries = [];
  
  for (const property of properties.rows) {
    // Generate 1-3 history entries per property
    const entryCount = randomInt(1, 3);
    
    for (let i = 0; i < entryCount; i++) {
      const eventTypes = ['price_change', 'status_change', 'listing'];
      const eventType = randomChoice(eventTypes);
      
      let oldValue = null;
      let newValue = null;
      let priceChange = null;
      let statusChange = null;
      
      if (eventType === 'price_change' && (property.list_price || property.monthly_rent)) {
        const currentPrice = property.list_price || property.monthly_rent;
        const changePercent = randomFloat(-0.1, 0.1); // ±10% change
        const oldPrice = Math.round(currentPrice / (1 + changePercent));
        
        oldValue = oldPrice.toString();
        newValue = currentPrice.toString();
        priceChange = currentPrice - oldPrice;
      } else if (eventType === 'status_change') {
        const oldStatus = randomChoice(statuses.rows);
        const newStatus = statuses.rows.find(s => s.id === property.status_id);
        
        oldValue = oldStatus.name;
        newValue = newStatus.name;
        statusChange = `${oldStatus.name} -> ${newStatus.name}`;
      } else if (eventType === 'listing') {
        newValue = 'Listed';
      }
      
      const eventDate = new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000);
      const notes = `Property ${eventType.replace('_', ' ')} recorded`;
      
      historyEntries.push({
        propertyId: property.id,
        eventType,
        oldValue,
        newValue,
        priceChange,
        statusChange,
        eventDate,
        notes
      });
    }
  }
  
  // Insert history entries in batches
  for (let i = 0; i < historyEntries.length; i += BATCH_SIZE) {
    const batch = historyEntries.slice(i, i + BATCH_SIZE);
    
    const queries = batch.map(entry => ({
      text: `
        INSERT INTO property_history (
          property_id, event_type, old_value, new_value, 
          price_change, status_change, event_date, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      params: [
        entry.propertyId, entry.eventType, entry.oldValue, entry.newValue,
        entry.priceChange, entry.statusChange, entry.eventDate, entry.notes
      ]
    }));
    
    await transaction(queries);
    
    console.log(`Inserted history batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(historyEntries.length / BATCH_SIZE)}`);
  }
  
  console.log(`Generated ${historyEntries.length} property history entries`);
}

async function updateSearchVectors() {
  console.log('Updating search vectors...');
  
  await query(`
    UPDATE properties 
    SET search_vector = to_tsvector('english', 
      COALESCE(title, '') || ' ' || 
      COALESCE(description, '') || ' ' || 
      COALESCE(street_address, '')
    )
  `);
  
  console.log('Search vectors updated');
}

async function createIndexes() {
  console.log('Creating database indexes for better performance...');
  
  const indexes = [
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_search_vector ON properties USING gin(search_vector)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_city_id ON properties(city_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_province_id ON properties(province_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_property_type_id ON properties(property_type_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_listing_type_id ON properties(listing_type_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_status_id ON properties(status_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_list_price ON properties(list_price)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_monthly_rent ON properties(monthly_rent)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_bathrooms ON properties(bathrooms)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_total_area_sqft ON properties(total_area_sqft)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_created_at ON properties(created_at)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_images_property_id ON property_images(property_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_feature_mappings_property_id ON property_feature_mappings(property_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_feature_mappings_feature_id ON property_feature_mappings(feature_id)'
  ];
  
  for (const indexQuery of indexes) {
    try {
      await query(indexQuery);
      console.log(`Created index: ${indexQuery.split(' ')[5]}`);
    } catch (error) {
      console.log(`Index may already exist: ${indexQuery.split(' ')[5]}`);
    }
  }
  
  console.log('Database indexes created');
}

/**
 * Drop all existing tables and recreate them from schema
 */
async function recreateTables() {
  console.log('🗑️  Dropping existing tables...');
  
  // Drop tables in reverse dependency order
  const dropQueries = [
    'DROP TABLE IF EXISTS property_history CASCADE',
    'DROP TABLE IF EXISTS property_feature_mappings CASCADE',
    'DROP TABLE IF EXISTS property_images CASCADE',
    'DROP TABLE IF EXISTS properties CASCADE',
    'DROP TABLE IF EXISTS agents CASCADE',
    'DROP TABLE IF EXISTS property_features CASCADE',
    'DROP TABLE IF EXISTS property_status CASCADE',
    'DROP TABLE IF EXISTS listing_types CASCADE',
    'DROP TABLE IF EXISTS property_types CASCADE',
    'DROP TABLE IF EXISTS neighborhoods CASCADE',
    'DROP TABLE IF EXISTS cities CASCADE',
    'DROP TABLE IF EXISTS provinces CASCADE'
  ];
  
  for (const dropQuery of dropQueries) {
    try {
      await query(dropQuery);
    } catch (error) {
      // Ignore errors for non-existent tables
      console.log(`Note: ${dropQuery} - table may not exist`);
    }
  }
  
  console.log('✅ All tables dropped');
  
  // Recreate tables from schema
  console.log('📊 Creating tables from schema...');
  
  const fs = await import('fs');
  const path = await import('path');
  
  // Read schema.sql file
  const schemaPath = path.join(process.cwd(), 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  
  // Execute schema SQL (split by semicolon to handle multiple statements)
  const statements = schemaSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  for (const statement of statements) {
    try {
      await query(statement);
    } catch (error) {
      console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
      throw error;
    }
  }
  
  console.log('✅ Tables created successfully');
}

// Main execution function
async function main() {
  try {
    console.log('🚀 Starting data generation script...');
    console.log(`🎯 Target: ${TOTAL_PROPERTIES} properties, ${AGENTS_COUNT} agents`);
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }
    
    // Recreate all tables (this will clear existing data)
    await recreateTables();
    
    console.log('\n=== Phase 1: Inserting lookup data ===');
    await insertLookupData();
    
    console.log('\n=== Phase 2: Generating agents ===');
    await generateAgents();
    
    console.log('\n=== Phase 3: Generating properties ===');
    await generateProperties();
    
    console.log('\n=== Phase 4: Generating property history ===');
    await generatePropertyHistory();
    
    console.log('\n=== Phase 5: Updating search vectors ===');
    await updateSearchVectors();
    
    console.log('\n=== Phase 6: Creating database indexes ===');
    await createIndexes();
    
    // Final statistics
    const finalStats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM properties) as total_properties,
        (SELECT COUNT(*) FROM agents) as total_agents,
        (SELECT COUNT(*) FROM property_images) as total_images,
        (SELECT COUNT(*) FROM property_feature_mappings) as total_feature_mappings,
        (SELECT COUNT(*) FROM property_history) as total_history_entries
    `);
    
    const stats = finalStats.rows[0];
    
    console.log('\n=== Data Generation Complete ===');
    console.log(`✅ Properties: ${stats.total_properties}`);
    console.log(`✅ Agents: ${stats.total_agents}`);
    console.log(`✅ Property Images: ${stats.total_images}`);
    console.log(`✅ Feature Mappings: ${stats.total_feature_mappings}`);
    console.log(`✅ History Entries: ${stats.total_history_entries}`);
    console.log('\nDatabase is ready for the seeksphere real estate demo!');
    
  } catch (error) {
    console.error('Error during data generation:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { main as generateData };