import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import { Locale, i18n } from "@/i18n-config";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import ProfileClient from "@/components/profile/ProfileClient";
import MainLayout from "@/components/MainLayout";

export default function ProfilePage({ user, dict, userData }) {
  if (!dict) return null;

  return (
    <MainLayout>
      <ProfileClient user={user} dict={dict} userData={userData} />
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

  return {
    props: {
      dict,
      user: session.user,
      userData: null, // Handle user data as needed
    },
  };
};
