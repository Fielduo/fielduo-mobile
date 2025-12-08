import React from 'react';
import { View, StyleSheet } from 'react-native';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      {/* Simple Purple Header */}
      <View style={styles.header} />

      {/* Screen Content */}
      <View style={styles.content}>{children}</View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  header: {
    height: 45,
    backgroundColor: '#6234E2',
  },
  content: {
    flex: 1,
  },
});

export default Layout;
