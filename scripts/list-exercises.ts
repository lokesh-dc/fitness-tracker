import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const exs = await db.collection("Exercises").find({}).sort({ muscleGroup: 1, name: 1 }).toArray();
  const byGroup: Record<string, string[]> = {};
  for (const ex of exs) {
    (byGroup[ex.muscleGroup] ||= []).push(ex.name);
  }
  for (const [group, names] of Object.entries(byGroup)) {
    console.log(`\n## ${group} (${names.length})`);
    for (const n of names) console.log(`- ${n}`);
  }
  await client.close();
}
main();
