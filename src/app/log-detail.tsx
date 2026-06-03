import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogDetail() {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("workouts").select("*").eq("id", id).single();
      if (data) setSession(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const entryData = session ? (typeof session.entries === 'string' ? JSON.parse(session.entries) : session.entries) : {};

  const handleDelete = async () => {
    await supabase.from("workouts").delete().eq("id", id);
    router.back();
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!session) return <Text style={{ padding: 24 }}>Session not found.</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>{new Date(session.date).toLocaleString()}</Text>
        <Text style={{ color: "#555" }}>{session.exercise_name}</Text>

        {entryData?.exercises?.map((ex, i) => (
          <View key={i} style={{ marginTop: 10, borderWidth: 1, borderColor: "#eee", padding: 10, borderRadius: 10 }}>
            <Text style={{ fontWeight: "700" }}>{ex.name}</Text>
            {ex.sets.map((s, si) => (
              <Text key={si} style={{ marginLeft: 10, color: "#555" }}>
                Set {si + 1}: {s.reps || 0} reps @ {s.weight || 0} lb
              </Text>
            ))}
          </View>
        ))}

        {entryData?.custom?.length > 0 && (
          <View style={{ marginTop: 15, padding: 10, backgroundColor: "#f0f8ff", borderRadius: 8 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Custom Entries:</Text>
            {entryData.custom.map((c, i) => (
              <Text key={i} style={{ color: "#555" }}>• {c}</Text>
            ))}
          </View>
        )}

        {entryData?.note ? (
          <View style={{ marginTop: 15, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
            <Text style={{ fontWeight: "bold" }}>Note:</Text>
            <Text style={{ color: "#555" }}>{entryData.note}</Text>
          </View>
        ) : null}

        <Pressable onPress={() => Alert.alert("Delete", "Are you sure?", [{ text: "Delete", style: "destructive", onPress: handleDelete }, { text: "Cancel" }])} 
          style={{ backgroundColor: '#ffeded', padding: 15, borderRadius: 8, marginTop: 20 }}>
          <Text style={{ textAlign: 'center', color: 'red' }}>Delete Workout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}