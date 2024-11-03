import { getSupabase } from "./supabase";

export interface QuotaInfo {
  remaining: number;
  limit: number;
  resetDate: Date;
  planType: "free" | "basic" | "pro";
}

export async function getQuotaInfo(userId: string): Promise<QuotaInfo | null> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from("anonymous_users")
      .select("quota_remaining, quota_limit, quota_reset_date, plan_type")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return {
      remaining: data.quota_remaining,
      limit: data.quota_limit,
      resetDate: new Date(data.quota_reset_date),
      planType: data.plan_type,
    };
  } catch (error) {
    console.error("Error fetching quota info:", error);
    return null;
  }
}

export async function decrementQuota(userId: string): Promise<boolean> {
  const supabase = getSupabase();

  try {
    const { data: userData, error: userError } = await supabase
      .from("anonymous_users")
      .select("ip_address")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    const { data, error } = await supabase.rpc("decrement_quota", {
      user_ip: userData.ip_address,
    });

    if (error) throw error;

    return data as boolean;
  } catch (error) {
    console.error("Error decrementing quota:", error);
    return false;
  }
}

export interface PricingPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  quota_limit: number;
  features: string[];
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from("pricing_plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return [];
  }
}
