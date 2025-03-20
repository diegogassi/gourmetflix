import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, auth } from "../../firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, deleteUser } from "firebase/auth";

export default function AdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null);
  const [formEdicion, setFormEdicion] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await verificarAdmin(user.email);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const verificarAdmin = async (email) => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosLista = [];
      let esAdmin = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email === email && data.rol === "admin") {
          esAdmin = true;
        }
        usuariosLista.push({ id: doc.id, ...data });
      });

      if (!esAdmin) {
        router.push("/");
      } else {
        setUsuarios(usuariosLista);
      }
    } catch (err) {
      setError("Error al verificar permisos");
    }
    setLoading(false);
  };

  const toggleMembresia = async (usuario) => {
    try {
      const usuarioRef = doc(db, "usuarios", usuario.id);
      const nuevaMembresia = !usuario.membresiaActiva;
      const nuevaFecha = nuevaMembresia ? new Date(new Date().setMonth(new Date().getMonth() + 1)) : null;
      await updateDoc(usuarioRef, {
        membresiaActiva: nuevaMembresia,
        fechaExpiracion: nuevaFecha,
      });

      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, membresiaActiva: nuevaMembresia, fechaExpiracion: nuevaFecha } : u))
      );
    } catch (err) {
      setError("Error al actualizar la membresía");
    }
  };

  const toggleRol = async (usuario) => {
    try {
      const usuarioRef = doc(db, "usuarios", usuario.id);
      const nuevoRol = usuario.rol === "admin" ? "usuario" : "admin";
      await updateDoc(usuarioRef, { rol: nuevoRol });

      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, rol: nuevoRol } : u))
      );
    } catch (err) {
      setError("Error al actualizar el rol");
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (!window.confirm(`¿Estás seguro de que querés eliminar a ${usuario.nombre}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "usuarios", usuario.id));

      // Intentar eliminar de Firebase Auth si el usuario está autenticado
      const user = auth.currentUser;
      if (user && user.email === usuario.email) {
        await deleteUser(user);
      }

      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
      alert(`✅ Usuario ${usuario.nombre} eliminado correctamente.`);
    } catch (error) {
      console.error("❌ Error al eliminar usuario:", error);
      alert("❌ Error al eliminar usuario.");
    }
  };

  const comenzarEdicion = (usuario) => {
    setEditando(usuario.id);
    setFormEdicion({ ...usuario });
  };

  const guardarEdicion = async () => {
    try {
      const usuarioRef = doc(db, "usuarios", formEdicion.id);
      await updateDoc(usuarioRef, {
        nombre: formEdicion.nombre,
        apellido: formEdicion.apellido,
        email: formEdicion.email,
      });

      setUsuarios((prev) =>
        prev.map((u) => (u.id === formEdicion.id ? { ...formEdicion } : u))
      );
      setEditando(null);
      alert("✅ Datos actualizados correctamente.");
    } catch (error) {
      console.error("❌ Error al actualizar usuario:", error);
      alert("❌ No se pudo actualizar el usuario.");
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={containerStyle}>
      <h1>🔧 Administración de Usuarios</h1>

      <table style={tableStyle} border="1">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Membresía</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{editando === usuario.id ? <input value={formEdicion.email} onChange={(e) => setFormEdicion({ ...formEdicion, email: e.target.value })} /> : usuario.email}</td>
              <td>{editando === usuario.id ? <input value={formEdicion.nombre} onChange={(e) => setFormEdicion({ ...formEdicion, nombre: e.target.value })} /> : usuario.nombre}</td>
              <td>{editando === usuario.id ? <input value={formEdicion.apellido} onChange={(e) => setFormEdicion({ ...formEdicion, apellido: e.target.value })} /> : usuario.apellido}</td>
              <td><button onClick={() => toggleMembresia(usuario)} style={buttonStyle}>{usuario.membresiaActiva ? "✅ Activa" : "❌ Inactiva"}</button></td>
              <td><button onClick={() => toggleRol(usuario)} style={buttonStyle}>{usuario.rol === "admin" ? "👑 Admin" : "👤 Usuario"}</button></td>
              <td>
                {usuario.rol !== "admin" && <button onClick={() => eliminarUsuario(usuario)} style={deleteButtonStyle}>🗑️ Eliminar</button>}
                {editando === usuario.id ? <button onClick={guardarEdicion} style={buttonStyle}>💾 Guardar</button> : <button onClick={() => comenzarEdicion(usuario)} style={buttonStyle}>✏️ Editar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={buttonContainerStyle}>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Ir a la página principal</button>
      </div>
    </div>
  );
}

// 💅 Estilos unificados
const containerStyle = { textAlign: "center", padding: "20px", backgroundColor: "#f8f8f8", minHeight: "100vh" };
const tableStyle = { width: "80%", margin: "auto", borderCollapse: "collapse", padding: "10px" };
const buttonStyle = { margin: "10px", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none" };
const deleteButtonStyle = { ...buttonStyle, backgroundColor: "red" };
const buttonContainerStyle = { textAlign: "center", marginTop: "20px" };

