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
  const [numSets, setNumSets] = useState("");

  const [editing, setEditing] = useState(null);
  // { groupIndex, exerciseIndex }

  useEffect(() => {
    async function load() {
      if (!isEditing || !id) return;

      const stored = await AsyncStorage.getItem("workouts");
      const workouts = stored ? JSON.parse(stored) : [];

      const found = workouts.find((w) => String(w.id) === String(id));
      if (!found) return;

      setWorkoutName(found.name || "");
      setGroups(found.groups || []);
    }

    load();
  }, [id, isEditing]);

  function startGroup(type) {
    setGroups((prev) => [
      ...prev,
      { type, exercises: [] },
    ]);
    setActiveGroupIndex(groups.length);
  }

  // 🔥 CORE CHANGE: per-set weight input stored in UI state
  function updateSetWeight(groupIndex, exIndex, setIndex, value) {
    setGroups((prev) => {
      const updated = [...prev];

      const setObj =
        updated[groupIndex].exercises[exIndex].sets[setIndex];

      setObj.weight = Number(value);

      return updated;
    });
  }

  function addOrUpdateExercise() {
    if (!exerciseName.trim() || !numSets.trim()) return;

    const setCount = Math.max(Number(numSets), 1);

    const newSets = Array.from({ length: setCount }, (_, i) => ({
      set: i + 1,
      reps: 0,
      weight: 0,
    }));

    setGroups((prev) => {
      const updated = [...prev];

      if (updated.length === 0) {
        updated.push({ type: "single", exercises: [] });
      }

      const gi =
        activeGroupIndex !== null ? activeGroupIndex : updated.length - 1;

      const group = updated[gi];

      let exercises = [...group.exercises];

      // ✏️ EDIT MODE
      if (editing) {
        exercises[editing.exerciseIndex] = {
          name: exerciseName,
          sets: newSets,
        };

        updated[editing.groupIndex] = {
          ...group,
          exercises,
        };

        setEditing(null);
        return updated;
      }

      // ➕ ADD MODE
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

      updated[gi] = {
        ...group,
        exercises,
      };

      return updated;
    });

    setExerciseName("");
    setNumSets("");
  }

  function editExercise(groupIndex, exerciseIndex) {
    const ex = groups[groupIndex].exercises[exerciseIndex];

    setExerciseName(ex.name);
    setNumSets(String(ex.sets?.length || 1));

    setActiveGroupIndex(groupIndex);
    setEditing({ groupIndex, exerciseIndex });
  }

  function deleteExercise(groupIndex, exerciseIndex) {
    setGroups((prev) => {
      const updated = [...prev];
      updated[groupIndex].exercises.splice(exerciseIndex, 1);
      return updated;
    });
  }

  async function saveWorkout() {
    const stored = await AsyncStorage.getItem("workouts");
    const workouts = stored ? JSON.parse(stored) : [];

    if (isEditing && id) {
      const updated = workouts.map((w) =>
        String(w.id) === String(id)
          ? { ...w, name: workoutName, groups }
          : w
      );

      await AsyncStorage.setItem(
        "workouts",
        JSON.stringify(updated)
      );
    } else {
      workouts.push({
        id: Date.now(),
        name: workoutName,
        groups,
      });

      await AsyncStorage.setItem(
        "workouts",
        JSON.stringify(workouts)
      );
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        {isEditing ? "Edit Workout" : "Log Workout"}
      </Text>

      {/* BACK BUTTON */}
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: "#555" }}>← Back</Text>
      </Pressable>

      {/* WORKOUT NAME */}
      <Text style={{ fontWeight: "600" }}>Workout Name</Text>
      <TextInput
        value={workoutName}
        onChangeText={setWorkoutName}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      {/* GROUPS */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable onPress={() => startGroup("single")}>
          <Text>+ Single</Text>
        </Pressable>

        <Pressable onPress={() => startGroup("superset")}>
          <Text>+ Superset</Text>
        </Pressable>
      </View>

      {/* INPUTS */}
      <Text style={{ fontWeight: "600" }}>Exercise Name</Text>
      <TextInput
        value={exerciseName}
        onChangeText={setExerciseName}
        style={{ borderWidth: 1, padding: 10 }}
      />

      <Text style={{ fontWeight: "600" }}>Number of Sets</Text>
      <TextInput
        value={numSets}
        onChangeText={setNumSets}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10 }}
      />

      <Pressable onPress={addOrUpdateExercise}>
        <Text style={{ fontWeight: "700" }}>
          {editing ? "Update Exercise" : "Add Exercise"}
        </Text>
      </Pressable>

      {/* PREVIEW */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Preview
        </Text>

        {groups.map((group, gi) => (
          <View key={gi} style={{ marginTop: 10 }}>
            <Text>
              {group.type === "superset" ? "⚡ Superset" : "Single"}
            </Text>

            {group.exercises.map((ex, ei) => (
              <View key={ei} style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: "600" }}>
                  {ex.name}
                </Text>

                {/* EACH SET HAS OWN WEIGHT */}
                {ex.sets.map((s, si) => (
                  <View key={si} style={{ marginLeft: 10 }}>
                    <Text>
                      Set {s.set}
                    </Text>

                    <TextInput
                      placeholder="reps"
                      value={String(s.reps)}
                      onChangeText={(v) => {
                        const updated = [...groups];
                        updated[gi].exercises[ei].sets[si].reps =
                          Number(v);
                        setGroups(updated);
                      }}
                      style={{ borderWidth: 1, padding: 6 }}
                    />

                    <TextInput
                      placeholder="weight"
                      value={String(s.weight)}
                      onChangeText={(v) =>
                        updateSetWeight(gi, ei, si, v)
                      }
                      style={{ borderWidth: 1, padding: 6 }}
                    />
                  </View>
                ))}

                {/* ACTIONS */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable onPress={() => editExercise(gi, ei)}>
                    <Text style={{ color: "blue" }}>Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => deleteExercise(gi, ei)}
                  >
                    <Text style={{ color: "red" }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* SAVE */}
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
    </ScrollView>
  );
}