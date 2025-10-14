import { PageHeader } from "@/components/page-header";
import { members } from "@/lib/data";
import { MembersTable } from "@/components/crud/members-table";

export default function MembersPage() {
  return (
    <>
      <PageHeader
        title="Members"
        description="Manage all member registrations and statuses."
      />
      <MembersTable members={members} />
    </>
  );
}
