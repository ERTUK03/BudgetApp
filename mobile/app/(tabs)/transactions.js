import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "../../services/api";

const fmt = (n) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n ?? 0);
const MONTHS = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paź","Lis","Gru"];

export default function TransactionsScreen() {
  const now = new Date();
  const [items, setItems] = useState([]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [type, setType] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const params = { month, year, per_page: 50 };
      if (type) params.type = type;
      const data = await api.transactions.list(params);
      setItems(data.items ?? []);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [month, type]));

  const deleteItem = (id) => {
    Alert.alert("Usuń", "Usunąć transakcję?", [
      { text: "Anuluj", style: "cancel" },
      { text: "Usuń", style: "destructive", onPress: async () => {
        await api.transactions.delete(id);
        load();
      }},
    ]);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Transakcje</Text>

      {/* Month filter */}
      <FlatList horizontal data={MONTHS} keyExtractor={(_, i) => i.toString()}
        showsHorizontalScrollIndicator={false} style={s.monthRow}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={[s.monthBtn, month === index + 1 && s.monthBtnActive]}
            onPress={() => setMonth(index + 1)}>
            <Text style={[s.monthText, month === index + 1 && s.monthTextActive]}>{item}</Text>
          </TouchableOpacity>
        )} />

      {/* Type filter */}
      <View style={s.typeRow}>
        {[["", "Wszystkie"], ["expense", "Wydatki"], ["income", "Przychody"]].map(([v, label]) => (
          <TouchableOpacity key={v} style={[s.typeBtn, type === v && s.typeBtnActive]} onPress={() => setType(v)}>
            <Text style={[s.typeText, type === v && s.typeTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList data={items} keyExtractor={(i) => i.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#3b82f6" />}
        ListEmptyComponent={<Text style={s.empty}>Brak transakcji</Text>}
        renderItem={({ item: t }) => (
          <TouchableOpacity style={s.txRow} onLongPress={() => deleteItem(t.id)}>
            <View style={{ flex: 1 }}>
              <Text style={s.txTitle}>{t.title}</Text>
              <Text style={s.txCat}>{t.category ? `${t.category.icon} ${t.category.name}` : "–"}</Text>
              <Text style={s.txDate}>{new Date(t.date).toLocaleDateString("pl-PL")}</Text>
            </View>
            <Text style={{ color: t.type === "income" ? "#22c55e" : "#ef4444", fontWeight: "700", fontSize: 16 }}>
              {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
            </Text>
          </TouchableOpacity>
        )} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080c14" },
  title: { color: "#e2eaf4", fontSize: 22, fontWeight: "800", padding: 20, paddingTop: 56 },
  monthRow: { paddingHorizontal: 16, marginBottom: 12 },
  monthBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: "#0f1623" },
  monthBtnActive: { backgroundColor: "#3b82f6" },
  monthText: { color: "#7a92b0", fontSize: 13 },
  monthTextActive: { color: "#fff", fontWeight: "700" },
  typeRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: "#0f1623", borderWidth: 1, borderColor: "#1e2d45" },
  typeBtnActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  typeText: { color: "#7a92b0", fontSize: 13 },
  typeTextActive: { color: "#fff", fontWeight: "700" },
  txRow: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1e2d45", backgroundColor: "#0f1623", marginHorizontal: 16, marginBottom: 8, borderRadius: 10 },
  txTitle: { color: "#e2eaf4", fontWeight: "600", fontSize: 15 },
  txCat: { color: "#7a92b0", fontSize: 12, marginTop: 2 },
  txDate: { color: "#7a92b0", fontSize: 11, marginTop: 2 },
  empty: { color: "#7a92b0", textAlign: "center", marginTop: 40 },
});
