import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "./supabase";

export async function rateLimit(req: NextRequest) {
  const supabase = getSupabase();
  const ip = req.ip ?? "::1";

  try {
    // Use the get_or_create_anonymous_user function from our SQL setup
    const { data: user, error } = await supabase.rpc(
      "get_or_create_anonymous_user",
      {
        user_ip: ip,
        initial_quota: 5, // Default initial quota
        initial_plan: "F", // Free plan
      },
    );

    if (error) {
      console.error("Error fetching user quota:", error);
      return NextResponse.json(
        { error: "Error checking quota" },
        { status: 500 },
      );
    }

    if (user.quota_remaining <= 0) {
      return NextResponse.json(
        { error: "Daily quota exceeded. Please try again tomorrow." },
        { status: 429 },
      );
    }

    return null; // No rate limit hit
  } catch (error) {
    console.error("Rate limit check error:", error);
    return NextResponse.json(
      { error: "Error checking rate limit" },
      { status: 500 },
    );
  }
}
