import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function Perfil() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        await cargarDatosUsuario(user.email);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const cargarDatosUsuario = async (email) => {
    try {
      const usuarioRef = doc(db, "usuarios", email);
      const docSnap = await getDoc(usuarioRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombre(data.nombre);
        setApellido(data.apellido);
        setEmail(email);
      }
    } catch (err) {
      setError("Error al cargar datos del usuario.");
    }
  };

  const actualizarDatos = async () => {
    try {
      const usuarioRef = doc(db, "usuarios", usuario.email);
      await updateDoc(usuarioRef, { nombre, apellido });
      setMensaje("Datos actualizados correctamente.");
    } catch (err) {
      setError("Error al actualizar los datos.");
    }
  };

  const cambiarEmail = async () => {
    try {
      const credential = EmailAuthProvider.credential(usuario.email, passwordActual);
      await reauthenticateWithCredential(usuario, credential);
      await updateEmail(usuario, email);
      const usuarioRef = doc(db, "usuarios", usuario.email);
      await updateDoc(usuarioRef, { email });
      setMensaje("Email actualizado correctamente. Vuelve a iniciar sesión.");
      auth.signOut();
      router.push("/login");
    } catch (err) {
      setError("Error al actualizar el email. Verifica tu contraseña.");
    }
  };

  const cerrarSesion = () => {
    auth.signOut().then(() => {
      window.location.href = "/login";
    }).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Perfil de Usuario</h1>
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <h3>Datos personales</h3>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" style={inputStyle} />
        <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" style={inputStyle} />
        <button onClick={actualizarDatos} style={buttonStyle}>Actualizar Datos</button>
      </div>

      <div>
        <h3>Email</h3>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        <input 
          type="password" 
          value={passwordActual} 
          onChange={(e) => setPasswordActual(e.target.value)} 
          placeholder="Ingresa tu contraseña actual para modificar el email" 
          style={inputStyle} 
          autoComplete="off"
        />
        <br />
        <button onClick={cambiarEmail} style={buttonStyle}>Actualizar Email</button>
      </div>

      <button onClick={cerrarSesion} style={logoutButtonStyle}>Cerrar Sesión</button>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  margin: "5px",
  fontSize: "16px",
  width: "250px",
  borderRadius: "5px",
  border: "1px solid #ddd",
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

const logoutButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#dc3545",
};