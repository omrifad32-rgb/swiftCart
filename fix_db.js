import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';

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

async function fixDB() {
  const settingsRef = ref(db, 'settings');
  const snapshot = await get(settingsRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    console.log("Current DB settings:", data);
    let updates = {};
    if (data.title && (data.title.includes("טיטאן") || data.title.includes("Titan"))) {
        updates['title'] = data.title.replace(/טיטאן( X| x)?|Titan( X| x)?/gi, "SwiftCart").trim();
    }
    // Also change other fields if needed
    for (const key of Object.keys(data)) {
        if (typeof data[key] === 'string') {
            if (data[key].includes("טיטאן") || data[key].includes("Titan")) {
                updates[key] = data[key].replace(/טיטאן( X| x)?|Titan( X| x)?/gi, "SwiftCart").trim();
            }
        }
    }
    if (Object.keys(updates).length > 0) {
        await update(settingsRef, updates);
        console.log("Updated settings:", updates);
    } else {
        // Force title if it's not SwiftCart?
        if (data.title !== "SwiftCart") {
            await update(settingsRef, { title: "SwiftCart" });
            console.log("Forced title to SwiftCart");
        }
    }
  } else {
    console.log("No settings in DB. Setting to SwiftCart.");
    await update(settingsRef, { title: "SwiftCart" });
  }

  process.exit(0);
}

fixDB();
