import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsV-yssd3sEyjnwPvdJgvMiWvjNZA9OBc",
  authDomain: "gourmetflix-41bc0.firebaseapp.com",
  projectId: "gourmetflix-41bc0",
  storageBucket: "gourmetflix-41bc0.firebasestorage.app",
  messagingSenderId: "812681732692",
  appId: "1:812681732692:web:69592d198afce56214c3c1",
};

// Asegura que la app solo se inicializa una vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
export default app;