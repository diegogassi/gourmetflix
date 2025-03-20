import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
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
          setError("El libro no existe");
        }
      } catch (err) {
        setError("Error al cargar el libro");
      }
    };

    fetchLibro();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!libro) return <p>Cargando libro...</p>;

  return (
    <div style={containerStyle}>
      <h1>{libro.titulo}</h1>
      <h3>{libro.autor}</h3>
      <p><strong>Editorial:</strong> {libro.editorial}</p>
      <p><strong>Año:</strong> {libro.anio}</p>
      <img src={libro.portada} alt={`Portada de ${libro.titulo}`} style={coverStyle} />
      
      <div style={descriptionStyle} dangerouslySetInnerHTML={{ __html: libro.descripcion }}></div>

      <button onClick={() => router.push(`/lector/${id}`)} style={buttonStyle}>📖 Leer Ahora</button>
      <button onClick={() => router.push("/catalogo")} style={backButtonStyle}>⬅ Volver al Catálogo</button>
    </div>
  );
}

// Estilos en línea para simplicidad
const containerStyle = {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "#f8f8f8",
  minHeight: "100vh",
};

const coverStyle = {
  maxWidth: "300px",
  margin: "20px auto",
  display: "block",
  borderRadius: "8px",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
};

const descriptionStyle = {
  textAlign: "left",
  margin: "20px auto",
  maxWidth: "600px",
  fontSize: "16px",
  lineHeight: "1.6",
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

const backButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6c757d",
};
