import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { api } from "../../services/api";

export default function AddScreen() {
  const [form, setForm] = useState({
    title: "", amount: "", type: "expense",
    note: "", date: new Date().toISOString().slice(0, 10), category_id: "",
  });
  const [categories, setCategories] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => {});
  }, []);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const filteredCats = categories.filter((c) => c.type === form.type);

  // 🌍 Native feature: Geolocation
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") { Alert.alert("Brak uprawnień", "Nie można pobrać lokalizacji"); return; }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Medium });
    setLocation(`📍 ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
  };

  const handleSave = async () => {
    if (!form.title || !form.amount) { Alert.alert("Błąd", "Podaj tytuł i kwotę"); return; }
    const amount = parseFloat(form.amount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) { Alert.alert("Błąd", "Nieprawidłowa kwota"); return; }

    setLoading(true);
    const note = location ? (form.note ? `${form.note} | ${location}` : location) : form.note;

    try {
      await api.transactions.create({
        title: form.title,
        amount,
        type: form.type,
        note,
        date: new Date(form.date).toISOString(),
        category_id: form.category_id || null,
      });
      router.replace("/(tabs)/transactions");
    } catch (e) {
      Alert.alert("Błąd", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Nowa transakcja</Text>

      {/* Type toggle */}
      <View style={s.typeRow}>
        {["expense", "income"].map((t) => (
          <TouchableOpacity key={t} style={[s.typeBtn, form.type === t && (t === "expense" ? s.expenseActive : s.incomeActive)]}
            onPress={() => { set("type")(t); set("category_id")(""); }}>
            <Text style={[s.typeTxt, form.type === t && s.typeTxtActive]}>
              {t === "expense" ? "💸 Wydatek" : "💰 Przychód"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.label}>TYTUŁ</Text>
        <TextInput style={s.input} value={form.title} onChangeText={set("title")} placeholderTextColor="#3a4a60" placeholder="np. Zakupy" />

        <Text style={s.label}>KWOTA (PLN)</Text>
        <TextInput style={s.input} value={form.amount} onChangeText={set("amount")}
          keyboardType="decimal-pad" placeholderTextColor="#3a4a60" placeholder="0.00" />

        <Text style={s.label}>DATA</Text>
        <TextInput style={s.input} value={form.date} onChangeText={set("date")} placeholderTextColor="#3a4a60" />

        <Text style={s.label}>KATEGORIA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {[{ id: "", icon: "❌", name: "Brak" }, ...filteredCats].map((c) => (
            <TouchableOpacity key={c.id} style={[s.catBtn, form.category_id === c.id && s.catBtnActive]}
              onPress={() => set("category_id")(c.id)}>
              <Text style={s.catTxt}>{c.icon} {c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={s.label}>NOTATKA</Text>
        <TextInput style={s.input} value={form.note} onChangeText={set("note")} placeholderTextColor="#3a4a60" placeholder="Opcjonalnie" />

        {/* Geolocation */}
        <View style={s.locRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>LOKALIZACJA</Text>
            <Text style={{ color: location ? "#22c55e" : "#3a4a60", fontSize: 12 }}>
              {location || "Nie pobrano"}
            </Text>
          </View>
          <TouchableOpacity style={s.locBtn} onPress={getLocation}>
            <Text style={{ color: "#60a5fa", fontWeight: "700" }}>📍 Pobierz</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={s.saveTxt}>{loading ? "Zapisywanie…" : "Zapisz transakcję"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080c14" },
  title: { color: "#e2eaf4", fontSize: 22, fontWeight: "800", padding: 20, paddingTop: 56 },
  typeRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, gap: 8 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center", backgroundColor: "#161e2e" },
  expenseActive: { backgroundColor: "#ef4444" },
  incomeActive: { backgroundColor: "#22c55e" },
  typeTxt: { color: "#7a92b0", fontWeight: "700" },
  typeTxtActive: { color: "#fff" },
  card: { margin: 16, marginTop: 0, backgroundColor: "#0f1623", borderRadius: 12, padding: 20, borderWidth: 1, borderColor: "#1e2d45" },
  label: { color: "#7a92b0", fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: "#161e2e", borderRadius: 8, padding: 12, color: "#e2eaf4", fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: "#1e2d45" },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: "#161e2e" },
  catBtnActive: { backgroundColor: "#3b82f6" },
  catTxt: { color: "#e2eaf4", fontSize: 13 },
  locRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, padding: 12, backgroundColor: "#161e2e", borderRadius: 8, borderWidth: 1, borderColor: "#1e2d45" },
  locBtn: { padding: 8 },
  saveBtn: { backgroundColor: "#3b82f6", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 8 },
  saveTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
