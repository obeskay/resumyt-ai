import { GetServerSideProps } from "next";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ProfileClient from "@/components/profile/ProfileClient";
import { getDictionary } from "@/lib/getDictionary";
import { Database } from "@/types/supabase";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookies(),
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const [profile, dict] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => data),
    getDictionary(params?.lang as string),
  ]);

  if (!profile) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
      profile,
      dict,
    },
  };
};

interface ProfilePageProps {
  user: Database["public"]["Tables"]["profiles"]["Row"]["user"];
  profile: Database["public"]["Tables"]["profiles"]["Row"];
  dict: any;
}

export default function ProfilePage({ user, profile, dict }: ProfilePageProps) {
  return <ProfileClient user={user} profile={profile} dict={dict} />;
}
