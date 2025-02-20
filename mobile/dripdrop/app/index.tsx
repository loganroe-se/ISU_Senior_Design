import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import SignUpScreen from './Signup';
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";


export default function Index() {
  const router = useRouter();
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Handle successful sign-up
  const onSuccessfulSignUp = () => {
    console.log("Sign up successful!");
    router.push('/Login'); // Navigate Login page on successful signup
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <SignUpScreen
        setIsSigningUp={setIsSigningUp}
        onSuccessfulSignUp={onSuccessfulSignUp}
      />

    </View>
  );
}