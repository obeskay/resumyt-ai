import { redirect } from 'next/navigation'

export default function Home() {
  // En Pages Router, no podemos usar 'redirect' directamente.
  // En su lugar, usamos getServerSideProps para redirigir.
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/es',
      permanent: false,
    },
  }
}