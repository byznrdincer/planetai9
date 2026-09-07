import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { getDict } from "@/lib/i18n";

export default async function NotFound() {
  const t = await getDict();
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <LogoMark className="mx-auto h-12 w-12" />
      <h1 className="mt-5 text-xl font-black tracking-tight text-ink">{t.common.notFound}</h1>
      <p className="mt-2 text-sm text-muted">{t.common.notFoundBody}</p>
      <Link href="/" className="mt-6 inline-block text-sm link-accent">
        {t.common.backHome}
      </Link>
    </div>
  );
}
