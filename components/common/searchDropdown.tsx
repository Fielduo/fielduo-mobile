import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";


export default function SearchDropdown({
  label,
  placeholder,
  value,
  data = [],
  onSelect,
  editable = true,
  onSearch,
}: {
  label: string;
  placeholder: string;
  value: string;
  data: string[];
  onSelect: (val: string) => void;
  editable?: boolean;
  onSearch?: (query: string) => void;
   readOnlyValue?: string;
}) {
  const [query, setQuery] = useState(value);
  const [showList, setShowList] = useState(false);

  // ✅ Keep query synced with parent value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleChange = (text: string) => {
    setQuery(text);
    onSearch?.(text);
    setShowList(true);
  };

  const handleSelect = (item: string) => {
    onSelect(item);
    setQuery(item);
    setShowList(false);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={18} color="#777" style={styles.icon} />
        <TextInput
          placeholder={placeholder}
          value={query}
          editable={editable}
          onChangeText={handleChange}
          onFocus={() => setShowList(true)}
          style={styles.input}
        />
        {query ? (
          <TouchableOpacity
            onPress={() => {
              setQuery("");          // clear input
              onSearch?.("");        // notify parent (optional)
              setShowList(false);    // hide list
            }}
          >
            <Ionicons name="close-circle" size={18} color="#777" />
          </TouchableOpacity>
        ) : null}

      </View>

      {/* ✅ Only show when we have results */}
      {showList && data.length > 0 && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)}>
                <Text style={styles.listItem}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: "#6234E2", fontWeight: "600", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  icon: { marginRight: 6 },
  input: { flex: 1, paddingVertical: 10 },
  dropdownContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#DDD",
    borderTopWidth: 0,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
});
