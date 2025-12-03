import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderSectionProps {
  title: string;
  buttonText: string;
  onButtonClick?: () => void;
  onSearchChange?: (text: string) => void;
  currentScreen?: string; // 👈 new prop to identify screen
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  buttonText,
  onButtonClick,
  onSearchChange,
  currentScreen, // 👈 using here
}) => {
  // 👇 Hide the header row only for Dashboard & SearchMenu
  const hideHeader = currentScreen === 'DashboardScreen' || currentScreen === 'SearchMenu';

  return (
    <View style={styles.container}>
      {/* 🔹 Header Row */}
      {!hideHeader && ( // 👈 conditionally render
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>

          {/* 🔹 Gradient Button */}
          <TouchableOpacity onPress={onButtonClick} activeOpacity={0.8}>
            <LinearGradient
              colors={['#6234E2', '#DF34E2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* 🔍 Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
};

export default HeaderSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6234E2',
  },
  gradientButton: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#535351B2',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#53535180',
  },
});
