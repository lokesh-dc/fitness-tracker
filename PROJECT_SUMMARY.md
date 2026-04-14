# Project Summary: Fitness Tracker App

This document provides a comprehensive technical and functional overview of the Fitness Tracker application.

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

### 1. Training Plans
- Structured routines mapped to weeks and days.
- Ability to design plans and templates.
- Progression tracking through "Active Plans."

### 2. Live Session Logging
- Real-time workout tracking with start/stop timers.
- Integrated rest timers with customizable durations.
- Materialized PR updates immediately upon saving.

### 3. Analytics & Progress
- **Muscle Group Distribution**: Pie charts showing volume by muscle group.
- **Volume Trends**: Periodic volume comparisons (weekly/monthly).
- **Exercise Timelines**: Individual exercise progress charts (Max Weight vs. Volume).
- **Bodyweight Tracking**: Trends and correlation with training volume.

### 4. Interactive UI Widgets
- Sticky sidebars on Dashboard, History, and Analytics pages.
- Widgets include: "Most Trained Muscle Group," "Most Improved Exercise," "Weekly Volume Comparison," and more.
- Mobile-responsive horizontal scroll strips for widgets.

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
