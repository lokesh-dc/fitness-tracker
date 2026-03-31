import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/seed-demo-data";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("Triggering scheduled demo reset...");
    const stats = await seedDemoData();

    return NextResponse.json({
      reset: true,
      timestamp: new Date().toISOString(),
      stats,
    });
  } catch (error) {
    console.error("Cron reset error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
