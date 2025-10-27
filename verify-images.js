// Script para verificar si los usuarios que aparecen en Salidas tienen imágenes en la BD
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function verifyUserImages() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Definir esquema User
    const UserSchema = new mongoose.Schema({
      firstname: String,
      lastname: String,
      email: String,
      imagen: String,
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

    // Buscar usuarios que aparecen en las salidas (según los emails de los screenshots)
    const testEmails = [
      'palazzocle@gmail.com',      // Clemn Palazzo (aparece en salidas con foto)
      'matiasalumno@gmail.com',    // Matias Piovesan (aparece en salidas con foto)
      'palazzocle10@gmail.com',    // Clemen Palazzo (otro email)
    ];

    console.log('🔍 Buscando usuarios en la BD:\n');

    for (const email of testEmails) {
      const user = await User.findOne({ email }).lean();

      if (!user) {
        console.log(`❌ ${email}: NO ENCONTRADO en la BD`);
        continue;
      }

      console.log(`\n👤 ${user.firstname} ${user.lastname} (${email})`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Tiene imagen: ${!!user.imagen ? '✅ SÍ' : '❌ NO'}`);

      if (user.imagen) {
        if (user.imagen.includes('firebasestorage.googleapis.com')) {
          console.log(`   Tipo: ✅ Firebase Storage (FOTO REAL)`);
          console.log(`   URL: ${user.imagen.substring(0, 80)}...`);
        } else if (user.imagen.includes('ui-avatars.com')) {
          console.log(`   Tipo: ⚠️  Avatar Generado (ui-avatars.com)`);
          console.log(`   URL: ${user.imagen.substring(0, 80)}...`);
        } else {
          console.log(`   Tipo: ❓ Desconocido`);
          console.log(`   URL: ${user.imagen}`);
        }
      } else {
        console.log(`   URL: null`);
      }
    }

    console.log('\n✅ Verificación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUserImages();
