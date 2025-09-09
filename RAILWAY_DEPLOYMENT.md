# Railway Deployment Guide

This guide will help you deploy the SeekSphere Real Estate application to Railway with PostgreSQL database.

## Prerequisites

1. [Railway account](https://railway.app)
2. [Railway CLI](https://docs.railway.app/develop/cli) (optional but recommended)
3. Git repository with your code

## Deployment Steps

### 1. Create a New Railway Project

#### Option A: Using Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select this repository

#### Option B: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to existing project (if you created one in dashboard)
railway link
```

### 2. Add PostgreSQL Database

1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. The `DATABASE_URL` environment variable will be automatically set

### 3. Configure Environment Variables

In your Railway project dashboard, go to the "Variables" tab and add:

```bash
# Required: Your Seeksphere API Key
SEEKSPHERE_API_KEY=your_actual_seeksphere_api_key_here

# Optional: Custom domain (Railway will auto-generate if not set)
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com

# The following are automatically set by Railway:
# DATABASE_URL (automatically provided by Railway PostgreSQL)
# RAILWAY_PUBLIC_DOMAIN (automatically set)
# NODE_ENV=production (automatically set)
```

### 4. Deploy the Application

#### Option A: Automatic Deployment (Recommended)
1. Push your code to the connected GitHub repository
2. Railway will automatically detect the `Dockerfile` and `railway.json`
3. The build and deployment will start automatically

#### Option B: Manual Deployment via CLI
```bash
# Deploy current directory
railway up

# Or deploy and follow logs
railway up --detach=false
```

### 5. Monitor Deployment

1. Watch the build logs in the Railway dashboard
2. The deployment process will:
   - Build the Docker image
   - Wait for PostgreSQL to be ready
   - Initialize the database schema
   - Generate sample data (20,000 properties)
   - Start the Next.js application

### 6. Access Your Application

Once deployed, your application will be available at:
- Railway-generated URL: `https://your-app-name.up.railway.app`
- Custom domain (if configured): `https://your-custom-domain.com`

## Database Initialization

The application automatically handles database setup:

1. **Schema Creation**: Runs `schema.sql` to create all tables
2. **Data Generation**: Generates 20,000 sample properties with:
   - 500 real estate agents
   - Canadian provinces and cities
   - Property types, features, and images
   - Realistic pricing and details

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | Auto-set by Railway |
| `SEEKSPHERE_API_KEY` | Your Seeksphere API key | ✅ | None |
| `NEXT_PUBLIC_APP_URL` | Public URL of your app | ❌ | Railway domain |
| `NODE_ENV` | Environment mode | ❌ | `production` |

## Troubleshooting

### Build Issues

1. **Docker build fails**: Check the build logs in Railway dashboard
2. **Dependencies issue**: Ensure `package.json` is up to date
3. **TypeScript errors**: Run `npm run build` locally first

### Database Issues

1. **Connection timeout**: Railway PostgreSQL may take a few minutes to initialize
2. **Schema errors**: Check if `schema.sql` is properly formatted
3. **Data generation fails**: Ensure sufficient memory allocation

### Application Issues

1. **App won't start**: Check environment variables are set correctly
2. **API errors**: Verify `SEEKSPHERE_API_KEY` is valid
3. **404 errors**: Ensure `NEXT_PUBLIC_APP_URL` matches your domain

### Checking Logs

```bash
# View application logs
railway logs

# Follow logs in real-time
railway logs --follow

# View specific service logs
railway logs --service=your-service-name
```

## Scaling and Performance

### Vertical Scaling
- Railway automatically handles scaling based on usage
- Monitor resource usage in the dashboard
- Upgrade plan if needed for higher limits

### Database Performance
- Railway PostgreSQL includes connection pooling
- Monitor query performance in the dashboard
- Consider adding database indexes for large datasets

### Caching
- Next.js static assets are automatically cached
- Consider adding Redis for session/data caching if needed

## Custom Domain Setup

1. Go to your Railway project dashboard
2. Click on your service → "Settings" → "Domains"
3. Click "Custom Domain"
4. Enter your domain name
5. Configure DNS records as shown
6. Update `NEXT_PUBLIC_APP_URL` environment variable

## Backup and Recovery

### Database Backups
- Railway automatically creates daily backups
- Access backups in PostgreSQL service dashboard
- Download backups for local development

### Code Backups
- Code is backed up in your Git repository
- Railway maintains deployment history
- Rollback to previous deployments if needed

## Cost Optimization

1. **Hobby Plan**: Free tier with limitations
2. **Pro Plan**: $5/month for production apps
3. **Monitor Usage**: Check resource usage regularly
4. **Sleep Mode**: Enable for development environments

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway GitHub](https://github.com/railwayapp/railway)

## Next Steps

After successful deployment:

1. Test all application features
2. Set up monitoring and alerts
3. Configure custom domain
4. Set up CI/CD workflows
5. Monitor performance and costs