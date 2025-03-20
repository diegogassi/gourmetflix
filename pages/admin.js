import { useRouter } from "next/router";

export default function AdminHome() {
  const router = useRouter();

  return (
    <div style={containerStyle}>
      <h1>🔧 Panel de Administración</h1>

      <div style={buttonContainerStyle}>
        <button onClick={() => router.push("/admin/usuarios")} style={buttonStyle}>👥 Administrar Usuarios</button>
        <button onClick={() => router.push("/admin/libros")} style={buttonStyle}>📚 Administrar Libros</button>
      </div>

      <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Volver a la Página Principal</button>
    </div>
  );
}

// 💅 Estilos
const containerStyle = { textAlign: "center", padding: "20px", backgroundColor: "#f8f8f8", minHeight: "100vh" };
const buttonContainerStyle = { display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" };
const buttonStyle = { padding: "10px 20px", borderRadius: "5px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none" };
