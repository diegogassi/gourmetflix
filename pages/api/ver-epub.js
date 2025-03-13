import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No se proporcionó ninguna URL de libro." });
  }

  // Construir la ruta absoluta del archivo EPUB en la carpeta /public/libros
  const filePath = path.join(process.cwd(), "public", "libros", path.basename(url));

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo EPUB no encontrado." });
  }

  // Enviar el archivo EPUB
  res.setHeader("Content-Type", "application/epub+zip");
  fs.createReadStream(filePath).pipe(res);
}
