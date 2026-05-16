import { useEffect, useState } from "react";
import { api } from "../services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const fmt = (n) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n ?? 0);
const now = new Date();

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.transactions.summary(month, year),
      api.transactions.list({ month, year, per_page: 5 }),
    ]).then(([s, t]) => {
      setSummary(s);
      setRecent(t.items ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [month, year]);

  const months = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paź","Lis","Gru"];

  const pieData = (summary?.by_category ?? [])
    .filter((c) => c.expense > 0)
    .map((c) => ({ name: `${c.icon} ${c.name}`, value: c.expense, color: "#3b82f6" }));

  const COLORS = ["#3b82f6","#8b5cf6","#ec4899","#f97316","#22c55e","#06b6d4","#f59e0b","#ef4444"];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="flex gap-8">
          <select value={month} onChange={(e) => setMonth(+e.target.value)} style={{ width: 100 }}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} style={{ width: 90 }}>
            {[2023, 2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Ładowanie…</p>
      ) : (
        <>
          <div className="card-grid">
            <div className="stat-card">
              <div className="label">Przychody</div>
              <div className="value green">{fmt(summary?.total_income)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Wydatki</div>
              <div className="value red">{fmt(summary?.total_expense)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Bilans</div>
              <div className={`value ${(summary?.balance ?? 0) >= 0 ? "blue" : "red"}`}>
                {fmt(summary?.balance)}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Oszczędność</div>
              <div className="value blue">
                {summary?.total_income > 0
                  ? `${((1 - summary.total_expense / summary.total_income) * 100).toFixed(0)}%`
                  : "–"}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {pieData.length > 0 && (
              <div className="card">
                <div className="label" style={{ marginBottom: 12 }}>Wydatki wg kategorii</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {summary?.by_category?.length > 0 && (
              <div className="card">
                <div className="label" style={{ marginBottom: 12 }}>Przychody vs Wydatki</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[{ name: months[month - 1], income: summary.total_income, expense: summary.total_expense }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                    <XAxis dataKey="name" stroke="#7a92b0" />
                    <YAxis stroke="#7a92b0" />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Bar dataKey="income" fill="#22c55e" radius={4} name="Przychody" />
                    <Bar dataKey="expense" fill="#ef4444" radius={4} name="Wydatki" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card">
            <div className="label" style={{ marginBottom: 12 }}>Ostatnie transakcje</div>
            {recent.length === 0 ? (
              <p className="text-muted">Brak transakcji w tym miesiącu</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Tytuł</th><th>Kategoria</th><th>Data</th><th>Kwota</th></tr>
                  </thead>
                  <tbody>
                    {recent.map((t) => (
                      <tr key={t.id}>
                        <td>{t.title}</td>
                        <td>{t.category ? `${t.category.icon} ${t.category.name}` : "–"}</td>
                        <td className="text-muted">{new Date(t.date).toLocaleDateString("pl-PL")}</td>
                        <td className={t.type === "income" ? "text-green mono" : "text-red mono"}>
                          {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
