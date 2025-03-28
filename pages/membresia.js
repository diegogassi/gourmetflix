import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Membresia() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { error } = router.query;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUsuario(null);
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUsuario({ id: user.uid, ...snap.data() });
        } else {
          setUsuario(null);
        }
      } catch (err) {
        console.error("❌ Error al obtener datos del usuario:", err);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const mostrarMensaje = () => {
    if (loading) return "Cargando datos de la membresía...";

    if (!usuario) {
      if (error === "registro") {
        return "⚠️ No pudimos encontrar tu usuario. Contactá a soporte o registrate nuevamente.";
      }
      return "⚠️ No pudimos cargar los datos del usuario. Por favor, revisá tu conexión o volvé a intentarlo.";
    }

    if (!usuario.membresiaActiva || error === "membresia") {
      return "⚠️ Parece que no tenés una membresía activa.";
    }

    return null;
  };

  const mensaje = mostrarMensaje();

  return (
    <div style={containerStyle}>
      <h2>📄 Estado de Membresía</h2>
      {mensaje && <p style={errorStyle}>{mensaje}</p>}

      {usuario && usuario.membresiaActiva && (
        <div style={{ marginBottom: "20px" }}>
          <p>Estado de tu membresía: <strong style={{ color: "green" }}>Activa</strong></p>
          <p>Nombre: <strong>{usuario.nombre}</strong></p>
          <p>Apellido: <strong>{usuario.apellido}</strong></p>
        </div>
      )}

      <div style={buttonContainerStyle}>
        <button onClick={() => router.push("/")} style={buttonStyle}>Ir a la página principal</button>
        <button onClick={() => router.push("/perfil")} style={buttonStyle}>Mi perfil</button>
      </div>
    </div>
  );
}

const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: "#f9f9f9",
  borderRadius: "10px",
  textAlign: "center",
};

const errorStyle = {
  color: "red",
  fontWeight: "bold",
  marginBottom: "20px",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginTop: "30px",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};
