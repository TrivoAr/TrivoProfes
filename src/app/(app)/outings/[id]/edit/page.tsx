import { EditOutingForm } from "@/components/forms/edit-outing-form";

interface EditOutingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditOutingPage({ params }: EditOutingPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Editar Salida Social</h1>
          <p className="text-muted-foreground mt-2">
            Actualiza la información de tu salida social
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <EditOutingForm salidaId={id} />
        </div>
      </div>
    </div>
  );
}
