import { loadAllData } from "@/lib/load-data";
import { ClientPage } from "@/components/client-page";

export const dynamic = "force-dynamic";

export default function Home() {
  const data = loadAllData();
  const hasData = data.stats !== null || data.sessions.length > 0;

  return <ClientPage initialData={hasData ? data : null} />;
}
