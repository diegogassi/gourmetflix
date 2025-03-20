import { useRouter } from "next/router";

export default function RegistroOk() {
  const router = useRouter();
  const { nombre } = router.query;

  return (
    <div style={containerStyle}>
      <h1>✅ Gracias, {nombre || "usuario"}!</h1>
      <p>El registro se realizó con éxito.</p>

      <div style={buttonContainerStyle}>
        <button onClick={() => router.push("/catalogo")} style={buttonStyle}>📚 Ir al Catálogo</button>
        <button onClick={() => router.push("/perfil")} style={buttonStyle}>👤 Mi Perfil</button>
        <button onClick={() => router.push("/")} style={buttonStyle}>🏠 Página Principal</button>
      </div>
    </div>
  );
}

// 💅 Estilos
const containerStyle = { textAlign: "center", padding: "20px", backgroundColor: "#f8f8f8", minHeight: "100vh" };
const buttonContainerStyle = { textAlign: "center", marginTop: "20px" };
const buttonStyle = { margin: "10px", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none" };
