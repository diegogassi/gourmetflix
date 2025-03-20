import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBsV-yssd3sEyjnwPvdJgvMiWvjNZA9OBc",
  authDomain: "gourmetflix-41bc0.firebaseapp.com",
  projectId: "gourmetflix-41bc0",
  storageBucket: "gourmetflix-41bc0.firebasestorage.app",
  messagingSenderId: "812681732692",
  appId: "1:812681732692:web:69592d198afce56214c3c1",
};

// Inicializar Firebase solo si no está inicializado
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;
