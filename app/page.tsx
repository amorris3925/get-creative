import { fetchSectionContent } from "@/lib/content/fetcher";
import { verifyAdmin } from "@/lib/admin/auth";
import ZurichV2 from "@/components/ZurichV2";
import EditableWrapper from "@/components/editor/EditableWrapper";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  const [content, isAdmin] = await Promise.all([
    fetchSectionContent('home'),
    verifyAdmin(),
  ]);

  return (
    <EditableWrapper isAdmin={isAdmin}>
      <ZurichV2 content={content} />
    </EditableWrapper>
  );
}
