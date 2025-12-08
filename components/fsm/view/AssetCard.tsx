import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import { Asset } from "@/types/Worker";





export default function AssetCard() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch assets from backend
const fetchAssets = async () => {
  setLoading(true);
  try {
    const data = await api.get<Asset[]>('/newassets');
    if (!data || data.length === 0) {
      console.log("No assets found");
      setAssets([]); // optional: clear list if empty
    } else {
      console.log("Fetched assets:", data);
      setAssets(data);
    }
  } catch (err) {
    console.error("Error fetching assets:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAssets();
  }, []);

  // 🔹 View or Edit asset
  const handleCardPress = (asset: Asset) => {
    navigation.navigate("CreateAsset", { mode: "view", asset });
  };

  // 🔹 Create new asset
  const handleCreateNew = () => {
    navigation.navigate("CreateAsset", { mode: "create" });
  };

  // 🔹 Card UI
  const renderAssetCard = ({ item }: { item: Asset }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Asset Name</Text>
            <Text style={styles.value}>{item.asset_name}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Asset Number</Text>
            <Text style={styles.value}>{item.asset_number}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{item.asset_type}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Product</Text>
            <Text style={styles.value}>{item.product}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{item.company}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Contact</Text>
            <Text style={styles.value}>{item.contact_name}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Asset"
        onButtonClick={handleCreateNew}
        onSearchChange={(text) => console.log("Searching:", text)}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.subTitle}>FSM</Text>
        <Text style={styles.title}>Assets</Text>
        <Text style={styles.subtitle}>Updated just now</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6234E2" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderAssetCard}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFF",
  },
  subTitle: {
    color: "#6234E2",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101318",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#C4B5FD",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  col: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    color: "#6234E2",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 2,
  },
  value: {
    color: "#374151",
    fontSize: 13,
  },
});
