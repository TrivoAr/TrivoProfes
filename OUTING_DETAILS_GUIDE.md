# Guía de Página de Detalles de Salida

## 📄 Vista de Detalles de Salida Social

Se ha creado una página completa para ver todos los detalles de una salida social.

---

## 🔗 Rutas

- **Página de detalles**: `/outings/[id]`
- **Componente principal**: `src/components/outings/outing-details.tsx`

---

## ✨ Características Implementadas

### **1. Información General**
- ✅ **Título y estado** de la salida (Activa/Finalizada)
- ✅ **Imagen principal** de la salida
- ✅ **Descripción completa**
- ✅ **Deporte/Actividad** con badge

### **2. Detalles de la Actividad**
- ✅ **Fecha y hora** formateadas en español
- ✅ **Duración** estimada
- ✅ **Dificultad** (Fácil/Media/Difícil)
- ✅ **Ubicación** (localidad, provincia)
- ✅ **Precio** (si aplica)

### **3. Información de Pago**
- ✅ **CBU** para transferencias
- ✅ **Alias** bancario

### **4. Contacto**
- ✅ **Teléfono del organizador**
- ✅ **Link de WhatsApp** para unirse al grupo

### **5. Participantes**
- ✅ **Lista de participantes confirmados** con avatar y datos
- ✅ **Lista de participantes pendientes** de aprobación
- ✅ **Contador de cupo** (X/Total)
- ✅ **Barra de progreso** visual del cupo
- ✅ **Botón para gestionar participantes**

### **6. Información del Organizador**
- ✅ **Card con datos del creador**:
  - Avatar
  - Nombre completo
  - Email

### **7. Sponsor** (si aplica)
- ✅ **Card con información del sponsor**:
  - Logo/imagen
  - Nombre de la empresa

### **8. Acciones Rápidas**
- ✅ **Botón Volver** - Regresa a la lista
- ✅ **Botón Editar** - Va a `/outings/[id]/edit`
- ✅ **Botón Eliminar** - Con diálogo de confirmación
- ✅ **Botón Gestionar Participantes** - Va a `/outings/[id]/miembros`

---

## 🎨 Layout de la Página

```
┌─────────────────────────────────────────────────────────┐
│  [← Volver]              [Editar] [Eliminar]            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │  COLUMNA PRINCIPAL       │  │  SIDEBAR             │ │
│  │                          │  │                      │ │
│  │  📋 Información General  │  │  👤 Organizador      │ │
│  │  - Título + Estado       │  │  - Avatar            │ │
│  │  - Imagen                │  │  - Nombre            │ │
│  │  - Descripción           │  │  - Email             │ │
│  │                          │  │                      │ │
│  │  📅 Detalles Actividad   │  │  🏢 Sponsor          │ │
│  │  - Fecha/Hora            │  │  - Logo              │ │
│  │  - Duración              │  │  - Nombre            │ │
│  │  - Dificultad            │  │                      │ │
│  │  - Ubicación             │  │  👥 Disponibilidad   │ │
│  │                          │  │  - Cupo usado        │ │
│  │  💰 Info de Pago         │  │  - Barra progreso    │ │
│  │  - CBU/Alias             │  │                      │ │
│  │                          │  └──────────────────────┘ │
│  │  📞 Contacto             │                           │
│  │  - Teléfono              │                           │
│  │  - WhatsApp              │                           │
│  │                          │                           │
│  │  👥 Participantes        │                           │
│  │  - Confirmados           │                           │
│  │  - Pendientes            │                           │
│  │  [Gestionar]             │                           │
│  └──────────────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Datos Mostrados

### **Salida Principal**
```typescript
{
  nombre: string;
  imagen?: string;
  descripcion?: string;
  deporte?: string;
  fecha?: string;
  hora?: string;
  duracion?: string;
  dificultad?: "facil" | "media" | "dificil";
  localidad?: string;
  provincia?: string;
  precio?: string;
  cupo: number;
  cbu?: string;
  alias?: string;
  telefonoOrganizador?: string;
  whatsappLink?: string;
  creador_id: User;
  sponsor_id?: Sponsor;
}
```

### **Participantes**
```typescript
{
  miembro_id: User;
  estado: "pendiente" | "aprobado" | "rechazado";
  createdAt: string;
}
```

---

## 🎯 Estados y Badges

### **Estado de la Salida**
- 🟢 **Activa** - Si la fecha es futura
- ⚪ **Finalizada** - Si la fecha ya pasó
- ⚪ **Sin fecha definida** - Si no tiene fecha

### **Estado de Participantes**
- 🟢 **Confirmado** - Participante aprobado
- 🟠 **Pendiente** - Esperando aprobación

### **Indicador de Cupo**
- Verde: Hay espacio disponible
- Naranja: Cupo completo

---

## 🔄 Flujo de Navegación

```
/outings (Lista)
    ↓
    [Click en fila o botón Ver]
    ↓
/outings/[id] (Detalles) ← ESTA PÁGINA
    ↓
    [Botón Editar] → /outings/[id]/edit
    [Botón Gestionar] → /outings/[id]/miembros
    [Botón Eliminar] → Confirmación → /outings (Lista)
    [Botón Volver] → Regresa a página anterior
```

---

## 🛠️ Implementación Técnica

### **Server Component** (Página)
```typescript
// src/app/(app)/outings/[id]/page.tsx
export default async function OutingPage({ params }) {
  const { id } = await params;
  const data = await getSalidaDetails(id);

  return <OutingDetails salida={data.salida} miembros={data.miembros} />;
}
```

### **Client Component** (Detalles)
```typescript
// src/components/outings/outing-details.tsx
"use client";

export function OutingDetails({ salida, miembros }) {
  // Manejo de acciones (eliminar, etc.)
  // Renderizado de la UI
}
```

---

## 🔐 Permisos

- **Ver detalles**: Todos los usuarios autenticados
- **Editar**: Solo `admin` o `profe` (verificado en la API)
- **Eliminar**: Solo `admin` o `profe` (verificado en la API)

---

## 📱 Responsive Design

- **Desktop**: Layout de 3 columnas (principal + sidebar)
- **Tablet**: 2 columnas adaptativas
- **Mobile**: 1 columna vertical

---

## ✅ Acciones Disponibles

### **Desde la Página de Detalles**

1. **Volver** - Regresa a la lista de salidas
2. **Editar** - Abre el formulario de edición
3. **Eliminar** - Muestra diálogo de confirmación y elimina
4. **Gestionar Participantes** - Va a la página de gestión de miembros
5. **Unirse a WhatsApp** - Abre el link del grupo (si existe)

---

## 🎨 Componentes Utilizados

- `Card`, `CardHeader`, `CardTitle`, `CardContent` - Tarjetas de información
- `Badge` - Estados y etiquetas
- `Avatar`, `AvatarImage`, `AvatarFallback` - Fotos de perfil
- `Button` - Acciones
- `Separator` - Divisores visuales
- `AlertDialog` - Confirmación de eliminación
- `Icons` - Lucide icons

---

## 🚀 Mejoras Futuras

### **Posibles Adiciones**
- [ ] Mapa interactivo con la ubicación
- [ ] Galería de imágenes (múltiples fotos)
- [ ] Comentarios/Chat de la salida
- [ ] Exportar a calendario (iCal)
- [ ] Compartir en redes sociales
- [ ] Histórico de cambios
- [ ] Ratings y reviews

---

## 💡 Notas

- La página usa **Server Components** para cargar datos
- Las acciones usan **Client Components** para interactividad
- Los datos se cargan directamente desde MongoDB
- Se populan relaciones (creador, sponsor, miembros)
- Formato de fechas en español con `date-fns`

---

## 🔗 Links Relacionados

- [Formulario de Edición](./EDIT_OUTING_GUIDE.md)
- [Formulario de Creación](./CREATE_OUTING_GUIDE.md)
- [Gestión de Miembros](./MEMBERS_GUIDE.md) (próximamente)
