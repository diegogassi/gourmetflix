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
        height: "75vh",
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

      {/* Contenedor de botones */}
      <div style={buttonContainer}>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Página Principal</button>
        <button onClick={() => router.push("/catalogo")} style={buttonStyle}>📚 Catálogo</button>
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
  justifyContent: "space-between",
};

const viewerStyle = {
  width: "100%",
  height: "75vh",
  border: "1px solid black",
};

const buttonContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  padding: "20px 0",
  backgroundColor: "#fff",
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
