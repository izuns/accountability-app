import React, { useState } from 'react';
import { Alert, View, Text, TextInput, Pressable, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert("Sign In Failed", error.message);
    else router.replace('/');
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert("Sign Up Failed", error.message);
    else Alert.alert("Success!", "Account created successfully.");
    setLoading(false);
  }

  return (
    // TouchableWithoutFeedback lets us dismiss the keyboard by tapping anywhere else
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
          
          {/* Back Button */}
          <Pressable onPress={() => router.back()} style={{ marginBottom: 20 }}>
            <Text style={{ color: '#007BFF', fontSize: 16 }}>← Back</Text>
          </Pressable>

          <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
            Welcome!
          </Text>

          <View>
            <Text style={{ fontWeight: '600', marginBottom: 4 }}>Email</Text>
            <TextInput
              onChangeText={setEmail}
              value={email}
              placeholder="partner@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 14, borderRadius: 8 }}
            />
          </View>

          <View>
            <Text style={{ fontWeight: '600', marginBottom: 4 }}>Password</Text>
            <TextInput
              onChangeText={setPassword}
              value={password}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 14, borderRadius: 8 }}
            />
          </View>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Pressable
              onPress={signInWithEmail}
              disabled={loading}
              style={{ backgroundColor: 'black', padding: 16, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Sign In</Text>
            </Pressable>

            <Pressable
              onPress={signUpWithEmail}
              disabled={loading}
              style={{ backgroundColor: 'white', borderWidth: 1, borderColor: 'black', padding: 16, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>Create Account</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}