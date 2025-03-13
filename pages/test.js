import { useEffect } from "react";
import ePub from "epubjs";

export default function TestEPUB() {
  useEffect(() => {
    const libroURL = "http://localhost:3000/libros/pg1342-images.epub";
    const book = ePub(libroURL);

    const rendition = book.renderTo("reader", {
      width: "100%",
      height: "100vh",
      flow: "scrolled",  // 🔹 Permite scroll libre sin cortes
      spread: "none",  // 🔹 No divide en páginas dobles
    });

    rendition.display();
  }, []);

  return <div id="reader" style={{ width: "100%", height: "100vh", background: "#fff", overflowY: "scroll" }}></div>;
}
