import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  // Fetch the current profile on load
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (data) setUsername(data.username);
      }
    }
    getProfile();
  }, []);

  // Save the new username
  async function updateProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user?.id, username });

    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Profile updated!');
    setLoading(false);
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Edit Profile</Text>
      <TextInput 
        placeholder="Username" 
        value={username} 
        onChangeText={setUsername}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
      />
      <Pressable onPress={updateProfile} style={{ backgroundColor: 'black', padding: 15, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Save Profile</Text>
      </Pressable>
    </View>
  );
}