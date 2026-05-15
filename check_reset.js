import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyClINnufUSy3OUJe-bhYmwcbHzpQQKpjLc",
  authDomain: "titan-x-552bd.firebaseapp.com",
  projectId: "titan-x-552bd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function tryReset() {
  try {
    await sendPasswordResetEmail(auth, "omrifad32@gmail.com");
    console.log("Reset email sent!");
  } catch (e) {
    console.error("Reset Error:", e.code, e.message);
  }
  process.exit();
}
tryReset();
