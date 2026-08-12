# ⚡ TRAK.FIT
### The Elite Standard in Performance Tracking

TRAK.FIT is a data-driven cockpit for your training. Designed for athletes who demand precision, TRAK.FIT combines high-fidelity aesthetics with surgical analytics to turn every rep into actionable intelligence.

---<img width="1920" height="1440" alt="shot" src="https://github.com/user-attachments/assets/b3a3b8fc-3dd1-47f2-afb1-65fb47a7735f" />


## 💎 The Athlete's Toolkit

### 🏋️‍♂️ Live Session Logging & Intelligence
- **Gym-Floor Optimized UX**: A fast, minimalist, high-contrast interface built specifically for quick data entry between sets.
- **Plateau Detection**: Intelligent alerts that trigger during a workout if no progress (in weight or reps) has been detected for a specific exercise over the past 3 weeks.
- **Active Timers**: Real-time tracking of overall workout duration (start/stop) alongside integrated, customizable rest timers.
- **Smart History**: Automatically references past PRs and the last logged weights during a session so you know exactly what numbers to beat.

### 🏆 Advanced Personal Record (PR) Engine
- **Atomic PR Tracking**: Materialized records that track two distinct types of PRs:
  - **Weight PR**: Lifting a heavier absolute weight.
  - **Rep PR**: Lifting the current max weight, but for more reps.
- **Instant Visual Feedback**: Triggers a "Workout Celebration" using Framer Motion animations immediately upon hitting a new PR.

### 🏗️ Dynamic Cycle Architect (Plan Designer)
- **Custom Program Builder**: A dedicated tool to architect entire multi-week training blocks from scratch.
- **Custom Splits**: Drag-and-drop interface to define training days versus rest days.
- **Warmup Calculator**: Automatically generates required warmup sets based on your target working weight.

### 📊 Post-Workout Summaries & History
- **Detailed Session Debrief**: Complete a workout to see a comprehensive summary showing exercises performed, estimated calories burned, and updated **1RM (One Rep Max)** calculations.
- **Workout History Page**: A scannable logbook serving as the source of truth for all past workouts, allowing you to review exact sets, reps, and weights.

### 🧬 Deep Analytics & Muscle Diagnostics
- **Muscle Targeting Breakdown**: Highly detailed analytics for individual muscle groups, including volume tracking, activity heatmaps, and identification of your top exercises per muscle.
- **Exercise Timelines**: Pro-grade Recharts visualizations showing volume analysis and estimated 1RM trends over time for individual lifts.
- **Bodyweight Correlation**: Maps bodyweight fluctuations against training volume to track relative strength.

### 🔥 Gamification & Consistency Metrics
- **Streak Maintenance**: Systems to track and display active workout streaks, motivating you to maintain consistency.
- **Interactive Dashboard Widgets**: Premium UI sidebars showing stats like "Most Trained Muscle Group" and "Weekly Volume Comparisons."

### 🛡️ Secure, Fast, Reliable
- **NextAuth.js Security**: Secure, session-based authentication using MongoDB adapter.
- **Server Actions**: Optimized data mutations using Next.js Server Actions for a "zero-flash" experience.

---

## 🛠 Tech Stack
- **Engine:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) (with connection pooling)
- **Security:** [NextAuth.js](https://next-auth.js.org/)
- **Visuals:** [Recharts](https://recharts.org/) & [Lucide Icons](https://lucide.dev/)
- **Motion:** [Framer Motion](https://www.framer.com/motion/)
- **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com/) (Glassmorphism)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)

### 2. Environment Setup
Create a `.env.local` file in the root:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Installation
```bash
npm install
```

### 4. Database Seeding (Optional)
To populate the database with default exercises:
```bash
npm run seed
```

### 5. Development Mode
```bash
npm run dev
```

### 6. Verification
Before pushing changes, verify the production build:
```bash
npm run build
```

---

## 🗺️ Roadmap: The Future of Peak Performance

### 🌀 Phase 1: Intelligence Core
- **Wearable Biometrics**: Sync with Apple Health & Garmin to correlate recovery with performance.
- **RPE & RIR Integration**: Layer subjective effort data over objective tonnage.
- **PR Prediction**: Proprietary algorithms to predict 1RM based on volume trends.

### 🏆 Phase 2: Mastery & Social
- **The Arena**: Opt-in leaderboards categorized by weight class.
- **Verified PR Feed**: Share your biggest wins with the community via verified logs.
- **Coach-Link**: Remote cycle design and monitoring for trainers.

---

## 🤝 Join the Pursuit
TRAK.FIT is designed for the elite. Contributions are welcome from developers and athletes alike.

**Elite Performance. Zero Excuses.** 
© 2026 TRAK.FIT
