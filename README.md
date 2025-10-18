# CongoAddressMapper

A comprehensive geospatial application designed to create a nationwide physical address and mapping system for the Democratic Republic of the Congo. This platform supports the DRC infrastructure modernization initiative, enabling critical services including telecommunications, postal tracking, emergency services, and financial technologies.

## Features

- **Dashboard**: Real-time statistics and overview of mapping progress
- **Interactive Map View**: Leaflet-based map with address markers and filtering
- **Addresses Management**: Browse, filter, and manage all mapped addresses
- **Analytics**: Comprehensive statistics and insights by province and data source
- **Multilingual Support**: English and French language support with session-based preferences
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Simple demo authentication for testing
- **DRC National Colors Theme**: Custom styling using the Democratic Republic of Congo's national colors (Blue, Red, Yellow)

## Multilingual Support

The application supports both **English** and **French** to accommodate the linguistic diversity of the Democratic Republic of Congo.

### Language Features

- **Two Languages**: Complete English and French translations throughout the application
- **Session-based Preference**: Language selection persists during the browser session and resets on new sessions
- **Default Language**: English is the default language on first visit
- **Easy Switching**: Toggle between languages using the language button in the sidebar footer (desktop) or header (mobile)
- **Comprehensive Coverage**: All UI elements, navigation, content, buttons, and messages are translated

### Translated Components

✅ **Navigation & Layout**
- Sidebar menu items
- User profile dropdown
- Authentication screens

✅ **Dashboard Pages**
- Home dashboard (stats, charts, quick actions)
- Interactive map (filters, search, legend)
- Addresses page (table, filters, pagination)
- Analytics page
- Settings page

✅ **Common Elements**
- Form labels and placeholders
- Button text
- Status indicators
- Error messages
- Success notifications

### Adding New Translations

To extend translations, edit `client/src/locales/translations.ts`:

```typescript
export const translations = {
  en: {
    "your.new.key": "English text",
  },
  fr: {
    "your.new.key": "Texte français",
  },
};
```

Then use in components:

```typescript
import { useLanguage } from "@/contexts/LanguageContext";

function MyComponent() {
  const { t } = useLanguage();
  return <div>{t("your.new.key")}</div>;
}
```

### Language Toggle

Users can switch languages at any time by clicking the language button (showing "English" or "Français") in the sidebar footer on desktop, or in the header on mobile devices.

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
- `npm run gen:images` - Pre-generate illustrative images for all training pages without video (uploads to Cloudinary)
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

## Recent Enhancements (Training System)

This release includes a comprehensive set of improvements to the training experience.

- **Dialog UX**
  - Centered by default; uses Radix centering until moved/resized.
  - Draggable by header, resizable with bottom-right grip.
  - Maximize/Restore button. New "Center" button and header double-click to re-center.
  - Keeps header/footer fixed with scrollable content; constrained within viewport and adjusts on window resize.
  - Files: `client/src/pages/TrainingPage.tsx`, `client/src/components/ui/dialog.tsx` (children forwarding fix).

- **Media**
  - Subtle b‑roll video background with blur/opacity.
  - If a page has no video, auto-generates an illustrative image (Recraft-first by default) and uploads to Cloudinary.
  - New DB table `trainingModuleImages` stores URLs and metadata; server endpoints to fetch/generate.
  - Files: `server/_core/images.ts`, `server/routers.ts`, `drizzle/schema.ts`, `client/src/pages/TrainingPage.tsx`.

- **Settings: Image Management & Visual Controls**
  - Training Media Settings: adjust background opacity, blur, and optional gradient overlay. Persisted in localStorage and applied live to training pages.
  - Training Image Management: regenerate all or per‑page module images with updated prompt style (DRC context). Shows confirmation and loading states.
  - Files: `client/src/pages/SettingsPage.tsx`, `client/src/lib/trainingSettings.ts`.

- **Progress**
  - Server-persisted progress per user/module with `trainingProgress` table and tRPC endpoints.
  - Endpoints are wrapped in try/catch to avoid 500s if DB isn’t available.
  - Files: `drizzle/schema.ts`, `server/db.ts`, `server/routers.ts`.

- **Narration (TTS)**
  - Auto-plays narration on page open (when permitted by browser policies).
  - Removed previous “preamble” so only the page text is narrated.
  - Added narration language toggle (EN/FR) in the Training dialog header; persists for the session and restarts narration when switched.
  - Files: `client/src/pages/TrainingPage.tsx`, `server/_core/tts.ts`.

- **Speech-to-Text (Whisper) Support**
  - Server utility for OpenAI Whisper (`whisper-1`) transcription with an explicit `language` parameter (e.g., `"fr"`).
  - Files: `server/_core/stt.ts`.
  - File: `server/_core/tts.ts`.

- **Content**
  - Training modules/pages sourced from JSON: `client/public/training/training.en.json` and `.fr.json`.
  - Client loads appropriate language and maps keywords to b‑roll videos when available.

- **Quizzes & Achievements**
  - Per‑page quizzes with instant result badges.
  - Progress integrates with server persistence; achievements surfaced inline.

- **Completion**
  - Completion banner and printable certificate dialog.

- **Accessibility**
  - ARIA labels on controls, keyboard focus outlines, color-safe backgrounds for media overlays.

### How to use

- Open a module; the dialog appears centered. Drag header to move, drag corner to resize, use Maximize/Restore, click "Center" (or double‑click header) to re-center.
- Pages with videos show dimmed video background; pages without videos will auto-generate and display an image.
- Adjust background opacity/blur/gradient in Settings → Training Media Settings.
- Regenerate images globally or per page in Settings → Training Image Management.
- Toggle narration language (EN/FR) in the Training dialog header; the selection persists during the session.

## Training Media: AI Images and Cloudinary

This project can automatically generate illustrative images for training modules/pages that do not have a b-roll video.

- **Provider options**: OpenAI Images (default) or Recraft
- **Storage**: Cloudinary (signed uploads)
- **Display**: If a page has no video, its background uses a dimmed/blurred image from Cloudinary
- **Persistence**: Saved in the `trainingModuleImages` table keyed by `moduleId` and `pageIndex`

### Environment variables

Add these to `.env` (see `.env.example` for comments):

```env
IMAGE_PROVIDER=auto              # auto (preferred) | recraft | openai

# OpenAI (if IMAGE_PROVIDER=openai or fallback from auto/recraft)
OPENAI_API_KEY=...
OPENAI_IMAGE_MODEL=gpt-image-1

# Recraft (if IMAGE_PROVIDER=recraft or chosen by auto)
RECRAFT_API_URL=...
RECRAFT_API_KEY=...

# Cloudinary (always required for uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=training
```

### Server endpoints

- `training.getPageImage({ moduleId, pageIndex })` → `{ url: string | null }`
- `training.generatePageImage({ moduleId, pageIndex, prompt })` → `{ url, provider }`
  - Optional: `force: true` to overwrite an existing image with a newly generated one.

Notes:
- Generation checks for an existing record and will not overwrite existing images.
- If DB is missing, `getPageImage` safely returns `{ url: null }`.

### Database

- `trainingModuleImages` — stores `moduleId`, `pageIndex`, `url`, `provider`, `prompt`, `publicId`, `createdAt`.
- `trainingProgress` — per-user module/page progress.

Run migrations to create these tables (see `drizzle/schema.ts`).

### Client behavior

- When a training page has no video, the UI tries to load an image via `getPageImage`.
- If none exists and the user is authenticated, a "Generate" button appears to invoke `generatePageImage` using a prompt derived from the page title/body.

### Troubleshooting

- **OpenAI 403 / missing b64**: Some accounts require org verification to use `gpt-image-1`. Use `IMAGE_PROVIDER=auto` or `recraft` with `RECRAFT_API_URL`/`RECRAFT_API_KEY` configured. The system prefers Recraft first in `auto` mode.
- **No DB table**: If images don’t persist, run `npm run db:push` to create `trainingModuleImages` and restart the server.
- **No background showing**: Hard-refresh the app after generation; ensure Cloudinary creds are correct.

## Narration Language Toggle (EN/FR)

- The Training dialog header includes EN/FR buttons for narration. Switching updates playback immediately and persists for the session.
- The TTS engine uses the selected language to request an appropriate voice and pronunciation (`server/_core/tts.ts`).
- If you also need transcription of audio samples, use the Whisper helper in `server/_core/stt.ts` which posts to `v1/audio/transcriptions` with `model=whisper-1` and `language` set to `"en"` or `"fr"`.

Example (Python-style semantics mirrored by our helper):

\`\`\`python
with open("french_audio.mp3", "rb") as audio_file:
    transcript = openai.Audio.transcribe(
        model="whisper-1",
        file=audio_file,
        language="fr"  # ISO 639-1
    )
print(transcript)
\`\`\`

Our server helper submits the same parameters using multipart form data.

---

## Training Roadmap and Open Suggestions

Below are improvements and ideas to consider. Items marked with ✅ are implemented.

- **Content source**
  - ✅ Load content from JSON files (`client/public/training/training.en.json`, `training.fr.json`)
  - Suggestion: Support Markdown or CMS-based content to enable non-developer edits

- **Media handling**
  - ✅ B‑roll videos as subtle background
  - ✅ AI image generation + Cloudinary uploads for pages without videos
  - Suggestion: Batch pre-generation script/endpoint to generate images for all modules at once
  - Suggestion: Add alt text generation and captions summary for accessibility

- **Narration / Audio**
  - ✅ Auto‑play narration on page open (subject to browser policies)
  - ✅ TTS voice validation and retry logic
  - Suggestion: Cache TTS audio per page/language and prefetch the next page
  - Suggestion: Optional one-time "Enable Audio" handshake for stricter autoplay policies

- **Progress and analytics**
  - ✅ Server‑persisted progress with database + local resume
  - Suggestion: `trainingEvents` table to track dwell time, quiz correctness rates, and drop-off
  - Suggestion: Throttle/batch `saveProgress` to reduce write frequency during fast navigation

- **Assessments**
  - ✅ Per‑page quizzes with pass/fail badges
  - Suggestion: Aggregate per‑module scoring and award achievements/badges upon mastery

- **Completion**
  - ✅ Completion banner and certificate dialog with print option
  - Suggestion: Export certificate as image/PDF and optional share link

- **Accessibility (a11y)**
  - ✅ ARIA labels on controls; keyboard focus outlines
  - Suggestion: Announce page change via `aria-live`; verify color contrast on all backgrounds; ensure no keyboard traps; add descriptive alt text for generated images

- **Performance**
  - Suggestion: Preload next page media (video/image/audio) and preconnect to Cloudinary
  - Suggestion: Lazy-load background media at reduced resolution with fade‑in

- **Dev experience**
  - Suggestion: Add tests for dialog navigation, autoplay fallback, and quiz logic
  - Suggestion: Admin page to review/regenerate training images, re-upload to Cloudinary, and set alt text
  - Suggestion: Bulk regeneration progress/queue with retries and concurrency controls
  - Suggestion: Role-based controls for regeneration and media settings

- **Audio & Accessibility**
  - Suggestion: Offline cache for TTS audio per page/language
  - Suggestion: Voice picker with preview and per-language preferred voices
  - Suggestion: Toggle “auto-narrate on page open” and announce page changes via `aria-live`
  - Suggestion: Provide downloadable textual transcripts per page (via Whisper) and ensure alt text for images
