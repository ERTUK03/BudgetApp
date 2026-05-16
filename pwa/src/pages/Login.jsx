import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Błąd logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>BudgetApp</h1>
        <p className="subtitle">Zaloguj się do swojego konta</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Hasło</label>
            <input type="password" value={form.password} onChange={set("password")} required autoComplete="current-password" />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary w-full mt-16" type="submit" disabled={loading}>
            {loading ? "Logowanie…" : "Zaloguj się"}
          </button>
        </form>
        <p className="text-muted mt-16" style={{ textAlign: "center" }}>
          Nie masz konta? <Link to="/register" className="auth-link">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
}
