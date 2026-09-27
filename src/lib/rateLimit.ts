import type { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { getSupabase } from "./supabase";
import { decrementQuota } from "./quotaManager";

// First hop of x-forwarded-for (set by Vercel and most proxies), else the socket peer.
export const clientIp = (req: NextApiRequest) =>
  String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() ||
  req.socket.remoteAddress ||
  "::1";

// `consume` spends one unit of the daily quota; only summaries do.
export async function rateLimit(ip: string, consume = false) {
  const supabase = getSupabase();

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

    // Nothing else decrements the quota, so without this the 429 never fires.
    if (consume) await decrementQuota(user.id);

    return null; // No rate limit hit
  } catch (error) {
    console.error("Rate limit check error:", error);
    return NextResponse.json(
      { error: "Error checking rate limit" },
      { status: 500 },
    );
  }
}
