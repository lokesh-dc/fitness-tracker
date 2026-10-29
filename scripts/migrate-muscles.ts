/**
 * Muscle taxonomy migration.
 *
 *   npx tsx scripts/migrate-muscles.ts            # dry run (default, no writes)
 *   npx tsx scripts/migrate-muscles.ts --apply    # apply changes
 *
 * Safe to re-run: the old value is copied to `legacyMuscleGroup` only when that
 * field is missing, and an exercise whose primary/secondary values already
 * match the classification is counted as unchanged.
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { MongoClient, type ObjectId } from "mongodb";
import {
  MUSCLES,
  sanitizeSecondaryMuscles,
  type Muscle,
} from "../src/lib/muscles";

const uri =
  process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";
const APPLY = process.argv.includes("--apply");

interface Classification {
  primary: Muscle;
  secondary: Muscle[];
  rule: string;
}

function c(
  primary: Muscle,
  secondary: readonly string[],
  rule: string,
): Classification {
  return {
    primary,
    secondary: sanitizeSecondaryMuscles(primary, secondary),
    rule,
  };
}

/**
 * Name-first classification. Order matters: specific patterns must be
 * evaluated before broad ones (calf before leg press, side plank before plank).
 */
export function classifyExercise(
  name: string,
  legacy: string,
): Classification | null {
  const n = name.toLowerCase();

  // Cardio is intentionally not a muscle category. Leave it alone.
  if (legacy === "Cardio") return null;

  // --- Explicit corrections for obvious library mis-tags -------------------
  if (/overhead tricep|overhead triceps/.test(n)) {
    return c("Triceps", [], "overhead triceps extension");
  }
  if (/hammer curl/.test(n)) {
    return c("Biceps", ["Forearms"], "hammer curl");
  }

  // --- Legs / hips (most specific first) -----------------------------------
  // Calf must come before "leg press" or a leg-press calf raise becomes quads.
  if (/\bcalf\b|\bcalves\b/.test(n)) {
    return c("Calves", [], "calf raise");
  }
  if (/leg extension|sissy/.test(n)) {
    return c("Quads", [], "leg extension");
  }
  if (/hack squat|front squat|goblet squat|smith.*squat/.test(n)) {
    return c("Quads", ["Glutes"], "front/hack/goblet squat");
  }
  if (/romanian|\brdl\b|stiff.?leg|good morning/.test(n)) {
    return c("Hamstrings", ["Glutes", "Lower Back"], "hip hinge");
  }
  if (/leg curl|hamstring|nordic/.test(n)) {
    return c("Hamstrings", [], "leg curl");
  }
  // "Kickback" is a glute movement only when the name says so; the same word
  // is also used for triceps kickbacks, which must fall through to the arm
  // rules. Keep this name-based so the classifier is idempotent after the
  // migrated value becomes "Glutes".
  if (
    /hip thrust|glute bridge|glute|pull.?through|kettlebell swing/.test(n) ||
    (/kickback/.test(n) && /cable/.test(n))
  ) {
    return c(
      "Glutes",
      /swing/.test(n) ? ["Hamstrings", "Lower Back"] : ["Hamstrings"],
      /swing|pull.?through/.test(n) ? "hip extension" : "glute isolation",
    );
  }
  if (/abduction|abductor/.test(n)) {
    return c("Glutes", [], "hip abduction");
  }
  if (/adduction|adductor/.test(n)) {
    return c("Adductors", [], "hip adduction");
  }
  if (/deadlift/.test(n)) {
    return c(
      "Hamstrings",
      ["Glutes", "Lower Back", "Lats", "Traps"],
      "deadlift",
    );
  }
  if (/hyperextension|back extension/.test(n)) {
    return c("Lower Back", ["Glutes", "Hamstrings"], "back extension");
  }
  if (/rack pull/.test(n)) {
    return c("Upper Back", ["Traps", "Lower Back"], "rack pull");
  }
  if (/squat|leg press/.test(n)) {
    return c("Quads", ["Glutes", "Hamstrings"], "squat / leg press");
  }
  if (/lunge|split squat|step.?up/.test(n)) {
    return c("Quads", ["Glutes"], "lunge / split squat / step-up");
  }

  // --- Core ----------------------------------------------------------------
  if (/side plank|russian twist|woodchop|pallof|bicycle|side bend/.test(n)) {
    return c("Obliques", [], "rotation / anti-rotation");
  }
  if (/plank/.test(n)) {
    return c("Abs", ["Obliques"], "plank");
  }
  if (/crunch|leg raise|sit.?up|hollow|ab wheel|dead bug|bird dog|dragon flag|toe touch|v.?up|mountain climber/.test(n)) {
    return c("Abs", [], "core flexion");
  }

  // --- Arms (before chest so "Incline DB Curl" stays a curl) ---------------
  if (/curl/.test(n)) {
    if (legacy === "Forearms" || /reverse curl|wrist curl/.test(n)) {
      return c("Forearms", [], "forearm curl");
    }
    return c("Biceps", ["Forearms"], "curl");
  }
  // Only treat "grip" as a forearm signal for exercises already in the
  // forearm library: "Close-Grip Bench Press" and "Lat Pulldown (Wide Grip)"
  // contain the word but are a triceps press and a lat pull respectively.
  if (
    /wrist|farmer|pinch hold/.test(n) ||
    (legacy === "Forearms" && /grip/.test(n))
  ) {
    return c("Forearms", [], "grip / forearm");
  }
  if (/skull|pushdown|tricep|kickback|triceps extension|tricep extension/.test(n)) {
    return c("Triceps", [], "triceps isolation");
  }

  // --- Shoulders (before chest so "Rear Delt Fly" stays a shoulder) --------
  if (/shrug|shrugh/.test(n)) {
    return c("Traps", ["Forearms"], "shrug");
  }
  if (/face pull/.test(n)) {
    return c("Shoulders", ["Upper Back"], "face pull");
  }
  if (/upright row/.test(n)) {
    return c("Shoulders", ["Traps"], "upright row");
  }
  if (/overhead press|shoulder press|military|arnold|smith press|push press/.test(n)) {
    return c("Shoulders", ["Triceps"], "overhead press");
  }
  if (/lateral raise|front raise|rear delt/.test(n)) {
    return c("Shoulders", [], "shoulder isolation");
  }

  // --- Chest ---------------------------------------------------------------
  if (/close.?grip.*bench|diamond.*push/.test(n)) {
    return c("Triceps", ["Chest", "Shoulders"], "close-grip pressing");
  }
  if (/\bdip\b|\bdips\b/.test(n)) {
    if (legacy === "Triceps" || /tricep/.test(n)) {
      return c("Triceps", ["Chest", "Shoulders"], "triceps dip");
    }
    return c("Chest", ["Triceps", "Shoulders"], "chest dip");
  }
  if (/incline/.test(n) && /press|bench/.test(n)) {
    return c("Chest", ["Shoulders", "Triceps"], "incline press");
  }
  if (/bench|chest press|db press|dumbbell press|push.?up|landmine/.test(n)) {
    return c("Chest", ["Triceps", "Shoulders"], "horizontal press");
  }
  if (/fly|pec deck|crossover/.test(n)) {
    return c("Chest", [], "chest fly");
  }
  if (/pullover/.test(n)) {
    return c("Chest", ["Lats", "Triceps"], "pullover");
  }

  // --- Back / pulling ------------------------------------------------------
  if (/pull.?up|chin.?up|lat pulldown|pulldown|straight arm/.test(n)) {
    return c("Lats", ["Biceps", "Upper Back"], "vertical pull");
  }
  if (/row/.test(n)) {
    if (/chest supported|machine|seated cable|t.?bar/.test(n)) {
      return c("Upper Back", ["Lats", "Biceps"], "upper-back row");
    }
    const secondary = ["Biceps", "Upper Back"];
    if (/barbell|bent over|pendlay/.test(n)) secondary.push("Lower Back");
    return c("Lats", secondary, "horizontal pull");
  }

  // --- Legacy fallback -----------------------------------------------------
  switch (legacy) {
    case "Chest":
      return c("Chest", [], "legacy Chest");
    case "Back":
      return c("Lats", [], "legacy Back");
    case "Shoulders":
    case "Delts":
      return c("Shoulders", [], "legacy Shoulders");
    case "Biceps":
      return c("Biceps", ["Forearms"], "legacy Biceps");
    case "Triceps":
      return c("Triceps", [], "legacy Triceps");
    case "Forearms":
      return c("Forearms", [], "legacy Forearms");
    case "Core":
    case "Abs":
      return c("Abs", [], "legacy Core");
    case "Arms":
      return c("Biceps", [], "legacy Arms");
    default:
      // Legs without a matching name rule, unknown custom groups, Other.
      return null;
  }
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

async function migrate() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const exercises = db.collection("Exercises");

    const all = await exercises.find({}).sort({ name: 1 }).toArray();
    console.log(`Muscle taxonomy migration — ${APPLY ? "APPLY" : "DRY RUN"}`);
    console.log(`Scanned ${all.length} exercises in the Exercises collection.\n`);

    const operations: {
      updateOne: {
        filter: { _id: ObjectId };
        update: object[];
      };
    }[] = [];
    const changed: { name: string; from: string; cls: Classification }[] = [];
    const unchanged: string[] = [];
    const unclassified: { id: string; name: string; legacy: string }[] = [];

    for (const doc of all) {
      const legacy = typeof doc.muscleGroup === "string" ? doc.muscleGroup : "";
      const cls = classifyExercise(String(doc.name), legacy);

      if (!cls) {
        unclassified.push({
          id: doc._id.toString(),
          name: String(doc.name),
          legacy: legacy || "(missing)",
        });
        continue;
      }

      const currentSecondary = Array.isArray(doc.secondaryMuscles)
        ? (doc.secondaryMuscles as string[])
        : [];
      const isSame =
        doc.muscleGroup === cls.primary &&
        arraysEqual(currentSecondary, cls.secondary);

      if (isSame) {
        unchanged.push(String(doc.name));
        continue;
      }

      changed.push({
        name: String(doc.name),
        from: legacy || "(missing)",
        cls,
      });

      operations.push({
        updateOne: {
          filter: { _id: doc._id },
          update: [
            {
              $set: {
                // Keep the very first original value for rollback.
                legacyMuscleGroup: {
                  $ifNull: ["$legacyMuscleGroup", "$muscleGroup"],
                },
                muscleGroup: cls.primary,
                secondaryMuscles: cls.secondary,
                muscleMigratedAt: new Date(),
              },
            },
          ],
        },
      });
    }

    const byPrimary = new Map<Muscle, Classification[]>();
    for (const row of changed) {
      const list = byPrimary.get(row.cls.primary) ?? [];
      list.push(row.cls);
      byPrimary.set(row.cls.primary, list);
    }

    console.log("Classification report (changed rows):");
    for (const muscle of MUSCLES) {
      const group = byPrimary.get(muscle);
      if (!group) continue;
      const rows = changed.filter((row) => row.cls.primary === muscle);
      console.log(`\n  ${muscle} (${rows.length})`);
      rows
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((row) => {
          const secondary = row.cls.secondary.length
            ? `  + ${row.cls.secondary.join(", ")}`
            : "";
          console.log(`    - ${row.name}${secondary}`);
        });
    }

    if (unclassified.length > 0) {
      console.log(
        `\nUnclassified, review manually (${unclassified.length} — not changed):`,
      );
      unclassified.forEach((row) => {
        console.log(`  - ${row.name}  [${row.legacy}]  _id=${row.id}`);
      });
    }

    console.log("\nSummary");
    console.log(`  total scanned : ${all.length}`);
    console.log(`  changed       : ${changed.length}`);
    console.log(`  unchanged     : ${unchanged.length}`);
    console.log(`  unclassified  : ${unclassified.length}`);

    if (!APPLY) {
      console.log(
        "\nDry run complete — nothing written. Re-run with --apply to migrate.",
      );
      return;
    }

    if (operations.length === 0) {
      console.log("\nNothing to write. Already up to date.");
      return;
    }

    const result = await exercises.bulkWrite(operations, { ordered: false });
    console.log(
      `\nApplied. matched=${result.matchedCount} modified=${result.modifiedCount}`,
    );
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

migrate();
