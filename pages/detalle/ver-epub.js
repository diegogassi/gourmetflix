import { useRouter } from "next/router";
import { useEffect } from "react";
import ePub from "epubjs";

export default function VerEPUB() {
  const router = useRouter();
  const { url } = router.query;

  useEffect(() => {
    if (!url) return;

    const book = ePub(decodeURIComponent(url));

    book.ready.then(() => {
      console.log("Libro cargado correctamente:", book);
      console.log("Índice del libro (spine):", book.spine);
    });
    
    const rendition = book.renderTo("reader", {
      width: "100%",
      height: "100vh",
      flow: "scrolled-continuous", // 📌 Flujo continuo sin paginación
      spread: "none",
    });

    rendition.display();
  }, [url]);

  return <div id="reader" style={{ width: "100%", height: "100vh", background: "#fff" }}></div>;
}
