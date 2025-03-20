import { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const registrarUsuario = async () => {
    setError(null);
    setCargando(true);

    if (!nombre || !apellido || !email || !password) {
      setError("⚠️ Todos los campos son obligatorios.");
      setCargando(false);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("⚠️ El formato del correo electrónico no es válido.");
      setCargando(false);
      return;
    }

    if (password.length < 6) {
      setError("⚠️ La contraseña debe tener al menos 6 caracteres.");
      setCargando(false);
      return;
    }

    try {
      // Verifica si el email ya está registrado
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setError(
          <span>
            ⚠️ Ese correo ya está registrado.{" "}
            <a href="/login" style={linkStyle}>Ingresá acá</a> para iniciar sesión.
          </span>
        );
        setCargando(false);
        return;
      }

      // Registra al usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guarda la información en Firestore
      await setDoc(doc(db, "usuarios", email), {
        nombre,
        apellido,
        email,
        membresiaActiva: false,
        rol: "usuario",
        fechaRegistro: new Date(),
      });

      setCargando(false);
      router.push(`/registro-ok?nombre=${encodeURIComponent(nombre)}`);
    } catch (err) {
      console.error("❌ Error en el registro:", err);
      setError("⚠️ No se pudo completar el registro. Intenta nuevamente.");
      setCargando(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1>📝 Registro</h1>

      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
      <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} style={inputStyle} />
      <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

      {error && <p style={errorStyle}>{error}</p>}

      <button onClick={registrarUsuario} style={buttonStyle} disabled={cargando}>
        {cargando ? "Registrando..." : "Registrarse"}
      </button>
    </div>
  );
}

// 💅 Estilos
const containerStyle = { textAlign: "center", padding: "20px", backgroundColor: "#f8f8f8", minHeight: "100vh" };
const inputStyle = { padding: "10px", fontSize: "16px", margin: "10px", width: "250px", borderRadius: "5px", border: "1px solid #ccc" };
const buttonStyle = { margin: "10px", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none" };
const errorStyle = { color: "red", fontWeight: "bold", marginTop: "10px" };
const linkStyle = { color: "#007bff", cursor: "pointer", textDecoration: "underline" };
