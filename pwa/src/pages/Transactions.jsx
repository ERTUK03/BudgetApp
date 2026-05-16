import { useEffect, useState } from "react";
import { api } from "../services/api";

const fmt = (n) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n ?? 0);
const now = new Date();

const EMPTY = { title: "", amount: "", type: "expense", note: "", date: now.toISOString().slice(0, 10), category_id: "" };

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState({ type: "", month: now.getMonth() + 1, year: now.getFullYear() });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = { page, per_page: 20 };
    if (filter.type) params.type = filter.type;
    if (filter.month) params.month = filter.month;
    if (filter.year) params.year = filter.year;
    try {
      const data = await api.transactions.list(params);
      setItems(data.items); setTotal(data.total); setPages(data.pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter]);
  useEffect(() => { api.categories.list().then(setCategories); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(""); setModal(true); };
  const openEdit = (t) => {
    setForm({ title: t.title, amount: t.amount, type: t.type, note: t.note, date: t.date.slice(0,10), category_id: t.category_id ?? "" });
    setEditId(t.id); setError(""); setModal(true);
  };

  const save = async (e) => {
    e.preventDefault(); setError("");
    const payload = { ...form, amount: parseFloat(form.amount), date: new Date(form.date).toISOString(), category_id: form.category_id || null };
    try {
      if (editId) await api.transactions.update(editId, payload);
      else await api.transactions.create(payload);
      setModal(false); load();
    } catch (err) { setError(err.message); }
  };

  const del = async (id) => {
    if (!confirm("Usunąć transakcję?")) return;
    await api.transactions.delete(id);
    load();
  };

  const filteredCats = categories.filter((c) => c.type === form.type);
  const months = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paź","Lis","Gru"];

  return (
    <div>
      <div className="page-header">
        <h1>Transakcje <span className="text-muted">({total})</span></h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nowa</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
          <select value={filter.type} onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))} style={{ width: 130 }}>
            <option value="">Wszystkie</option>
            <option value="income">Przychody</option>
            <option value="expense">Wydatki</option>
          </select>
          <select value={filter.month} onChange={(e) => setFilter((f) => ({ ...f, month: +e.target.value }))} style={{ width: 100 }}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={filter.year} onChange={(e) => setFilter((f) => ({ ...f, year: +e.target.value }))} style={{ width: 90 }}>
            {[2023, 2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <p className="text-muted">Ładowanie…</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tytuł</th><th>Kategoria</th><th>Typ</th><th>Data</th><th>Kwota</th><th></th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={6} className="text-muted">Brak transakcji</td></tr>}
                {items.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.category ? `${t.category.icon} ${t.category.name}` : "–"}</td>
                    <td><span className={`badge badge-${t.type}`}>{t.type === "income" ? "Przychód" : "Wydatek"}</span></td>
                    <td className="text-muted">{new Date(t.date).toLocaleDateString("pl-PL")}</td>
                    <td className={`mono ${t.type === "income" ? "text-green" : "text-red"}`}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(t.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex gap-8 mt-16" style={{ justifyContent: "center" }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Wstecz</button>
            <span className="text-muted">{page} / {pages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Dalej →</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h2>{editId ? "Edytuj transakcję" : "Nowa transakcja"}</h2>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Tytuł</label>
                <input value={form.title} onChange={set("title")} required />
              </div>
              <div className="form-group">
                <label>Typ</label>
                <select value={form.type} onChange={set("type")}>
                  <option value="expense">Wydatek</option>
                  <option value="income">Przychód</option>
                </select>
              </div>
              <div className="form-group">
                <label>Kwota (PLN)</label>
                <input type="number" step="0.01" min="0.01" value={form.amount} onChange={set("amount")} required />
              </div>
              <div className="form-group">
                <label>Data</label>
                <input type="date" value={form.date} onChange={set("date")} required />
              </div>
              <div className="form-group">
                <label>Kategoria</label>
                <select value={form.category_id} onChange={set("category_id")}>
                  <option value="">Brak kategorii</option>
                  {filteredCats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Notatka</label>
                <input value={form.note} onChange={set("note")} />
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
