import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ePub from "epubjs";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { guardarPosicionLectura, obtenerPosicionLectura } from "../utils/lectura";

export default function Lector() {
  const router = useRouter();
  const { file } = router.query;
  const [rendition, setRendition] = useState(null);
  const [book, setBook] = useState(null);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const docRef = doc(db, "usuarios", user.uid);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          console.error("❌ Usuario no encontrado en Firestore");
          alert("Tu usuario no está registrado correctamente. Contactá a soporte.");
          router.push("/login");
          return;
        }

        const userData = snap.data();

        if (!userData.membresiaActiva) {
          alert("Necesitás una membresía activa para leer los libros 📚");
          router.push("/membresia");
          return;
        }

        setUid(user.uid);
      } catch (error) {
        console.error("⚠️ Error al verificar la membresía:", error);
        alert("Error al verificar la membresía.");
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!file || !uid) return;

    const fileName = file.split("/").pop();
    const newBook = ePub(file);
    setBook(newBook);

    const viewer = document.getElementById("viewer");

    if (viewer) {
      const newRendition = newBook.renderTo(viewer, {
        width: "100%",
        height: "75vh",
        flow: "paginated",
      });

      setRendition(newRendition);

      obtenerPosicionLectura(uid, fileName).then((ultimaPosicion) => {
        if (ultimaPosicion) {
          newRendition.display(ultimaPosicion);
        } else {
          newRendition.display();
        }
      });

      newRendition.on("relocated", (location) => {
        const cfi = location.start.cfi;
        guardarPosicionLectura(uid, fileName, cfi);
      });
    }
  }, [file, uid]);

  const nextPage = () => rendition && rendition.next();
  const prevPage = () => rendition && rendition.prev();

  return (
    <div style={containerStyle}>
      <div id="viewer" style={viewerStyle}></div>

      <div style={buttonContainerStyle}>
        <button onClick={() => router.push("/")} style={buttonStyle2}>🏠 Página principal</button>
        <button onClick={() => router.push("/catalogo")} style={buttonStyle2}>📚 Catálogo</button>
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
  padding: "80px 0 10px 0",
  backgroundColor: "#fff",
  flexWrap: "wrap",
};

const buttonStyle = {
  padding: "10px 5%",
  fontSize: "16px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
  margin: "0 10px",
};

const buttonStyle2 = {
  padding: "10px 20px",
  fontSize: "16px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
  margin: "0 10px",
};
