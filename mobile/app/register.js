import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../services/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.email || !form.username || !form.password) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola"); return;
    }
    if (form.password !== form.confirm) {
      Alert.alert("Błąd", "Hasła nie są zgodne"); return;
    }
    setLoading(true);
    try {
      await register(form.email.trim(), form.username.trim(), form.password);
      router.replace("/(tabs)/dashboard");
    } catch (e) {
      Alert.alert("Błąd rejestracji", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.box}>
          <Text style={s.logo}>Nowe konto</Text>
          <Text style={s.subtitle}>Zacznij śledzić swoje finanse</Text>

          {[["E-MAIL", "email", "email-address"], ["NAZWA UŻYTKOWNIKA", "username", "default"],
            ["HASŁO", "password", "default"], ["POWTÓRZ HASŁO", "confirm", "default"]].map(([label, key, kb]) => (
            <View key={key}>
              <Text style={s.label}>{label}</Text>
              <TextInput style={s.input} value={form[key]} onChangeText={set(key)}
                keyboardType={kb} autoCapitalize="none" placeholderTextColor="#3a4a60"
                secureTextEntry={key === "password" || key === "confirm"} />
            </View>
          ))}

          <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
            <Text style={s.btnText}>{loading ? "Rejestrowanie…" : "Utwórz konto"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.link}>Masz już konto? <Text style={s.linkAccent}>Zaloguj się</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080c14" },
  scroll: { padding: 24, justifyContent: "center", flexGrow: 1 },
  box: { backgroundColor: "#0f1623", borderRadius: 16, padding: 28, borderWidth: 1, borderColor: "#1e2d45" },
  logo: { fontSize: 28, fontWeight: "800", color: "#e2eaf4", textAlign: "center", marginBottom: 6 },
  subtitle: { color: "#7a92b0", fontSize: 14, textAlign: "center", marginBottom: 28 },
  label: { color: "#7a92b0", fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: "#161e2e", borderRadius: 8, padding: 12, color: "#e2eaf4", fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: "#1e2d45" },
  btn: { backgroundColor: "#3b82f6", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8, marginBottom: 16 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { color: "#7a92b0", textAlign: "center", fontSize: 13 },
  linkAccent: { color: "#3b82f6", fontWeight: "700" },
});
