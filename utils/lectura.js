// utils/lectura.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const guardarPosicionLectura = async (uid, nombreArchivo, cfi) => {
  try {
    const docRef = doc(db, "lecturas", uid);
    const snap = await getDoc(docRef);
    const data = snap.exists() ? snap.data() : {};
    await setDoc(docRef, { ...data, [nombreArchivo]: cfi });
  } catch (error) {
    console.error("❌ Error al guardar posición:", error);
  }
};

export const obtenerPosicionLectura = async (uid, nombreArchivo) => {
  try {
    const docRef = doc(db, "lecturas", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return data[nombreArchivo] || null;
    }
    return null;
  } catch (error) {
    console.error("❌ Error al obtener posición:", error);
    return null;
  }
};
