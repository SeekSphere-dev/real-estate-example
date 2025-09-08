# Data Generation Script

This script generates realistic property data for the seeksphere real estate demo application.

## Overview

The script generates:
- **20,000+ properties** with realistic Canadian addresses, pricing, and specifications
- **500 real estate agents** with contact information and ratings
- **Property images** (3-8 per property) using placeholder image URLs
- **Property features** and amenities mappings
- **Property history** entries for price and status changes
- **Lookup data** for provinces, cities, neighborhoods, property types, etc.

## Prerequisites

1. **Database Setup**: Ensure PostgreSQL is running and the database schema has been created using `schema.sql`
2. **Environment Variables**: Set up your database connection in `.env` or environment variables:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=seeksphere_real_estate
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

## Usage

### Run the complete data generation:
```bash
npm run generate-data
```

### Or run directly with tsx:
```bash
npx tsx scripts/generate-data.ts
```

## What the Script Does

### Phase 1: Lookup Data
- Inserts Canadian provinces and major cities
- Creates neighborhoods for each city
- Sets up property types (House, Condo, Townhouse, etc.)
- Defines listing types (For Sale, For Rent, Lease)
- Creates property status options
- Populates property features and amenities

### Phase 2: Agents
- Generates 500 realistic real estate agents
- Includes names, contact info, license numbers
- Assigns agents to various real estate agencies
- Adds experience levels and ratings

### Phase 3: Properties
- Creates 20,000+ diverse property listings
- Generates realistic Canadian addresses with postal codes
- Sets appropriate pricing based on location and property type
- Includes detailed specifications (bedrooms, bathrooms, square footage)
- Assigns features and amenities to each property
- Creates 3-8 images per property

### Phase 4: Property History
- Generates price change and status change history
- Creates realistic timeline of property events
- Adds notes and tracking information

### Phase 5: Search Optimization
- Updates full-text search vectors for all properties
- Enables efficient text-based searching

### Phase 6: Database Indexes
- Creates performance indexes on commonly queried fields
- Optimizes search and filter operations

## Generated Data Characteristics

### Geographic Distribution
- Properties across all Canadian provinces
- Focus on major cities (Toronto, Vancouver, Montreal, Calgary, etc.)
- Realistic postal codes and coordinates

### Property Types
- **Houses**: 2-5 bedrooms, larger lots, higher prices
- **Condos**: 1-3 bedrooms, maintenance fees, building amenities
- **Townhouses**: 2-4 bedrooms, multi-level layouts
- **Apartments**: Rental focus, varied sizes
- **Studios**: Compact urban living spaces

### Pricing Strategy
- Location-based pricing (Toronto/Vancouver premium)
- Size-appropriate pricing per square foot
- Rental vs. purchase pricing logic
- Realistic maintenance fees and property taxes

### Features and Amenities
- Interior features (hardwood floors, granite countertops, etc.)
- Exterior features (balconies, patios, gardens)
- Building amenities (gym, concierge, rooftop terrace)
- Neighborhood features (transit access, schools, shopping)

## Performance Considerations

- **Batch Processing**: Inserts data in batches of 1,000 records
- **Transaction Safety**: Uses database transactions for data integrity
- **Memory Efficient**: Processes data in chunks to avoid memory issues
- **Progress Tracking**: Shows progress during generation
- **Index Creation**: Creates database indexes for optimal query performance

## Customization

You can modify the script constants at the top of the file:

```typescript
const TOTAL_PROPERTIES = 20000;  // Number of properties to generate
const BATCH_SIZE = 1000;         // Batch size for database operations
const AGENTS_COUNT = 500;        // Number of agents to generate
const NEIGHBORHOODS_PER_CITY = 5; // Neighborhoods per city
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check environment variables
- Ensure database exists and schema is loaded

### Memory Issues
- Reduce `TOTAL_PROPERTIES` or `BATCH_SIZE`
- Ensure sufficient system memory

### Performance Issues
- Run during off-peak hours
- Consider reducing batch size
- Monitor database performance

## Output

Upon successful completion, you'll see:
```
=== Data Generation Complete ===
✅ Properties: 20,000
✅ Agents: 500
✅ Property Images: 120,000
✅ Feature Mappings: 100,000
✅ History Entries: 15,000

Database is ready for the seeksphere real estate demo!
```

The generated data provides a realistic foundation for testing both traditional search functionality and seeksphere's advanced search capabilities.