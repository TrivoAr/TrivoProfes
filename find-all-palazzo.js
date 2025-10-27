// Buscar TODOS los usuarios Palazzo y Piovesan en la BD
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function findAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

    // Buscar todos los Palazzo
    console.log('🔍 Buscando todos los usuarios "Palazzo":\n');
    const palazzos = await User.find({
      $or: [
        { firstname: /palazzo/i },
        { lastname: /palazzo/i },
        { email: /palazzo/i }
      ]
    }).lean();

    for (const user of palazzos) {
      console.log(`\n👤 ${user.firstname} ${user.lastname}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Imagen: ${user.imagen ? user.imagen.substring(0, 80) + '...' : 'null'}`);

      if (user.imagen && user.imagen.includes('firebasestorage')) {
        console.log(`   ✅ TIENE FOTO DE FIREBASE!`);
      }
    }

    // Buscar todos los Piovesan
    console.log('\n\n🔍 Buscando todos los usuarios "Piovesan":\n');
    const piovesans = await User.find({
      $or: [
        { firstname: /piovesan/i },
        { lastname: /piovesan/i },
        { email: /piovesan/i }
      ]
    }).lean();

    for (const user of piovesans) {
      console.log(`\n👤 ${user.firstname} ${user.lastname}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Imagen: ${user.imagen ? user.imagen.substring(0, 80) + '...' : 'null'}`);

      if (user.imagen && user.imagen.includes('firebasestorage')) {
        console.log(`   ✅ TIENE FOTO DE FIREBASE!`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findAllUsers();
