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
