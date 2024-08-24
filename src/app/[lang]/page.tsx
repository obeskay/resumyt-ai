import HomePage from "./HomePage";

export default async function Home({
  params: { lang },
}: {
  params: { lang: string };
}) {
  return (
    <HomePage
      params={{
        lang: lang,
      }}
    />
  );
}
