import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#0f1623", borderTopColor: "#1e2d45" },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#7a92b0",
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} /> }} />
      <Tabs.Screen name="transactions" options={{ title: "Transakcje", tabBarIcon: ({ color }) => <TabIcon emoji="💸" color={color} /> }} />
      <Tabs.Screen name="add" options={{ title: "Dodaj", tabBarIcon: ({ color }) => <TabIcon emoji="➕" color={color} /> }} />
      <Tabs.Screen name="categories" options={{ title: "Kategorie", tabBarIcon: ({ color }) => <TabIcon emoji="🏷️" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ emoji }) {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}
