# CongoAddressMapper

A comprehensive geospatial application designed to create a nationwide physical address and mapping system for the Democratic Republic of the Congo. This platform supports the DRC infrastructure modernization initiative, enabling critical services including telecommunications, postal tracking, emergency services, and financial technologies.

## Features

- **Dashboard**: Real-time statistics and overview of mapping progress
- **Interactive Map View**: Leaflet-based map with address markers and filtering
- **Addresses Management**: Browse, filter, and manage all mapped addresses
- **Analytics**: Comprehensive statistics and insights by province and data source
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Simple demo authentication for testing
- **DRC National Colors Theme**: Custom styling using the Democratic Republic of Congo's national colors (Blue, Red, Yellow)

## Democratic Republic of Congo National Colors

This application incorporates the official national colors of the Democratic Republic of the Congo (DRC) in its design theme:

### Color Palette

| Color | Hex Code | RGB | Symbolism |
|-------|----------|-----|-----------|
| **Blue** | `#0085CA` | `rgb(0, 133, 202)` | Peace and hope |
| **Red** | `#EF3340` | `rgb(239, 51, 64)` | Blood of martyrs and sacrifice for independence |
| **Yellow** | `#FFD100` | `rgb(255, 209, 0)` | Nation's wealth and prosperity |

These colors are used throughout the application:
- **Primary elements**: Buttons, links, and interactive components
- **Status indicators**: Verification status markers on the map
- **Charts and graphs**: Data visualization elements in analytics
- **Branding**: Logo, headers, and accent elements

The color scheme reflects the DRC's national identity while maintaining accessibility and visual hierarchy in the user interface.

**Current Implementation Status: ✅ Already Active**

The application currently uses the DRC national colors throughout:
- **Primary actions**: Democratic Republic of Congo blue (#0085CA)
- **Secondary elements**: DRC yellow (#FFD100) for highlights and accents
- **Status indicators**: DRC red (#EF3340) for destructive actions and alerts
- **Data visualization**: All charts use the DRC color palette
- **Interactive elements**: Buttons, links, and form controls use DRC colors

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11
- **Database**: PostgreSQL with Drizzle ORM
- **Mapping**: Leaflet, React-Leaflet
- **Build Tool**: Vite 6

## Prerequisites

- Node.js 20+ (recommended: Node.js 20.10.0 or higher)
- pnpm (will be installed automatically if not present)
- PostgreSQL database (or Neon PostgreSQL for cloud deployment)

## Local Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/congo_address_mapper

# Application
VITE_APP_ID=congo-address-mapper
VITE_APP_TITLE=CongoAddressMapper
VITE_APP_LOGO=https://your-logo-url.com/logo.png

# Infrastructure (server-only)
PORT=3000
```

**Demo Authentication:**
- Email: `demo@congo.cd`
- Password: `Demo2024!`

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

The application is successfully deployed on Vercel and supports both development and production environments.

**Production Deployment (Vercel):**

✅ **Currently Active** - The application is deployed at `https://congo.visiumtechnologies.com`

**Deployment Features:**
- **Serverless API**: tRPC endpoints served via Vercel's serverless functions
- **Static Assets**: Optimized client bundle with gzip compression
- **Database**: PostgreSQL integration with Drizzle ORM
- **CDN**: Fast global content delivery via Vercel's edge network

**Environment Configuration:**
- Database connection configured for production PostgreSQL
- API endpoints properly routed through `/api/trpc/*`
- Static assets served from optimized build

**Development Deployment:**

1. **Local Development**:
   ```bash
   pnpm dev
   ```
   - Hot reload with Vite
   - Local PostgreSQL database
   - Development API server on `http://localhost:3000`

2. **Production Build**:
   ```bash
   pnpm build
   ```
   - Optimized client bundle in `dist/public/`
   - Server bundle in `dist/index.js`
   - Ready for Vercel deployment

**Note:** The current authentication system uses a static demo user for testing purposes. For production deployment, implement proper OAuth or JWT-based authentication.

## Support

For questions or issues related to the DRC infrastructure modernization project, please contact the Visium Technologies team.

## License

Proprietary - Visium Technologies

