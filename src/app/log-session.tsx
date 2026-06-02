import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogSession() {
  const [templates, setTemplates] = useState([]);
  
  // State for Templates
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sessionExercises, setSessionExercises] = useState([]);

  // State for Custom Entries (Open form text boxes)
  const [customEntries, setCustomEntries] = useState([]);

  // General Log Data
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
  );

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const stored = await AsyncStorage.getItem("workouts");
    const parsed = stored ? JSON.parse(stored) : [];
    setTemplates(parsed);
  }

  // --- Toggle Template Selection ---
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
            sets:
              exercise.sets?.map((s) => ({
                set: s.set,
                reps: s.reps || "",
                weight: "",
              })) || [],
          });
        });
      });

      setSessionExercises(copiedExercises);
    }
  }

  // --- Custom Entry Functions ---
  function addCustomEntry() {
    setCustomEntries((prev) => [...prev, ""]);
  }

  function updateCustomEntry(index, text) {
    setCustomEntries((prev) => {
      const updated = [...prev];
      updated[index] = text;
      return updated;
    });
  }

  function removeCustomEntry(indexToRemove) {
    setCustomEntries((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  // --- Update Template Sets ---
  function updateSet(exIndex, setIndex, field, value) {
    setSessionExercises((prev) => {
      const updated = [...prev];
      updated[exIndex].sets[setIndex] = {
        ...updated[exIndex].sets[setIndex],
        [field]: value,
      };
      return updated;
    });
  }

  // --- Save Logic ---
  async function saveSession() {
    const hasCustom = customEntries.some(entry => entry.trim() !== "");
    
    if (!selectedTemplate && !hasCustom) {
      alert("Please select a template or add a custom entry.");
      return;
    }

    const existing = await AsyncStorage.getItem("workoutSessions");
    const sessions = existing ? JSON.parse(existing) : [];

    let sessionName = "Custom Session";
    if (selectedTemplate) {
      sessionName = selectedTemplate.name;
      if (hasCustom) sessionName += " + Custom";
    }

    sessions.unshift({
      id: Date.now(),
      templateName: sessionName,
      date: `${date} ${time}`,
      entries: [
        ...sessionExercises,
        ...customEntries
          .filter((text) => text.trim() !== "")
          .map((text) => ({ type: "customText", text })),
        ...(note.trim() ? [{ type: "note", text: note }] : []),
      ],
    });

    await AsyncStorage.setItem("workoutSessions", JSON.stringify(sessions));
    alert("Session saved!");
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          gap: 16, 
        }}
        keyboardShouldPersistTaps="handled" // Helps dismiss keyboard when tapping outside inputs
      >
        {/* --- Header --- */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Log Session</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: "#007BFF", fontWeight: "600", fontSize: 16 }}>Cancel</Text>
          </Pressable>
        </View>

        {/* --- Date & Time --- */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>Time</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 }}
            />
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />

        {/* --- Templates Section --- */}
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Templates</Text>
        {templates.length === 0 && (
          <Text style={{ color: "#666", fontStyle: "italic" }}>No templates saved.</Text>
        )}
        {templates.map((template) => (
          <Pressable
            key={template.id}
            onPress={() => toggleTemplate(template)}
            style={{
              borderWidth: 1,
              borderColor: selectedTemplate?.id === template.id ? "black" : "#ddd",
              backgroundColor: selectedTemplate?.id === template.id ? "black" : "transparent",
              padding: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: selectedTemplate?.id === template.id ? "white" : "black", fontWeight: "600" }}>
              {template.name}
            </Text>
          </Pressable>
        ))}

        {/* --- Template Exercises Section --- */}
        {selectedTemplate && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
              Template Exercises
            </Text>

            {sessionExercises.map((exercise, exIndex) => (
              <View
                key={exIndex}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                  backgroundColor: "#fafafa"
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 15, marginBottom: 12 }}>
                  {exercise.name}
                </Text>

                <View style={{ flexDirection: "row", marginBottom: 8 }}>
                  <Text style={{ flex: 1, fontWeight: "600", color: "#666" }}>Set</Text>
                  <Text style={{ flex: 2, fontWeight: "600", color: "#666", marginLeft: 8 }}>Reps</Text>
                  <Text style={{ flex: 2, fontWeight: "600", color: "#666", marginLeft: 8 }}>Weight</Text>
                </View>

                {exercise.sets.map((set, setIndex) => (
                  <View
                    key={setIndex}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ flex: 1, fontWeight: "500" }}>{set.set}</Text>

                    <TextInput
                      placeholder="Reps"
                      value={String(set.reps)}
                      onChangeText={(v) => updateSet(exIndex, setIndex, "reps", v)}
                      keyboardType="numeric"
                      style={{
                        flex: 2,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 8,
                        borderRadius: 8,
                        marginLeft: 8,
                        backgroundColor: "#fff"
                      }}
                    />

                    <TextInput
                      placeholder="Lbs/Kg"
                      value={String(set.weight)}
                      onChangeText={(v) => updateSet(exIndex, setIndex, "weight", v)}
                      keyboardType="numeric"
                      style={{
                        flex: 2,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 8,
                        borderRadius: 8,
                        marginLeft: 8,
                        backgroundColor: "#fff"
                      }}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />

        {/* --- Custom Entries Section --- */}
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Custom Entries</Text>
        
        {customEntries.map((entry, index) => (
          <View key={index} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 }}>
              <Pressable onPress={() => removeCustomEntry(index)}>
                <Text style={{ color: "#FF3B30", fontWeight: "600", fontSize: 14 }}>
                  Remove
                </Text>
              </Pressable>
            </View>
            
            <TextInput
              placeholder="E.g., 3x10 Pullups, 20 min core circuit..."
              value={entry}
              onChangeText={(text) => updateCustomEntry(index, text)}
              multiline
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 12,
                borderRadius: 8,
                minHeight: 80,
                backgroundColor: "#fff",
                textAlignVertical: "top" // Ensures placeholder starts at top on Android
              }}
            />
          </View>
        ))}

        <Pressable
          onPress={addCustomEntry}
          style={{
            borderWidth: 1,
            borderColor: "#007BFF",
            backgroundColor: "#E3F2FD",
            padding: 12,
            borderRadius: 10,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#007BFF", fontWeight: "600" }}>
            + Add Custom Entry
          </Text>
        </Pressable>

        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />

        {/* --- Notes Section --- */}
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Overall Session Notes</Text>
        <TextInput
          placeholder="Felt great today, right shoulder a bit tight..."
          value={note}
          onChangeText={setNote}
          multiline
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 12,
            borderRadius: 8,
            minHeight: 80,
            textAlignVertical: "top"
          }}
        />

        {/* --- Save Button --- */}
        <Pressable
          onPress={saveSession}
          style={{
            backgroundColor: "black",
            padding: 16,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 12,
            marginBottom: 32, // Extra padding at bottom for easier scrolling
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            Save Session
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}