import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "./supabase";

export async function rateLimit(req: NextRequest) {
  const supabase = getSupabase();
  const ip = req.ip ?? "::1";

  // Check user's quota_remaining
  const { data: user, error } = await supabase
    .from("anonymous_users")
    .select("quota_remaining")
    .eq("ip_address", ip)
    .single();

  if (error) {
    console.error("Error fetching user quota:", error);
    return NextResponse.json(
      { error: "Error checking quota" },
      { status: 500 }
    );
  }

  if (user.quota_remaining <= 0) {
    return NextResponse.json({ error: "Quota exceeded" }, { status: 429 });
  }

  // Decrement quota_remaining
  const { error: updateError } = await supabase
    .from("anonymous_users")
    .update({ quota_remaining: user.quota_remaining - 1 })
    .eq("ip_address", ip);

  if (updateError) {
    console.error("Error updating user quota:", updateError);
    return NextResponse.json(
      { error: "Error updating quota" },
      { status: 500 }
    );
  }

  return null;
}
