import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

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

async function tryLogin() {
  try {
    const cred = await signInAnonymously(auth);
    console.log("Logged in anonymously!", cred.user.uid);
  } catch (e) {
    console.error("Anonymous Error:", e.code, e.message);
  }
  process.exit();
}
tryLogin();
