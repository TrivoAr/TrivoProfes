import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
dotenv.config({ path: join(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI no está definido en .env.local");
  process.exit(1);
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  rol: {
    type: String,
    enum: ["alumno", "profe", "dueño de academia", "admin"],
    required: true,
  },
  telnumber: { type: String },
  imagen: { type: String },
  bio: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  twitter: { type: String },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  try {
    console.log("🔄 Conectando a MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@trivo.com" });

    if (existingAdmin) {
      console.log("⚠️  El usuario admin@trivo.com ya existe");
      console.log("📧 Email: admin@trivo.com");
      console.log("🔑 Password: (usa la contraseña existente o elimina el usuario primero)");
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    // Create admin user
    const admin = await User.create({
      email: "admin@trivo.com",
      password: hashedPassword,
      firstname: "Admin",
      lastname: "Trivo",
      rol: "admin",
      telnumber: "+54 9 11 1234-5678",
      imagen: "https://ui-avatars.com/api/?name=Admin+Trivo&background=C95100&color=fff",
      bio: "Administrador principal del panel de Trivo",
    });

    console.log("\n✅ Usuario administrador creado exitosamente!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    admin@trivo.com");
    console.log("🔑 Password: Admin123!");
    console.log("👤 Nombre:   Admin Trivo");
    console.log("🎭 Rol:      admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login en producción\n");

    // Optionally create a profe user
    const existingProfe = await User.findOne({ email: "profe@trivo.com" });

    if (!existingProfe) {
      const hashedProfePassword = await bcrypt.hash("Profe123!", 10);

      await User.create({
        email: "profe@trivo.com",
        password: hashedProfePassword,
        firstname: "Profesor",
        lastname: "Demo",
        rol: "profe",
        telnumber: "+54 9 11 8765-4321",
        imagen: "https://ui-avatars.com/api/?name=Profesor+Demo&background=10b981&color=fff",
        bio: "Usuario de prueba con rol de profesor",
      });

      console.log("✅ Usuario profesor creado exitosamente!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📧 Email:    profe@trivo.com");
      console.log("🔑 Password: Profe123!");
      console.log("👤 Nombre:   Profesor Demo");
      console.log("🎭 Rol:      profe");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }

    await mongoose.disconnect();
    console.log("🎉 Proceso completado. Puedes iniciar sesión en http://localhost:9002/login\n");

  } catch (error: any) {
    console.error("\n❌ Error creando usuario administrador:");
    console.error(error.message);

    if (error.code === 11000) {
      console.error("\n⚠️  El usuario ya existe en la base de datos");
    }

    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
