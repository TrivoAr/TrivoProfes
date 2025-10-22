# 🎯 Trivo Dashboard Administrativo

Panel de administración MVP para gestionar la plataforma deportiva Trivo.

## 📋 Stack Tecnológico

- **Framework**: Next.js 15.3 con App Router
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: NextAuth.js v4 con JWT
- **UI**: Tailwind CSS + shadcn/ui
- **Lenguaje**: TypeScript
- **Validación**: Zod + React Hook Form

## 🚀 Inicio Rápido

### 1. Prerrequisitos

- Node.js 20+
- MongoDB Atlas cuenta (o MongoDB local)
- npm o yarn

### 2. Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
npm install
```

### 3. Configuración de Variables de Entorno

Edita el archivo `.env.local` en la raíz del proyecto con tus credenciales reales:

```env
# MongoDB - Reemplaza con tu connection string real
MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@TU_CLUSTER.mongodb.net/trivo?retryWrites=true&w=majority

# NextAuth - Genera un secret seguro con: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=tu-secret-aleatorio-muy-largo-y-seguro

# App
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

**IMPORTANTE**:
- Reemplaza `MONGODB_URI` con tu connection string real de MongoDB Atlas
- Genera un `NEXTAUTH_SECRET` seguro ejecutando: `openssl rand -base64 32`

### 4. Crear Usuario Administrador

Antes de iniciar la aplicación, necesitas crear un usuario administrador en tu base de datos MongoDB.

Ejecuta el script de seed:

```bash
npm run seed:admin
```

Esto creará un usuario con las siguientes credenciales:

```
Email: admin@trivo.com
Password: Admin123!
Rol: admin
```

**IMPORTANTE**: Cambia la contraseña después del primer login en producción.

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El dashboard estará disponible en [http://localhost:9002](http://localhost:9002)

### 6. Login

1. Ve a [http://localhost:9002/login](http://localhost:9002/login)
2. Ingresa las credenciales del admin creado
3. Serás redirigido al dashboard

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/              # Página de login
│   ├── (app)/                  # Rutas protegidas
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── outings/            # Gestión de salidas sociales
│   │   ├── teams/              # Gestión de teams
│   │   ├── academies/          # Gestión de academias
│   │   ├── members/            # Gestión de miembros
│   │   └── payments/           # Gestión de pagos
│   └── api/
│       ├── auth/               # NextAuth endpoints
│       ├── stats/              # Estadísticas del dashboard
│       ├── salidas/            # CRUD de salidas sociales
│       ├── teams/              # CRUD de teams
│       ├── academias/          # CRUD de academias
│       └── pagos/              # Gestión de pagos
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   ├── providers/              # Context providers
│   ├── dashboard/              # Componentes del dashboard
│   └── crud/                   # Tablas y componentes CRUD
├── lib/
│   ├── mongodb.ts              # Conexión a MongoDB
│   ├── authOptions.ts          # Configuración de NextAuth
│   ├── types.ts                # Tipos TypeScript
│   └── utils.ts                # Utilidades
├── models/                     # Modelos de Mongoose
│   ├── User.ts
│   ├── SalidaSocial.ts
│   ├── TeamSocial.ts
│   ├── Academia.ts
│   ├── MiembroSalida.ts
│   └── Pago.ts
└── types/
    └── next-auth.d.ts          # Tipos de NextAuth
```

## 🗄️ Modelos de Base de Datos

### User
- email, password (bcrypt)
- firstname, lastname
- rol: `"alumno" | "profe" | "dueño de academia" | "admin"`
- Campos opcionales: telnumber, imagen, bio, redes sociales

### SalidaSocial
- nombre, ubicacion, deporte, fecha, hora, duracion
- precio, cupo, cbu, alias
- creador_id (ref User)
- shortId único

### TeamSocial
- Similar a SalidaSocial
- creadorId (ref User)

### Academia
- dueño_id (ref User)
- nombre_academia, pais, provincia, localidad
- tipo_disciplina: `"Running" | "Trekking" | "Ciclismo" | "Otros"`
- clase_gratis, precio

### MiembroSalida
- usuario_id (ref User)
- salida_id (ref SalidaSocial)
- estado: `"pendiente" | "aprobado" | "rechazado"`
- rol: `"miembro" | "organizador"`

### Pago
- userId (ref User)
- salidaId (ref SalidaSocial) o academiaId (ref Academia)
- estado: `"pendiente" | "aprobado" | "rechazado"`
- amount, comprobanteUrl
- tipoPago: `"transferencia" | "mercadopago"`

## 🔐 Autenticación

El sistema usa NextAuth.js con:
- **Provider**: Credentials (email/password)
- **Session**: JWT (24 horas de duración)
- **Protección**: Middleware protege todas las rutas del dashboard
- **Autorización**: Solo usuarios con rol `admin` o `profe` pueden acceder

### Endpoints de Auth
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Obtener sesión actual

## 📡 API Endpoints

### Estadísticas
- `GET /api/stats` - Obtener estadísticas del dashboard

### Salidas Sociales
- `GET /api/salidas` - Listar todas
- `POST /api/salidas` - Crear nueva
- `GET /api/salidas/[id]` - Obtener una
- `PUT /api/salidas/[id]` - Actualizar
- `DELETE /api/salidas/[id]` - Eliminar

### Miembros de Salidas
- `GET /api/salidas/[id]/miembros` - Listar miembros
- `PATCH /api/salidas/[id]/miembros/[miembroId]` - Aprobar/Rechazar
- `DELETE /api/salidas/[id]/miembros/[miembroId]` - Eliminar

### Teams
- Mismos endpoints que Salidas en `/api/teams`

### Academias
- Mismos endpoints que Salidas en `/api/academias`

### Pagos
- `GET /api/pagos?estado=pendiente` - Listar pagos (con filtro opcional)
- `PATCH /api/pagos/[id]` - Actualizar estado

## 🎨 Características Implementadas

✅ **Autenticación**
- Login con email/password
- Protección de rutas con middleware
- Logout con redirección

✅ **Dashboard**
- 6 cards de estadísticas en tiempo real
- Gráfico de ingresos
- Vista general de actividad

✅ **API Completa**
- CRUD completo para Salidas, Teams y Academias
- Gestión de miembros con aprobación/rechazo
- Gestión de pagos
- Validación de cupos

✅ **UI/UX**
- Diseño responsive (desktop y mobile)
- Sidebar colapsable
- Toast notifications
- Tablas interactivas

## 🔧 Próximos Pasos (No Implementado en MVP)

Para completar la funcionalidad total, considera agregar:

1. **Formularios de Creación/Edición**
   - Página `/outings/crear` con formulario completo
   - Página `/outings/[id]/editar`
   - Lo mismo para Teams y Academias

2. **Gestión de Miembros**
   - Página `/outings/[id]/miembros` para aprobar/rechazar
   - Vista de detalles de pago con imagen del comprobante

3. **Tablas con Datos Reales**
   - Actualizar tablas en `/outings`, `/teams`, `/academies`
   - Agregar paginación, búsqueda y filtros

4. **Validaciones**
   - Agregar esquemas Zod para todos los formularios
   - Validación de imágenes (upload)

5. **Mejoras**
   - Upload de imágenes a un servicio (Cloudinary, S3)
   - Exportar reportes a CSV/PDF
   - Notificaciones por email
   - Roles y permisos más granulares

## 🐛 Troubleshooting

### Error: "MONGODB_URI must be defined"
Asegúrate de que `.env.local` existe y tiene la variable `MONGODB_URI` correctamente configurada.

### Error: "Invalid session"
Genera un nuevo `NEXTAUTH_SECRET` ejecutando `openssl rand -base64 32` y actualiza `.env.local`.

### No puedo hacer login
1. Verifica que el usuario admin fue creado ejecutando `npm run seed:admin`
2. Verifica las credenciales en la base de datos
3. Revisa los logs de la consola para más detalles

### Error de conexión a MongoDB
1. Verifica que tu IP está en la whitelist de MongoDB Atlas
2. Verifica el connection string
3. Asegúrate de que el cluster está activo

## 📝 Notas Importantes

- Este es un **MVP (Producto Mínimo Viable)** - algunas funcionalidades están parcialmente implementadas
- La conexión a MongoDB usa caché global para evitar múltiples conexiones en desarrollo
- Todos los endpoints requieren autenticación
- Las contraseñas se hashean con bcrypt (10 rounds)
- Los IDs de MongoDB se usan como referencias entre colecciones

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Crea el modelo en `src/models/` si es necesario
2. Agrega los tipos en `src/lib/types.ts`
3. Crea los endpoints en `src/app/api/`
4. Crea las páginas en `src/app/(app)/`
5. Actualiza este README

## 📄 Licencia

Este proyecto es parte de la plataforma Trivo.

---

**Desarrollado con** ❤️ **para Trivo** 🏃‍♂️🚴‍♀️⛰️
