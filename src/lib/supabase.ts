import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return url;
};

const getSupabaseKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return key;
};

let supabase: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (supabase) return supabase;

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();

  supabase = createClient<Database>(supabaseUrl, supabaseKey);

  // Log the Supabase URL and key (first 5 characters) for debugging
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Anon Key (first 5 chars):", supabaseKey.substring(0, 5));

  return supabase;
}

// Export the Supabase client directly
export const supabase = getSupabase();

export async function getOrCreateAnonymousUser(
  ip: string
): Promise<AnonymousUser | null> {
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
): Promise<AnonymousUser | null> {
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
