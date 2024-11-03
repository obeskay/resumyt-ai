import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import { Locale, i18n } from "@/i18n-config";
import AuthForm from "@/components/auth/AuthForm";
import { motion } from "framer-motion";
import { getSupabase } from "@/lib/supabase";

export default function SignIn({ dict, lang }: { dict: any; lang: Locale }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <div className="container relative max-w-[400px] mx-auto">
        <AuthForm dict={dict} lang={lang} />
      </div>
    </motion.div>
  );
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

  // Check if user is already authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return {
      redirect: {
        destination: `/${validLang}/profile`,
        permanent: false,
      },
    };
  }

  const dict = await getDictionary(validLang);

  return {
    props: {
      dict,
      lang: validLang,
    },
  };
};
