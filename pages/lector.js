import EpubReader from "../components/EpubReader";

const Lector = () => {
  return (
    <div>
      <h1>📖 Lector de EPUB</h1>
      <EpubReader fileUrl="/libros/los-piojos-en-los-90.epub" />
    </div>
  );
};

export default Lector;
