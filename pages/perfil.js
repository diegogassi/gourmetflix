import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Perfil() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        await cargarPerfil(user.email);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const cargarPerfil = async (email) => {
    try {
      const docRef = doc(db, "usuarios", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPerfil(data);
        setNuevoNombre(data.nombre || "");
        setNuevoApellido(data.apellido || "");
      } else {
        setError("No se encontró información del usuario.");
      }
    } catch (err) {
      console.error("❌ Error al obtener el perfil:", err);
      setError("Error al cargar el perfil.");
    }
  };

  const actualizarPerfil = async () => {
    if (!nuevoNombre || !nuevoApellido) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const userDocRef = doc(db, "usuarios", usuario.email);
      await updateDoc(userDocRef, {
        nombre: nuevoNombre,
        apellido: nuevoApellido,
      });

      setMensaje("✅ Perfil actualizado correctamente.");
      setError(null);
    } catch (err) {
      console.error("❌ Error al actualizar el perfil:", err);
      setError("Error al actualizar el perfil.");
    }
  };

  const actualizarPassword = async () => {
    if (!passwordActual || !nuevaPassword) {
      setError("Por favor, ingresa tu contraseña actual y la nueva.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(usuario.email, passwordActual);
      await reauthenticateWithCredential(usuario, credential);

      await updatePassword(usuario, nuevaPassword);

      setMensaje("✅ Contraseña actualizada correctamente.");
      setError(null);
    } catch (err) {
      console.error("❌ Error al actualizar la contraseña:", err);
      setError("Error al actualizar la contraseña. Verifica tu contraseña actual.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!perfil) return <p>Cargando perfil...</p>;

  return (
    <div style={containerStyle}>
      <h1>👤 Mi Perfil</h1>

      <h2>📝 Editar Información</h2>
      <input
        type="text"
        placeholder="Nombre"
        value={nuevoNombre}
        onChange={(e) => setNuevoNombre(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Apellido"
        value={nuevoApellido}
        onChange={(e) => setNuevoApellido(e.target.value)}
        style={inputStyle}
      />
      <button onClick={actualizarPerfil} style={buttonStyle}>Actualizar Perfil</button>

      <h2>🔒 Cambiar Contraseña</h2>
      <div style={passwordWrapper}>
        <div style={passwordContainer}>
          <input
            type={mostrarPasswordActual ? "text" : "password"}
            placeholder="Contraseña actual"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            style={inputStyle}
          />
          <button 
            onClick={() => setMostrarPasswordActual(!mostrarPasswordActual)} 
            style={togglePasswordButton}
          >
            {mostrarPasswordActual ? "🙈" : "👁️"}
          </button>
        </div>

        <div style={passwordContainer}>
          <input
            type={mostrarNuevaPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            style={inputStyle}
          />
          <button 
            onClick={() => setMostrarNuevaPassword(!mostrarNuevaPassword)} 
            style={togglePasswordButton}
          >
            {mostrarNuevaPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button onClick={actualizarPassword} style={buttonStyle}>Actualizar</button>
      </div>

      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Botones "Volver a la Página Principal" y "Volver al Catálogo" */}
      <div style={buttonContainer}>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Página Principal</button>
        <button onClick={() => router.push("/catalogo")} style={buttonStyle}>📚 Volver al Catálogo</button>
      </div>
    </div>
  );
}

const containerStyle = {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "#f8f8f8",
  minHeight: "100vh",
};

const inputStyle = {
  padding: "10px",
  fontSize: "16px",
  margin: "10px",
  width: "250px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const passwordWrapper = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  marginTop: "10px",
};

const passwordContainer = {
  display: "flex",
  alignItems: "center",
  position: "relative",
};

const togglePasswordButton = {
  marginLeft: "5px",
  backgroundColor: "transparent",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
};

const buttonStyle = {
  padding: "10px 15px",
  fontSize: "16px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
  margin: "10px",
};

const buttonContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginTop: "20px",
};

