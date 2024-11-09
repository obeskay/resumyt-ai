import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import { Locale, i18n } from "@/i18n-config";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ProfileClient from "@/components/profile/ProfileClient";
import MainLayout from "@/components/MainLayout";

// Definimos el tipo User que coincide con el esperado por ProfileClient
type User = {
  name: string | null;
  email: string | null;
  image: string | null;
} | null;

interface ProfilePageProps {
  user: User;
  dict: any;
  userData: any | null;
}

export default function ProfilePage({
  user,
  dict,
  userData,
}: ProfilePageProps) {
  if (!dict) return null;

  return (
    <MainLayout>
      <ProfileClient user={user as any} dict={dict} userData={userData} />
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const lang = params?.lang as string;

  if (!session) {
    return {
      redirect: {
        destination: `/${lang}/login`,
        permanent: false,
      },
    };
  }

  const validLang: Locale = i18n.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18n.defaultLocale;

  const dict = await getDictionary(validLang);

  // Aseguramos que user sea del tipo correcto
  const user: any = session.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  return {
    props: {
      dict,
      user,
      userData: null, // Handle user data as needed
    },
  };
};
