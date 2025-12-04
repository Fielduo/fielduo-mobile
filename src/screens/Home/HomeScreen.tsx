import DashboardScreen from '@/components/report-analysis/DashboardScreen';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';



const HomeScreen = () => {
  return (
    
      <View style={styles.container}>
        <DashboardScreen/>
      </View>
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '600' },
});

export default HomeScreen;
