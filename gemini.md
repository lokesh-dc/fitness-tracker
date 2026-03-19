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

- **Aesthetics**: Premium, dark-themed glassmorphism.
- **Colors**: `orange-500` accents, white/transparent glass cards.
- **Components**: Use `GlassCard` for all container elements.
- **Animations**: Use `framer-motion` for transitions and the `WorkoutCelebration` component.

## Development Workflow

- **Database**: Use `src/lib/db-utils.ts` and `clientPromise` from `mongodb.ts` for connection reuse.
- **Cleanup**: Delete migration/seed scripts in `scripts/` immediately after successful one-time execution.
- **Verification**: All features must be manually verified in-browser as no automated test suite exists yet.

## File Organization

- **Server Actions**: `src/app/actions/` (e.g., `logs.ts`, `analytics.ts`).
- **UI Components**: `src/components/` and `src/components/ui/`.
- **Types**: Use interfaces defined in `src/types/` (e.g., `workout.ts`).
