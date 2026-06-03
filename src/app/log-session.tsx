import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

export default function LogSession() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sessionExercises, setSessionExercises] = useState([]);
  const [customEntries, setCustomEntries] = useState([]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => { loadTemplates(); }, []);

  async function loadTemplates() {
    const stored = await AsyncStorage.getItem("workouts");
    setTemplates(stored ? JSON.parse(stored) : []);
  }

  function toggleTemplate(template) {
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
      setSessionExercises([]);
    } else {
      setSelectedTemplate(template);
      const copiedExercises = [];
      template.groups?.forEach((group) => {
        group.exercises?.forEach((exercise) => {
          copiedExercises.push({
            name: exercise.name,
            sets: exercise.sets?.map((s) => ({ set: s.set, reps: "", weight: "" })) || [],
          });
        });
      });
      setSessionExercises(copiedExercises);
    }
  }

  function addCustomEntry() { setCustomEntries((prev) => [...prev, ""]); }
  function updateCustomEntry(index, text) { setCustomEntries((prev) => { const updated = [...prev]; updated[index] = text; return updated; }); }
  function removeCustomEntry(indexToRemove) { setCustomEntries((prev) => prev.filter((_, index) => index !== indexToRemove)); }
  function updateSet(exIndex, setIndex, field, value) {
    setSessionExercises((prev) => {
      const updated = [...prev];
      updated[exIndex].sets[setIndex] = { ...updated[exIndex].sets[setIndex], [field]: value };
      return updated;
    });
  }

  async function saveSession() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("workouts").insert({
      user_id: user.id,
      exercise_name: selectedTemplate?.name || "Custom Session",
      sets: 0,
      reps: 0,
      weight: 0,
      date: new Date(date).toISOString(),
      entries: { exercises: sessionExercises, custom: customEntries, note: note }
    });

    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Workout logged!");
      router.push("/view-log");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Log Session</Text>

        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Templates</Text>
        {templates.map((t) => (
          <Pressable key={t.id} onPress={() => toggleTemplate(t)} style={{ padding: 12, borderWidth: 1, borderColor: selectedTemplate?.id === t.id ? "black" : "#ddd", borderRadius: 8 }}>
            <Text style={{ fontWeight: "600" }}>{t.name}</Text>
          </Pressable>
        ))}

        {sessionExercises.map((ex, exIdx) => (
          <View key={exIdx} style={{ padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>{ex.name}</Text>
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={{ flex: 0.5, fontWeight: "600" }}>Set</Text>
              <Text style={{ flex: 1, fontWeight: "600" }}>Reps</Text>
              <Text style={{ flex: 1, fontWeight: "600" }}>Weight</Text>
            </View>
            {ex.sets.map((s, sIdx) => (
              <View key={sIdx} style={{ flexDirection: "row", gap: 10, marginBottom: 5, alignItems: "center" }}>
                <Text style={{ flex: 0.5 }}>{sIdx + 1}</Text>
                <TextInput placeholder="Reps" keyboardType="numeric" value={String(s.reps || "")} onChangeText={(v) => updateSet(exIdx, sIdx, "reps", v)} style={{ flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5 }} />
                <TextInput placeholder="Lbs" keyboardType="numeric" value={String(s.weight || "")} onChangeText={(v) => updateSet(exIdx, sIdx, "weight", v)} style={{ flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5 }} />
              </View>
            ))}
          </View>
        ))}

        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Custom Entries</Text>
        {customEntries.map((entry, index) => (
          <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput value={entry} onChangeText={(t) => updateCustomEntry(index, t)} placeholder="Add exercise..." style={{ flex: 1, borderWidth: 1, padding: 8, borderRadius: 5 }} />
            <Pressable onPress={() => removeCustomEntry(index)}><Text style={{ color: "red", fontWeight: "600" }}>Remove</Text></Pressable>
          </View>
        ))}
        <Pressable onPress={addCustomEntry}><Text style={{ color: "blue", fontWeight: "600" }}>+ Add Custom Entry</Text></Pressable>

        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Notes</Text>
        <TextInput value={note} onChangeText={setNote} multiline placeholder="Session notes..." style={{ borderWidth: 1, padding: 10, borderRadius: 5, minHeight: 60 }} />

        {loading ? <ActivityIndicator size="large" /> : (
          <Pressable onPress={saveSession} style={{ backgroundColor: "black", padding: 16, borderRadius: 10 }}>
            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Save Session</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}