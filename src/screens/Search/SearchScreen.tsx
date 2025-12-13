import Header from '@/components/common/Header';
import HeaderSection from '@/components/common/HeaderSection';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';




const SearchScreen = () => {
  return (

    <View >
      <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Field"
        onButtonClick={() => console.log("New Field Clicked")}
        onSearchChange={(text) => console.log("Searching:", text)}
        currentScreen="DashboardScreen"   // ✅ add this
      />
    </View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '600' },
});

export default SearchScreen;
