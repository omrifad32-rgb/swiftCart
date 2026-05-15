import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyClINnufUSy3OUJe-bhYmwcbHzpQQKpjLc",
  authDomain: "titan-x-552bd.firebaseapp.com",
  databaseURL: "https://titan-x-552bd-default-rtdb.firebaseio.com",
  projectId: "titan-x-552bd",
  storageBucket: "titan-x-552bd.firebasestorage.app",
  appId: "1:55152198563:web:f94af0549185ef36ac5016"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function checkDB() {
  const settingsRef = ref(db, 'settings');
  try {
    const snapshot = await get(settingsRef);
    console.log("Settings:", snapshot.val());
  } catch(e) {
    console.error("Read failed:", e.message);
  }
  process.exit(0);
}
checkDB();
