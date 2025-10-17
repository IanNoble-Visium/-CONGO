# CongoAddressMapper

A comprehensive geospatial application designed to create a nationwide physical address and mapping system for the Democratic Republic of the Congo. This platform supports the DRC infrastructure modernization initiative, enabling critical services including telecommunications, postal tracking, emergency services, and financial technologies.

## Features

- **Dashboard**: Real-time statistics and overview of mapping progress
- **Interactive Map View**: Leaflet-based map with address markers and filtering
- **Addresses Management**: Browse, filter, and manage all mapped addresses
- **Analytics**: Comprehensive statistics and insights by province and data source
- **Database**: MySQL/TiDB with Drizzle ORM for type-safe database operations
- **Authentication**: Built-in OAuth integration with Manus

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **Mapping**: Leaflet, React-Leaflet
- **Build Tool**: Vite 7

## Prerequisites

- Node.js 18+ (recommended: Node.js 22)
- pnpm (will be installed automatically if not present)
- MySQL database (or TiDB for cloud deployment)

## Local Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DATABASE_URL=mysql://username:password@localhost:3306/congo_address_mapper

# Authentication (provided by Manus platform)
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Application
VITE_APP_ID=congo-address-mapper
VITE_APP_TITLE=CongoAddressMapper
VITE_APP_LOGO=https://your-logo-url.com/logo.png

# Owner (optional)
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name

# Built-in APIs (provided by Manus platform)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### 3. Set Up Database

Run database migrations:

```bash
pnpm db:push
```

### 4. Seed Sample Data

Populate the database with DRC provinces and sample addresses:

```bash
pnpm exec tsx scripts/seed-data.ts
```

This will insert:
- 26 DRC provinces with population and area data
- 12 sample addresses across major cities (Kinshasa, Lubumbashi, Goma, Bukavu, Kisangani)

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Database Schema

The application includes the following main tables:

- **provinces**: Administrative boundaries with mapping progress tracking
- **communes**: Second-level administrative divisions
- **quartiers**: Neighborhoods/districts
- **addresses**: Main address records with GPS coordinates and verification status
- **buildings**: Building footprints and metadata
- **photos**: Street signs and building images
- **surveySessions**: Field data collection sessions
- **aiProcessingJobs**: Batch processing jobs for AI-based address detection
- **changeLog**: Audit trail for address modifications

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm db:push` - Push database schema changes
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint

## Project Structure

```
congo-address-mapper/
├── client/               # Frontend React application
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── lib/         # Utilities and tRPC client
│       └── hooks/       # Custom React hooks
├── server/              # Backend Express + tRPC
│   ├── _core/          # Framework core (OAuth, context, etc.)
│   ├── db.ts           # Database query helpers
│   ├── routers.ts      # tRPC API routes
│   └── storage.ts      # S3 storage helpers
├── drizzle/            # Database schema and migrations
├── shared/             # Shared types and constants
└── scripts/            # Utility scripts
```

## Key Features Explained

### Interactive Map

The map view uses Leaflet to display addresses with color-coded markers based on verification status:
- 🟢 Green: Verified addresses
- 🟡 Yellow: Pending verification
- 🔵 Blue: Unverified addresses
- 🔴 Red: Disputed addresses

### Address Verification Workflow

1. Addresses are collected via manual survey, AI detection, crowdsourcing, or import
2. Each address has a confidence score (0-1)
3. Addresses can be verified by authenticated users
4. All changes are logged in the change log for audit purposes

### Analytics Dashboard

The analytics page provides:
- Overall statistics (total addresses, verification rate, coverage)
- Province-level breakdown with progress bars
- Data source distribution
- Key insights and trends

## Deployment

This application is designed to be deployed on the Manus platform, which provides:
- Automatic OAuth integration
- Built-in database provisioning
- S3 storage for photos and documents
- Analytics and monitoring

For manual deployment, ensure all environment variables are properly configured and the database is accessible.

## Support

For questions or issues related to the DRC infrastructure modernization project, please contact the Visium Technologies team.

## License

Proprietary - Visium Technologies

