import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import { getSupabase } from "@/lib/supabase";
import ProfileClient from "@/components/profile/ProfileClient";
import { Locale, i18n } from "@/i18n-config";
import type { User } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfilePageProps {
  user: User | null;
  profile: Profile | null;
  dict: any;
}

export default function ProfilePage({ user, profile, dict }: ProfilePageProps) {
  if (!user || !profile) {
    return <div>Loading...</div>; // Or redirect to login
  }

  return <ProfileClient user={user} profile={profile} dict={dict} />;
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const lang = params?.lang as string;
  const validLang: Locale = i18n.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18n.defaultLocale;

  const supabase = getSupabase();

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: `/${validLang}/login`,
        permanent: false,
      },
    };
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    // If no profile exists, redirect to signin
    return {
      redirect: {
        destination: `/${validLang}/auth/signin`,
        permanent: false,
      },
    };
  }

  const dict = await getDictionary(validLang);

  return {
    props: {
      user: session.user,
      profile,
      dict,
    },
  };
};
