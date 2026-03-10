import { NextRequest, NextResponse } from "next/server";
import { checkDueDates } from "@/lib/notify";

/**
 * POST /api/notifications/check-due-dates
 * Check for upcoming due dates and send notifications
 * 
 * This should be called by a cron job (e.g., every hour)
 * 
 * Example cron configuration:
 * 0 * * * * curl -X POST http://localhost:3000/api/notifications/check-due-dates
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await checkDueDates();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Check Due Dates API] Error:", error);
    return NextResponse.json(
      { error: "Failed to check due dates" },
      { status: 500 }
    );
  }
}
