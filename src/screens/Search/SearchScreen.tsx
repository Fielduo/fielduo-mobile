import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import Header from "@/components/common/Header";
import { menuSections } from "@/components/report-analysis/search-menu";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";

// ---------------------------
// Type-safe navigation setup
type RootTabParamList = {
  Home: undefined;
  Search: undefined;
  Menu: undefined | { screen: keyof SearchMenuStackParamList; params?: any };
  Profile: undefined;
};

// Composite navigation type: bottom tab + nested stack
type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList>,
  NativeStackNavigationProp<SearchMenuStackParamList>
>;
// ---------------------------

const SearchScreen = () => {
  const [query, setQuery] = useState("");

  // ✅ Use navigation inside component
  const navigation = useNavigation<NavProp>();

  // Navigate to any screen inside the Menu stack
  const goToScreen = (screenName: keyof SearchMenuStackParamList) => {
    navigation.navigate("Menu", { screen: screenName });
  };

  // Filter menu items based on search query
  const filteredMenu = useMemo(() => {
    if (!query.trim()) return [];
    return menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search menu..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {filteredMenu.length === 0 && query !== "" && (
          <Text style={styles.noResult}>No results found</Text>
        )}

        {filteredMenu.map((section, i) => (
          <View key={i}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, index) => (
              <Pressable
                key={index}
                style={styles.menuItem}
                onPress={() =>
                  goToScreen(item.route as keyof SearchMenuStackParamList)
                }
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color="#6B6B6B"
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.menuText}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  searchBox: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  input: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6234E2",
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  noResult: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },
});
