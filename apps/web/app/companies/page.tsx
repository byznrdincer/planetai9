import { EntityGrid } from "@/components/EntityGrid";
import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import type { EntityListItem } from "@/lib/types";

export const revalidate = 300;

export default async function CompaniesPage() {
  const entities = await apiSafe<EntityListItem[]>("/entities?type=company,institution&limit=200", []);
  return (
    <Page title="Şirketler" lead="Yapay zekâ şirketleri ve kurumları. Şirket sayfasında son haberler ve ilişki grafiği yer alır.">
      <EntityGrid entities={entities} />
    </Page>
  );
}
