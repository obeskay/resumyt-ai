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

export async function ensureVideoExists(
  supabase: SupabaseClient<Database>,
  videoUrl: string,
  userId: string,
  videoTitle: string,
  thumbnailUrl: string
): Promise<string> {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const { data, error } = await supabase
    .from("videos")
    .upsert(
      {
        id: videoId,
        url: videoUrl,
        user_id: userId,
        title: videoTitle,
        thumbnail_url: thumbnailUrl,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error ensuring video exists:", error);
    throw error;
  }

  return data.id;
}
