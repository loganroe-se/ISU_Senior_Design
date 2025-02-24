import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SearchScreen from '../components/Searchbar';

const HomePage = () => {
  return (
    <SearchScreen/>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomePage;
