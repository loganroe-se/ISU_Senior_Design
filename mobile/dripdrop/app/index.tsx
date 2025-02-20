import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Login from './Login';
import SignUpScreen from './Signup';
//import { ReadableStream } from 'web-streams-polyfill/ponyfill';
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
//globalThis.ReadableStream = ReadableStream;


export default function Index() {
  const router = useRouter();
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Handle successful sign-up
  const onSuccessfulSignUp = () => {
    // You can add logic to handle what happens when the sign-up is successful
    console.log("Sign up successful!");
    router.push('/Login'); // Navigate to another page, for example, home
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