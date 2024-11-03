import { getSupabase } from "@/lib/supabase";

interface QuickSummary {
  id: string;
  title: string;
  content: string;
  videoId: string;
}

export async function getQuickSummaries(filters?: {
  searchTerm?: string;
  dateRange?: { start: Date; end: Date };
  sortBy?: "date" | "title";
}): Promise<{ quickSummaries: QuickSummary[] }> {
  const supabase = getSupabase();

  try {
    let query = supabase
      .from("summaries")
      .select("id, content, videos(id, title)");

    if (filters?.searchTerm) {
      query = query.ilike("content", `%${filters.searchTerm}%`);
    }
    // Implementar otros filtros...

    // Obtener los resúmenes rápidos de la base de datos
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(`Error fetching quick summaries: ${error.message}`);
    }

    const quickSummaries: QuickSummary[] = data.map((item: any) => ({
      id: item.id,
      title: item.videos?.title || "Título no disponible",
      content: item.content.substring(0, 150) + "...", // Limitar el contenido a 150 caracteres
      videoId: item.videos?.id || "",
    }));

    return { quickSummaries };
  } catch (error) {
    console.error("Error fetching quick summaries:", error);
    // En caso de error, devolver un array vacío
    return { quickSummaries: [] };
  }
}
