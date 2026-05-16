import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../services/AuthContext";

function RootLayoutNav() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/(tabs)/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
