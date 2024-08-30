import HomePage from "./HomePage";

export default function Home({
  params: { lang },
}: {
  params: { lang: string };
}) {
  return <HomePage params={{ lang }} />;
}
