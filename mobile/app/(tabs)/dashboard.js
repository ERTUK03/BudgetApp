import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../services/AuthContext";
import { api } from "../../services/api";

const fmt = (n) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n ?? 0);
const MONTHS = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paź","Lis","Gru"];

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const load = async () => {
    try {
      const [s, t] = await Promise.all([
        api.transactions.summary(month, year),
        api.transactions.list({ month, year, per_page: 5 }),
      ]);
      setSummary(s);
      setRecent(t.items ?? []);
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [month]));

  return (
    <ScrollView style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#3b82f6" />}>

      {offline && <View style={s.offlineBanner}><Text style={s.offlineText}>⚠️ Tryb offline</Text></View>}

      <View style={s.header}>
        <Text style={s.title}>Cześć, {user?.username}!</Text>
        <TouchableOpacity onPress={logout}><Text style={s.logout}>Wyloguj</Text></TouchableOpacity>
      </View>

      {/* Month selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.monthRow}>
        {MONTHS.map((m, i) => (
          <TouchableOpacity key={i} style={[s.monthBtn, month === i + 1 && s.monthBtnActive]} onPress={() => setMonth(i + 1)}>
            <Text style={[s.monthText, month === i + 1 && s.monthTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats */}
      <View style={s.grid}>
        <View style={s.statCard}>
          <Text style={s.statLabel}>PRZYCHODY</Text>
          <Text style={[s.statValue, { color: "#22c55e" }]}>{fmt(summary?.total_income)}</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>WYDATKI</Text>
          <Text style={[s.statValue, { color: "#ef4444" }]}>{fmt(summary?.total_expense)}</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>BILANS</Text>
          <Text style={[s.statValue, { color: (summary?.balance ?? 0) >= 0 ? "#60a5fa" : "#ef4444" }]}>
            {fmt(summary?.balance)}
          </Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>OSZCZĘDNOŚĆ</Text>
          <Text style={[s.statValue, { color: "#60a5fa" }]}>
            {summary?.total_income > 0
              ? `${((1 - summary.total_expense / summary.total_income) * 100).toFixed(0)}%`
              : "–"}
          </Text>
        </View>
      </View>

      {/* Recent */}
      <Text style={s.sectionTitle}>Ostatnie transakcje</Text>
      <View style={s.card}>
        {recent.length === 0
          ? <Text style={s.empty}>Brak transakcji</Text>
          : recent.map((t) => (
            <View key={t.id} style={s.txRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.txTitle}>{t.title}</Text>
                <Text style={s.txCat}>{t.category ? `${t.category.icon} ${t.category.name}` : "–"}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: t.type === "income" ? "#22c55e" : "#ef4444", fontWeight: "700" }}>
                  {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                </Text>
                <Text style={s.txDate}>{new Date(t.date).toLocaleDateString("pl-PL")}</Text>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080c14" },
  offlineBanner: { backgroundColor: "#f59e0b", padding: 8 },
  offlineText: { color: "#000", textAlign: "center", fontWeight: "700" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 56 },
  title: { color: "#e2eaf4", fontSize: 22, fontWeight: "800" },
  logout: { color: "#7a92b0", fontSize: 14 },
  monthRow: { paddingHorizontal: 16, marginBottom: 16 },
  monthBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: "#0f1623" },
  monthBtnActive: { backgroundColor: "#3b82f6" },
  monthText: { color: "#7a92b0", fontSize: 13 },
  monthTextActive: { color: "#fff", fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 12 },
  statCard: { flex: 1, minWidth: "45%", backgroundColor: "#0f1623", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#1e2d45" },
  statLabel: { color: "#7a92b0", fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: "700" },
  sectionTitle: { color: "#e2eaf4", fontSize: 16, fontWeight: "700", paddingHorizontal: 16, marginBottom: 8 },
  card: { margin: 16, marginTop: 0, backgroundColor: "#0f1623", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#1e2d45" },
  empty: { color: "#7a92b0", textAlign: "center" },
  txRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1e2d45" },
  txTitle: { color: "#e2eaf4", fontWeight: "600", fontSize: 14 },
  txCat: { color: "#7a92b0", fontSize: 12, marginTop: 2 },
  txDate: { color: "#7a92b0", fontSize: 11, marginTop: 2 },
});
