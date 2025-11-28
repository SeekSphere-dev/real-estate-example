# Data Generation Scripts

This directory contains scripts for generating sample real estate data for the Seeksphere demo application.

## Python Script (Recommended)

### Setup

1. Install Python dependencies:
```bash
pip install -r scripts/requirements.txt
```

2. Set up your database URL (one of the following):
```bash
# Option 1: Environment variable
export DATABASE_URL="postgresql://username:password@localhost:5432/seeksphere_real_estate"

# Option 2: Pass directly to script
python scripts/generate_data.py --database-url "postgresql://username:password@localhost:5432/seeksphere_real_estate"
```

### Usage

Basic usage:
```bash
python scripts/generate_data.py --database-url "postgresql://username:password@localhost:5432/seeksphere_real_estate"
```

Advanced options:
```bash
# Generate custom amounts of data
python scripts/generate_data.py \
  --database-url "postgresql://username:password@localhost:5432/seeksphere_real_estate" \
  --properties 10000 \
  --agents 200

# Force regeneration (clears existing data)
python scripts/generate_data.py \
  --database-url "postgresql://username:password@localhost:5432/seeksphere_real_estate" \
  --force
```

### Features

- **Data Existence Check**: Automatically detects if data already exists and prevents accidental regeneration
- **Force Mode**: Use `--force` flag to regenerate data even if it exists
- **Configurable Amounts**: Customize the number of properties and agents to generate
- **Independent**: Completely isolated from the Next.js application
- **Batch Processing**: Efficient batch insertions for large datasets
- **Error Handling**: Comprehensive error handling with transaction rollbacks

### Command Line Options

- `--database-url`: PostgreSQL database connection URL (required)
- `--force`: Force regeneration even if data exists
- `--properties`: Number of properties to generate (default: 20000)
- `--agents`: Number of agents to generate (default: 500)

## TypeScript Script (Legacy)

The original TypeScript script is still available at `scripts/generate-data.ts` but is deprecated in favor of the Python version for better isolation from the Next.js application.

## Database Schema

The scripts expect the database schema to be already created. Make sure to run your database migrations before generating data.
