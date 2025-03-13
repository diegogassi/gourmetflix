import { useState } from "react";
import { useRouter } from "next/router";

export default function PlanesMembresia() {
  const router = useRouter();
  const [mensaje, setMensaje] = useState("");

  const activarMembresia = () => {
    setMensaje("Tu solicitud ha sido enviada. Un administrador activará tu membresía pronto.");
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Planes de Membresía</h1>
      <p>Accede a todo el catálogo de libros sin restricciones.</p>
      
      <div style={planStyle}>
        <h2>Plan Mensual</h2>
        <p>Acceso ilimitado a todos los libros.</p>
        <p><strong>Precio: $XX/mes</strong></p>
        <button onClick={activarMembresia} style={buttonStyle}>
          Activar Membresía
        </button>
      </div>

      {mensaje && <p style={{ color: "green", marginTop: "20px" }}>{mensaje}</p>}

      <button onClick={() => router.push("/catalogo")} style={buttonStyle}>
        Volver al Catálogo
      </button>
    </div>
  );
}

const planStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "10px",
  maxWidth: "400px",
  margin: "20px auto",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)"
};

const buttonStyle = {
  padding: "10px 15px",
  fontSize: "16px",
  margin: "10px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
};
