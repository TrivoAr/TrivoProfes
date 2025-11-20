import { PageHeader } from "@/components/page-header";
import { PaymentConfig } from "@/components/payments/payment-config";
import { WhatsAppConfig } from "@/components/whatsapp/whatsapp-config";
import { ClubTrekkingConfigComponent } from "@/components/club-trekking/club-config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.rol === "admin";

  return (
    <>
      <PageHeader
        title="Configuraciones"
        description="Gestiona la configuración de pagos, Club del Trekking y grupos de WhatsApp del sistema."
      />

      {/* Configuración de pagos, Club y WhatsApp - Solo para admins */}
      {isAdmin ? (
        <div className="space-y-6">
          <PaymentConfig />
          <ClubTrekkingConfigComponent />
          <WhatsAppConfig />
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <p>Solo los administradores pueden acceder a esta sección.</p>
        </div>
      )}
    </>
  );
}
