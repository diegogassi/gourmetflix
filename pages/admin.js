import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuarioActual(user);
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
        router.push("/"); // Redirigir si no es admin
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

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Administración de Usuarios</h1>
      <table border="1" style={{ width: "80%", margin: "auto", borderCollapse: "collapse" }}>
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
              <td>{usuario.email}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.apellido}</td>
              <td>{usuario.membresiaActiva ? "Activa" : "Inactiva"}</td>
              <td>{usuario.rol}</td>
              <td>
                <button
                  onClick={() => toggleMembresia(usuario)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: usuario.membresiaActiva ? "#dc3545" : "#28a745",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                    marginRight: "5px",
                  }}
                >
                  {usuario.membresiaActiva ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => toggleRol(usuario)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: usuario.rol === "admin" ? "#f39c12" : "#007bff",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                  }}
                >
                  {usuario.rol === "admin" ? "Quitar Admin" : "Hacer Admin"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
