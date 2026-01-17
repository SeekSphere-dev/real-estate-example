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
        cursor = self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(query, params)
        return cursor
    
    def execute_query_returning(self, query: str, params: tuple = None) -> Any:
        """Execute a query with RETURNING clause and return the result."""
        with self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(query, params)
            result = cursor.fetchone()
            return result
    
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

    def generate_properties(self, count: int):
        """Generate sample properties."""
        print(f"🏠 Generating {count} properties...")
        
        try:
            # Fetch lookup data
            cursor = self.db.execute_query("SELECT id FROM property_types")
            property_type_ids = [row['id'] for row in cursor.fetchall()]
            
            cursor = self.db.execute_query("SELECT id FROM listing_types")
            listing_type_ids = [row['id'] for row in cursor.fetchall()]
            
            cursor = self.db.execute_query("SELECT id FROM property_status")
            status_ids = [row['id'] for row in cursor.fetchall()]
            
            cursor = self.db.execute_query("SELECT id FROM agents")
            agent_ids = [row['id'] for row in cursor.fetchall()]
            if not agent_ids:
                agent_ids = [None]
            
            cursor = self.db.execute_query("""
                SELECT c.id as city_id, c.name as city_name, c.province_id, 
                       p.code as province_code, n.id as neighborhood_id
                FROM cities c
                JOIN provinces p ON c.province_id = p.id
                LEFT JOIN neighborhoods n ON n.city_id = c.id
            """)
            locations = cursor.fetchall()
            
            if not locations:
                print("❌ No cities found. Please run lookup data insertion first.")
                return
            
            cursor = self.db.execute_query("SELECT id FROM property_features")
            feature_ids = [row['id'] for row in cursor.fetchall()]
            
            # Property type configurations for realistic data
            property_configs = {
                'House': {'bedrooms_range': (2, 5), 'bathrooms_range': (1.5, 4.5), 'sqft_range': (1200, 3500), 'price_range': (300000, 1200000)},
                'Condo': {'bedrooms_range': (1, 3), 'bathrooms_range': (1.0, 2.5), 'sqft_range': (600, 1800), 'price_range': (200000, 800000)},
                'Townhouse': {'bedrooms_range': (2, 4), 'bathrooms_range': (1.5, 3.5), 'sqft_range': (1000, 2500), 'price_range': (250000, 900000)},
                'Apartment': {'bedrooms_range': (1, 2), 'bathrooms_range': (1.0, 2.0), 'sqft_range': (500, 1200), 'price_range': (150000, 500000)},
                'Duplex': {'bedrooms_range': (3, 6), 'bathrooms_range': (2.0, 4.0), 'sqft_range': (1500, 3000), 'price_range': (400000, 1000000)},
                'Bungalow': {'bedrooms_range': (2, 4), 'bathrooms_range': (1.5, 3.0), 'sqft_range': (1000, 2500), 'price_range': (300000, 900000)},
                'Loft': {'bedrooms_range': (1, 2), 'bathrooms_range': (1.0, 2.0), 'sqft_range': (800, 2000), 'price_range': (250000, 700000)},
                'Studio': {'bedrooms_range': (0, 1), 'bathrooms_range': (1.0, 1.5), 'sqft_range': (400, 800), 'price_range': (150000, 400000)}
            }
            
            heating_types = ['Forced Air', 'Radiant', 'Baseboard', 'Heat Pump', 'Electric', 'Gas', 'Oil']
            cooling_types = ['Central Air', 'Window Units', 'None', 'Heat Pump']
            parking_types = ['Garage', 'Driveway', 'Street', 'Underground', 'Surface Lot']
            utilities = ['Electricity', 'Water', 'Heat', 'Internet', 'Cable']
            
            properties_data = []
            property_features_data = []
            property_images_data = []
            
            # Generate MLS numbers
            mls_numbers_used = set()
            
            for i in range(count):
                # Select random location
                location = self.random_choice(locations)
                city_id = location['city_id']
                province_id = location['province_id']
                province_code = location['province_code']
                neighborhood_id = location['neighborhood_id'] if location['neighborhood_id'] else None
                city_name = location['city_name']
                
                # Select property type and get configuration
                property_type_id = self.random_choice(property_type_ids)
                cursor = self.db.execute_query("SELECT name FROM property_types WHERE id = %s", (property_type_id,))
                property_type_name = cursor.fetchone()['name']
                
                config = property_configs.get(property_type_name, property_configs['House'])
                
                # Generate property details
                bedrooms = self.random_int(*config['bedrooms_range'])
                bathrooms = round(self.random_float(*config['bathrooms_range']), 1)
                half_bathrooms = self.random_int(0, 2) if bedrooms >= 2 else 0
                total_area_sqft = self.random_int(*config['sqft_range'])
                lot_size_sqft = None
                
                # Lot size only for houses, townhouses, duplexes, bungalows
                if property_type_name in ['House', 'Townhouse', 'Duplex', 'Bungalow']:
                    lot_size_sqft = self.random_int(total_area_sqft, total_area_sqft * 3)
                
                floors = self.random_int(1, 3) if property_type_name != 'Bungalow' else 1
                
                # Generate pricing based on listing type
                listing_type_id = self.random_choice(listing_type_ids)
                cursor = self.db.execute_query("SELECT name FROM listing_types WHERE id = %s", (listing_type_id,))
                listing_type_name = cursor.fetchone()['name']
                
                base_price = self.random_float(*config['price_range'])
                list_price = None
                monthly_rent = None
                price_per_sqft = None
                
                if listing_type_name == 'Sale':
                    list_price = round(base_price, 2)
                    price_per_sqft = round(list_price / total_area_sqft, 2)
                elif listing_type_name in ['Rent', 'Lease']:
                    monthly_rent = round(base_price / 200, 2)  # Rough conversion
                    list_price = None
                
                # Maintenance fee for condos and some apartments
                maintenance_fee = None
                if property_type_name in ['Condo', 'Apartment'] and random.random() > 0.3:
                    maintenance_fee = round(self.random_float(200, 800), 2)
                
                # Property taxes (roughly 1-2% of property value annually)
                property_taxes_annual = None
                if list_price:
                    property_taxes_annual = round(list_price * self.random_float(0.01, 0.02), 2)
                
                # Status - mostly active, some pending/sold/rented
                status_id = self.random_choice(status_ids)
                if random.random() < 0.7:  # 70% active
                    cursor = self.db.execute_query("SELECT id FROM property_status WHERE name = 'Active'")
                    status_id = cursor.fetchone()['id']
                
                # Agent assignment (80% have agents)
                agent_id = self.random_choice(agent_ids) if random.random() < 0.8 else None
                
                # Generate address
                street_address = self.generate_street_address()
                unit_number = None
                if property_type_name in ['Condo', 'Apartment', 'Loft', 'Studio']:
                    if random.random() > 0.5:
                        unit_number = f"{self.random_int(100, 999)}{self.random_choice(['A', 'B', 'C', ''])}"
                
                postal_code = self.generate_postal_code(province_code)
                
                # Generate coordinates (roughly in Canada)
                latitude = round(self.random_float(42.0, 70.0), 8)
                longitude = round(self.random_float(-141.0, -52.0), 8)
                
                # Generate title and description
                title = self.generate_property_title(property_type_name, city_name)
                year_built = self.random_int(1950, 2023)
                
                property_data = {
                    'bedrooms': bedrooms,
                    'bathrooms': bathrooms,
                    'property_type': property_type_name,
                    'city': city_name,
                    'total_area_sqft': total_area_sqft,
                    'parking_spaces': self.random_int(0, 3) if property_type_name != 'Studio' else 0,
                    'pet_friendly': random.random() > 0.4,
                    'furnished': random.random() > 0.7
                }
                description = self.generate_property_description(property_data)
                
                # Generate dates
                listed_date = (datetime.now() - timedelta(days=self.random_int(0, 365))).date()
                available_date = None
                sold_date = None
                
                if listing_type_name in ['Rent', 'Lease']:
                    available_date = (datetime.now() + timedelta(days=self.random_int(0, 90))).date()
                
                # Generate MLS number (optional, 70% have one)
                mls_number = None
                if random.random() < 0.7:
                    mls_base = f"{province_code}{self.random_int(100000, 999999)}"
                    while mls_base in mls_numbers_used:
                        mls_base = f"{province_code}{self.random_int(100000, 999999)}"
                    mls_numbers_used.add(mls_base)
                    mls_number = mls_base
                
                # Other details
                heating_type = self.random_choice(heating_types)
                cooling_type = self.random_choice(cooling_types)
                parking_type = self.random_choice(parking_types) if property_data['parking_spaces'] > 0 else None
                parking_spaces = property_data['parking_spaces']
                
                # Utilities included (for rentals)
                utilities_included = None
                if listing_type_name in ['Rent', 'Lease']:
                    included = self.random_choices(utilities, self.random_int(0, 3))
                    utilities_included = included if included else None
                
                # Insert property (using UUID default from database)
                result = self.db.execute_query_returning("""
                    INSERT INTO properties (
                        mls_number, property_type_id, listing_type_id, status_id, agent_id,
                        street_address, unit_number, neighborhood_id, city_id, province_id, postal_code,
                        latitude, longitude, title, description, year_built,
                        total_area_sqft, lot_size_sqft, bedrooms, bathrooms, half_bathrooms, floors,
                        list_price, price_per_sqft, monthly_rent, maintenance_fee, property_taxes_annual,
                        heating_type, cooling_type, utilities_included,
                        parking_spaces, parking_type, pet_friendly, furnished,
                        listed_date, available_date, sold_date
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING id
                """, (
                    mls_number, property_type_id, listing_type_id, status_id, agent_id,
                    street_address, unit_number, neighborhood_id, city_id, province_id, postal_code,
                    latitude, longitude, title, description, year_built,
                    total_area_sqft, lot_size_sqft, bedrooms, bathrooms, half_bathrooms, floors,
                    list_price, price_per_sqft, monthly_rent, maintenance_fee, property_taxes_annual,
                    heating_type, cooling_type, utilities_included,
                    parking_spaces, parking_type, property_data['pet_friendly'], property_data['furnished'],
                    listed_date, available_date, sold_date
                ))
                
                property_id = result['id']
                
                # Generate property features (3-8 features per property)
                num_features = self.random_int(3, min(8, len(feature_ids)))
                selected_features = self.random_choices(feature_ids, num_features)
                for feature_id in selected_features:
                    property_features_data.append((property_id, feature_id))
                
                # Generate property images (1-5 images, at least one primary)
                num_images = self.random_int(1, 5)
                image_types = ['exterior', 'interior', 'floor_plan', 'kitchen', 'bathroom', 'bedroom', 'living_room']
                
                for img_idx in range(num_images):
                    is_primary = (img_idx == 0)
                    image_type = self.random_choice(image_types) if not is_primary else 'exterior'
                    # Use placeholder image service
                    image_url = f"https://picsum.photos/800/600?random={i * 100 + img_idx}"
                    caption = f"{property_type_name} - {image_type.replace('_', ' ').title()}"
                    
                    property_images_data.append((
                        property_id, image_url, image_type, caption, img_idx, is_primary
                    ))
                
                # Progress update
                if (i + 1) % 100 == 0:
                    print(f"   Generated {i + 1}/{count} properties...")
            
            # Insert property features in batches
            if property_features_data:
                print("   Inserting property features...")
                for i in range(0, len(property_features_data), BATCH_SIZE):
                    batch = property_features_data[i:i + BATCH_SIZE]
                    self.db.execute_many(
                        "INSERT INTO property_feature_mappings (property_id, feature_id) VALUES (%s, %s)",
                        batch
                    )
            
            # Insert property images in batches
            if property_images_data:
                print("   Inserting property images...")
                for i in range(0, len(property_images_data), BATCH_SIZE):
                    batch = property_images_data[i:i + BATCH_SIZE]
                    self.db.execute_many(
                        """INSERT INTO property_images 
                           (property_id, image_url, image_type, caption, display_order, is_primary) 
                           VALUES (%s, %s, %s, %s, %s, %s)""",
                        batch
                    )
            
            self.db.commit()
            print(f"✅ Generated {count} properties successfully")
            
            # Populate search_table
            print("   Populating search_table...")
            self.populate_search_table()
            print("✅ Search table populated successfully")
            
        except Exception as e:
            print(f"❌ Error generating properties: {e}")
            import traceback
            traceback.print_exc()
            self.db.rollback()
            raise

    def populate_search_table(self):
        """Populate search_table with denormalized property data."""
        try:
            # First, clear existing data from search_table
            cursor = self.db.execute_query("DELETE FROM search_table")
            
            # Insert all properties with joined data into search_table
            # Aggregate property features into arrays
            insert_query = """
                INSERT INTO search_table (
                    id, mls_number, street_address, unit_number, title, description, year_built,
                    total_area_sqft, lot_size_sqft, bedrooms, bathrooms, half_bathrooms, floors,
                    list_price, price_per_sqft, monthly_rent, maintenance_fee, property_taxes_annual,
                    heating_type, cooling_type, utilities_included,
                    parking_spaces, parking_type, pet_friendly, furnished,
                    listed_date, available_date, sold_date, last_updated, created_at,
                    latitude, longitude,
                    province_code, province_name, province_country_code,
                    city_name, city_population, city_latitude, city_longitude,
                    neighborhood_name, neighborhood_average_income, neighborhood_walkability_score, neighborhood_safety_rating,
                    property_type_name, property_type_description, property_type_category,
                    listing_type_name, listing_type_description,
                    property_status_name, property_status_description, property_status_is_available,
                    agent_first_name, agent_last_name, agent_email, agent_phone, agent_license_number,
                    agent_agency_name, agent_years_experience, agent_rating, agent_total_reviews,
                    property_features_names, property_features_categories, property_features_descriptions
                )
                SELECT 
                    p.id,
                    p.mls_number,
                    p.street_address,
                    p.unit_number,
                    p.title,
                    p.description,
                    p.year_built,
                    p.total_area_sqft,
                    p.lot_size_sqft,
                    p.bedrooms,
                    p.bathrooms,
                    p.half_bathrooms,
                    p.floors,
                    p.list_price,
                    p.price_per_sqft,
                    p.monthly_rent,
                    p.maintenance_fee,
                    p.property_taxes_annual,
                    p.heating_type,
                    p.cooling_type,
                    p.utilities_included,
                    p.parking_spaces,
                    p.parking_type,
                    p.pet_friendly,
                    p.furnished,
                    p.listed_date,
                    p.available_date,
                    p.sold_date,
                    p.last_updated,
                    p.created_at,
                    p.latitude,
                    p.longitude,
                    prov.code AS province_code,
                    prov.name AS province_name,
                    prov.country_code AS province_country_code,
                    c.name AS city_name,
                    c.population AS city_population,
                    c.latitude AS city_latitude,
                    c.longitude AS city_longitude,
                    n.name AS neighborhood_name,
                    n.average_income AS neighborhood_average_income,
                    n.walkability_score AS neighborhood_walkability_score,
                    n.safety_rating AS neighborhood_safety_rating,
                    pt.name AS property_type_name,
                    pt.description AS property_type_description,
                    pt.category AS property_type_category,
                    lt.name AS listing_type_name,
                    lt.description AS listing_type_description,
                    ps.name AS property_status_name,
                    ps.description AS property_status_description,
                    ps.is_available AS property_status_is_available,
                    a.first_name AS agent_first_name,
                    a.last_name AS agent_last_name,
                    a.email AS agent_email,
                    a.phone AS agent_phone,
                    a.license_number AS agent_license_number,
                    a.agency_name AS agent_agency_name,
                    a.years_experience AS agent_years_experience,
                    a.rating AS agent_rating,
                    a.total_reviews AS agent_total_reviews,
                    COALESCE(
                        ARRAY_AGG(DISTINCT pf.name) FILTER (WHERE pf.name IS NOT NULL),
                        ARRAY[]::TEXT[]
                    ) AS property_features_names,
                    COALESCE(
                        ARRAY_AGG(DISTINCT pf.category) FILTER (WHERE pf.category IS NOT NULL),
                        ARRAY[]::TEXT[]
                    ) AS property_features_categories,
                    COALESCE(
                        ARRAY_AGG(DISTINCT pf.description) FILTER (WHERE pf.description IS NOT NULL),
                        ARRAY[]::TEXT[]
                    ) AS property_features_descriptions
                FROM properties p
                LEFT JOIN provinces prov ON p.province_id = prov.id
                LEFT JOIN cities c ON p.city_id = c.id
                LEFT JOIN neighborhoods n ON p.neighborhood_id = n.id
                LEFT JOIN property_types pt ON p.property_type_id = pt.id
                LEFT JOIN listing_types lt ON p.listing_type_id = lt.id
                LEFT JOIN property_status ps ON p.status_id = ps.id
                LEFT JOIN agents a ON p.agent_id = a.id
                LEFT JOIN property_feature_mappings pfm ON p.id = pfm.property_id
                LEFT JOIN property_features pf ON pfm.feature_id = pf.id
                GROUP BY 
                    p.id, p.mls_number, p.street_address, p.unit_number, p.title, p.description, p.year_built,
                    p.total_area_sqft, p.lot_size_sqft, p.bedrooms, p.bathrooms, p.half_bathrooms, p.floors,
                    p.list_price, p.price_per_sqft, p.monthly_rent, p.maintenance_fee, p.property_taxes_annual,
                    p.heating_type, p.cooling_type, p.utilities_included,
                    p.parking_spaces, p.parking_type, p.pet_friendly, p.furnished,
                    p.listed_date, p.available_date, p.sold_date, p.last_updated, p.created_at,
                    p.latitude, p.longitude,
                    prov.code, prov.name, prov.country_code,
                    c.name, c.population, c.latitude, c.longitude,
                    n.name, n.average_income, n.walkability_score, n.safety_rating,
                    pt.name, pt.description, pt.category,
                    lt.name, lt.description,
                    ps.name, ps.description, ps.is_available,
                    a.first_name, a.last_name, a.email, a.phone, a.license_number,
                    a.agency_name, a.years_experience, a.rating, a.total_reviews
            """
            
            cursor = self.db.execute_query(insert_query)
            self.db.commit()
            
        except Exception as e:
            print(f"❌ Error populating search_table: {e}")
            import traceback
            traceback.print_exc()
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
        
        print("\n=== Phase 3: Generating properties ===")
        generator.generate_properties(TOTAL_PROPERTIES)
        
        print("\n✅ Data generation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during data generation: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()