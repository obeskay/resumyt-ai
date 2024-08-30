import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("videos").select("count").single();

    if (error) {
      throw error;
    }

    logger.info("Health check passed");
    return NextResponse.json({ status: "healthy", database: "connected" });
  } catch (error) {
    logger.error("Health check failed:", error);
    return NextResponse.json({ status: "unhealthy", error: (error as Error).message }, { status: 500 });
  }
}