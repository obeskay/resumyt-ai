import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClientComponentClient<Database>();
};

export const getSupabase = createClient;

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function ensureVideoExists(supabase: ReturnType<typeof createClient>, videoUrl: string, userId: string) {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  // First, try to upsert the video
  const { error: upsertError } = await supabase
    .from('videos')
    .upsert(
      { id: videoId, url: videoUrl, user_id: userId },
      { onConflict: 'id' }
    );

  if (upsertError) {
    console.error('Error upserting video record:', upsertError);
    throw upsertError;
  }

  // Then, select the video to return its id
  const { data: video, error: selectError } = await supabase
    .from('videos')
    .select('id')
    .eq('id', videoId)
    .single();

  if (selectError) {
    console.error('Error selecting video record:', selectError);
    throw selectError;
  }

  if (!video) {
    throw new Error('Failed to retrieve video record');
  }

  return video.id;
}
