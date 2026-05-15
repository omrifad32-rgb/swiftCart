import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyClINnufUSy3OUJe-bhYmwcbHzpQQKpjLc",
  authDomain: "titan-x-552bd.firebaseapp.com",
  databaseURL: "https://titan-x-552bd-default-rtdb.firebaseio.com",
  projectId: "titan-x-552bd",
  storageBucket: "titan-x-552bd.firebasestorage.app",
  appId: "1:55152198563:web:f94af0549185ef36ac5016"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function setPassword() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, "omrifad32@gmail.com", "Omrifad3232@@");
    console.log("Created successfully!");
  } catch (e) {
    console.error("Error creating:", e.code, e.message);
  }
  process.exit();
}
setPassword();
