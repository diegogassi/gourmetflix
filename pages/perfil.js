import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseConfig";
import {
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

export default function Perfil() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const datos = snap.data();
          setUsuario({
            uid: user.uid,
            email: user.email,
            ...datos,
          });
          setNuevoNombre(datos.nombre || "");
          setNuevoApellido(datos.apellido || "");
        } else {
          setUsuario(null);
        }
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const actualizarPerfil = async () => {
    if (!usuario) return;
    try {
      const ref = doc(db, "usuarios", usuario.uid);
      await updateDoc(ref, {
        nombre: nuevoNombre,
        apellido: nuevoApellido,
      });
      alert("✅ Perfil actualizado correctamente.");
    } catch (err) {
      console.error("❌ Error al actualizar el perfil:", err);
      alert("Error al actualizar el perfil.");
    }
  };

  const cambiarPassword = async () => {
    if (!usuario || !passwordActual || !nuevaPassword) return;
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordActual
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, nuevaPassword);
      alert("✅ Contraseña actualizada correctamente.");
      setPasswordActual("");
      setNuevaPassword("");
    } catch (error) {
      console.error("❌ Error al cambiar contraseña:", error);
      alert("Error al cambiar la contraseña. Verificá tu contraseña actual.");
    }
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!usuario) return <p>No se encontró información del usuario.</p>;

  return (
    <div style={containerStyle}>
      <h2>👤 Mi Perfil</h2>
      <p><strong>Email:</strong> {usuario.email}</p>

      <div style={formGroupStyle}>
        <label>Nombre:</label>
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={formGroupStyle}>
        <label>Apellido:</label>
        <input
          type="text"
          value={nuevoApellido}
          onChange={(e) => setNuevoApellido(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button onClick={actualizarPerfil} style={buttonStyle}>
        Guardar cambios
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h3>🔐 Cambiar contraseña</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <input
          type={mostrarPassword ? "text" : "password"}
          placeholder="Contraseña actual"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          style={inputStyle}
        />
        <input
          type={mostrarPassword ? "text" : "password"}
          placeholder="Nueva contraseña"
          value={nuevaPassword}
          onChange={(e) => setNuevaPassword(e.target.value)}
          style={inputStyle}
        />
        <button onClick={() => setMostrarPassword(!mostrarPassword)} style={toggleBtn}>
          {mostrarPassword ? "🙈" : "👁"}
        </button>
        <button onClick={cambiarPassword} style={buttonStyle}>
          Actualizar
        </button>
      </div>

      <div style={footerStyle}>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Volver a la página principal</button>
        <button onClick={() => router.push("/catalogo")} style={buttonStyle}>📚 Volver al catálogo</button>
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

const formGroupStyle = {
  marginBottom: "15px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px 20px",
  marginTop: "10px",
  fontSize: "16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const toggleBtn = {
  padding: "8px",
  fontSize: "20px",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
};

const footerStyle = {
  marginTop: "40px",
  display: "flex",
  justifyContent: "center",
  gap: "10px",
};
