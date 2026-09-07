import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="headline text-6xl text-line">404</p>
      <h1 className="mt-4 headline text-xl">Sayfa bulunamadı</h1>
      <p className="mt-2 text-sm text-muted">Aradığınız haber kaldırılmış veya taşınmış olabilir.</p>
      <Link href="/" className="mt-6 inline-block text-sm link-accent">
        Ana sayfaya dön →
      </Link>
    </div>
  );
}
