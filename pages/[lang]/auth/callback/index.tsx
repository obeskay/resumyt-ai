import { useEffect } from "react";
import { useRouter } from "next/router";
import { getSupabase } from "@/lib/supabase";
import LoadingContainer from "@/components/LoadingContainer";
import { getDictionary } from "@/lib/getDictionary";

export default function AuthCallback() {
  const router = useRouter();
  const { lang } = router.query;
  const supabase = getSupabase();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error:", error.message);
        await router.push(`/${lang || "es"}/login`);
        return;
      }

      if (session) {
        // Create or update user profile
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: session.user.id,
            email: session.user.email,
            updated_at: new Date().toISOString(),
            quota_remaining: 10, // Valor inicial de cuota
            quota_max: 10,
            quota_reset_date: new Date(
              new Date().setMonth(new Date().getMonth() + 1),
            ).toISOString(), // Reset en un mes
            plan: "free",
          },
          {
            onConflict: "id",
          },
        );

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }

        await router.push(`/${lang || "es"}/profile`);
      }
    };

    handleAuthCallback();
  }, [router, lang]);

  const dict = getDictionary(lang as string);
  return <LoadingContainer dict={dict} />;
}
