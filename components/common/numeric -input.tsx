import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";


interface NumericInputProps {
  label: string;
  value: number;
  editable?: boolean; 
  onChange: (value: number) => void;
}

export default function NumericInput({ label, value, onChange }: NumericInputProps) {
  const handleIncrease = () => onChange(value + 1);
  const handleDecrease = () => onChange(value > 0 ? value - 1 : 0);

  return (
    <View style={styles.column}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={String(value)} // ✅ convert number → string for TextInput
          onChangeText={(text) => onChange(Number(text) || 0)} // ✅ convert string → number
        />
        <View style={styles.arrowContainer}>
          <TouchableOpacity style={styles.arrowButton} onPress={handleIncrease}>
            <Ionicons name="chevron-up" size={12} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowButton} onPress={handleDecrease}>
            <Ionicons name="chevron-down" size={12} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 13,
    color: "#6A1B9A",
    marginTop: 10,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
    borderColor: "#535351B2",
    borderWidth: 1,
    borderRadius: 6,
    height: 40,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#000",
  },
  arrowContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 8,
  },
  arrowButton: {
    paddingVertical: -1, // ✅ corrected (no negatives)
  },
});
