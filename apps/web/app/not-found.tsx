import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl">🛰️</p>
      <h1 className="mt-4 text-xl font-semibold">Lost in space</h1>
      <p className="mt-2 text-sm text-text-dim">This signal isn&apos;t on the radar.</p>
      <Link href="/" className="mt-6 inline-block text-sm text-accent hover:underline">
        Back to PlanetAI →
      </Link>
    </div>
  );
}
