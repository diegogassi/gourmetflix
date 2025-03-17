import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Catalogo() {
  const router = useRouter();
  const [libros, setLibros] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "libros"));
        const librosLista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLibros(librosLista);
      } catch (err) {
        console.error("❌ Error al obtener libros:", err);
        setError("Error al cargar los libros.");
      }
    };

    fetchLibros();
  }, []);

  if (error) return <p>{error}</p>;
  if (!libros.length) return <p>Cargando catálogo...</p>;

  return (
    <div style={containerStyle}>
      <h1>📚 Catálogo de Libros</h1>
      <div style={gridStyle}>
        {libros.map((libro) => (
          <div key={libro.id} style={cardStyle}>
            <img 
              src={libro.portada} 
              alt={libro.titulo} 
              style={coverStyle} 
              onClick={() => router.push(`/detalle/${libro.id}`)}
            />
            <h3>{libro.titulo}</h3>
            <p>{libro.autor}</p>
            <button 
              onClick={() => router.push(`/detalle/${libro.id}`)} 
              style={buttonStyle}
            >
              Ver Detalles
            </button>
          </div>
        ))}
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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "20px",
  padding: "20px",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "15px",
  borderRadius: "8px",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  textAlign: "center",
};

const coverStyle = {
  width: "100%",
  height: "auto",
  cursor: "pointer",
  borderRadius: "5px",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
};

const buttonStyle = {
  padding: "10px 15px",
  fontSize: "16px",
  margin: "10px 0",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
};
