import React from "react";
import { StyleSheet } from "react-native";
import NavScreen from "./NavScreen";
import SearchScreen from "../../components/Searchbar";

export default function Search({}) {
  return (
    <NavScreen>
        <SearchScreen />
    </NavScreen>
  );
};

const styles = StyleSheet.create(
    {
    }
)