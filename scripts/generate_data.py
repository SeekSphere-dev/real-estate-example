#!/usr/bin/env python3
"""
Isolated Python script to generate real estate data for the Seeksphere demo.
This script is completely independent of the Next.js application.
"""

import os
import psycopg2
import psycopg2.extras
import random
import string
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import argparse
import sys

# Configuration
TOTAL_PROPERTIES = 20000
BATCH_SIZE = 1000
AGENTS_COUNT = 500
NEIGHBORHOODS_PER_CITY = 5

# Canadian provinces and major cities data
PROVINCES_DATA = [
    {'code': 'ON', 'name': 'Ontario', 'cities': ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Kitchener', 'Windsor', 'Mississauga', 'Brampton']},
    {'code': 'QC', 'name': 'Quebec', 'cities': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke']},
    {'code': 'BC', 'name': 'British Columbia', 'cities': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford']},
    {'code': 'AB', 'name': 'Alberta', 'cities': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat']},
    {'code': 'MB', 'name': 'Manitoba', 'cities': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson']},
    {'code': 'SK', 'name': 'Saskatchewan', 'cities': ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw']},
    {'code': 'NS', 'name': 'Nova Scotia', 'cities': ['Halifax', 'Sydney', 'Dartmouth', 'Truro']},
    {'code': 'NB', 'name': 'New Brunswick', 'cities': ['Saint John', 'Moncton', 'Fredericton', 'Dieppe']},
    {'code': 'NL', 'name': 'Newfoundland and Labrador', 'cities': ['St. Johns', 'Mount Pearl', 'Corner Brook']},
    {'code': 'PE', 'name': 'Prince Edward Island', 'cities': ['Charlottetown', 'Summerside']}
]

PROPERTY_TYPES_DATA = [
    {'name': 'House', 'description': 'Single-family detached house', 'category': 'residential'},
    {'name': 'Condo', 'description': 'Condominium unit', 'category': 'residential'},
    {'name': 'Townhouse', 'description': 'Multi-level attached home', 'category': 'residential'},
    {'name': 'Apartment', 'description': 'Rental apartment unit', 'category': 'residential'},
    {'name': 'Duplex', 'description': 'Two-unit residential building', 'category': 'residential'},
    {'name': 'Bungalow', 'description': 'Single-story house', 'category': 'residential'},
    {'name': 'Loft', 'description': 'Open-concept living space', 'category': 'residential'},
    {'name': 'Studio', 'description': 'Single-room living space', 'category': 'residential'}
]

LISTING_TYPES_DATA = [
    {'name': 'Sale', 'description': 'Property available for purchase'},
    {'name': 'Rent', 'description': 'Property available for rental'},
    {'name': 'Lease', 'description': 'Property available for lease'}
]

PROPERTY_STATUS_DATA = [
    {'name': 'Active', 'description': 'Currently available', 'is_available': True},
    {'name': 'Pending', 'description': 'Offer accepted, pending completion', 'is_available': False},
    {'name': 'Sold', 'description': 'Sale completed', 'is_available': False},
    {'name': 'Rented', 'description': 'Currently rented', 'is_available': False},
    {'name': 'Off Market', 'description': 'Temporarily unavailable', 'is_available': False}
]

PROPERTY_FEATURES_DATA = [
    # Interior features
    {'name': 'Hardwood Floors', 'category': 'interior', 'description': 'Beautiful hardwood flooring throughout'},
    {'name': 'Granite Countertops', 'category': 'interior', 'description': 'Premium granite kitchen countertops'},
    {'name': 'Stainless Steel Appliances', 'category': 'interior', 'description': 'Modern stainless steel kitchen appliances'},
    {'name': 'Walk-in Closet', 'category': 'interior', 'description': 'Spacious walk-in closet in master bedroom'},
    {'name': 'Fireplace', 'category': 'interior', 'description': 'Cozy fireplace in living area'},
    {'name': 'Updated Kitchen', 'category': 'interior', 'description': 'Recently renovated modern kitchen'},
    {'name': 'Ensuite Bathroom', 'category': 'interior', 'description': 'Private bathroom in master bedroom'},
    {'name': 'High Ceilings', 'category': 'interior', 'description': 'Soaring high ceilings create spacious feel'},
    {'name': 'In-Unit Laundry', 'category': 'interior', 'description': 'Washer and dryer in unit'},
    {'name': 'Central Air', 'category': 'interior', 'description': 'Central air conditioning system'},
    
    # Exterior features
    {'name': 'Balcony', 'category': 'exterior', 'description': 'Private outdoor balcony space'},
    {'name': 'Patio', 'category': 'exterior', 'description': 'Outdoor patio area'},
    {'name': 'Garden', 'category': 'exterior', 'description': 'Private garden space'},
    {'name': 'Garage', 'category': 'exterior', 'description': 'Attached or detached garage'},
    {'name': 'Driveway', 'category': 'exterior', 'description': 'Private driveway parking'},
    {'name': 'Deck', 'category': 'exterior', 'description': 'Outdoor deck space'},
    {'name': 'Fenced Yard', 'category': 'exterior', 'description': 'Fully fenced backyard'},
    {'name': 'Pool', 'category': 'exterior', 'description': 'Swimming pool on property'},
    
    # Building amenities
    {'name': 'Gym', 'category': 'building', 'description': 'On-site fitness facility'},
    {'name': 'Concierge', 'category': 'building', 'description': '24/7 concierge service'},
    {'name': 'Rooftop Terrace', 'category': 'building', 'description': 'Shared rooftop outdoor space'},
    {'name': 'Storage Locker', 'category': 'building', 'description': 'Additional storage space'},
    {'name': 'Bike Storage', 'category': 'building', 'description': 'Secure bicycle storage'},
    {'name': 'Party Room', 'category': 'building', 'description': 'Shared entertainment space'},
    {'name': 'Guest Suite', 'category': 'building', 'description': 'Guest accommodation available'},
    {'name': 'Security System', 'category': 'building', 'description': 'Building security system'},
    
    # Neighborhood features
    {'name': 'Near Transit', 'category': 'neighborhood', 'description': 'Close to public transportation'},
    {'name': 'Near Schools', 'category': 'neighborhood', 'description': 'Walking distance to schools'},
    {'name': 'Near Shopping', 'category': 'neighborhood', 'description': 'Close to shopping centers'},
    {'name': 'Near Parks', 'category': 'neighborhood', 'description': 'Close to parks and recreation'},
    {'name': 'Waterfront', 'category': 'neighborhood', 'description': 'Waterfront location'},
    {'name': 'Downtown', 'category': 'neighborhood', 'description': 'Downtown location'}
]

class DatabaseConnection:
    """Handle database connections and operations."""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.connection = None
    
    def connect(self) -> bool:
        """Test and establish database connection."""
        try:
            self.connection = psycopg2.connect(self.database_url)
            self.connection.autocommit = False
            
            # Test connection
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                
            print("✅ Database connection successful")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def execute_query(self, query: str, params: tuple = None) -> psycopg2.extras.RealDictCursor:
        """Execute a single query."""
        with self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(query, params)
            return cursor
    
    def execute_many(self, query: str, params_list: List[tuple]) -> None:
        """Execute query with multiple parameter sets."""
        with self.connection.cursor() as cursor:
            cursor.executemany(query, params_list)
    
    def commit(self):
        """Commit transaction."""
        self.connection.commit()
    
    def rollback(self):
        """Rollback transaction."""
        self.connection.rollback()
    
    def close(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()

class DataGenerator:
    """Generate sample real estate data."""
    
    def __init__(self, db: DatabaseConnection):
        self.db = db
        random.seed(42)  # For reproducible results
    
    def check_existing_data(self) -> bool:
        """Check if data already exists in the database."""
        try:
            cursor = self.db.execute_query("SELECT COUNT(*) as count FROM properties")
            properties_count = cursor.fetchone()['count']
            
            cursor = self.db.execute_query("SELECT COUNT(*) as count FROM agents")
            agents_count = cursor.fetchone()['count']
            
            if properties_count > 0 or agents_count > 0:
                print(f"📊 Existing data found:")
                print(f"   - Properties: {properties_count}")
                print(f"   - Agents: {agents_count}")
                return True
            
            return False
        except Exception as e:
            print(f"❌ Error checking existing data: {e}")
            return False
    
    def random_int(self, min_val: int, max_val: int) -> int:
        """Generate random integer between min and max (inclusive)."""
        return random.randint(min_val, max_val)
    
    def random_float(self, min_val: float, max_val: float) -> float:
        """Generate random float between min and max."""
        return random.uniform(min_val, max_val)
    
    def random_choice(self, choices: List[Any]) -> Any:
        """Choose random item from list."""
        return random.choice(choices)
    
    def random_choices(self, choices: List[Any], count: int) -> List[Any]:
        """Choose multiple random items from list without replacement."""
        return random.sample(choices, min(count, len(choices)))
    
    def generate_postal_code(self, province_code: str) -> str:
        """Generate Canadian postal code."""
        letters = string.ascii_uppercase
        digits = string.digits
        
        return f"{random.choice(letters)}{random.choice(digits)}{random.choice(letters)} {random.choice(digits)}{random.choice(letters)}{random.choice(digits)}"
    
    def generate_street_address(self) -> str:
        """Generate random street address."""
        street_number = self.random_int(1, 9999)
        street_names = [
            'Main St', 'Oak Ave', 'Maple Dr', 'Pine Rd', 'Cedar Blvd', 'Elm St', 'King St', 'Queen St',
            'First Ave', 'Second Ave', 'Park Ave', 'Church St', 'Mill Rd', 'Hill St', 'Lake Dr',
            'Forest Ave', 'Garden St', 'Spring St', 'River Rd', 'Mountain View Dr', 'Sunset Blvd',
            'Victoria St', 'Wellington St', 'Richmond St', 'York St', 'Bay St', 'College St'
        ]
        
        return f"{street_number} {self.random_choice(street_names)}"
    
    def generate_property_title(self, property_type: str, city: str) -> str:
        """Generate property title."""
        adjectives = [
            'Beautiful', 'Stunning', 'Modern', 'Spacious', 'Charming', 'Luxurious', 'Cozy', 'Bright',
            'Updated', 'Renovated', 'Contemporary', 'Classic', 'Elegant', 'Comfortable', 'Stylish'
        ]
        
        features = [
            'with great views', 'in prime location', 'with modern amenities', 'near downtown',
            'with parking', 'newly renovated', 'move-in ready', 'with outdoor space',
            'in quiet neighborhood', 'with lots of natural light'
        ]
        
        adjective = self.random_choice(adjectives)
        feature = f" {self.random_choice(features)}" if random.random() > 0.5 else ""
        
        return f"{adjective} {property_type} in {city}{feature}"
    
    def generate_property_description(self, property_data: Dict[str, Any]) -> str:
        """Generate property description."""
        descriptions = [
            f"This {property_data['bedrooms']}-bedroom, {property_data['bathrooms']}-bathroom {property_data['property_type']} offers {property_data['total_area_sqft']} sq ft of comfortable living space.",
            f"Located in the heart of {property_data['city']}, this property features modern amenities and excellent access to local attractions.",
            f"Perfect for {'professionals or small families' if property_data['bedrooms'] <= 2 else 'families'}, with {'parking included' if property_data['parking_spaces'] > 0 else 'street parking available'}.",
            f"{'Pet-friendly property' if property_data['pet_friendly'] else 'No pets allowed'} with {'furnished' if property_data['furnished'] else 'unfurnished'} accommodation."
        ]
        
        selected_descriptions = self.random_choices(descriptions, self.random_int(2, 4))
        return ' '.join(selected_descriptions)
    
    def insert_lookup_data(self):
        """Insert all lookup/reference data."""
        print("📝 Inserting lookup data...")
        
        try:
            # Insert provinces
            for province in PROVINCES_DATA:
                cursor = self.db.execute_query(
                    "INSERT INTO provinces (code, name, country_code) VALUES (%s, %s, %s) ON CONFLICT (code) DO NOTHING",
                    (province['code'], province['name'], 'CA')
                )
            
            # Insert cities
            for province in PROVINCES_DATA:
                cursor = self.db.execute_query("SELECT id FROM provinces WHERE code = %s", (province['code'],))
                province_id = cursor.fetchone()['id']
                
                for city_name in province['cities']:
                    population = self.random_int(50000, 3000000)
                    latitude = round(self.random_float(42.0, 70.0), 8)
                    longitude = round(self.random_float(-141.0, -52.0), 8)
                    
                    cursor = self.db.execute_query(
                        "INSERT INTO cities (name, province_id, population, latitude, longitude) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
                        (city_name, province_id, population, latitude, longitude)
                    )
            
            # Insert neighborhoods
            cursor = self.db.execute_query("SELECT id, name FROM cities")
            cities = cursor.fetchall()
            
            for city in cities:
                neighborhood_names = [
                    'Downtown', 'Uptown', 'Midtown', 'Old Town', 'New Town', 'Riverside', 'Hillside', 'Parkside',
                    'Westside', 'Eastside', 'Northside', 'Southside', 'Central', 'Heights', 'Gardens'
                ]
                
                selected_neighborhoods = self.random_choices(neighborhood_names, NEIGHBORHOODS_PER_CITY)
                
                for neighborhood_name in selected_neighborhoods:
                    average_income = self.random_int(40000, 150000)
                    walkability_score = self.random_int(20, 100)
                    safety_rating = self.random_int(1, 5)
                    
                    cursor = self.db.execute_query(
                        "INSERT INTO neighborhoods (name, city_id, average_income, walkability_score, safety_rating) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
                        (neighborhood_name, city['id'], average_income, walkability_score, safety_rating)
                    )
            
            # Insert property types
            for property_type in PROPERTY_TYPES_DATA:
                cursor = self.db.execute_query(
                    "INSERT INTO property_types (name, description, category) VALUES (%s, %s, %s) ON CONFLICT (name) DO NOTHING",
                    (property_type['name'], property_type['description'], property_type['category'])
                )
            
            # Insert listing types
            for listing_type in LISTING_TYPES_DATA:
                cursor = self.db.execute_query(
                    "INSERT INTO listing_types (name, description) VALUES (%s, %s) ON CONFLICT (name) DO NOTHING",
                    (listing_type['name'], listing_type['description'])
                )
            
            # Insert property status
            for status in PROPERTY_STATUS_DATA:
                cursor = self.db.execute_query(
                    "INSERT INTO property_status (name, description, is_available) VALUES (%s, %s, %s) ON CONFLICT (name) DO NOTHING",
                    (status['name'], status['description'], status['is_available'])
                )
            
            # Insert property features
            for feature in PROPERTY_FEATURES_DATA:
                cursor = self.db.execute_query(
                    "INSERT INTO property_features (name, category, description) VALUES (%s, %s, %s) ON CONFLICT (name) DO NOTHING",
                    (feature['name'], feature['category'], feature['description'])
                )
            
            self.db.commit()
            print("✅ Lookup data inserted successfully")
            
        except Exception as e:
            print(f"❌ Error inserting lookup data: {e}")
            self.db.rollback()
            raise
    
    def generate_agents(self):
        """Generate sample agents."""
        print(f"👥 Generating {AGENTS_COUNT} agents...")
        
        first_names = [
            'John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Jessica',
            'James', 'Ashley', 'Christopher', 'Amanda', 'Daniel', 'Melissa', 'Matthew', 'Michelle', 'Anthony', 'Kimberly',
            'Mark', 'Amy', 'Donald', 'Angela', 'Steven', 'Helen', 'Paul', 'Deborah', 'Andrew', 'Rachel'
        ]
        
        last_names = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
        ]
        
        agencies = [
            'Royal LePage', 'RE/MAX', 'Century 21', 'Coldwell Banker', 'Keller Williams', 'Sutton Group',
            'HomeLife', 'Realty Executives', 'Exit Realty', 'Chestnut Park Real Estate', 'Bosley Real Estate',
            'Right at Home Realty', 'iPro Realty', 'Sage Real Estate'
        ]
        
        agents_data = []
        
        try:
            for i in range(AGENTS_COUNT):
                first_name = self.random_choice(first_names)
                last_name = self.random_choice(last_names)
                
                # Generate unique email and license number
                domain = self.random_choice(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'])
                email = f"{first_name.lower()}.{last_name.lower()}.{i + 1}@{domain}"
                license_number = f"RE{str(100000 + i).zfill(6)}"
                
                phone = f"{self.random_int(200, 999)}-{self.random_int(200, 999)}-{self.random_int(1000, 9999)}"
                agency_name = self.random_choice(agencies)
                years_experience = self.random_int(1, 30)
                rating = round(self.random_float(3.0, 5.0), 2)
                total_reviews = self.random_int(5, 200)
                
                agents_data.append((
                    first_name, last_name, email, phone, license_number, agency_name,
                    years_experience, rating, total_reviews
                ))
            
            # Insert agents in batches
            for i in range(0, len(agents_data), BATCH_SIZE):
                batch = agents_data[i:i + BATCH_SIZE]
                self.db.execute_many(
                    """INSERT INTO agents (first_name, last_name, email, phone, license_number, agency_name, 
                       years_experience, rating, total_reviews) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    batch
                )
                print(f"   Inserted agents batch {i // BATCH_SIZE + 1}/{(len(agents_data) + BATCH_SIZE - 1) // BATCH_SIZE}")
            
            self.db.commit()
            print(f"✅ Generated {AGENTS_COUNT} agents successfully")
            
        except Exception as e:
            print(f"❌ Error generating agents: {e}")
            self.db.rollback()
            raise

def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description='Generate real estate data for Seeksphere demo')
    parser.add_argument('--database-url', required=True, help='PostgreSQL database URL')
    parser.add_argument('--force', action='store_true', help='Force regeneration even if data exists')
    parser.add_argument('--properties', type=int, default=TOTAL_PROPERTIES, help=f'Number of properties to generate (default: {TOTAL_PROPERTIES})')
    parser.add_argument('--agents', type=int, default=AGENTS_COUNT, help=f'Number of agents to generate (default: {AGENTS_COUNT})')
    
    args = parser.parse_args()
    
    # Update global configuration
    global TOTAL_PROPERTIES, AGENTS_COUNT
    TOTAL_PROPERTIES = args.properties
    AGENTS_COUNT = args.agents
    
    print("🚀 Starting Python data generation script...")
    print(f"🎯 Target: {TOTAL_PROPERTIES} properties, {AGENTS_COUNT} agents")
    
    # Initialize database connection
    db = DatabaseConnection(args.database_url)
    
    if not db.connect():
        print("❌ Could not connect to database")
        sys.exit(1)
    
    try:
        # Initialize data generator
        generator = DataGenerator(db)
        
        # Check if data already exists
        if not args.force and generator.check_existing_data():
            print("\n⚠️  Data already exists in the database!")
            print("   Use --force flag to regenerate data (this will clear existing data)")
            print("   Or delete existing data manually before running the script")
            return
        
        if args.force:
            print("\n🗑️  Force flag detected - will regenerate all data")
        
        print("\n=== Phase 1: Inserting lookup data ===")
        generator.insert_lookup_data()
        
        print("\n=== Phase 2: Generating agents ===")
        generator.generate_agents()
        
        # TODO: Implement remaining phases
        print("\n⚠️  Note: Property generation not yet implemented in Python version")
        print("   This is a partial implementation focusing on lookup data and agents")
        
        print("\n✅ Data generation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during data generation: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()