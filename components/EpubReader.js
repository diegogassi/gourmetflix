"use client"; // Necesario si usás App Router en Next.js

import { useEffect, useRef, useState } from "react";
import ePub from "epubjs";

const EpubReader = ({ fileUrl }) => {
  const viewerRef = useRef(null);
  const [rendition, setRendition] = useState(null);

  useEffect(() => {
    if (!fileUrl || !viewerRef.current) return;

    const book = ePub(fileUrl);
    const renditionInstance = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100vh",
    });

    renditionInstance.display();
    setRendition(renditionInstance);
  }, [fileUrl]);

  return <div ref={viewerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default EpubReader;
