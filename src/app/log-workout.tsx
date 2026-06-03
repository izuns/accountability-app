import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogWorkout() {
  const { id, mode } = useLocalSearchParams();
  const isEditing = mode === "edit";

  const [workoutName, setWorkoutName] = useState("");
  const [groups, setGroups] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(null);

  const [exerciseName, setExerciseName] = useState("");
  const [reps, setReps] = useState("");
  const [numSets, setNumSets] = useState("");

  const [editingExercise, setEditingExercise] = useState(null); 
  // { groupIndex, exerciseIndex }

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    async function load() {
      if (!isEditing || !id) return;

      const stored = await AsyncStorage.getItem("workouts");
      const workouts = stored ? JSON.parse(stored) : [];

      const found = workouts.find((w) => String(w.id) === String(id));

      if (!found) return;

      setWorkoutName(found.name || "");
      setGroups(found.groups || []);
      setEditingId(found.id || null);
    }

    load();
  }, [id, isEditing]);

  function startNewGroup(type) {
    setGroups((prev) => {
      const updated = [...prev, { type, exercises: [] }];
      setActiveGroupIndex(updated.length - 1);
      return updated;
    });
  }

  function resetInputs() {
    setExerciseName("");
    setReps("");
    setNumSets("");
    setEditingExercise(null);
  }

  function addOrUpdateExercise() {
    if (!exerciseName.trim() || !reps.trim() || !numSets.trim()) return;

    const setCount = Math.max(Number(numSets), 1);

    const newSets = Array.from({ length: setCount }, (_, i) => ({
      set: i + 1,
      reps: Number(reps),
    }));

    setGroups((prev) => {
      const updated = [...prev];

      if (updated.length === 0) {
        updated.push({ type: "single", exercises: [] });
      }

      const groupIndex =
        activeGroupIndex !== null ? activeGroupIndex : updated.length - 1;

      const group = updated[groupIndex];

      let exercises = [...group.exercises];

      // ✏️ EDIT EXISTING EXERCISE
      if (editingExercise) {
        const { groupIndex: gi, exerciseIndex: ei } = editingExercise;

        const targetGroup = updated[gi];

        const updatedExercises = [...targetGroup.exercises];

        updatedExercises[ei] = {
          name: exerciseName,
          sets: newSets,
        };

        updated[gi] = {
          ...targetGroup,
          exercises: updatedExercises,
        };

        return updated;
      }

      // ➕ ADD NEW EXERCISE
      const existingIndex = exercises.findIndex(
        (ex) =>
          ex.name.toLowerCase() === exerciseName.toLowerCase()
      );

      if (existingIndex >= 0) {
        exercises[existingIndex] = {
          ...exercises[existingIndex],
          sets: [...exercises[existingIndex].sets, ...newSets],
        };
      } else {
        exercises.push({
          name: exerciseName,
          sets: newSets,
        });
      }

      updated[groupIndex] = {
        ...group,
        exercises,
      };

      return updated;
    });

    resetInputs();
  }

  function editExercise(groupIndex, exerciseIndex) {
    const ex = groups[groupIndex].exercises[exerciseIndex];

    setExerciseName(ex.name);
    setReps(String(ex.sets?.[0]?.reps || ""));
    setNumSets(String(ex.sets?.length || 1));

    setActiveGroupIndex(groupIndex);
    setEditingExercise({ groupIndex, exerciseIndex });
  }

  function deleteExercise(groupIndex, exerciseIndex) {
    setGroups((prev) => {
      const updated = [...prev];

      updated[groupIndex].exercises.splice(exerciseIndex, 1);

      return updated;
    });
  }

  async function saveWorkout() {
    if (!workoutName.trim()) return;

    const stored = await AsyncStorage.getItem("workouts");
    const workouts = stored ? JSON.parse(stored) : [];

    if (isEditing && editingId) {
      const updated = workouts.map((w) =>
        w.id === editingId
          ? { ...w, name: workoutName, groups }
          : w
      );

      await AsyncStorage.setItem("workouts", JSON.stringify(updated));
    } else {
      workouts.push({
        id: Date.now(),
        name: workoutName,
        groups,
      });

      await AsyncStorage.setItem("workouts", JSON.stringify(workouts));
    }

    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView 
        contentContainerStyle={{ padding: 24, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
          {isEditing ? "Edit Workout" : "Template Creator"}
        </Text>

        <View>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Workout Name</Text>
          <TextInput
            placeholder="e.g., Pull Day, Full Body"
            value={workoutName}
            onChangeText={setWorkoutName}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
          />
        </View>

        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />

        {/* GROUPS */}
        <Text style={{ fontWeight: "600", marginBottom: -4 }}>Add Structure</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
          <Pressable 
            onPress={() => startNewGroup("single")}
            style={{ padding: 8, backgroundColor: "#f0f0f0", borderRadius: 8 }}
          >
            <Text style={{ fontWeight: "500" }}>+ Standard Exercise</Text>
          </Pressable>

          <Pressable 
            onPress={() => startNewGroup("superset")}
            style={{ padding: 8, backgroundColor: "#fff3cd", borderRadius: 8, borderWidth: 1, borderColor: "#ffe69c" }}
          >
            <Text style={{ fontWeight: "500", color: "#856404" }}>+ Superset Group</Text>
          </Pressable>
        </View>

        {/* INPUTS WITH LABELS AND NEW ORDER */}
        <View>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Exercise Name</Text>
          <TextInput
            placeholder="e.g., Barbell Squat"
            value={exerciseName}
            onChangeText={setExerciseName}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>Sets</Text>
            <TextInput
              placeholder="e.g., 3"
              value={numSets}
              onChangeText={setNumSets}
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
            />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>Reps</Text>
            <TextInput
              placeholder="e.g., 10"
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
            />
          </View>
        </View>

        <Pressable 
          onPress={addOrUpdateExercise}
          style={{
            backgroundColor: "#007BFF",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 4
          }}
        >
          <Text style={{ fontWeight: "bold", color: "white" }}>
            {editingExercise ? "Update Exercise" : "Add Exercise to Template"}
          </Text>
        </Pressable>

        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />

        {/* PREVIEW */}
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            Template Preview
          </Text>

          {groups.length === 0 && (
            <Text style={{ color: "#666", fontStyle: "italic" }}>
              Add exercises above to build your template.
            </Text>
          )}

          {groups.map((group, gi) => (
            <View key={gi} style={{ marginBottom: 16, backgroundColor: "#fafafa", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#eee" }}>
              <Text style={{ fontWeight: "bold", color: group.type === "superset" ? "#d97706" : "#333", marginBottom: 8 }}>
                {group.type === "superset" ? "⚡ Superset" : "Standard"}
              </Text>

              {group.exercises.map((ex, ei) => (
                <View key={ei} style={{ marginLeft: 10, marginBottom: 8, borderLeftWidth: 2, borderLeftColor: "#ddd", paddingLeft: 10 }}>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>{ex.name}</Text>

                  {ex.sets.map((s, si) => (
                    <Text key={si} style={{ color: "#555" }}>
                      Set {s.set}: {s.reps} reps
                    </Text>
                  ))}

                  <View style={{ flexDirection: "row", gap: 16, marginTop: 6 }}>
                    <Pressable onPress={() => editExercise(gi, ei)}>
                      <Text style={{ color: "#007BFF", fontWeight: "500" }}>Edit</Text>
                    </Pressable>

                    <Pressable onPress={() => deleteExercise(gi, ei)}>
                      <Text style={{ color: "#FF3B30", fontWeight: "500" }}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        <Pressable
          onPress={saveWorkout}
          style={{
            backgroundColor: "black",
            padding: 16,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 12
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Save Template</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={{ padding: 12 }}>
          <Text style={{ textAlign: "center", color: "#555", fontWeight: "600" }}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}