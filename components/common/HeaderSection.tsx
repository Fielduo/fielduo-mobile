import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface HeaderSectionProps {
  title: string;
  buttonText: string;
  onButtonClick?: () => void;
  searchValue: string;
  onSearchChange: (text: string) => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  buttonText,
  onButtonClick,
  searchValue,
  onSearchChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity onPress={onButtonClick}>
          <LinearGradient
            colors={["#6234E2", "#DF34E2"]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ✅ DIRECT SEARCH */}
      <TextInput
        placeholder="Search..."
        value={searchValue}
        onChangeText={onSearchChange}
        style={styles.input}
      />
    </View>
  );
};

export default HeaderSection;

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 14, fontWeight: "600", color: "#6234E2" },
  gradientButton: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
  },
});
