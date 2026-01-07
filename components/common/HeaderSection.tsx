import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

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

      {/* ✅ DIRECT SEARCH WITH CLEAR BUTTON */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search..."
          value={searchValue}
          onChangeText={onSearchChange}
          style={styles.input}
        />
        {searchValue.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => onSearchChange("")}
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
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
  searchContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 5,
    padding: 10,
    paddingRight: 32, // space for clear button
  },
  clearBtn: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
});
