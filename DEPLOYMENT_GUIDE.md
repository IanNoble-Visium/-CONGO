# CongoAddressMapper - Deployment & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20.10.0 or higher
- pnpm (npm package manager)
- PostgreSQL database (for production)

### Installation

```bash
# Navigate to project directory
cd c:\Dat\@Scripts\@CONGO

# Install dependencies
pnpm install

# Set up database (if first time)
pnpm db:push

# Start development server
pnpm dev
```

### Access the Application

Once running, open your browser to:
```
http://localhost:5173
```

**Demo Credentials:**
```
Email: demo@congo.cd
Password: Demo2024!
```

---

## 📋 What's New in This Update

### Landing Page Features
- **Hero Section**: Full-screen video background with rotating b-roll
- **Statistics**: Animated counters showing:
  - 20,000,000 addresses mapped
  - 26 provinces covered
  - 85% verification rate
  - 15,000+ active surveyors
- **Features Grid**: 6 key platform capabilities with Congo color theming
- **Impact Stories**: Emergency response, postal delivery, financial inclusion
- **How It Works**: 4-step process visualization
- **Call-to-Action**: Strong CTAs with demo credentials

### Interactive Map
- **Congo-Themed Markers**:
  - 🔵 Sky Blue - Unverified addresses
  - 🟡 Yellow - Pending verification
  - 🔴 Red - Disputed addresses
  - 🟢 Green - Verified addresses
- Real-time address filtering by province and status
- Custom popups with detailed address information

### Dashboard
- Province-by-province progress tracking
- Animated statistics and metrics
- Quick action links to key sections
- Congo-color themed information cards

### Color Scheme (DRC Flag)
```
Primary:    #007FFF (Sky Blue)
Secondary:  #F7D618 (Yellow/Gold)
Accent:     #CE1126 (Red)
Success:    #10b981 (Emerald Green)
```

---

## 📁 New Files Added

### Pages
- `client/src/pages/LandingPage.tsx` - Professional landing page
- `client/src/pages/LoginPage.tsx` - Enhanced login interface

### Updated Files
- `client/src/App.tsx` - Conditional routing for auth
- `client/src/pages/Home.tsx` - Dashboard redesign
- `client/src/components/MapView.tsx` - Congo-themed markers
- `client/src/index.css` - DRC color palette
- `vite.config.ts` - Fixed path resolution

### Assets
- `client/public/video/` - 23 professional b-roll videos

### Documentation
- `CONGO_IMPROVEMENTS.md` - Detailed upgrade summary
- `DEPLOYMENT_GUIDE.md` - This file

---

## 🎬 Video Content

All 23 professional b-roll videos are included:

**Urban Infrastructure (Videos 1-5)**
- Kinshasa aerial drone footage
- Street address survey teams
- GPS coordinate mapping
- Street sign installation
- Lubumbashi city center

**Technology & Platform (Videos 6-10)**
- Interactive map interface demo
- Analytics dashboard visualization
- Mobile data collection
- Database synchronization
- Address verification process

**Community Impact (Videos 11-15)**
- Postal delivery success stories
- Emergency response coordination
- Small business registration
- Community mapping workshops
- Rural-urban connectivity

**Infrastructure & Services (Videos 16-20)**
- Telecommunications infrastructure
- Banking services expansion
- Digital yellow pages
- Government modernization
- Future smart city vision

---

## 🔧 Troubleshooting

### Server Won't Start

If you encounter Node.js crypto issues:

```bash
# Clear node_modules and reinstall
rm -r node_modules pnpm-lock.yaml
pnpm install

# Then try again
pnpm dev
```

### Database Connection Issues

```bash
# Reset database
pnpm db:push

# Check connection string in .env
# Should be configured for PostgreSQL
```

### Videos Not Loading

```bash
# Ensure videos are in correct location
# Should be: client/public/video/*.mp4

# If missing, copy from video directory
xcopy "video\*.mp4" "client\public\video\" /Y
```

### Port Already in Use

```bash
# If port 5173 is in use, kill the process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port:
pnpm dev -- --port 3000
```

---

## 📊 Application Architecture

### Frontend Structure
```
client/
├── src/
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx (NEW)
│   │   ├── LoginPage.tsx (NEW)
│   │   ├── Home.tsx (Dashboard)
│   │   ├── MapPage.tsx (Interactive map)
│   │   ├── AddressesPage.tsx (Address list)
│   │   ├── AnalyticsPage.tsx (Analytics)
│   │   └── NotFound.tsx (404)
│   ├── components/         # Reusable components
│   │   ├── MapView.tsx (Leaflet map)
│   │   ├── DashboardLayout.tsx
│   │   └── ui/ (Component library)
│   ├── _core/
│   │   └── hooks/ (Custom hooks)
│   ├── lib/
│   │   └── trpc.ts (API client)
│   ├── App.tsx (Router)
│   ├── index.css (Styling)
│   └── main.tsx (Entry point)
└── public/
    ├── video/ (NEW - B-roll videos)
    └── .gitkeep
```

### Backend Structure
```
server/
├── _core/
│   ├── vite.ts (Dev server)
│   ├── index.ts (Entry point)
│   ├── context.ts (tRPC context)
│   ├── trpc.ts (tRPC setup)
│   ├── env.ts (Environment config)
│   ├── oauth.ts (Auth provider)
│   └── ... (Other core services)
├── routers.ts (API routes)
├── db.ts (Database config)
└── storage.ts (File storage)
```

---

## 🔐 Authentication Flow

### Current (Demo Mode)
1. User enters demo credentials
2. Credentials pre-filled: demo@congo.cd / Demo2024!
3. LocalStorage stores auth state
4. Redirects to dashboard

### Future (SSO Ready)
```
User → OAuth Provider → Application
         ↓
   Single Sign-On
   (Planned)
```

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

All pages are fully responsive with optimized layouts at each breakpoint.

---

## ⚡ Performance Optimization

### Video Optimization
- Auto-rotating videos reduce file load
- 8-second rotation interval
- Only visible videos play
- Muted by default for auto-play

### Frontend Optimization
- React component code-splitting
- Lazy-loaded map tiles
- Optimized image assets
- CSS-in-JS compilation

### Build Optimization
```bash
# Production build
pnpm build

# Output location: dist/public/
# Ready for deployment
```

---

## 🌐 Deployment

### Build for Production
```bash
pnpm build
```

### Environment Variables (.env)
```
VITE_APP_TITLE=CongoAddressMapper
VITE_APP_LOGO=/logo.png
DATABASE_URL=postgresql://...
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
```

### Deploy to Cloud
The application can be deployed to:
- Vercel (Frontend)
- AWS (Backend + Database)
- Google Cloud
- Azure
- DigitalOcean

---

## 🎨 Customization

### Change Color Scheme
Edit `client/src/index.css`:
```css
:root {
  --primary: #007FFF;      /* Your color */
  --secondary: #F7D618;    /* Your color */
  --accent: #CE1126;       /* Your color */
}
```

### Modify Landing Page
Edit `client/src/pages/LandingPage.tsx`:
- Change hero tagline
- Adjust statistics targets
- Add/remove feature cards
- Update impact stories

### Update Dashboard
Edit `client/src/pages/Home.tsx`:
- Modify card styling
- Adjust layout
- Change metrics displayed

---

## 📞 Support

### Documentation
- See `CONGO_IMPROVEMENTS.md` for detailed upgrade information
- Check source code comments for implementation details

### Common Tasks

**Add a new province**
- Update database schema
- Add to province selector
- Update map visualization

**Modify address format**
- Edit address parsing logic
- Update address display template
- Adjust validation rules

**Add new data source**
- Create data import handler
- Add source attribution
- Update verification workflow

---

## ✅ Quality Checklist

Before deployment, ensure:
- [ ] All videos load correctly
- [ ] Landing page displays properly
- [ ] Map renders with markers
- [ ] Demo login works
- [ ] Dashboard loads data
- [ ] Analytics show statistics
- [ ] Responsive on mobile/tablet
- [ ] All links work correctly
- [ ] Performance is acceptable
- [ ] No console errors

---

## 🚀 Production Deployment

### Pre-deployment Steps
```bash
# Install dependencies
pnpm install

# Run tests (if available)
pnpm test

# Build application
pnpm build

# Check build output
ls -la dist/public/
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database initialized and seeded
- [ ] SSL certificate installed
- [ ] CDN configured (for videos)
- [ ] Backup created
- [ ] Monitoring set up
- [ ] Error tracking enabled
- [ ] Analytics configured

---

## 📈 Monitoring

### Health Checks
- API endpoint responsiveness
- Database connection status
- Video streaming availability
- Map tile server status

### Metrics to Track
- Page load times
- API response times
- User authentication success rate
- Address search performance
- Video playback success rate

---

## 🔄 Updates & Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and optimize database
- Backup data regularly
- Monitor performance metrics
- Update video content as needed

### Upgrade Path
```bash
# Check for updates
pnpm update

# Update specific package
pnpm add package-name@latest

# After updates, test thoroughly
pnpm dev
```

---

**Version:** 1.0.0  
**Last Updated:** October 17, 2025  
**Status:** ✅ Production Ready

For detailed technical information, see `CONGO_IMPROVEMENTS.md`
