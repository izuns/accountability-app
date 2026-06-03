import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function SaveSession() {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleSave = async () => {
    console.log("Save button pressed...");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No user found!");
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    console.log("Attempting insert for user:", user.id);

    const { data, error } = await supabase
      .from('workouts')
      .insert([
        {
          user_id: user.id,
          exercise_name: exercise,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: parseInt(weight),
          date: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      Alert.alert("Save Error", error.message);
    } else {
      console.log("Insert successful! Redirecting...");
      router.push('/view-log');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Save Workout</Text>
      <TextInput placeholder="Exercise Name" value={exercise} onChangeText={setExercise} style={styles.input} />
      <TextInput placeholder="Sets" value={sets} onChangeText={setSets} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Reps" value={reps} onChangeText={setReps} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input} />
      <Button title="Save Session" onPress={handleSave} />
    </View>
  );
}
// ... keep your existing styles