import Link from "next/link";

export default function Home() {
  return (
    <div style={containerStyle}>
      <h1>📚 Proyecto Gourmetflix</h1>
      <p>Selecciona una opción para probar:</p>

      <div style={menuStyle}>
        <Link href="/catalogo" style={linkStyle}>📖 Catálogo de libros</Link>
        <Link href="/perfil" style={linkStyle}>👤 Mi perfil</Link>
        <Link href="/membresia" style={linkStyle}>💳 Membresía</Link>
        <Link href="/admin" style={linkStyle}>⚙️ Administración</Link>
        <Link href="/login" style={linkStyle}>🔑 Iniciar sesión</Link>
        <Link href="/registro" style={linkStyle}>📝 Registrarse</Link>
      </div>
    </div>
  );
}

const containerStyle = {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "#f8f8f8",
  minHeight: "100vh",
};

const menuStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "20px",
};

const linkStyle = {
  textDecoration: "none",
  color: "white",
  backgroundColor: "#007bff",
  padding: "10px 15px",
  margin: "5px",
  borderRadius: "5px",
  width: "200px",
  textAlign: "center",
  fontSize: "16px",
};
