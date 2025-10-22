# 🚀 Guía de Configuración Rápida - Trivo Dashboard

Esta guía te ayudará a poner en marcha el dashboard administrativo de Trivo en **5 minutos**.

## ✅ Paso 1: Verificar Prerrequisitos

Asegúrate de tener instalado:
- ✅ Node.js 20 o superior
- ✅ npm (viene con Node.js)
- ✅ Una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)

## ✅ Paso 2: Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea un nuevo cluster (gratuito M0)
3. En **Database Access**, crea un usuario con contraseña
4. En **Network Access**, agrega tu IP actual (o 0.0.0.0/0 para desarrollo)
5. Haz clic en **Connect** → **Connect your application**
6. Copia el connection string (se ve así):
   ```
   mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## ✅ Paso 3: Configurar Variables de Entorno

1. Abre el archivo `.env.local` en la raíz del proyecto (ya existe)
2. Reemplaza los valores de ejemplo con tus credenciales reales:

```env
# Pega tu connection string aquí (reemplaza <password> con tu contraseña real)
MONGODB_URI=mongodb+srv://usuario:TU_PASSWORD@cluster0.xxxxx.mongodb.net/trivo?retryWrites=true&w=majority

# Genera un secret seguro con: openssl rand -base64 32
NEXTAUTH_SECRET=tu-secret-aleatorio-muy-largo-y-seguro

# Estas pueden quedarse igual para desarrollo local
NEXTAUTH_URL=http://localhost:9002
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### Generar NEXTAUTH_SECRET

En tu terminal, ejecuta:

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**O usa uno de estos ejemplos temporales:**
```
kJ8v2nX9pL4mQ7wR1tY6uI0oP3sA5zB8cD7fG2hK9jM4
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET`.

## ✅ Paso 4: Instalar Dependencias (si es necesario)

Las dependencias ya están instaladas, pero si necesitas reinstalarlas:

```bash
npm install
```

## ✅ Paso 5: Crear Usuario Administrador

Ejecuta el script de seed para crear un usuario admin en tu base de datos:

```bash
npm run seed:admin
```

Deberías ver este resultado:

```
✅ Usuario administrador creado exitosamente!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    admin@trivo.com
🔑 Password: Admin123!
👤 Nombre:   Admin Trivo
🎭 Rol:      admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Guarda estas credenciales - las necesitarás para hacer login.**

También se crea un usuario con rol "profe":
```
📧 Email:    profe@trivo.com
🔑 Password: Profe123!
```

## ✅ Paso 6: Iniciar el Servidor

```bash
npm run dev
```

Verás algo como:

```
▲ Next.js 15.3.3
- Local:        http://localhost:9002
- Experiments (use with caution):
  · turbopack

✓ Ready in 2.3s
```

## ✅ Paso 7: Acceder al Dashboard

1. Abre tu navegador en [http://localhost:9002](http://localhost:9002)
2. Serás redirigido a [http://localhost:9002/login](http://localhost:9002/login)
3. Ingresa las credenciales:
   - **Email:** `admin@trivo.com`
   - **Password:** `Admin123!`
4. Haz clic en **Iniciar Sesión**
5. ¡Listo! Deberías ver el dashboard con las estadísticas

## 🎉 ¡Todo Configurado!

Ahora deberías ver:

- 📊 **Dashboard** con 6 cards de estadísticas (probablemente todas en 0 por ahora)
- 🏃 **Salidas Sociales** (vacío)
- 👥 **Teams** (vacío)
- 🎓 **Academias** (vacío)
- 💳 **Pagos** (vacío)

## 🔧 Próximos Pasos

El MVP está configurado con:
- ✅ Autenticación funcional
- ✅ Dashboard con estadísticas en tiempo real
- ✅ API completa (CRUD para todas las entidades)
- ✅ Protección de rutas
- ✅ UI responsive

### Para completar la funcionalidad:

1. **Crear formularios de agregar/editar** para Salidas, Teams y Academias
2. **Conectar las tablas** en las páginas `/outings`, `/teams`, `/academies`
3. **Implementar gestión de miembros** con aprobación/rechazo
4. **Agregar upload de imágenes** (Cloudinary o similar)

## 🐛 ¿Problemas?

### "Error: MONGODB_URI must be defined"
- Verifica que `.env.local` existe
- Verifica que copiaste el connection string correctamente
- Reinicia el servidor (`Ctrl+C` y `npm run dev` de nuevo)

### "Invalid credentials" al hacer login
- Verifica que ejecutaste `npm run seed:admin`
- Verifica las credenciales: `admin@trivo.com` / `Admin123!`
- Revisa la consola del navegador (F12) para errores

### "Cannot connect to MongoDB"
- Verifica que tu IP está en la whitelist de MongoDB Atlas
- Verifica que reemplazaste `<password>` en el connection string
- Verifica que el cluster está activo en MongoDB Atlas

### El dashboard muestra "0" en todas las stats
- Es normal - la base de datos está vacía
- Agrega datos usando los formularios (cuando los implementes)
- O agrega datos manualmente en MongoDB Atlas

## 📚 Documentación Adicional

- [DASHBOARD_README.md](DASHBOARD_README.md) - Documentación completa del dashboard
- [README.md](README.md) - Documentación del proyecto principal
- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Mongoose Docs](https://mongoosejs.com/docs/)

## 🆘 Ayuda

Si tienes problemas:
1. Revisa los logs de la consola del servidor
2. Revisa la consola del navegador (F12)
3. Consulta [DASHBOARD_README.md](DASHBOARD_README.md) sección "Troubleshooting"

---

**¡Feliz desarrollo! 🚀**
