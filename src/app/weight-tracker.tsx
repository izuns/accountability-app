import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WeightTracker() {
  const [weight, setWeight] = useState("");
  const [weightHistory, setWeightHistory] = useState([]);

  // Load past entries when the screen opens
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const stored = await AsyncStorage.getItem("weightLogs");
    if (stored) {
      setWeightHistory(JSON.parse(stored));
    }
  }

  // Save a new entry
  async function saveWeight() {
    if (!weight.trim()) return;

    // Create a new entry with today's date
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(), // Automatically gets today's date
      weight: weight,
    };

    // Add the new entry to the top of our history list
    const updatedHistory = [newEntry, ...weightHistory];

    // Save to the screen and to the phone's storage
    setWeightHistory(updatedHistory);
    await AsyncStorage.setItem("weightLogs", JSON.stringify(updatedHistory));

    // Clear the input box so it's empty for next time
    setWeight("");
  }

  // Delete an entry if you make a mistake
  async function deleteEntry(id) {
    const updated = weightHistory.filter(entry => entry.id !== id);
    setWeightHistory(updated);
    await AsyncStorage.setItem("weightLogs", JSON.stringify(updated));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView 
        contentContainerStyle={{ padding: 24, gap: 16 }} 
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>Weight Tracker</Text>

        {/* --- INPUT SECTION --- */}
        <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-end" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>Log Today's Weight</Text>
            <TextInput
              placeholder="e.g., 150"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
            />
          </View>
          
          <Pressable
            onPress={saveWeight}
            style={{ backgroundColor: "black", padding: 14, borderRadius: 8, justifyContent: "center" }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
          </Pressable>
        </View>

        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />

        {/* --- HISTORY SECTION --- */}
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>History</Text>

        {weightHistory.length === 0 ? (
          <Text style={{ color: "#666", fontStyle: "italic" }}>No weigh-ins logged yet.</Text>
        ) : (
          weightHistory.map((entry) => (
            <View
              key={entry.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ddd",
                padding: 16,
                borderRadius: 12,
                backgroundColor: "#fafafa"
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>{entry.date}</Text>
              
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>{entry.weight} lbs</Text>
                
                <Pressable onPress={() => deleteEntry(entry.id)}>
                  <Text style={{ color: "#FF3B30", fontWeight: "600", fontSize: 16 }}>X</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <Pressable onPress={() => router.back()} style={{ marginTop: 20, padding: 12 }}>
          <Text style={{ textAlign: "center", color: "#555", fontWeight: "600" }}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}