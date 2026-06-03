import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context"; // <-- Imported here

export default function ViewWorkouts() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const loadWorkouts = async () => {
      const data = await AsyncStorage.getItem("workouts");
      setWorkouts(data ? JSON.parse(data) : []);
    };

    const unsubscribe = router.addListener?.("focus", loadWorkouts);

    loadWorkouts();
    return unsubscribe;
  }, []);

  async function deleteWorkout(id) {
    const updated = workouts.filter((w) => w.id !== id);

    setWorkouts(updated);
    await AsyncStorage.setItem("workouts", JSON.stringify(updated));
  }

  return (
    // Wrapped the entire screen in SafeAreaView
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>
          Saved Workouts
        </Text>

        {workouts.length === 0 ? (
          <Text style={{ color: "#666" }}>
            No workouts saved yet.
          </Text>
        ) : (
          workouts.map((workout) => (
            <View
              key={workout.id}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                padding: 16,
                gap: 10,
                backgroundColor: "white",
              }}
            >
              {/* TITLE */}
              <Text style={{ fontSize: 18, fontWeight: "700" }}>
                {workout.name}
              </Text>

              {/* STRUCTURE */}
              {workout.groups?.map((group, gi) => (
                <View key={gi} style={{ marginTop: 6 }}>
                  <Text
                    style={{
                      fontWeight: "700",
                      color:
                        group.type === "superset"
                          ? "#d97706"
                          : "#333",
                    }}
                  >
                    {group.type === "superset" ? "⚡ Superset" : "Single"}
                  </Text>

                  {group.exercises?.map((ex, ei) => (
                    <View
                      key={ei}
                      style={{
                        marginLeft: 12,
                        marginTop: 6,
                        paddingLeft: 8,
                        borderLeftWidth: 2,
                        borderLeftColor:
                          group.type === "superset"
                            ? "#fbbf24"
                            : "#ddd",
                      }}
                    >
                      <Text style={{ fontWeight: "600" }}>
                        {ex.name}
                      </Text>

                      {ex.sets?.map((s, si) => (
                        <Text
                          key={si}
                          style={{ marginLeft: 10, color: "#555" }}
                        >
                          Set {s.set}: {s.reps} reps
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              ))}

              {/* EDIT */}
              <Pressable
                onPress={() =>
                  router.push(
                    `/log-workout?mode=edit&id=${workout.id}`
                  )
                }
                style={{
                  marginTop: 10,
                  backgroundColor: "#000",
                  padding: 10,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Edit Workout
                </Text>
              </Pressable>

              {/* DELETE (NEW) */}
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Delete Workout",
                    "Are you sure you want to delete this workout?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => deleteWorkout(workout.id),
                      },
                    ]
                  )
                }
                style={{
                  marginTop: 8,
                  backgroundColor: "#b91c1c",
                  padding: 10,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Delete Workout
                </Text>
              </Pressable>
            </View>
          ))
        )}

        {/* BACK */}
        <Pressable
          onPress={() => router.back()}
          style={{ alignItems: "center", marginTop: 10 }}
        >
          <Text style={{ color: "#555", fontWeight: "600" }}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}