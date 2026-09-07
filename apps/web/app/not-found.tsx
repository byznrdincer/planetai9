import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-8 py-24 text-center">
      <p className="text-5xl">🛰️</p>
      <h1 className="mt-4 text-xl font-black tracking-tight">Uzayda kaybolduk</h1>
      <p className="mt-2 text-sm text-muted">Bu sinyal radarda yok.</p>
      <Link href="/" className="mt-6 inline-block text-sm link-accent">
        PlanetAI&apos;ye dön →
      </Link>
    </div>
  );
}
