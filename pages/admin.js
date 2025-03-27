import { useRouter } from "next/router";
import { useEffect } from "react";
import { auth } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminHome() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const admin = querySnapshot.docs.find(doc => doc.data().email === user.email && doc.data().rol === "admin");
        if (!admin) router.push("/");
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={containerStyle}>
      <h1>🔧 Panel de Administración</h1>

      <div style={buttonContainerStyle}>
        <button onClick={() => router.push("/admin/usuarios")} style={buttonStyle}>👥 Administrar Usuarios</button>
        <button onClick={() => router.push("/admin/libros")} style={buttonStyle}>📚 Administrar Libros</button>
      </div>

      <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Volver a la Página Principal</button>
    </div>
  );
}

const containerStyle = {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "#f8f8f8",
  minHeight: "100vh",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginTop: "20px",
};

const buttonStyle = {
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
};
