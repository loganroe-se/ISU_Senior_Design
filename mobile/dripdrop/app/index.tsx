import { Text, View } from "react-native";
import { useState, useEffect } from "react";
import Login from "@/components/screens/Login";
import Home from "@/components/screens/Home";
import Navbar from "@/components/navigation/Navbar";
import Profile from "@/components/screens/Profile";
import Search from "@/components/screens/Search";
import Post from "@/components/screens/Post";
import Bookmarks from "@/components/screens/Bookmarks";

export default function Index() {
  const [pageName, setPageName] = useState("");

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
    <View style={{ flex: 1 }}>
      {renderPage()} 
      <Navbar setPageName={setPageName} />
    </View>
  );
}
