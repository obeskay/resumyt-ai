import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isUserAuthenticated = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn("Error checking authentication:", error);
      return false;
    }
    return !!data.session;
  } catch (error) {
    console.warn("Error checking authentication:", error);
    return false;
  }
};

export const signInAnonymous = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn("Error signing in anonymously:", error);
      return null;
    }

    if (session) {
      // Create or retrieve anonymous user in the database
      const { data: anonymousUser, error: dbError } = await supabase
        .from("anonymous_users")
        .upsert({ id: session.user.id, transcriptions_used: 0 })
        .select()
        .single();

      if (dbError) {
        console.warn("Error creating/retrieving anonymous user:", dbError);
        return null;
      }

      return { session, anonymousUser };
    }

    return null;
  } catch (error) {
    console.warn("Error signing in anonymously:", error);
    return null;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Error signing in:", error);
      return null;
    }
    await transferAnonymousDataToRegisteredUser(data.session.user.id);
    return data.session;
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error }: any = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("Error signing up:", error);
      return null;
    }
    await transferAnonymousDataToRegisteredUser(data.user.id);
    return data.session;
  } catch (error) {
    console.error("Error signing up:", error);
    return null;
  }
};

const transferAnonymousDataToRegisteredUser = async (userId: string) => {
  try {
    // Get the anonymous user's data
    const { data: anonymousUser, error: anonymousError } = await supabase
      .from("anonymous_users")
      .select("id")
      .single();

    if (anonymousError) {
      console.error("Error fetching anonymous user:", anonymousError);
      return;
    }

    if (anonymousUser) {
      // Transfer summaries from anonymous user to registered user
      const { error: transferError } = await supabase
        .from("summaries")
        .update({ user_id: userId })
        .match({ user_id: anonymousUser.id });

      if (transferError) {
        console.error("Error transferring summaries:", transferError);
      }

      // Delete the anonymous user entry
      const { error: deleteError } = await supabase
        .from("anonymous_users")
        .delete()
        .match({ id: anonymousUser.id });

      if (deleteError) {
        console.error("Error deleting anonymous user:", deleteError);
      }
    }
  } catch (error) {
    console.error("Error transferring anonymous data:", error);
  }
};
