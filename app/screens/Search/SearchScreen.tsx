import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import SearchMenu from '../../components/report-analysis/search-menu';



const SearchScreen = () => {
  return (
    
      <View style={styles.container}>
        {/* <SearchMenu/> */}
      </View>
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '600' },
});

export default SearchScreen;
