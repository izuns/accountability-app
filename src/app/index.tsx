import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: "center",
        gap: 16,
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontSize: 30, fontWeight: "bold" }}>
        Accountability App
      </Text>

      <Text style={{ fontSize: 16 }}>
        Today: 0 / 1 workouts completed
      </Text>

      {/* Today's Plan */}
      <View
        style={{
          padding: 16,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: "#ddd",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Today's Plan
        </Text>
        <Text style={{ marginTop: 6, color: "#555" }}>
          No workouts scheduled yet.
        </Text>
      </View>

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

      {/* 1. LOG SESSION */}
      <Pressable
        style={{
          backgroundColor: "#333",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
        onPress={() => router.push("/log-session")}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          Log Workout Session
        </Text>
      </Pressable>

      {/* 2. VIEW LOG */}
      <Pressable
        style={{
          backgroundColor: "#555",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
        onPress={() => router.push("/view-log")}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          View Workout Log
        </Text>
      </Pressable>

      {/* 3. ADD TEMPLATE */}
      <Pressable
        style={{
          backgroundColor: "black",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
        onPress={() => router.push("/log-workout")}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          Add Workout Template
        </Text>
      </Pressable>

      {/* 4. VIEW TEMPLATES */}
      <Pressable
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          alignItems: "center",
        }}
        onPress={() => router.push("/workouts")}
      >
        <Text>View Workout Templates</Text>
      </Pressable>
    </View>
  );
}