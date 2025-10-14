import { PageHeader } from "@/components/page-header";
import { teams } from "@/lib/data";
import { TeamsTable } from "@/components/crud/teams-table";

export default function TeamsPage() {
  return (
    <>
      <PageHeader
        title="Teams"
        description="Manage all sports teams and their members."
      />
      <TeamsTable teams={teams} />
    </>
  );
}
