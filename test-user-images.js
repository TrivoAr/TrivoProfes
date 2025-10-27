// Test script to check which users actually have profile images in Firebase
const { initializeApp } = require('firebase/app');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// List of user IDs to test (add real user IDs here)
const testUsers = [
  { id: 'USER_ID_1', name: 'Matias Piovesan' },
  { id: 'USER_ID_2', name: 'Clemen Palazzo' },
  // Add more user IDs
];

async function checkUserImage(userId, userName) {
  try {
    const imageRef = ref(storage, `profile/${userId}/profile-image.jpg`);
    const url = await getDownloadURL(imageRef);
    console.log(`✅ ${userName}: Image exists - ${url.substring(0, 80)}...`);
    return true;
  } catch (error) {
    console.log(`❌ ${userName}: No image (${error.code})`);
    return false;
  }
}

async function main() {
  console.log('Checking which users have profile images in Firebase Storage...\n');

  for (const user of testUsers) {
    await checkUserImage(user.id, user.name);
  }
}

main().catch(console.error);
