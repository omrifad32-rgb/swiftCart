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

async function testRead() {
  try {
    const s = await get(ref(db, 'products'));
    console.log("Read products success:", !!s.val());
  } catch (e) {
    console.log("Read error:", e.message);
  }
  process.exit();
}
testRead();
