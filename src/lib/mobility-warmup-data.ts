export type { MobilityMovement } from "@/types/workout";
import type { MobilityMovement } from "@/types/workout";

export const MOBILITY_MOVEMENTS: MobilityMovement[] = [
  { id: "cat-cow", name: "Cat-Cow", durationSeconds: 45 },
  { id: "hip-circles", name: "Hip Circles", durationSeconds: 45 },
  { id: "band-pull-aparts", name: "Band Pull-Aparts", durationSeconds: 40 },
  { id: "leg-swings", name: "Leg Swings", durationSeconds: 40 },
  { id: "arm-circles", name: "Arm Circles", durationSeconds: 40 },
  { id: "worlds-greatest-stretch", name: "World's Greatest Stretch", durationSeconds: 60 },
];

export function resolveMovements(ids?: string[], custom?: MobilityMovement[]): MobilityMovement[] {
  const defaults: MobilityMovement[] = ids && ids.length > 0
    ? ids.map((id) => MOBILITY_MOVEMENTS.find((m) => m.id === id)).filter((m): m is MobilityMovement => !!m)
    : [...MOBILITY_MOVEMENTS];
  const extras = custom?.filter((c) => !defaults.some((d) => d.id === c.id)) || [];
  const merged = [...defaults, ...extras];
  return merged.length > 0 ? merged : MOBILITY_MOVEMENTS;
}
