import { useEffect, useState } from "react";
import { api } from "../services/api";

const EMPTY = { name: "", icon: "💰", color: "#3b82f6", type: "expense" };

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const load = () => api.categories.list().then(setCats);
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setError("");
    try {
      await api.categories.create(form);
      setModal(false); setForm(EMPTY); load();
    } catch (err) { setError(err.message); }
  };

  const del = async (id) => {
    if (!confirm("Usunąć kategorię?")) return;
    await api.categories.delete(id);
    load();
  };

  const income = cats.filter((c) => c.type === "income");
  const expense = cats.filter((c) => c.type === "expense");

  return (
    <div>
      <div className="page-header">
        <h1>Kategorie</h1>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>+ Nowa</button>
      </div>

      {["expense", "income"].map((type) => {
        const list = type === "expense" ? expense : income;
        return (
          <div key={type} style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12, color: "var(--text2)", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
              {type === "expense" ? "💸 Wydatki" : "💰 Przychody"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {list.map((c) => (
                <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: c.color + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {c.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: c.color, marginTop: 4 }} />
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}>✕</button>
                </div>
              ))}
              {list.length === 0 && <p className="text-muted">Brak kategorii</p>}
            </div>
          </div>
        );
      })}

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h2>Nowa kategoria</h2>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Nazwa</label>
                <input value={form.name} onChange={set("name")} required />
              </div>
              <div className="form-group">
                <label>Emoji / Ikona</label>
                <input value={form.icon} onChange={set("icon")} required maxLength={4} />
              </div>
              <div className="form-group">
                <label>Kolor</label>
                <input type="color" value={form.color} onChange={set("color")} />
              </div>
              <div className="form-group">
                <label>Typ</label>
                <select value={form.type} onChange={set("type")}>
                  <option value="expense">Wydatek</option>
                  <option value="income">Przychód</option>
                </select>
              </div>
              {error && <p className="error">{error}</p>}
              <div className="flex gap-8 mt-16">
                <button type="submit" className="btn btn-primary">Zapisz</button>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Anuluj</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
