import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, auth } from "../../firebaseConfig";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminLibros() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [libros, setLibros] = useState([]);
  const [editando, setEditando] = useState(null);
  const [nuevoLibro, setNuevoLibro] = useState({
    titulo: "",
    autor: "",
    anio: "",
    editorial: "",
    descripcion: "",
    url: "",
    portada: ""
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
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
      let esAdmin = false;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email === email && data.rol === "admin") {
          esAdmin = true;
        }
      });

      if (!esAdmin) {
        router.push("/catalogo");
      } else {
        cargarLibros();
      }
    } catch (err) {
      setError("Error al verificar permisos.");
    }
  };

  const cargarLibros = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "libros"));
      const listaLibros = [];
      querySnapshot.forEach((doc) => {
        listaLibros.push({ id: doc.id, ...doc.data() });
      });
      setLibros(listaLibros);
    } catch (err) {
      setError("Error al cargar libros.");
    }
  };

  const handleChange = (e) => {
    setNuevoLibro({ ...nuevoLibro, [e.target.name]: e.target.value });
  };

  const agregarLibro = async () => {
    try {
      await addDoc(collection(db, "libros"), nuevoLibro);
      setNuevoLibro({
        titulo: "",
        autor: "",
        anio: "",
        editorial: "",
        descripcion: "",
        url: "",
        portada: ""
      });
      cargarLibros();
    } catch (err) {
      setError("Error al agregar el libro.");
    }
  };

  const eliminarLibro = async (id) => {
    try {
      await deleteDoc(doc(db, "libros", id));
      cargarLibros();
    } catch (err) {
      setError("Error al eliminar el libro.");
    }
  };

  const iniciarEdicion = (libro) => {
    setNuevoLibro(libro);
    setEditando(libro.id);
  };

  const actualizarLibro = async () => {
    try {
      await updateDoc(doc(db, "libros", editando), nuevoLibro);
      setNuevoLibro({
        titulo: "",
        autor: "",
        anio: "",
        editorial: "",
        descripcion: "",
        url: "",
        portada: ""
      });
      setEditando(null);
      cargarLibros();
    } catch (err) {
      setError("Error al actualizar el libro.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Administración de Libros</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "20px" }}>
        <h3>{editando ? "Editar Libro" : "Agregar Nuevo Libro"}</h3>
        <input type="text" name="titulo" value={nuevoLibro.titulo} onChange={handleChange} placeholder="Título" style={inputStyle} />
        <input type="text" name="autor" value={nuevoLibro.autor} onChange={handleChange} placeholder="Autor" style={inputStyle} />
        <input type="text" name="anio" value={nuevoLibro.anio} onChange={handleChange} placeholder="Año" style={inputStyle} />
        <input type="text" name="editorial" value={nuevoLibro.editorial} onChange={handleChange} placeholder="Editorial" style={inputStyle} />
        <textarea name="descripcion" value={nuevoLibro.descripcion} onChange={handleChange} placeholder="Descripción (puede incluir HTML)" style={textAreaStyle}></textarea>
        <input type="text" name="url" value={nuevoLibro.url} onChange={handleChange} placeholder="URL del archivo EPUB" style={inputStyle} />
        <input type="text" name="portada" value={nuevoLibro.portada} onChange={handleChange} placeholder="URL de la portada" style={inputStyle} />
        <button onClick={editando ? actualizarLibro : agregarLibro} style={buttonStyle}>{editando ? "Actualizar Libro" : "Agregar Libro"}</button>
      </div>

      <h3>Lista de Libros</h3>
      {libros.length === 0 ? <p>No hay libros cargados.</p> : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {libros.map((libro) => (
            <li key={libro.id} style={listItemStyle}>
              <strong>{libro.titulo}</strong> - {libro.autor} ({libro.anio})  
              <button onClick={() => iniciarEdicion(libro)} style={buttonStyle}>Editar</button>
              <button onClick={() => eliminarLibro(libro.id)} style={buttonStyle}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
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

const textAreaStyle = {
  ...inputStyle,
  height: "80px"
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

const listItemStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  marginBottom: "5px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};
