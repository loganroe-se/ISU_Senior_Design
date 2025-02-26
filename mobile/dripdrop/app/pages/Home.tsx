import React from 'react';
import { Text, StyleSheet } from 'react-native';
import NavScreen from './NavScreen';

const HomePage = () => {
  return (
    <NavScreen>
      <Text>Home</Text>
    </NavScreen>
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
