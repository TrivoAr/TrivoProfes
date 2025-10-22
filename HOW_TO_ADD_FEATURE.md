# 🛠️ Tutorial: Cómo Agregar una Nueva Funcionalidad

Este tutorial te guiará paso a paso para agregar funcionalidades al Dashboard de Trivo.

---

## 📝 Ejemplo: Crear Formulario para "Nueva Salida Social"

Vamos a crear la página `/outings/crear` con un formulario completo para crear una nueva salida social.

### Paso 1: Crear el Schema de Validación

**Archivo:** `src/lib/schemas/salidaSocial.schema.ts` (crear nuevo)

```typescript
import { z } from "zod";

export const salidaSocialSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  deporte: z.string().optional(),
  descripcion: z.string().optional(),
  fecha: z.string().min(1, "La fecha es requerida"),
  hora: z.string().min(1, "La hora es requerida"),
  duracion: z.string().optional(),
  dificultad: z.enum(["Fácil", "Media", "Difícil"]).optional(),
  provincia: z.string().optional(),
  localidad: z.string().optional(),
  ubicacion: z.string().optional(),
  precio: z.string().optional(),
  cupo: z.number().min(1, "El cupo debe ser al menos 1"),
  cbu: z.string().optional(),
  alias: z.string().optional(),
  telefonoOrganizador: z.string().optional(),
  whatsappLink: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  imagen: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

export type SalidaSocialFormData = z.infer<typeof salidaSocialSchema>;
```

### Paso 2: Crear la Página del Formulario

**Archivo:** `src/app/(app)/outings/crear/page.tsx` (crear nuevo)

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salidaSocialSchema, type SalidaSocialFormData } from "@/lib/schemas/salidaSocial.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CrearSalidaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SalidaSocialFormData>({
    resolver: zodResolver(salidaSocialSchema),
    defaultValues: {
      nombre: "",
      deporte: "",
      descripcion: "",
      fecha: "",
      hora: "",
      duracion: "",
      dificultad: undefined,
      provincia: "",
      localidad: "",
      ubicacion: "",
      precio: "0",
      cupo: 10,
      cbu: "",
      alias: "",
      telefonoOrganizador: "",
      whatsappLink: "",
      imagen: "",
    },
  });

  const onSubmit = async (data: SalidaSocialFormData) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/salidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al crear salida");
      }

      const salida = await res.json();

      toast({
        title: "¡Salida creada!",
        description: `La salida "${salida.nombre}" ha sido creada exitosamente.`,
      });

      router.push("/outings");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear la salida",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Nueva Salida Social"
        description="Completa el formulario para crear una nueva salida"
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>

                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Salida *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Trekking al Cerro Champaquí" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deporte"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deporte</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un deporte" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Running">Running</SelectItem>
                            <SelectItem value="Ciclismo">Ciclismo</SelectItem>
                            <SelectItem value="Trekking">Trekking</SelectItem>
                            <SelectItem value="Otros">Otros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dificultad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dificultad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona dificultad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Fácil">Fácil</SelectItem>
                            <SelectItem value="Media">Media</SelectItem>
                            <SelectItem value="Difícil">Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe la salida..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Fecha y Hora */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fecha y Hora</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="fecha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hora"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duracion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Duración" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1hs">1 hora</SelectItem>
                            <SelectItem value="2hs">2 horas</SelectItem>
                            <SelectItem value="3hs">3 horas</SelectItem>
                            <SelectItem value="4hs+">4+ horas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ubicación</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="provincia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Córdoba" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="localidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localidad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Villa Carlos Paz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ubicacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación exacta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Av. San Martín 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cupo y Precio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cupo y Precio</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cupo Máximo *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Cantidad máxima de participantes</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="precio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>Dejar en 0 si es gratis</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("precio") && parseInt(form.watch("precio") || "0") > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cbu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CBU</FormLabel>
                          <FormControl>
                            <Input placeholder="0000003100010000000000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alias"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alias</FormLabel>
                          <FormControl>
                            <Input placeholder="mi.alias.trivo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contacto</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="telefonoOrganizador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+54 9 351 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsappLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="https://wa.me/5493511234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Imagen */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Imagen</h3>

                <FormField
                  control={form.control}
                  name="imagen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de la Imagen</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Por ahora solo URLs. Upload de archivos próximamente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="bg-[#C95100] hover:bg-[#A04200]">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Salida
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
```

### Paso 3: Actualizar la Página de Listado

**Archivo:** `src/app/(app)/outings/page.tsx` (actualizar existente)

Agregar un botón para crear nueva salida:

```typescript
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function OutingsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Salidas Sociales"
          description="Gestiona todas las salidas deportivas"
        />
        <Button asChild className="bg-[#C95100] hover:bg-[#A04200]">
          <Link href="/outings/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Salida
          </Link>
        </Button>
      </div>
      {/* Resto del código... */}
    </>
  );
}
```

---

## ✅ Checklist para Agregar una Funcionalidad

Cuando agregues una nueva funcionalidad, usa esta checklist:

### Backend
- [ ] ¿El modelo existe en `/src/models`?
- [ ] ¿El endpoint de API existe en `/src/app/api`?
- [ ] ¿El endpoint tiene validación?
- [ ] ¿El endpoint tiene manejo de errores?
- [ ] ¿El endpoint requiere autenticación?
- [ ] ¿Probaste el endpoint con Postman?

### Frontend
- [ ] ¿Creaste el schema de Zod en `/src/lib/schemas`?
- [ ] ¿Creaste el tipo TypeScript en `/src/lib/types.ts`?
- [ ] ¿Creaste la página del formulario?
- [ ] ¿El formulario usa react-hook-form + Zod?
- [ ] ¿El formulario muestra errores de validación?
- [ ] ¿El formulario muestra loading state?
- [ ] ¿El formulario muestra toast de éxito/error?
- [ ] ¿Agregaste el botón en la página de listado?
- [ ] ¿Probaste el flujo completo?

---

## 🎨 Patrón de Diseño Recomendado

Para mantener consistencia, sigue este patrón:

1. **Colores de Trivo:**
   - Primary: `#C95100` (naranja)
   - Hover: `#A04200`
   - Success: `#10b981` (verde)
   - Error: `#ef4444` (rojo)

2. **Estructura de Formularios:**
   - Usar secciones con `<h3>` para agrupar campos
   - Grid de 2 columnas en desktop, 1 en mobile
   - Campos requeridos con `*` en el label
   - FormDescription para ayudas contextuales

3. **Mensajes de Toast:**
   - Éxito: Título claro + descripción con nombre de la entidad
   - Error: Mostrar el mensaje del servidor
   - Variant: "default" para success, "destructive" para error

---

## 📚 Recursos Útiles

- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**¡Ahora puedes agregar cualquier funcionalidad siguiendo este patrón!** 🚀
