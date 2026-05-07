# Project Summary: Fitness Tracker App

This document provides a comprehensive technical and functional overview of the Fitness Tracker application (TRAK.FIT).

## 🌟 Overview
A premium, data-driven fitness tracking application designed for progressive overload and performance analytics. It focuses on workout logging, personal record (PR) tracking, and structured training plan management with a high-end "glassmorphism" aesthetic.

## 🛠️ Technical Stack
- **Framework**: Next.js 15+ (App Router)
- **Runtime**: Node.js
- **Database**: MongoDB Atlas (NoSQL)
- **Authentication**: NextAuth.js 4 (Credentials Provider with MongoDB Adapter)
- **Styling**: Tailwind CSS 4.0
- **Design Language**: Glassmorphism (custom `glass-card` and `glass-button` utilities)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Visualization**: Recharts (for progress, volume, and bodyweight trends)
- **Programming Language**: TypeScript (Strict Mode)

## 🏗️ Core Architecture
The project follows a **Server-First** approach using Next.js Server Components by default, supported by Server Actions for all mutations and sensitive data fetching.

### File Organization
- `/src/app`: Routes, layouts, and global styles.
- `/src/app/actions`: Business logic (logs, analytics, plans, auth).
- `/src/components`: UI components, including the design system.
- `/src/lib`: Database utilities (`mongodb.ts`, `db-utils.ts`) and Auth configuration.
- `/src/types`: Centralized TypeScript interfaces for all data models.

## 📊 Data Models & Logic

### Database Collections
- **`users`**: User profiles and authentication data.
- **`WorkoutLog`**: Historical logs of completed workout sessions.
- **`ExerciseRecords` (Atomic PRs)**: Materialized view of all-time bests for each exercise to ensure O(1) lookups for PR comparisons.
- **`PlanDocument`**: User-selected or custom-built training plans.
- **`WorkoutTemplate`**: Define specific routines (exercises, sets, reps) within a plan for specific days/weeks.

### PR (Personal Record) Logic
The app uses an atomic update system defined in `src/app/actions/logs.ts`:
1. **Weight PR**: Achieved if current session `maxWeight` > `currentPR`.
2. **Rep PR**: Achieved if `maxWeight` == `currentPR` AND `maxReps` > `currentPRReps`.
3. **Tracking**: Historical records are kept in the `history` array within `ExerciseRecords`.

## 🚀 Key Features

### 1. 🏋️‍♂️ Live Session Logging & Intelligence
- **Gym-Floor Optimized UX**: A fast, minimalist, high-contrast interface built specifically for quick data entry between sets.
- **Plateau Detection**: Intelligent alerts that trigger during a workout if no progress (in weight or reps) has been detected for a specific exercise over the past 3 weeks.
- **Active Timers**: Real-time tracking of overall workout duration (start/stop) alongside integrated, customizable rest timers.
- **Smart History**: Automatically references past PRs and the last logged weights during a session so users know exactly what numbers to beat.

### 2. 🏆 Advanced Personal Record (PR) Engine
- **Atomic PR Tracking**: Materialized records that track two distinct types of PRs: Weight PRs and Rep PRs.
- **Instant Visual Feedback**: Triggers a "Workout Celebration" using Framer Motion animations immediately upon hitting a new PR.

### 3. 🏗️ Dynamic Cycle Architect (Plan Designer)
- **Custom Program Builder**: A dedicated tool to architect entire multi-week training blocks from scratch, with drag-and-drop custom splits.
- **Warmup Calculator**: Automatically generates required warmup sets based on the user's target working weight.

### 4. 📊 Post-Workout Summaries & History
- **Detailed Session Debrief**: Comprehensive summary showing exercises performed, estimated calories burned, and updated 1RM (One Rep Max) calculations.
- **Workout History Page**: A scannable logbook serving as the source of truth for all past workouts.

### 5. 🧬 Deep Analytics & Muscle Diagnostics
- **Muscle Targeting Breakdown**: Highly detailed analytics for individual muscle groups, including volume tracking, activity heatmaps, and identification of top exercises per muscle.
- **Exercise Timelines**: Pro-grade Recharts visualizations showing volume analysis and estimated 1RM trends over time for individual lifts.
- **Bodyweight Correlation**: Maps bodyweight fluctuations against training volume to track relative strength.

### 6. 🔥 Gamification & Consistency Metrics
- **Streak Maintenance**: Systems to track and display active workout streaks, motivating users to maintain consistency.
- **Interactive Dashboard Widgets**: Premium UI sidebars showing stats like "Most Trained Muscle Group" and "Weekly Volume Comparisons."

## 🎨 Design System (Design Tokens)
- **Primary Accent**: Controlled via `--brand-accent` in `globals.css` (defaults to vibrant orange).
- **Theming**: Premium dark mode support using CSS variables (`--glass-bg`, `--glass-border`).
- **Typography**: Inter / System-UI.
- **Components**:
  - `GlassCard`: Standard container with blur and subtle borders.
  - `WorkoutCelebration`: Triggered on PR achievement.

---
> [!IMPORTANT]
> The app enforces strict typing across all server actions to prevent buildup of "implicit any" errors during production builds.
