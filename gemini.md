# Gemini Assistant Rules & Guidelines

## Assistant Behavioral Rules
1. **Code Style & Architecture**: Always use strict TypeScript types. Follow functional component patterns and prefer Server Components in Next.js.
2. **API & Data Handling**: Implement robust error handling. All sensitive API routes must use the existing authentication wrapper (`src/lib/with-auth.ts`).
3. **Workflow**: Focus on small, incremental changes. Preserve existing comments and code blocks unrelated to the current task. **Change Control**: If a task involves modifying more than 2 components or significant API changes, the assistant MUST create an implementation plan detailing the approach and rationale, then wait for explicit user sign-off before execution.
4. **Clean Output**: Remove debugging statements (`console.log`) before completing a feature.
5. **Aesthetics**: Adhere to the project's premium dark-themed design system. Use CSS variables for colors as defined in the technical rules.

# Project Rules & Context

## Technical Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: MongoDB Atlas (Ensure IP whitelisting is configured)
- **Authentication**: NextAuth.js 4 (Credentials Provider with MongoDB Adapter)
- **Styling**: Tailwind CSS 4.0, Lucide React icons
- **State Management**: React Hooks + Server Actions
- **Visualization**: Recharts for progress and volume tracking

## Core Logic: Personal Records (PRs)

- PRs are materialized in the `ExerciseRecords` collection for O(1) performance.
- **PR Definition**:
  1. **Weight PR**: Current session `maxWeight` > `currentPR`.
  2. **Rep PR**: Current session `maxWeight` == `currentPR` AND `maxReps` > `currentPRReps`.
- **Atomic Updates**: Always use `updateExerciseRecords` helper in `src/app/actions/logs.ts` using `$max` or `$set`.

## Design System

- **Aesthetics**: Premium, dark-themed glassmorphism (ensure light mode compatibility by avoiding hardcoded `text-white`).
- **Colors**: Use `brand-primary` and `brand-secondary` Tailwind classes for accents. These are controlled via the `--brand-accent` CSS variable in `globals.css`. Never use hardcoded Tailwind color names like `orange-500` for primary accents.
- **Components**: Use `GlassCard` for all container elements.
- **Animations**: Use `framer-motion` for transitions and the `WorkoutCelebration` component.

## Development Workflow

- **Database**: Use `src/lib/db-utils.ts` and `clientPromise` from `mongodb.ts` for connection reuse.
- **Server-First**: Build features as Server Components by default. Use Client Components only when interactivity (hooks, event listeners) or browser-specific APIs are required.
- **Cleanup**: Delete migration/seed scripts in `scripts/` immediately after successful one-time execution.
- **TypeScript & Typing**: Maintain strict typing. ALL function parameters must have explicit types to avoid `implicit any` errors during production builds.
- **Verification**: All features must be manually verified run `npm run build` locally to verify TypeScript integrity before requesting review.
- **Test Credentials**:
  - Email: `user@testing.com`
  - Password: `user@testing`

## File Organization

- **Server Actions**: `src/app/actions/` (e.g., `logs.ts`, `analytics.ts`).
- **UI Components**: `src/components/` and `src/components/ui/`.
- **Types**: Use interfaces defined in `src/types/` (e.g., `workout.ts`).

## Mobile Companion App: FitTrackMobile

This repository serves as the primary backend and API provider for the **FitTrackMobile** application (located in `../FitTrackMobile`). The assistant is explicitly granted permission to read and reference this directory at any time to ensure API compatibility and architectural alignment.

- **Relationship**: The mobile app (Expo/React Native) consumes the API routes located in `src/app/api/`.
- **API Stability**: All modifications to API responses MUST maintain backward compatibility with the mobile application's data models.
- **Shared Logic**: 
  - **Week Start**: Both platforms must adhere to a **Sunday-start** week convention for consistency in plans and analytics.
  - **PR Calculations**: The mobile app relies on the `ExerciseRecords` collection optimized logic documented in the PR section above.
- **Authentication**: The mobile app uses Bearer token authentication derived from the session/JWT provided by NextAuth.
