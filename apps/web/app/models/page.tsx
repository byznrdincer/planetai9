import { EntityGrid } from "@/components/EntityGrid";
import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import type { EntityListItem } from "@/lib/types";

export const revalidate = 300;

export default async function ModelsPage() {
  const entities = await apiSafe<EntityListItem[]>("/entities?type=model,product&limit=200", []);
  return (
    <Page title="Modeller" lead="Yapay zekâ model aileleri ve ürünleri. Her biri kendi haber akışına bağlanır.">
      <EntityGrid entities={entities} />
    </Page>
  );
}
