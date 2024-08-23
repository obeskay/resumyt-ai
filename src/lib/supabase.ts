import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return url;
};

const getSupabaseKey = () => {
  console.log("Environment:", process.env.NODE_ENV);
  console.log("All environment variables:", process.env);
  
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  console.log("Supabase Anon Key (first 5 chars):", key.substring(0, 5));
  return key;
};

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey);

  // Log the Supabase URL for debugging
  console.log("Supabase URL:", supabaseUrl);

  return supabaseInstance;
}

// Export the getSupabase function instead of a direct instance
export { getSupabase as supabase };

export async function getOrCreateAnonymousUser(
  ip: string
): Promise<Database['public']['Tables']['anonymous_users']['Row'] | null> {
  console.log("Attempting to get or create anonymous user for IP:", ip);

  try {
    const supabase = getSupabase();
    // Check if a user with this IP already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("anonymous_users")
      .select("*")
      .eq("ip_address", ip)
      .single();

    if (fetchError) {
      console.error("Error fetching user:", fetchError);
      console.error("Error details:", JSON.stringify(fetchError, null, 2));
      if (fetchError.code !== "PGRST116") {
        throw new Error("Failed to fetch user");
      }
    }

    if (existingUser) {
      console.log("Existing user found:", existingUser);
      return existingUser;
    }

    console.log(
      "No existing user found. Attempting to create a new anonymous user."
    );

    // If no user exists, create a new anonymous user
    let retries = 3;
    while (retries > 0) {
      const { data: newUser, error: createError } = await supabase
        .from("anonymous_users")
        .insert({ ip_address: ip, transcriptions_used: 0 })
        .select()
        .single();

      if (createError) {
        console.error("Error creating anonymous user:", createError);
        console.error("Error details:", JSON.stringify(createError, null, 2));
        retries--;
        if (retries === 0) {
          throw new Error("Failed to create new user after multiple attempts");
        }
      } else {
        console.log("New user created:", newUser);
        return newUser;
      }
    }
  } catch (error) {
    console.error("Unexpected error in getOrCreateAnonymousUser:", error);
    return null;
  }

  return null;
}

export async function getAnonymousUserByIp(
  ip: string
): Promise<Database['public']['Tables']['anonymous_users']['Row'] | null> {
  console.log("Attempting to get anonymous user for IP:", ip);

  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from("anonymous_users")
      .select("*")
      .eq("ip_address", ip)
      .single();

    if (error) {
      console.error("Error fetching anonymous user:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return null;
    }

    console.log("User found:", user);
    return user;
  } catch (error) {
    console.error("Unexpected error in getAnonymousUserByIp:", error);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("anonymous_users")
      .select("count")
      .single();
    if (error) throw error;
    console.log("Supabase connection test successful. Row count:", data.count);
    return true;
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return false;
  }
}
