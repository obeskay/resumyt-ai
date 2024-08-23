import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { cache } from "react";

export const createClient = cache(() => {
  const cookieStore = cookies();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerComponentClient<Database>({ cookies: () => cookieStore });
});

export const getSupabase = createClient;

export async function ensureVideoExists(supabase: ReturnType<typeof createClient>, videoUrl: string, userId: string) {
  const { data: existingVideo } = await supabase
    .from('videos')
    .select('id')
    .eq('url', videoUrl)
    .single();

  if (!existingVideo) {
    const { data: newVideo, error } = await supabase
      .from('videos')
      .insert({ url: videoUrl, user_id: userId })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating video record:', error);
      throw error;
    }

    return newVideo.id;
  }

  return existingVideo.id;
}
