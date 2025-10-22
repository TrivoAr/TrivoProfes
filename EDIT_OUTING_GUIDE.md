# Guía de Edición de Salidas Sociales

## 📝 Formulario de Edición

Se ha creado un formulario completo para editar salidas sociales existentes.

### 🔗 Rutas

- **Página de edición**: `/outings/[id]/edit`
- **Componente**: `src/components/forms/edit-outing-form.tsx`

### ✨ Características

El formulario de edición incluye:

1. **Carga automática de datos existentes** - Al abrir el formulario, se cargan todos los datos de la salida desde la base de datos
2. **Todos los campos editables**:
   - ✅ Nombre de la salida
   - ✅ Deporte/Actividad
   - ✅ Descripción
   - ✅ Fecha y Hora
   - ✅ Duración
   - ✅ Ubicación (con mapa interactivo)
   - ✅ Dificultad
   - ✅ Cupo máximo
   - ✅ Información de pago (precio, CBU, alias)
   - ✅ Contacto (teléfono, WhatsApp)
   - ✅ Sponsor
   - ✅ Imagen

3. **Gestión de imágenes**:
   - Muestra la imagen existente
   - Permite seleccionar una nueva imagen
   - Sube la nueva imagen a Firebase Storage en `salidas/[id]`
   - Actualiza la URL en la base de datos

4. **Validaciones**:
   - Nombre requerido
   - Cupo mínimo de 1 persona
   - Validación de archivos de imagen (5MB máx, JPG/PNG/WebP)

### 🚀 Cómo usar

#### Desde código

```tsx
import { EditOutingForm } from "@/components/forms/edit-outing-form";

export default function EditPage({ params }) {
  return (
    <EditOutingForm
      salidaId={params.id}
      onSuccess={() => {
        // Callback opcional después de editar
      }}
    />
  );
}
```

#### Desde la interfaz

1. Navegar a `/outings/[id]/edit` donde `[id]` es el ID de la salida
2. El formulario cargará automáticamente todos los datos
3. Editar los campos deseados
4. Click en "Actualizar Salida"

### 🔄 Flujo de actualización

```
1. Usuario abre /outings/[id]/edit
   ↓
2. GET /api/salidas/[id] - Cargar datos existentes
   ↓
3. Mostrar formulario con datos prellenados
   ↓
4. Usuario edita campos y/o selecciona nueva imagen
   ↓
5. Submit del formulario
   ↓
6. PUT /api/salidas/[id] - Actualizar datos
   ↓
7. Si hay nueva imagen:
   - Subir a Firebase: salidas/[id]
   - PATCH /api/salidas/[id] - Actualizar URL imagen
   ↓
8. ✅ Salida actualizada
```

### 📋 Endpoints utilizados

- `GET /api/salidas/[id]` - Obtener datos de la salida
- `PUT /api/salidas/[id]` - Actualizar datos de la salida
- `PATCH /api/salidas/[id]` - Actualizar solo la imagen
- `GET /api/sponsors` - Cargar lista de sponsors

### 🔐 Permisos

Solo usuarios con rol `admin` o `profe` pueden editar salidas.

### ⚠️ Notas importantes

1. La imagen se guarda directamente en `salidas/[id]` (sin subcarpeta ni nombre de archivo adicional)
2. Los campos `creador_id` y `shortId` no pueden ser modificados
3. Si hay error al subir la imagen, los datos se actualizan pero se muestra una advertencia
4. Todos los campos (excepto nombre y cupo) son opcionales

### 🎨 Interfaz

El formulario está organizado en secciones:
- **Información Básica** - Nombre, deporte, descripción
- **Fecha y Hora** - Fecha, hora, duración
- **Ubicación** - Punto de encuentro con mapa
- **Detalles de la Actividad** - Dificultad, cupo
- **Información de Pago** - Precio, CBU, alias
- **Información de Contacto** - Teléfono, WhatsApp
- **Sponsor** - Selector de sponsor
- **Imagen** - Carga de imagen

### 🔗 Integración con la tabla de salidas

Para agregar un botón de edición en la tabla de salidas:

```tsx
import { Edit } from "lucide-react";
import Link from "next/link";

<Link href={`/outings/${salida._id}/edit`}>
  <Button variant="outline" size="sm">
    <Edit className="h-4 w-4 mr-2" />
    Editar
  </Button>
</Link>
```
