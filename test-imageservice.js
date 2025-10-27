// Test para verificar si ImageService.getImageUrl funciona
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testImageService() {
  console.log('🔥 Testing ImageService...\n');

  // Importar módulos de Firebase
  const { ref, getDownloadURL } = await import('firebase/storage');
  const { getStorageInstance } = await import('./src/lib/firebaseConfig.js');

  try {
    // Test con el ID de Clemn Palazzo
    const userId = '67c8ae861521ef3ec904bbbc';
    const path = `profile/${userId}`;
    const fileName = 'profile-image.jpg';

    console.log(`📁 Intentando cargar: ${path}/${fileName}\n`);

    const storage = await getStorageInstance();
    const fileRef = ref(storage, `${path}/${fileName}`);

    console.log('⏳ Obteniendo URL de descarga...');

    const url = await getDownloadURL(fileRef);

    console.log('✅ ¡IMAGEN ENCONTRADA!');
    console.log(`URL: ${url.substring(0, 100)}...`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.code || error.message);

    if (error.code === 'storage/object-not-found') {
      console.log('\n💡 La imagen no existe en Firebase Storage');
      console.log('   Esto es normal si el usuario no ha subido foto');
    }

    process.exit(1);
  }
}

testImageService();
