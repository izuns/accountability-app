import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [plannedWorkouts, setPlannedWorkouts] = useState({});
  const [todayPlans, setTodayPlans] = useState([]);

  // Helper to get local YYYY-MM-DD accurately without timezone shifting
  function getLocalDateString(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const today = new Date();
  const todayString = getLocalDateString(today);

  // Generate an array of 7 dates for the current week (Sunday - Saturday)
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  useEffect(() => {
    const unsubscribe = router.addListener?.("focus", loadDashboardData);
    loadDashboardData();
    return unsubscribe;
  }, []);

  async function loadDashboardData() {
    const storedPlans = await AsyncStorage.getItem("plannedWorkouts");
    if (storedPlans) {
      const parsedPlans = JSON.parse(storedPlans);
      setPlannedWorkouts(parsedPlans);

      if (parsedPlans[todayString]) {
        setTodayPlans(parsedPlans[todayString]);
      } else {
        setTodayPlans([]);
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          Accountability App
        </Text>

        <Text style={{ fontSize: 16 }}>
          Today: 0 / {todayPlans.length === 0 ? 1 : todayPlans.length} workouts completed
        </Text>

        {/* --- DYNAMIC TODAY'S PLAN --- */}
        <View
          style={{
            padding: 16,
            borderWidth: 1,
            borderRadius: 12,
            borderColor: "#ddd",
            backgroundColor: "#fafafa"
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            Today's Plan
          </Text>
          {todayPlans.length === 0 ? (
            <Text style={{ marginTop: 6, color: "#555", fontStyle: "italic" }}>
              No workouts scheduled yet.
            </Text>
          ) : (
            todayPlans.map((plan, index) => (
              <Text key={index} style={{ marginTop: 6, fontSize: 16, fontWeight: "500", color: "#007BFF" }}>
                • {plan}
              </Text>
            ))
          )}
        </View>

        {/* --- WEEK VIEW PREVIEW --- */}
        <Pressable 
          onPress={() => router.push("/workout-calendar")}
          style={{ 
            borderWidth: 1, 
            borderColor: "#ddd", 
            borderRadius: 12, 
            padding: 16, 
            backgroundColor: "white",
            gap: 12 // Adds spacing between the header and the days
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            This Week
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {weekDates.map((date, i) => {
              const dateStr = getLocalDateString(date);
              const isToday = dateStr === todayString;
              const hasPlan = plannedWorkouts[dateStr] && plannedWorkouts[dateStr].length > 0;
              const dayName = ["S", "M", "T", "W", "T", "F", "S"][date.getDay()];

              return (
                <View key={i} style={{ alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 12, color: "#666", fontWeight: "600" }}>
                    {dayName}
                  </Text>
                  
                  {/* Date Circle */}
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isToday ? "#007BFF" : "transparent",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: isToday ? "bold" : "500",
                      color: isToday ? "white" : "black"
                    }}>
                      {date.getDate()}
                    </Text>
                  </View>

                  {/* The blue dot indicating a planned workout */}
                  <View style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: 3, 
                    backgroundColor: hasPlan ? "#007BFF" : "transparent" 
                  }} />
                </View>
              );
            })}
          </View>
        </Pressable>

        {/* Partner Activity */}
        <View
          style={{
            padding: 16,
            borderWidth: 1,
            borderRadius: 12,
            borderColor: "#ddd",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            Partner Activity
          </Text>
          <Text style={{ marginTop: 6, color: "#555" }}>
            No activity yet.
          </Text>
        </View>

        {/* --- NAVIGATION BUTTONS --- */}

        <Pressable
  style={{ backgroundColor: "#007BFF", padding: 14, borderRadius: 12, alignItems: "center" }}
  onPress={() => router.push("/login")}
>
  <Text style={{ color: "white", fontWeight: "bold" }}>TEST: Go to Login Page</Text>
</Pressable>

        <Pressable
          style={{ backgroundColor: "#333", padding: 14, borderRadius: 12, alignItems: "center" }}
          onPress={() => router.push("/log-session")}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Log Workout Session</Text>
        </Pressable>

        <Pressable
          style={{ backgroundColor: "#555", padding: 14, borderRadius: 12, alignItems: "center" }}
          onPress={() => router.push("/view-log")}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>View Workout Log</Text>
        </Pressable>

        <Pressable
          style={{ backgroundColor: "black", padding: 14, borderRadius: 12, alignItems: "center" }}
          onPress={() => router.push("/log-workout")}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Add Workout Template</Text>
        </Pressable>

        <Pressable
          style={{ padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, alignItems: "center" }}
          onPress={() => router.push("/workouts")}
        >
          <Text>View Workout Templates</Text>
        </Pressable>

        <Pressable
          style={{ padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, alignItems: "center" }}
          onPress={() => router.push("/weight-tracker")}
        >
          <Text>Weight Tracker</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}