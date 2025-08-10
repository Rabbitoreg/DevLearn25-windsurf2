# AI Tool Match

This is a conference game built with Next.js for DevLearn 2025.

**Status**: Connected to Supabase database for live conference use. A gameful, live, multi-player simulation where attendees act as an AI agent and pick the right tool for the job.

## 🎮 Game Overview

- **Sprint Mode**: 5-minute continuous gameplay
- **Tool Selection**: Choose the best AI tool for each scenario
- **Real-time Scoring**: Accuracy + Speed scoring algorithm
- **Live Leaderboards**: Auto-refreshing rankings
- **Mobile-First**: Optimized for phones and tablets
- **Accessibility**: WCAG AA compliant with ARIA support

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new Supabase project
2. Run the SQL schema from `db/schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key

### 3. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Game Flow

### For Players
1. **Join**: Visit `/join` and enter a codename
2. **Play**: Navigate to `/play` for continuous scenarios
3. **Results**: Check `/me` for personal stats
4. **Leaderboard**: View `/leaderboard` for live rankings

### For Facilitators
1. **Admin Dashboard**: Visit `/admin` for projector-friendly view
2. **Live Metrics**: Monitor submissions/min, player count, scores
3. **QR Code**: Direct players to the join URL

## 🏗️ Architecture

### Tech Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - PostgreSQL database and real-time features
- **Zod** - Runtime type validation

### Project Structure
```
/content/           # JSON content packs (tools, scenarios)
├── deck.tools.json # AI tool definitions
└── scenarios.json  # Game scenarios

/src/app/           # Next.js app router
├── api/           # API route handlers
├── join/          # Player registration
├── play/          # Main game interface
├── me/            # Personal results
├── leaderboard/   # Live rankings
└── admin/         # Facilitator dashboard

/src/lib/          # Core utilities
├── types.ts       # TypeScript definitions
├── scoring.ts     # Game scoring logic
├── content.ts     # Content loading
└── supabase.ts    # Database client

/src/components/   # Reusable UI components
├── tool-card.tsx  # Tool selection cards
└── timer.tsx      # Game timer

/db/               # Database schema
└── schema.sql     # Supabase table definitions
```

## 🎯 Scoring Algorithm

The game uses a dual-factor scoring system:

### Accuracy Score (70% weight)
- Compares tool attributes to scenario targets
- Uses weighted differences across 10 attributes
- Range-aware normalization (1-5 scale, 1-4 for application)

### Speed Score (30% weight)
- Based on reaction time from scenario display to submission
- 25-second default timer with configurable limits
- Faster responses score higher

### Final Score
```
finalScore = 100 * (0.7 * accuracy + 0.3 * speed)
```

## 🎨 Content Management

### Tools (`/content/deck.tools.json`)
Each tool includes:
- **Attributes**: 10 ratings (ease, flexibility, collaboration, etc.)
- **Category**: no-code, low-code, vibe-code, code
- **Notes**: Description for players

### Scenarios (`/content/scenarios.json`)
Each scenario includes:
- **Targets**: Ideal attribute values
- **Weights**: Importance of each attribute
- **Timer**: Custom time limit (default 25s)

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

### Testing Locally
1. Start the development server
2. Open multiple browser tabs to simulate players
3. Use `/admin` to monitor the game session
4. Check `/leaderboard` for live updates

## 🎪 Conference Setup

### Pre-Session (T-10 minutes)
1. Project `/admin` dashboard on main screen
2. Display QR code pointing to `/join`
3. Test with a few early arrivals

### During Sprint (5 minutes)
1. Start timer countdown
2. Monitor submissions per minute
3. Watch live leaderboard updates
4. Prepare for debrief with heatmap data

### Post-Session
1. Show final leaderboard
2. Discuss attribute trade-offs
3. Highlight tool spectrum (no-code → code)

## 📊 Analytics & Insights

The admin dashboard provides:
- **Real-time metrics**: Submissions/min, active players
- **Score distribution**: Median accuracy and latency
- **Attribute heatmap**: Where players struggle most
- **Leaderboard**: Top performers and team average

## 🔒 Privacy & Security

- **No PII required**: Only codenames stored
- **Session-based**: Data isolated per conference
- **Rate limiting**: Prevents spam submissions
- **Row-level security**: Supabase policies enabled

## 📄 License

MIT License - Educational demo for conference use. Replace example tools/scenarios with your own content as needed.

## 🤝 Contributing

This project follows the specifications from the original README. To modify:
1. Update content in `/content/` directory
2. Adjust scoring weights in `/src/lib/scoring.ts`
3. Customize UI in `/src/components/` and `/src/app/`

For questions or improvements, please refer to the detailed specification in `AI_Tool_Match_README.md`.
