import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
 
interface FormHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  onRightIconPress?: () => void; // optional callback for right icon
}
const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle, onBackPress, onRightIconPress }) => {
  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#000" />
      </TouchableOpacity>
      {/* 📝 Title and Subtitle - Centered */}
      <View style={styles.centerContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {/* 🌙 Right Icon */}
      <TouchableOpacity style={styles.iconCircle} onPress={onRightIconPress}>
        <Ionicons name="moon-outline" size={20} color="#101318" />
      </TouchableOpacity>
    </View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // keeps left, center, right elements aligned
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center', // center horizontally
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#101318E5',
    marginTop: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  }, 
});
 
export default FormHeader;