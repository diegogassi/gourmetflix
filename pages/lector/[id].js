import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db, auth } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ePub from "epubjs";

export default function Lector() {
  const router = useRouter();
  const { id } = router.query;
  const [libro, setLibro] = useState(null);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [mensaje, setMensaje] = useState("Cargando libro...");
  const [rendition, setRendition] = useState(null);
  const [book, setBook] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        await verificarMembresia(user.email);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchLibro = async () => {
      try {
        const docRef = doc(db, "libros", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const libroData = docSnap.data();
          console.log("📚 Libro cargado:", libroData);
          setLibro(libroData);
        } else {
          setError("El libro no existe");
        }
      } catch (err) {
        console.error("❌ Error al cargar el libro:", err);
        setError("Error al cargar el libro");
      }
    };

    fetchLibro();
  }, [id]);

  const verificarMembresia = async (email) => {
    try {
      const docRef = doc(db, "usuarios", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const datosUsuario = docSnap.data();
        const fechaExpiracion = datosUsuario.fechaExpiracion?.toDate();
        const ahora = new Date();

        if (datosUsuario.membresiaActiva && fechaExpiracion && fechaExpiracion > ahora) {
          setAccesoPermitido(true);
          setMensaje("");
        } else {
          setAccesoPermitido(false);
          setMensaje("Debes activar tu membresía para leer este libro.");
          setTimeout(() => router.push("/membresia"), 3000);
        }
      } else {
        setAccesoPermitido(false);
        setMensaje("No se encontró información de membresía.");
      }
    } catch (err) {
      console.error("❌ Error al verificar membresía:", err);
      setError("Error al verificar membresía");
    }
    setVerificado(true);
  };

  useEffect(() => {
    if (!libro || !accesoPermitido) return;

    console.log("📖 Cargando libro EPUB:", libro.url);
    const bookInstance = ePub(libro.url);
    setBook(bookInstance);

    const renditionInstance = bookInstance.renderTo("reader", {
      width: "100%",
      height: "100vh",
      flow: "scrolled-continuous",  // ✅ Scroll sin cortes
      spread: "none",  // ✅ Evita páginas dobles
    });

    setRendition(renditionInstance);

    renditionInstance.display().then(() => {
      console.log("✅ Lector EPUB cargado correctamente.");
    }).catch((err) => {
      console.error("❌ Error al mostrar el libro:", err);
      setError("Error al mostrar el libro.");
    });

  }, [libro, accesoPermitido]);

  if (!verificado) return <p>Verificando membresía...</p>;
  if (error) return <p>{error}</p>;
  if (!libro) return <p>Cargando libro...</p>;
  if (!accesoPermitido) return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <p>{mensaje}</p>
      <button onClick={() => router.push("/membresia")} style={buttonStyle}>Activar Membresía</button>
    </div>
  );

  return (
    <div style={{ padding: "20px", textAlign: "center", background: "#f4f4f4", minHeight: "100vh" }}>
      <h1>{libro.titulo}</h1>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => router.push("/catalogo")} style={buttonStyle}>Volver al Catálogo</button>
        <button onClick={() => router.push("/")} style={buttonStyle}>Ir a Inicio</button>
      </div>
      <div id="reader" style={{ width: "100%", height: "100vh", background: "#fff", overflow: "auto" }}></div>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 15px",
  fontSize: "16px",
  margin: "5px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
};
