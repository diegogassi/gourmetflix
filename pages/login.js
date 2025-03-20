import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        await obtenerNombreUsuario(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const obtenerNombreUsuario = async (email) => {
    try {
      const docRef = doc(db, "usuarios", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombreUsuario(data.nombre || "Usuario");
      }
    } catch (err) {
      console.error("❌ Error al obtener el nombre:", err);
      setNombreUsuario("Usuario");
    }
  };

  const iniciarSesion = async () => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setUsuario(auth.currentUser);
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      setUsuario(null);
    } catch (err) {
      console.error("❌ Error al cerrar sesión:", err);
    }
  };

  return (
    <div style={containerStyle}>
      <h1>🔑 Iniciar Sesión</h1>

      {usuario ? (
        <>
          <p>Hola, <strong>{nombreUsuario}</strong></p>
          <div style={buttonStack}>
            <button onClick={cerrarSesion} style={logoutButtonStyle}>❌ Cerrar Sesión</button>
            <button onClick={() => router.push("/perfil")} style={buttonStyle}>👤 Mi Perfil</button>
          </div>
        </>
      ) : (
        <>
          {/* Contenedor para alinear "Correo" y "Contraseña" en la misma línea */}
          <div style={inputRow}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />

            {/* Contenedor para la contraseña con el ícono */}
            <div style={passwordContainer}>
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              <button 
                onClick={() => setMostrarPassword(!mostrarPassword)} 
                style={togglePasswordButton}
              >
                {mostrarPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Botones de Login y Registro centrados */}
          <div style={buttonStack}>
            <button onClick={iniciarSesion} style={buttonStyle}>Iniciar Sesión</button>
            <button onClick={() => router.push("/registro")} style={registerButtonStyle}>
              ¿No tenés cuenta? Registrate
            </button>
          </div>
        </>
      )}

      {/* Botón para ir a la página principal */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Página Principal</button>
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

const inputRow = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginBottom: "15px",
};

const inputStyle = {
  padding: "10px",
  fontSize: "16px",
  width: "220px",
  borderRadius: "5px",
  border: "1px solid #ccc",
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

const buttonStack = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px", // Espaciado entre los botones
};

const buttonStyle = {
  padding: "10px 15px",
  fontSize: "16px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
  width: "250px",
};

const logoutButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#dc3545",
};

const registerButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#28a745",
};
