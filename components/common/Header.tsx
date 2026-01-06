import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';


const Header = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <Image
             source={require('../../assets/images/headericon.png')}
          style={styles.logo}
        />
      </View>
      {/* <View style={styles.icons}>
        <TouchableOpacity style={styles.iconCircle}>
          <Ionicons name="moon-outline" size={20} color="#101318" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconCircle}>
          <Ionicons name="notifications-outline" size={20} color="#101318" />
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
    paddingVertical: 16,
  },
  logo: {
    width: 86,
    height: 56,
    resizeMode: 'contain',
  },
  icons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 15,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    backgroundColor: '#D9D9D980', // light grey (similar to Tailwind's gray-200)
    borderRadius: 50, // makes it perfectly round
    padding: 8, // inner spacing
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});

export default Header;
