"use client";

import { useEffect, useRef, useState } from "react";
import ePub from "epubjs";

const EpubReader = ({ fileUrl }) => {
  const viewerRef = useRef(null);
  const [rendition, setRendition] = useState(null);

  useEffect(() => {
    if (!fileUrl || !viewerRef.current) return;

    const fetchBook = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("❌ No se pudo descargar el EPUB");

        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = function (event) {
          const book = ePub(event.target.result);
          const renditionInstance = book.renderTo(viewerRef.current, {
            width: "100%",
            height: "100%",
          });

          renditionInstance.display().then(() => {
            renditionInstance.flow("paginated");

            renditionInstance.themes.override("html", {
              "column-width": "100% !important",
              "column-count": "1 !important",
              "column-fill": "auto",
              "column-gap": "0"
            });

            renditionInstance.themes.override("body", {
              "padding-bottom": "80px",
              "margin": "0 auto",
              "max-width": "100vw",
              "overflow": "hidden"
            });

            applyIframePermissions();
            renditionInstance.on("relocated", applyIframePermissions);
          });

          setRendition(renditionInstance);
        };

        reader.readAsArrayBuffer(blob);

      } catch (err) {
        console.error("❌ Error al cargar el EPUB:", err);
      }
    };

    fetchBook();
  }, [fileUrl]);

  const applyIframePermissions = () => {
    setTimeout(() => {
      const iframe = viewerRef.current?.querySelector("iframe");
      if (iframe) {
        iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-modals");
      }
    }, 500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div ref={viewerRef} style={{ flexGrow: 1, border: "1px solid black", paddingBottom: "80px", overflow: "hidden" }} />
      <div style={{ textAlign: "center", padding: "10px", background: "#f8f8f8" }}>
        <button onClick={() => rendition?.prev()} style={{ margin: "5px", padding: "10px" }}>⬅ Anterior</button>
        <button onClick={() => rendition?.next()} style={{ margin: "5px", padding: "10px" }}>Siguiente ➡</button>
      </div>
    </div>
  );
};

export default EpubReader;
