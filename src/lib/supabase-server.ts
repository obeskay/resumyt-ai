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
  // First, try to get the existing video
  let { data: existingVideo, error: selectError } = await supabase
    .from('videos')
    .select('id')
    .eq('url', videoUrl)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error checking for existing video:', selectError);
    throw selectError;
  }

  if (existingVideo) {
    return existingVideo.id;
  }

  // If the video doesn't exist, create it
  const { data: newVideo, error: insertError } = await supabase
    .from('videos')
    .insert({ url: videoUrl, user_id: userId })
    .select('id')
    .single();

  if (insertError) {
    console.error('Error creating video record:', insertError);
    throw insertError;
  }

  if (!newVideo) {
    throw new Error('Failed to create video record');
  }

  return newVideo.id;
}
