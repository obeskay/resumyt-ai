import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Script from "next/script";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Función para manejar el inicio de sesión con Google
  async function handleSignInWithGoogle(response: any) {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) throw error;

      router.push("/profile"); // Redirige después del login exitoso
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  }

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
