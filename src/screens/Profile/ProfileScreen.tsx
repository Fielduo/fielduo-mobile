import React from 'react';
import { View, StyleSheet } from 'react-native';
import Profile from '@/components/Profile/Profile';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Profile />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA', // profile bg match
  },
});
