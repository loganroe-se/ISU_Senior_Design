import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Login from './Login';

export default function Index() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        mode="contained"
        onPress={() => router.push({ pathname: '/create-post' })}
      >
        Create Post
      </Button>

    </View>
  );
}