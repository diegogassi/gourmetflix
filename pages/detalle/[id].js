import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function DetalleLibro() {
  const router = useRouter();
  const { id } = router.query;
  const [libro, setLibro] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchLibro = async () => {
      try {
        const docRef = doc(db, "libros", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLibro(docSnap.data());
        } else {
          setError("El libro no existe.");
        }
      } catch (err) {
        console.error("❌ Error al obtener el libro:", err);
        setError("Error al cargar el libro.");
      }
    };

    fetchLibro();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!libro) return <p>Cargando información del libro...</p>;

  return (
    <div style={containerStyle}>
      <h1>{libro.titulo}</h1>
      <img src={libro.portada} alt={libro.titulo} style={coverStyle} />
      <p><strong>Autor:</strong> {libro.autor}</p>

      <p><strong>Descripción:</strong></p>
      <div dangerouslySetInnerHTML={{ __html: libro.descripcion }} />

      <button 
        onClick={() => {
          console.log("📂 Abriendo libro:", libro.url); // <-- Depuración en consola
          router.push(`/lector?file=${encodeURIComponent(libro.url)}`);
        }}
        style={buttonStyle}
      >
        📖 Leer Libro
      </button>

      <button onClick={() => router.push("/catalogo")} style={buttonStyle}>⬅ Volver al Catálogo</button>
    </div>
  );
}

const containerStyle = {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "#f8f8f8",
  minHeight: "100vh",
};

const coverStyle = {
  width: "200px",
  height: "auto",
  borderRadius: "8px",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
  marginBottom: "10px",
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
