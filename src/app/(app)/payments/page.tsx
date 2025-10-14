import { PageHeader } from "@/components/page-header";
import { payments } from "@/lib/data";
import { PaymentsTable } from "@/components/crud/payments-table";

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments"
        description="Manage all payments and their statuses."
      />
      <PaymentsTable payments={payments} />
    </>
  );
}
