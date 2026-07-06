# TRAK.FIT Project Features

This document provides a comprehensive list of every feature available in the TRAK.FIT application, organized by page and core system.

## 1. Landing & Authentication (`/`, `/auth`)
- **Premium Marketing Surface**: High-end glassmorphism design introducing the TRAK.FIT platform.
- **One-Click Demo**: Instant access via `?demo=true` parameter for frictionless evaluation.
- **Smart Redirects**: Automatically routes authenticated users to their personal dashboard.
- **NextAuth Integration**: Secure login and registration using MongoDB adapter and Credentials provider.

## 2. Personalized Dashboard (`/dashboard`)
- **Daily Intelligence**: Dynamic motivational quotes (via ZenQuotes API) and personalized greetings.
- **Real-Time Streak Tracking**: Visual indicators for current and all-time workout consistency.
- **Weekly Progress Snapshot**: Comparison of completed vs. planned sessions for the current week.
- **Intelligent Contextual Cards**:
    - **Workout Scheduler**: Shows today's scheduled workout from the active plan.
    - **Rest Day States**: Handles rest days with recovery reminders and recovery-focused UI.
    - **Cycle Reporting**: Triggers "Cycle Completion" reports upon finishing a multi-week training block.
- **Quick Action Hub**: Instant shortcuts for manual body weight logging and progress viewing.
- **Responsive Navigation**: Adaptive sidebar and mobile-optimized widget strips for high-level stats.

## 3. Live Workout Engine (`/workout`)
- **Dual Log Modes**:
    - **Live Session**: Real-time logging with integrated timers and active set tracking.
    - **Manual Log**: Efficient entry for retroactively recording past sessions.
- **Integrated Rest Timer**: Fully customizable, auto-triggering rest intervals with visual progress bars and background notifications.
- **Warmup Calculator**: Automatic set-by-set warmup generation (40%, 60%, 80% intensity) based on working weight.
- **Live PR Intelligence**: Instant detection of weight and rep PRs as sets are logged.
- **Plateau Detection**: Real-time alerts if no progress (weight or reps) is detected for an exercise over the last 3 sessions.
- **History Integration**: Side-by-side view of previous PRs and last-session performance for every exercise during the workout.
- **Gamified Celebration**: Full-screen Framer Motion animations and confetti on PR achievement.
- **Session Summaries**: Post-workout breakdown of volume, intensity, sets, and estimated calories burned.
- **Smart Set Management**: Easy addition, deletion, and editing of sets with auto-fill from previous sets.

## 4. Advanced Analytics Hub (`/analytics`, `/muscle-groups`)
- **Body Metrics Tracking**: Interactive body weight trend visualizations (Recharts) with date filtering.
- **Personal Record (PR) Gallery**: Comprehensive list of all-time bests for every tracked exercise.
- **Deep Muscle Diagnostics**: 
    - **Volume Distribution**: Analysis across all major muscle groups (Chest, Back, Legs, etc.).
    - **Activity Heatmaps**: Visual representation of training density.
- **Performance Trends**:
    - **Weekly Volume Comparison**: Trend direction, absolute difference (kg), and percentage change.
    - **Most Improved Exercise**: Identification of lifts with the highest relative strength gains.
- **Exercise Timeline**: Granular progress tracking (Volume and 1RM) for individual lifts over time.

## 5. Training Plan Management (`/plan`, `/plan/[id]`)
- **Cycle Lifecycle Management**: Overview and status tracking (Running, Completed, Not Started) for multiple training blocks.
- **Adherence Scoring**: Calculation of "Plan Adherence" based on scheduled vs. logged sessions.
- **Weekly Schedule Visualizer**: High-level view of the entire week's training split and exercises.
- **Post-Cycle Reports**: Detailed analytics generated at the end of a multi-week program showing total progress and volume.

## 2. The Dynamic Cycle Architect (Plan Designer) (`/plan/designer`)
- **Multi-Step Wizard**: Intuitive 3-step configuration for start dates, duration, and weekly splits.
- **Drag-and-Drop Split Builder**: Easily assign training and rest days for a 7-day master week.
- **Exercise Library**: Searchable database of 100+ exercises with muscle-group filtering and history lookups.
- **Custom Exercise Creation**: Ability to add non-standard movements to the global library.
- **Set & Rep Optimization**: Configure target sets, reps, and starting weights for every day of the plan.
- **Rest Duration Presets**: Standardized or custom rest period settings per exercise.

## 7. Workout History Logbook (`/workouts`)
- **Interactive Calendar Navigation**: Weekly and monthly views to browse historical logs.
- **Granular Session Breakdowns**: Comprehensive review of every set, rep, and weight ever recorded.
- **PR Indicator**: Visual "Trophy" badges on historical sessions identifying exactly where records were broken.
- **Muscle Targeting Summary**: Sidebar stats on which muscle groups were prioritized in past sessions.

## 8. User Profile & Onboarding (`/profile`, `/onboarding`)
- **Smart Onboarding**: Multi-step setup for gender, body weight, unit systems (KG/LB), and training preferences.
- **Gamification Levels**: User leveling system based on total workout volume and consistency (Level 1-100).
- **Notification Management**: Control over push notifications for workout reminders and rest timers.
- **Account Summary**: Pro-tier indicators and joined-date tracking.

## Core Logic & Architecture
- **Atomic PR Engine**: O(1) performance for PR lookups via materialized `ExerciseRecords` collection (Atomic `$max` updates).
- **Glassmorphism Design System**: Premium dark-themed UI utilizing Tailwind CSS 4.0 and custom CSS variables for accents.
- **Server-First Architecture**: High performance and security using Next.js 15 Server Components and Actions.
- **Plateau Logic**: Intelligent analysis of the last 3 workout logs to identify stalling progress and suggest intensity increases.
- **Mobile-First API**: Backend support for the companion FitTrackMobile app (Expo/React Native).
