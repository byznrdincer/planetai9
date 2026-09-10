import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";
import { adminToken, loadQueue } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetim",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const token = await adminToken();
  const { authed, apps } = await loadQueue(token);
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="kicker">PlanetAI9</p>
        <h1 className="mt-1 text-[26px] font-extrabold tracking-tight3 text-ink dark:text-d-ink">
          Marketplace Yönetimi
        </h1>
        <p className="mt-2 text-[14px] text-ink-2 dark:text-d-ink-2">
          Topluluktan gelen uygulama başvurularını buradan onayla veya reddet.
        </p>
      </header>
      <AdminPanel authed={authed} apps={apps} />
    </div>
  );
}
