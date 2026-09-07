import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <LogoMark className="mx-auto h-12 w-12" />
      <h1 className="mt-5 text-xl font-black tracking-tight text-ink">Sayfa bulunamadı</h1>
      <p className="mt-2 text-sm text-muted">Aradığınız haber kaldırılmış veya taşınmış olabilir.</p>
      <Link href="/" className="mt-6 inline-block text-sm link-accent">
        Ana sayfaya dön →
      </Link>
    </div>
  );
}
