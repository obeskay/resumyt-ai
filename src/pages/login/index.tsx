import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Función para manejar el inicio de sesión con Google
  async function handleSignInWithGoogle(response: any) {
    try {
      // Intentar primero con Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) {
        // Si falla Supabase, intentar con NextAuth
        await signIn("google", {
          callbackUrl: getCallbackUrl(),
        });
        return;
      }

      // Si el inicio de sesión con Supabase es exitoso, redirigir
      router.push(getCallbackUrl());
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  }

  const getCallbackUrl = () => {
    const returnUrl = searchParams?.get("returnUrl");
    if (returnUrl) {
      return decodeURIComponent(returnUrl);
    }
    const locale = window.location.pathname.split("/")[1];
    return `/${locale}/profile`;
  };

  useEffect(() => {
    // Exponer la función al scope global para que Google pueda llamarla
    (window as any).handleSignInWithGoogle = handleSignInWithGoogle;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      {/* Botón de Google Sign-In */}
      <div
        id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-auto_select="true"
        data-itp_support="true"
        data-use_fedcm_for_prompt="true"
      />

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
      />
    </div>
  );
}
