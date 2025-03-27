// utils/verificarAdmin.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const esUsuarioAdmin = async (email) => {
  try {
    const usuariosSnap = await getDocs(collection(db, "usuarios"));
    const usuario = usuariosSnap.docs.find(doc => doc.data().email === email);
    return usuario?.data().rol === "admin";
  } catch (error) {
    console.error("Error al verificar el rol de admin:", error);
    return false;
  }
};
