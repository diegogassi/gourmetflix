import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Catalogo() {
  const router = useRouter();
  const [libros, setLibros] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerLibros = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "libros"));
        const librosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLibros(librosData);
      } catch (err) {
        console.error("❌ Error al cargar los libros:", err);
        setError("Error al cargar los libros.");
      }
    };

    obtenerLibros();
  }, []);

  if (error) return <p>{error}</p>;
  if (!libros.length) return <p>Cargando libros...</p>;

  return (
    <div style={containerStyle}>
      <h1>📚 Catálogo de Libros</h1>
      <div style={bookContainerStyle}>
        {libros.map((libro) => (
          <div key={libro.id} style={bookStyle} onClick={() => router.push(`/detalle/${libro.id}`)}>
            <img src={libro.portada} alt={libro.titulo} style={coverStyle} />
            <p>{libro.titulo}</p>
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <div style={buttonContainer}>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Página Principal</button>
        <button onClick={() => router.push("/perfil")} style={buttonStyle}>👤 Mi Perfil</button>
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

const bookContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "20px",
};

const bookStyle = {
  cursor: "pointer",
  border: "1px solid #ddd",
  padding: "10px",
  borderRadius: "8px",
  backgroundColor: "#fff",
  textAlign: "center",
  width: "200px",
};

const coverStyle = {
  width: "100%",
  height: "250px",
  objectFit: "cover",
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
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
};

