# ⚡ TRAK.FIT
### The Elite Standard in Performance Tracking

TRAK.FIT is a data-driven cockpit for your training. Designed for athletes who demand precision, TRAK.FIT combines high-fidelity aesthetics with surgical analytics to turn every rep into actionable intelligence.

<img width="1920" height="1440" alt="image" src="https://github.com/user-attachments/assets/f61ac4b9-f287-46e7-9234-c412f335f286" />


---

## 💎 The Athlete's Toolkit

### 🏗️ Dynamic Cycle Architect
Build multi-week training blocks with ease. The **Plan Designer** allows you to architect your entire progression.
- **Custom Splits**: Define your training days and rest days with a fluid drag-and-drop interface.
- **Smart History**: Automatically pulls your historical PRs and last weights when adding exercises to a new plan.
- **Warmup Calculator**: Integrated calculator for every exercise based on your target working weight.
- **Rest Timer Management**: Set exercise-specific rest durations to keep your intensity on track.

### 📈 Surgical Analytics
Visualize your journey with pro-grade data visualizations powered by Recharts.
- **Personal Record Engine**: Atomic tracking of Weight and Rep PRs. If you match your weight PR but hit more reps, it's still a win.
- **Exercise Timelines**: Deep dive into every lift with volume analysis, estimated 1RM trends, and PR markers.
- **Body Weight Correlation**: Track how your body weight fluctuations impact your relative strength.
- **Consistency Metrics**: Live streak tracking, monthly heatmaps, and weekly snapshot widgets.

### 🛡️ Secure, Fast, Reliable
Built on a modern stack to ensure your data is always ready when you are.
- **NextAuth.js Security**: Secure, session-based authentication using MongoDB adapter.
- **Gym-Floor UX**: Minimalist, high-contrast logging interface designed for use between sets with live session timers.
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
