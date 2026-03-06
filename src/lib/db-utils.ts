import clientPromise from "@/lib/mongodb";

export async function getDb() {
  const client = await clientPromise;
  return client.db();
}

export const getCurrentDayOfWeek = () => new Date().getDay();

export const getCurrentWeekIndex = () => {
  return 1; // Mocking week 1 for now
};
