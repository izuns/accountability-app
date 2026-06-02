import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function ViewLog() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem("workoutSessions");
      const parsed = data ? JSON.parse(data) : [];

      parsed.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setSessions(parsed);
    };

    const unsubscribe = router.addListener?.("focus", load);
    load();

    return unsubscribe;
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Workout Log
      </Text>

      {sessions.map((s) => (
        <Pressable
          key={s.id}
          onPress={() =>
            router.push({
              pathname: "/log-detail",
              params: { id: s.id },
            })
          }
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 12,
            borderRadius: 10,
            gap: 4,
          }}
        >
          <Text style={{ fontWeight: "700" }}>
            {new Date(s.date).toLocaleString()}
          </Text>

          <Text>{s.templateName}</Text>

          {s.entries.slice(0, 4).map((e, i) => (
            <Text key={i} style={{ color: "#777" }}>
              {e.type === "note"
                ? `• ${e.text}`
                : `• ${e.name}`}
            </Text>
          ))}
        </Pressable>
      ))}

      {/* BACK */}
      <Pressable
        onPress={() => router.back()}
        style={{ alignItems: "center", marginTop: 10 }}
      >
        <Text style={{ color: "#555" }}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}