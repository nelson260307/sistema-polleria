
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function recuperarPassword() {
  if (!email.trim()) {
    setError("Primero escribe tu correo electrónico.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    setError("Te enviamos un correo para restablecer tu contraseña.");
  } catch (error) {
    console.error(error);
    setError("No se pudo enviar el correo de recuperación.");
  }
}
  async function iniciarSesion(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resultado = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      onLogin(resultado.user);
    } catch (error) {
      console.error(error);
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={iniciarSesion}>
        <div className="login-logo">🍗</div>

        <h1>POLLERÍA</h1>
        <p>Sistema de gestión de comandas</p>

        <label>Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa tu correo"
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa tu contraseña"
          required
        />

        {error && <div className="login-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
        <button
  type="button"
  onClick={recuperarPassword}
>
  ¿Olvidaste tu contraseña?
</button>

        <small>Acceso exclusivo para personal autorizado</small>
      </form>
    </div>
  );
}
