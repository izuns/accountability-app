import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";

export default function LogDetail() {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem("workoutSessions");
      const sessions = data ? JSON.parse(data) : [];

      const found = sessions.find(
        (s) => String(s.id) === String(id)
      );

      setSession(found || null);
    };

    load();
  }, [id]);

  if (!session) {
    return (
      <View style={{ padding: 24 }}>
        <Text>Session not found.</Text>

        <Pressable onPress={() => router.back()}>
          <Text>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
      {/* HEADER */}
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        {new Date(session.date).toLocaleString()}
      </Text>

      <Text style={{ color: "#555" }}>
        {session.templateName}
      </Text>

      {/* ENTRIES */}
      {session.entries.map((entry, i) => {
        if (entry.type === "note") {
          return (
            <Text key={i} style={{ color: "#666" }}>
              • {entry.text}
            </Text>
          );
        }

        return (
          <View
            key={i}
            style={{
              marginTop: 10,
              borderWidth: 1,
              borderColor: "#eee",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>
              {entry.name}
            </Text>

            {entry.sets.map((s, si) => (
              <Text
                key={si}
                style={{ marginLeft: 10, color: "#555" }}
              >
                Set {s.set}: {s.reps} reps @ {s.weight} lb
              </Text>
            ))}
          </View>
        );
      })}

      {/* BACK */}
      <Pressable
        onPress={() => router.back()}
        style={{ marginTop: 20, alignItems: "center" }}
      >
        <Text style={{ color: "#555" }}>← Back</Text>
      </Pressable>
    </ScrollView>
  );
}