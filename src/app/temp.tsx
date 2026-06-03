import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TempMigration() {
  useEffect(() => {
    // Put your migration/cleanup logic here
    console.log("Temp screen loaded – ready to run your one-time task.");
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Temp Screen is active.</Text>
      <Text>Check your terminal for the results of your task.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 10 }
});