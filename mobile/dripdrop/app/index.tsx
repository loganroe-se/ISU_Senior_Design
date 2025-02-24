import React, { useState } from 'react';
import { View } from 'react-native';
import SignUpScreen from './pages/Signup';
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import Navbar from '@/components/navigation/Navbar';
import Home from '@/components/screens/Home';
import Bookmarks from '@/components/screens/Bookmarks';
import Profile from '@/components/screens/Profile';
import Search from '@/components/screens/Search';
import Post from '@/components/screens/Post';


export default function Index() {
  const router = useRouter();
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Handle successful sign-up
  const onSuccessfulSignUp = () => {
    console.log("Sign up successful!");
    router.push('/Login'); // Navigate Login page on successful signup
  };

  const [pageName, setPageName] = useState("Signup");

  const renderPage = () => {
    switch (pageName) {
      case "Home":
        return <Home />;
      case "Search":
        return <Search />;
      case "Post":
        return <Post />;
      case "Bookmarks":
        return <Bookmarks />;
      case "Profile":
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {
        pageName == "Login" || pageName == "Signup" ? 
        <SignUpScreen
          setIsSigningUp={setIsSigningUp}
          onSuccessfulSignUp={onSuccessfulSignUp}
        /> 
        
        : 
        
        <>
          {renderPage()}
          <Navbar setPageName={setPageName} />
        </>
      }
    </View>
  );
}