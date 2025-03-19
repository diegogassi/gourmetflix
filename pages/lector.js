import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ePub from "epubjs";

export default function Lector() {
  const router = useRouter();
  const { file } = router.query;
  const [rendition, setRendition] = useState(null);
  const [book, setBook] = useState(null);

  useEffect(() => {
    if (!file) return;

    console.log("📖 Archivo EPUB recibido en el lector:", file);

    const newBook = ePub(file);
    setBook(newBook);

    const viewer = document.getElementById("viewer");
    if (viewer) {
      const newRendition = newBook.renderTo(viewer, {
        width: "100%",
        height: "75vh", // Ajustamos la altura del visor para dejar espacio a los botones
        flow: "paginated",
      });

      newRendition.display();
      setRendition(newRendition);
    }
  }, [file]);

  const nextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const prevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  return (
    <div style={containerStyle}>
      
      {/* Visor del libro */}
      <div id="viewer" style={viewerStyle}></div>
      
      {/* Contenedor de los botones para que siempre queden visibles */}
      <div style={buttonContainerStyle}>
      <button onClick={() => router.push("/catalogo")} style={buttonStyle2}>Catálogo</button>
        <button onClick={prevPage} style={buttonStyle}>⬅ Anterior</button>
        <button onClick={nextPage} style={buttonStyle}>Siguiente ➡</button>
      </div>
    </div>
  );
}

const containerStyle = {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "#f8f8f8",
  minHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between", // Asegura que los botones queden dentro de la vista
};

const viewerStyle = {
  width: "100%",
  height: "75vh", // Reducimos un poco la altura del lector
  border: "1px solid black",
};

const buttonContainerStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  padding: "100px 0 10px 0", // Agregamos un poco de margen arriba y abajo
  backgroundColor: "#fff", // Fondo blanco para que no se superponga con el lector
};

const buttonStyle = {
  padding: "10px 5%",
  fontSize: "16px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
  margin: "0 10px", // Espaciado entre botones
};

const buttonStyle2 = {
  padding: "10px 20px",
  fontSize: "16px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
  margin: "0 10px", // Espaciado entre botones
};