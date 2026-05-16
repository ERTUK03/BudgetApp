import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Hasła nie są zgodne"); return; }
    setError(""); setLoading(true);
    try {
      await register(form.email, form.username, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Błąd rejestracji");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Nowe konto</h1>
        <p className="subtitle">Zacznij śledzić swoje finanse</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="form-group">
            <label>Nazwa użytkownika</label>
            <input type="text" value={form.username} onChange={set("username")} required minLength={3} />
          </div>
          <div className="form-group">
            <label>Hasło</label>
            <input type="password" value={form.password} onChange={set("password")} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Powtórz hasło</label>
            <input type="password" value={form.confirm} onChange={set("confirm")} required />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary w-full mt-16" type="submit" disabled={loading}>
            {loading ? "Rejestrowanie…" : "Utwórz konto"}
          </button>
        </form>
        <p className="text-muted mt-16" style={{ textAlign: "center" }}>
          Masz już konto? <Link to="/login" className="auth-link">Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
}
