import { useEffect, useState } from 'react';
import VideoInput from '@/components/VideoInput';
import { getUserQuota } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

export default function Home() {
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function initializeUser() {
      setIsLoading(true);
      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const quota = await getUserQuota();
          setQuotaRemaining(quota);
        } else {
          // Manejar el caso de usuario no autenticado
          console.log('Usuario no autenticado');
          setQuotaRemaining(null);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setQuotaRemaining(null);
      } finally {
        setIsLoading(false);
      }
    }

    initializeUser();
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Video Summarizer</h1>
        {userId ? (
          <VideoInput 
            userId={userId}
            isLoading={isLoading}
            quotaRemaining={quotaRemaining}
            placeholder="Ingrese la URL del video de YouTube"
            buttonText="Resumir"
          />
        ) : (
          <div>Por favor, inicie sesión para usar el Video Summarizer.</div>
        )}
      </div>
    </main>
  );
}