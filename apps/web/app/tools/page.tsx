import Link from "next/link";
import { Page } from "@/components/Page";

export const revalidate = 3600;

export default function ToolsPage() {
  return (
    <Page title="Araçlar" lead="Yapay zekâ araçları dizini yakında burada olacak.">
      <div className="card p-8 text-center">
        <p className="text-sm text-ink-2">
          Yazma, kodlama, görsel, ses ve ajan araçları için keşif alanı hazırlanıyor.
        </p>
        <Link href="/news?category=AICoding" className="mt-4 inline-block text-sm link-accent">
          Bu arada kodlama haberlerine bak →
        </Link>
      </div>
    </Page>
  );
}
