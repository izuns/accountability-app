import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ViewLog() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    setSessions(data || []);
    setLoading(false);
  };

  useFocusEffect(() => { fetchLogs(); });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {loading ? <ActivityIndicator size="large" style={{ marginTop: 50 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Workout Log</Text>
          {sessions.map((s) => {
            const entryData = typeof s.entries === 'string' ? JSON.parse(s.entries) : s.entries;
            const sessionDate = new Date(s.date);
            return (
              <Pressable key={s.id} onPress={() => router.push(`/log-detail?id=${s.id}`)} 
                style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10 }}>
                <Text style={{ fontWeight: "800", fontSize: 16 }}>{sessionDate.toLocaleDateString()}</Text>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>{sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                
                {/* Template Name */}
                <Text style={{ color: "#007BFF", fontWeight: "600" }}>{s.exercise_name}</Text>
                
                {/* Custom Entries Preview */}
                {entryData?.custom?.map((text, i) => (
                  <Text key={i} style={{ fontSize: 13, color: "#444", marginTop: 2 }}>
                    • {text}
                  </Text>
                ))}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}