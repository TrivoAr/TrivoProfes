import { PageHeader } from "@/components/page-header";
import { socialOutings } from "@/lib/data";
import { OutingsTable } from "@/components/crud/outings-table";

export default function SocialOutingsPage() {
  return (
    <>
      <PageHeader
        title="Social Outings"
        description="Manage all social outings and events."
      />
      <OutingsTable outings={socialOutings} />
    </>
  );
}
