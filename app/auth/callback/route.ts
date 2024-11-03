import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const lang = requestUrl.pathname.split("/")[1] || "es";

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Create or update user profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: session.user.id,
          email: session.user.email,
          updated_at: new Date().toISOString(),
          quota_remaining: 10,
          quota_max: 10,
          quota_reset_date: new Date(
            new Date().setMonth(new Date().getMonth() + 1),
          ).toISOString(),
          plan: "free",
        },
        {
          onConflict: "id",
        },
      );

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      return NextResponse.redirect(`${origin}/${lang}/profile`);
    }
  }

  // En caso de error, redirige a la página de login
  return NextResponse.redirect(`${origin}/${lang}/login`);
}
