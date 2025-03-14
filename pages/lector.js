import EpubReader from "../components/EpubReader";

const Lector = () => {
  return (
    <div>
      <h1>📖 Lector de EPUB</h1>
      <EpubReader fileUrl="/libros/pg1342-images.epub" />
    </div>
  );
};

export default Lector;
