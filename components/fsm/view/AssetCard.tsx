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

import { Ionicons } from "@expo/vector-icons";

import SwipeCard from "@/components/common/SwipeCard";



export default function AssetCard() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  type ViewMode = 'all' | 'recent';

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);

  // 🔹 Fetch assets from backend
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await api.get<Asset[]>('/newassets');
      if (!data || data.length === 0) {

        setAssets([]); // optional: clear list if empty
      } else {

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

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredAssets(assets);
      return;
    }

    const text = searchText.toLowerCase();

    const result = assets.filter((item) =>
      Object.values(item).some((value) =>
        value
          ? value.toString().toLowerCase().includes(text)
          : false
      )
    );

    setFilteredAssets(result);
  }, [searchText, assets]);


  // 🔹 View or Edit asset
  const handleCardPress = (asset: Asset) => {
    setRecentAssets((prev) => {
      const exists = prev.find((a) => a.id === asset.id);
      if (exists) return prev;

      // latest first, max 5 items
      return [asset, ...prev].slice(0, 5);
    });

    navigation.navigate("CreateAsset", { mode: "view", asset });
  };



  // 🔹 Create new asset
  const handleCreateNew = () => {
    navigation.navigate("CreateAsset", { mode: "create" });
  };

  // 🔹 Card UI
  const renderAssetCard = ({ item }: { item: Asset }) => (
    <SwipeCard
      onEdit={() =>
        navigation.navigate("CreateAsset", {
          mode: "edit",
          asset: item,
        })
      }
      onView={() => {
        setRecentAssets((prev) => {
          const exists = prev.find((a) => a.id === item.id);
          if (exists) return prev;
          return [item, ...prev].slice(0, 5);
        });

        navigation.navigate("CreateAsset", {
          mode: "view",
          asset: item,
        });
      }}
    >
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
    </SwipeCard>

  );


  const displayAssets =
    viewMode === 'all' ? filteredAssets : recentAssets;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Assets"
        onButtonClick={handleCreateNew}
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <View style={styles.headerRow}>
        {/*  LEFT SIDE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.subTitle}>FSM</Text>
          <Text style={styles.title}>Assets</Text>
          <Text style={styles.subtitle}>Updated just now</Text>
        </View>

        {/*  RIGHT SIDE */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setDropdownOpen((prev) => !prev)}
          >
            <Text style={styles.filterText}>
              {viewMode === 'all' ? 'All' : 'Recently Viewed'}
            </Text>
            <Ionicons name="chevron-down-outline" size={16} color="#444" />
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setViewMode('all');
                  setDropdownOpen(false);
                }}
              >
                <Text>All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setViewMode('recent');
                  setDropdownOpen(false);
                }}
              >
                <Text>Recently Viewed</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>



      {loading ? (
        <ActivityIndicator size="large" color="#6234E2" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={displayAssets}
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
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#FFF",
  },
  subTitle: {
    flex: 1,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFF',
  },



  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    height: 36,
    minWidth: 170,
    paddingHorizontal: 12,

    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#fff',
  },


  filterText: {
    fontSize: 14,
    marginRight: 6,
    color: "#6C3EB5",

    fontWeight: "700",
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    width: 160,
    zIndex: 999,
    elevation: 4,
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },


  dropdownText: {
    color: "#212121",
    fontSize: 13,
    fontWeight: "500",
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
  leftAction: {
    backgroundColor: "#1C95F9",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
  },

  rightAction: {
    backgroundColor: "#6C35D1",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
  },

  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },

});
