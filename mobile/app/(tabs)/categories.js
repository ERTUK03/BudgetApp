import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "../../services/api";

export default function CategoriesScreen() {
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "💰", color: "#3b82f6", type: "expense" });

  const load = () => api.categories.list().then(setCats).catch(() => {});
  useFocusEffect(useCallback(() => { load(); }, []));

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name) { Alert.alert("Błąd", "Podaj nazwę kategorii"); return; }
    await api.categories.create(form);
    setModal(false);
    setForm({ name: "", icon: "💰", color: "#3b82f6", type: "expense" });
    load();
  };

  const del = (id) => {
    Alert.alert("Usuń", "Usunąć kategorię?", [
      { text: "Anuluj", style: "cancel" },
      { text: "Usuń", style: "destructive", onPress: async () => { await api.categories.delete(id); load(); } },
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Kategorie</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setModal(true)}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>+ Nowa</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={cats} keyExtractor={(i) => i.id.toString()}
        renderItem={({ item: c }) => (
          <View style={s.catRow}>
            <View style={[s.iconBox, { backgroundColor: c.color + "33" }]}>
              <Text style={{ fontSize: 22 }}>{c.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.catName}>{c.name}</Text>
              <Text style={s.catType}>{c.type === "income" ? "Przychód" : "Wydatek"}</Text>
            </View>
            <View style={[s.dot, { backgroundColor: c.color }]} />
            <TouchableOpacity onPress={() => del(c.id)} style={{ padding: 8 }}>
              <Text style={{ color: "#ef4444" }}>✕</Text>
            </TouchableOpacity>
          </View>
        )} />

      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Nowa kategoria</Text>

            <Text style={s.label}>NAZWA</Text>
            <TextInput style={s.input} value={form.name} onChangeText={set("name")} placeholderTextColor="#3a4a60" placeholder="np. Restauracje" />

            <Text style={s.label}>EMOJI / IKONA</Text>
            <TextInput style={s.input} value={form.icon} onChangeText={set("icon")} placeholderTextColor="#3a4a60" maxLength={2} />

            <Text style={s.label}>TYP</Text>
            <View style={s.typeRow}>
              {["expense", "income"].map((t) => (
                <TouchableOpacity key={t} style={[s.typeBtn, form.type === t && s.typeBtnActive]}
                  onPress={() => set("type")(t)}>
                  <Text style={[s.typeTxt, form.type === t && { color: "#fff" }]}>
                    {t === "expense" ? "Wydatek" : "Przychód"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.btnRow}>
              <TouchableOpacity style={s.saveBtn} onPress={save}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Zapisz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModal(false)}>
                <Text style={{ color: "#7a92b0" }}>Anuluj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080c14" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 56 },
  title: { color: "#e2eaf4", fontSize: 22, fontWeight: "800" },
  addBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  catRow: { flexDirection: "row", alignItems: "center", padding: 16, marginHorizontal: 16, marginBottom: 8, backgroundColor: "#0f1623", borderRadius: 10, borderWidth: 1, borderColor: "#1e2d45" },
  iconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  catName: { color: "#e2eaf4", fontWeight: "600", fontSize: 15 },
  catType: { color: "#7a92b0", fontSize: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalBox: { backgroundColor: "#0f1623", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 28, borderWidth: 1, borderColor: "#1e2d45" },
  modalTitle: { color: "#e2eaf4", fontSize: 20, fontWeight: "800", marginBottom: 20 },
  label: { color: "#7a92b0", fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: "#161e2e", borderRadius: 8, padding: 12, color: "#e2eaf4", fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: "#1e2d45" },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center", backgroundColor: "#161e2e", borderWidth: 1, borderColor: "#1e2d45" },
  typeBtnActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  typeTxt: { color: "#7a92b0", fontWeight: "700" },
  btnRow: { flexDirection: "row", gap: 8 },
  saveBtn: { flex: 1, backgroundColor: "#3b82f6", padding: 14, borderRadius: 10, alignItems: "center" },
  cancelBtn: { flex: 1, backgroundColor: "#161e2e", padding: 14, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#1e2d45" },
});
