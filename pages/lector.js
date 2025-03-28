import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ePub from "epubjs";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Lector() {
  const router = useRouter();
  const { file } = router.query;
  const [rendition, setRendition] = useState(null);
  const [book, setBook] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.log("👤 Usuario no registrado en Firestore. Redirigiendo a registro...");
        router.push("/registro");
        return;
      }

      const userData = snap.data();
      if (!userData.membresiaActiva) {
        console.log("⛔ Membresía inactiva para este usuario");
        router.push("/membresia?error=membresia");
        return;
      }

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
    });

    return () => unsubscribe();
  }, [file]);

  const nextPage = () => rendition && rendition.next();
  const prevPage = () => rendition && rendition.prev();

  return (
    <div style={containerStyle}>
      <div id="viewer" style={viewerStyle}></div>
      <div style={buttonContainerStyle}>
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

const buttonContainerStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  padding: "30px 0 10px 0",
  backgroundColor: "#fff",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
  margin: "10px",
};
