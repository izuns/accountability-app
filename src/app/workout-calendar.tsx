import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";

export default function WorkoutCalendar() {
  const [selectedDate, setSelectedDate] = useState("");
  const [planText, setPlanText] = useState("");
  
  // This object will hold all our plans. Format: { "2023-10-31": ["Run", "Core"] }
  const [plannedWorkouts, setPlannedWorkouts] = useState({});

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    const stored = await AsyncStorage.getItem("plannedWorkouts");
    if (stored) {
      setPlannedWorkouts(JSON.parse(stored));
    }
  }

  async function savePlan() {
    if (!planText.trim() || !selectedDate) return;

    // Get the existing plans for this date, or start an empty list
    const currentPlansForDate = plannedWorkouts[selectedDate] || [];
    
    const updatedPlans = {
      ...plannedWorkouts,
      [selectedDate]: [...currentPlansForDate, planText]
    };

    setPlannedWorkouts(updatedPlans);
    await AsyncStorage.setItem("plannedWorkouts", JSON.stringify(updatedPlans));
    
    // Clear the input box
    setPlanText("");
  }

  async function deletePlan(date, index) {
    const updatedPlansForDate = [...plannedWorkouts[date]];
    updatedPlansForDate.splice(index, 1); // Remove the specific item

    const updatedAllPlans = { ...plannedWorkouts };
    
    if (updatedPlansForDate.length === 0) {
      delete updatedAllPlans[date]; // If empty, remove the date entirely
    } else {
      updatedAllPlans[date] = updatedPlansForDate;
    }

    setPlannedWorkouts(updatedAllPlans);
    await AsyncStorage.setItem("plannedWorkouts", JSON.stringify(updatedAllPlans));
  }

  // Tell the calendar which days have dots under them and which is selected
  const markedDates = {};
  
  // 1. Put dots on days that have plans
  Object.keys(plannedWorkouts).forEach((date) => {
    markedDates[date] = { marked: true, dotColor: "black" };
  });

  // 2. Highlight the day the user just clicked
  if (selectedDate) {
    markedDates[selectedDate] = { 
      ...markedDates[selectedDate], 
      selected: true, 
      selectedColor: "black" 
    };
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>Workout Calendar</Text>

        {/* --- THE CALENDAR --- */}
        <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 12, overflow: "hidden" }}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              todayTextColor: '#007BFF',
              arrowColor: 'black',
            }}
          />
        </View>

        {/* --- ADD PLAN SECTION (Only shows if a date is clicked) --- */}
        {selectedDate ? (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
              Plans for {selectedDate}
            </Text>

            {/* List the plans for this specific day */}
            {(plannedWorkouts[selectedDate] || []).map((plan, index) => (
              <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fafafa", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#eee", marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "500" }}>{plan}</Text>
                <Pressable onPress={() => deletePlan(selectedDate, index)}>
                  <Text style={{ color: "#FF3B30", fontWeight: "bold" }}>X</Text>
                </Pressable>
              </View>
            ))}

            {/* Input box to add a new plan */}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <TextInput
                placeholder="e.g., Pull Day, 3 Mile Run..."
                value={planText}
                onChangeText={setPlanText}
                style={{ flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
              />
              <Pressable
                onPress={savePlan}
                style={{ backgroundColor: "black", paddingHorizontal: 16, justifyContent: "center", borderRadius: 8 }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Add</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={{ color: "#666", textAlign: "center", marginTop: 20, fontStyle: "italic" }}>
            Select a date on the calendar to plan a workout.
          </Text>
        )}

        <Pressable onPress={() => router.back()} style={{ marginTop: 20, padding: 12 }}>
          <Text style={{ textAlign: "center", color: "#555", fontWeight: "600" }}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}