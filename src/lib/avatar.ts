/**
 * Standardized profile avatar URLs:
 * - Male: Short cropped hair, hoodie, clean athletic male portrait
 * - Female: Long straight hair, collar & sweater, elegant female portrait
 */
export const MALE_AVATAR_URL =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lokesh&top=shortFlat&clothing=hoodie&accessoriesProbability=0&facialHairProbability=0";

export const FEMALE_AVATAR_URL =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&top=straight01&clothing=collarAndSweater&accessoriesProbability=0";

/**
 * Returns a consistent avatar URL based on gender:
 * - Female: Dedicated female avatar (1)
 * - Male (and default): Dedicated male avatar (1)
 */
export function getUserAvatarUrl(gender?: string | null): string {
  if (!gender) return MALE_AVATAR_URL;
  const normalized = gender.toLowerCase().trim();
  if (normalized === "female" || normalized === "woman" || normalized === "f") {
    return FEMALE_AVATAR_URL;
  }
  return MALE_AVATAR_URL;
}
