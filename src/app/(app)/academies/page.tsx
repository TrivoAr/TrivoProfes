import { PageHeader } from "@/components/page-header";
import { academies } from "@/lib/data";
import { AcademiesTable } from "@/components/crud/academies-table";

export default function AcademiesPage() {
  return (
    <>
      <PageHeader
        title="Academies"
        description="Manage all academies and their membership options."
      />
      <AcademiesTable academies={academies} />
    </>
  );
}
