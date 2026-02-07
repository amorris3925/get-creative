import { fetchSectionContent } from "@/lib/content/fetcher";
import ZurichV2 from "@/components/ZurichV2";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  const content = await fetchSectionContent('home');
  return <ZurichV2 content={content} />;
}
