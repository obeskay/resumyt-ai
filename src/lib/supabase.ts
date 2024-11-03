import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

export const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(supabaseUrl, supabaseKey);
};

export async function updateUserPlan(userId: string, planId: number) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("anonymous_users")
    .update({
      pricing_plan_id: planId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
  return true;
}

export async function getAnonymousUserByIp(ipAddress: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("anonymous_users")
    .select("*")
    .eq("ip_address", ipAddress)
    .single();

  if (error) throw error;
  return data;
}
