import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import { Locale, i18n } from "@/i18n-config";
import { User } from "@supabase/supabase-js";
import ProfileClient from "@/components/profile/ProfileClient";
import MainLayout from "@/components/MainLayout";
import type { Database } from "@/types/supabase";

// Change this to use anonymous_users instead of profiles
type AnonymousUser = Database["public"]["Tables"]["anonymous_users"]["Row"];

interface ProfilePageProps {
  user: User | null;
  dict: any;
  userData: AnonymousUser | null;
}

export default function ProfilePage({
  user,
  dict,
  userData,
}: ProfilePageProps) {
  if (!dict) return null;

  return (
    <MainLayout>
      <ProfileClient user={user} dict={dict} userData={userData} />
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const lang = params?.lang as string;

  if (!lang) {
    return { notFound: true };
  }

  const validLang: Locale = i18n.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18n.defaultLocale;

  const dict = await getDictionary(validLang);

  return {
    props: {
      dict,
      user: null, // Handle user authentication as needed
      userData: null, // Handle user data as needed
    },
  };
};
