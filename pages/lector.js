import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ePub from "epubjs";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export default function Lector() {
  const router = useRouter();
  const { file } = router.query;
  const [rendition, setRendition] = useState(null);
  const [book, setBook] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("🔐 Usuario autenticado:", user.uid);

        try {
          const userRef = doc(db, "usuarios", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log("📄 Datos obtenidos del usuario:", userData);

            if (!userData.membresiaActiva) {
              console.warn("⛔ Membresía inactiva para este usuario");
              router.push("/membresia");
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

              // Cargar posición guardada
              const libroKey = file.split("/").pop(); // ej: 'el-libro.epub'
              const posicionGuardada = userData.ultimaLectura?.[libroKey];
              if (posicionGuardada) {
                console.log(`🔁 Retomando desde la página: ${posicionGuardada}`);
                newRendition.display(posicionGuardada);
              } else {
                newRendition.display();
              }

              newRendition.on("relocated", async (location) => {
                const nuevaPos = location?.start?.cfi;
                if (!nuevaPos) return;

                const nuevaLectura = {
                  ...(userData.ultimaLectura || {}),
                  [libroKey]: nuevaPos,
                };

                await updateDoc(userRef, { ultimaLectura: nuevaLectura });
                console.log("💾 Posición guardada:", nuevaPos);
              });

              setRendition(newRendition);
            }
          } else {
            console.log("👤 Usuario no registrado en Firestore. Redirigiendo a registro...");
            router.push("/registro");
          }
        } catch (err) {
          console.error("❌ Error al acceder a Firestore:", err);
          alert("Ocurrió un error cargando tu información. Intentalo más tarde.");
        }
      } else {
        console.log("🚪 Usuario no autenticado. Redirigiendo a login...");
        router.push("/login");
      }
    });

    return () => unsubscribe();
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
      <div id="viewer" style={viewerStyle}></div>

      <div style={buttonContainerStyle}>
        <button onClick={() => router.push("/")} style={buttonStyle2}>Página principal</button>
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
  padding: "100px 0 10px 0",
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
