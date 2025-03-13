import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/catalogo");
    } catch (err) {
      setError("Error al registrar usuario. Verifica los datos ingresados.");
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/catalogo");
    } catch (err) {
      setError("Correo o contraseña incorrectos. Inténtalo nuevamente.");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Iniciar Sesión</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <br />
      <div style={{ position: "relative", display: "inline-block" }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          style={toggleButtonStyle}
        >
          {showPassword ? "🙈" : "👁"}
        </button>
      </div>
      <br />
      <button onClick={handleSignUp} style={buttonStyle}>Registrarse</button>
      <button onClick={handleSignIn} style={buttonStyle}>Iniciar Sesión</button>
      <br />
      <button onClick={handleSignOut} style={logoutButtonStyle}>Cerrar Sesión</button>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  margin: "5px",
  fontSize: "16px",
  width: "250px",
  borderRadius: "5px",
  border: "1px solid #ddd",
};

const buttonStyle = {
  padding: "10px 15px",
  fontSize: "16px",
  margin: "5px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  borderRadius: "5px",
};

const logoutButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#dc3545",
};

const toggleButtonStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "18px",
};
