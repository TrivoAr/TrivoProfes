import { PageHeader } from "@/components/page-header";
import { CreateOutingForm } from "@/components/forms/create-outing-form";

export default function NewOutingPage() {
  return (
    <>
      <PageHeader
        title="Crear Nueva Salida Social"
        description="Completa el formulario para crear una nueva salida social."
      />
      <div className="max-w-4xl">
        <CreateOutingForm />
      </div>
    </>
  );
}
