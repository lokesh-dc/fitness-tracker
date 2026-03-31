import { seedDemoData } from "../src/lib/seed-demo-data";

async function run() {
  console.log("=== STARTING DEMO SEEDING ===");
  try {
    const results = await seedDemoData();
    console.log("=== SEEDING COMPLETED SUCCESSFULY ===");
    console.log(`Logs Created: ${results.logs}`);
    console.log(`PRs Created: ${results.prs}`);
    console.log(`Plans Created: ${results.plans}`);
  } catch (error) {
    console.error("=== SEEDING FAILED ===");
    console.error(error);
    process.exit(1);
  }
  process.exit(0);
}

run();
