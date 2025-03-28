import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUsuario({
              uid: user.uid,
              email: user.email,
              ...data,
            });
          } else {
            setUsuario({ uid: user.uid, email: user.email });
          }
        } catch (err) {
          console.error("❌ Error obteniendo datos de usuario:", err);
        }
      } else {
        setUsuario(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const iniciarSesion = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      alert("Credenciales incorrectas o usuario no registrado.");
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      setUsuario(null);
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>🔐 Iniciar sesión</h2>

      {usuario ? (
        <>
          <p>Hola, <strong>{usuario.nombre || usuario.email}</strong></p>
          <div style={buttonContainer}>
            <button style={buttonStyleRed} onClick={cerrarSesion}>Cerrar sesión</button>
            <button style={buttonStyle} onClick={() => router.push("/perfil")}>Mi perfil</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <button onClick={() => setMostrarPassword(!mostrarPassword)} style={toggleBtn}>
              {mostrarPassword ? "🙈" : "👁"}
            </button>
          </div>
          <div style={buttonContainer}>
            <button style={buttonStyle} onClick={iniciarSesion}>Iniciar sesión</button>
            <button style={buttonStyle} onClick={() => router.push("/registro")}>¿No tenés cuenta? Registrate</button>
          </div>
        </>
      )}

      <div style={{ marginTop: "30px" }}>
        <button style={buttonStyle} onClick={() => router.push("/")}>🏠 Ir a la página principal</button>
      </div>
    </div>
  );
}

const containerStyle = {
  textAlign: "center",
  marginTop: "50px",
};

const inputStyle = {
  padding: "10px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginTop: "20px",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#007bff",
  color: "white",
  cursor: "pointer",
};

const buttonStyleRed = {
  ...buttonStyle,
  backgroundColor: "#dc3545",
};

const toggleBtn = {
  padding: "8px",
  fontSize: "20px",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
};
