import { PageHeader } from "@/components/page-header";
import { PaymentsTable } from "@/components/crud/payments-table";
import { PaymentConfig } from "@/components/payments/payment-config";
import { connectDB } from "@/lib/mongodb";
import Pago from "@/models/Pago";
import type { Payment } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function getPagos() {
  try {
    await connectDB();

    const pagos = await Pago.find()
      .populate("userId", "firstname lastname email imagen")
      .populate("salidaId", "nombre")
      .populate("academiaId", "nombre_academia")
      .sort({ createdAt: -1 })
      .lean();

    const serializedPagos = pagos.map((pago: any) => ({
      _id: pago._id.toString(),
      userId: pago.userId
        ? {
            _id: pago.userId._id?.toString(),
            firstname: pago.userId.firstname,
            lastname: pago.userId.lastname,
            email: pago.userId.email,
            imagen: pago.userId.imagen,
          }
        : null,
      salidaId: pago.salidaId
        ? {
            _id: pago.salidaId._id?.toString(),
            nombre: pago.salidaId.nombre,
          }
        : null,
      academiaId: pago.academiaId
        ? {
            _id: pago.academiaId._id?.toString(),
            nombre_academia: pago.academiaId.nombre_academia,
          }
        : null,
      comprobanteUrl: pago.comprobanteUrl || undefined,
      estado: pago.estado || "pendiente",
      amount: pago.amount || undefined,
      tipoPago: pago.tipoPago || "transferencia",
      createdAt: pago.createdAt,
      updatedAt: pago.updatedAt,
    }));

    return JSON.parse(JSON.stringify(serializedPagos)) as Payment[];
  } catch (error) {
    console.error("Error fetching pagos:", error);
    return [];
  }
}

export default async function PaymentsPage() {
  const pagos = await getPagos();
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.rol === "admin";

  return (
    <>
      <PageHeader
        title="Pagos"
        description="Gestiona y aprueba los pagos de los miembros."
      />

      {/* Configuración de pagos - Solo para admins */}
      {isAdmin && (
        <div className="mb-6">
          <PaymentConfig />
        </div>
      )}

      {/* Tabla de pagos */}
      <PaymentsTable payments={pagos} />
    </>
  );
}
