import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../services/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Błąd", "Wypełnij wszystkie pola"); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/dashboard");
    } catch (e) {
      Alert.alert("Błąd logowania", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.container}>
      <View style={s.box}>
        <Text style={s.logo}>💰 BudgetApp</Text>
        <Text style={s.subtitle}>Zaloguj się do swojego konta</Text>

        <Text style={s.label}>E-MAIL</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#3a4a60"
          placeholder="jan@example.com" />

        <Text style={s.label}>HASŁO</Text>
        <TextInput style={s.input} value={password} onChangeText={setPassword}
          secureTextEntry placeholderTextColor="#3a4a60" placeholder="••••••••" />

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          <Text style={s.btnText}>{loading ? "Logowanie…" : "Zaloguj się"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={s.link}>Nie masz konta? <Text style={s.linkAccent}>Zarejestruj się</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080c14", justifyContent: "center", padding: 24 },
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
