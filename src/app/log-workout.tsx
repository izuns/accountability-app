import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";

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
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        {isEditing ? "Edit Workout" : "Log Workout"}
      </Text>

      <TextInput
        placeholder="Workout name"
        value={workoutName}
        onChangeText={setWorkoutName}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      {/* GROUPS */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable onPress={() => startNewGroup("single")}>
          <Text>+ Single</Text>
        </Pressable>

        <Pressable onPress={() => startNewGroup("superset")}>
          <Text>+ Superset</Text>
        </Pressable>
      </View>

      {/* INPUTS */}
      <TextInput
        placeholder="Exercise"
        value={exerciseName}
        onChangeText={setExerciseName}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Reps"
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Sets"
        value={numSets}
        onChangeText={setNumSets}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <Pressable onPress={addOrUpdateExercise}>
        <Text style={{ fontWeight: "bold" }}>
          {editingExercise ? "Update Exercise" : "Add Exercise"}
        </Text>
      </Pressable>

      {/* PREVIEW */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Preview
        </Text>

        {groups.map((group, gi) => (
          <View key={gi}>
            <Text>{group.type}</Text>

            {group.exercises.map((ex, ei) => (
              <View key={ei} style={{ marginLeft: 10 }}>
                <Text>{ex.name}</Text>

                {ex.sets.map((s, si) => (
                  <Text key={si}>
                    Set {s.set}: {s.reps}
                  </Text>
                ))}

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable onPress={() => editExercise(gi, ei)}>
                    <Text style={{ color: "blue" }}>Edit</Text>
                  </Pressable>

                  <Pressable onPress={() => deleteExercise(gi, ei)}>
                    <Text style={{ color: "red" }}>Delete</Text>
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
          padding: 14,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white" }}>Save Workout</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={{ textAlign: "center" }}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}