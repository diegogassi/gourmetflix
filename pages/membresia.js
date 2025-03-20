import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Membresia() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [membresiaActiva, setMembresiaActiva] = useState(false);
  const [fechaExpiracion, setFechaExpiracion] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        await cargarEstadoMembresia(user.email);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const cargarEstadoMembresia = async (email) => {
    try {
      const usuarioRef = doc(db, "usuarios", email);
      const docSnap = await getDoc(usuarioRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
  
        if (data.membresiaActiva !== undefined && data.fechaExpiracion) {
          setMembresiaActiva(data.membresiaActiva);
  
          const fechaExpiracionDB = data.fechaExpiracion.toDate();
          setFechaExpiracion(fechaExpiracionDB);
  
          const hoy = new Date();
          if (!data.membresiaActiva && hoy > fechaExpiracionDB) {
            setMensaje("No tenés una membresía activa para leer ese libro.");
          } else if (!data.membresiaActiva) {
            setMensaje(`Tu acceso expira el ${fechaExpiracionDB.toLocaleDateString()}.`);
          } else {
            setMensaje("Tu membresía está activa. Disfruta de todo el catálogo.");
          }
        } else {
          setMensaje("No tenés una membresía activa para leer ese libro.");
        }
      } else {
        setMensaje("El usuario no existe en Firestore.");
      }
    } catch (err) {
      console.error("Error al obtener la membresía:", err);
      setMensaje("Error al cargar el estado de la membresía.");
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Estado de Membresía</h1>
      <p>{mensaje}</p>
      {!membresiaActiva && (
        <button style={buttonStyle} onClick={() => router.push("/membresia/planes")}>
          Activar Membresía
        </button>
      )}

      {/* Botones de navegación */}
      <div style={buttonContainer}>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Página Principal</button>
        <button onClick={() => router.push("/perfil")} style={buttonStyle}>👤 Mi Perfil</button>
      </div>
    </div>
  );
}

const containerStyle = {
  padding: "20px",
  textAlign: "center",
};

const buttonContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginTop: "20px",
};

const buttonStyle = {
  padding: "10px 15px",
  fontSize: "16px",
  margin: "10px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
};
