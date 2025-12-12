import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import FormHeader from "../../common/FormHeader";
import Checkbox from 'expo-checkbox';

import NumericInput from "../../common/numeric -input";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Asset } from "@/types/Worker";


type CreateInventoryRouteProp = RouteProp<
  SearchMenuStackParamList,
  "CreateInventory"
>;

const CreateInventoryForm: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const route = useRoute<CreateInventoryRouteProp>();
  const { mode = 'create', inventory } = route.params || {} as {
    mode?: string;
    asset?: Asset
  };


  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";

  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [showExpiry, setShowExpiry] = useState(false);
  const [cost, setCost] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [stockQty, setStockQty] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [maxStock, setMaxStock] = useState<number>(0);
  const [reorderPoint, setReorderPoint] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [serialTracked, setSerialTracked] = useState<boolean>(false);
  const [lotTracked, setLotTracked] = useState<boolean>(false);


  // string states – map to backend fields
  const [itemNumber, setItemNumber] = useState(inventory?.item_number || "");
  const [itemName, setItemName] = useState(inventory?.item_name || "");
  const [description, setDescription] = useState(
    inventory?.item_description || ""
  );
  const [category, setCategory] = useState(inventory?.category || "");
  const [status, setStatus] = useState(inventory?.status || "");
  const [subcategory, setSubcategory] = useState(inventory?.subcategory || "");
  const [unitOfMeasure, setUnitOfMeasure] = useState(
    inventory?.unit_of_measure || ""
  );
  const [supplierId, setSupplierId] = useState<string>("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [binLocation, setBinLocation] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [barcode, setBarcode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isEditable] = useState(isCreateMode || isEditMode);


  // useEffect to populate fields in edit/view mode
  useEffect(() => {
    if (inventory && mode !== "create") {
      setItemNumber(inventory.item_number || "");
      setItemName(inventory.item_name || "");
      setDescription(inventory.item_description || "");  // string, no null
      setCategory(inventory.category || "");             // string, no null
      setSubcategory(inventory.subcategory || "");
      setUnitOfMeasure(inventory.unit_of_measure || "");

      setCost(inventory.cost ?? 0);                // number
      setPrice(inventory.price ?? 0);              // number
      setSupplierId(
        inventory.supplier_id !== null && inventory.supplier_id !== undefined
          ? String(inventory.supplier_id)
          : ""
      );
      setStockQty(inventory.stock_quantity ?? 0);  // number
      setMinStock(inventory.minimum_stock ?? 0);   // number
      setMaxStock(inventory.maximum_stock ?? 0);   // number
      setReorderPoint(inventory.reorder_point ?? 0); // number

      setSerialTracked(!!inventory.serial_tracked);
      setLotTracked(!!inventory.lot_tracked);

      setExpiryDate(
        inventory.expiry_date ? new Date(inventory.expiry_date) : null
      );

      setWeight(inventory.weight ?? 0);
      setWarehouseLocation(inventory.warehouse_location || "");
      setBinLocation(inventory.bin_location || "");
      setDimensions(inventory.dimensions || "");
      setBarcode(inventory.barcode || "");
      setImageUrl(inventory.image_url || "");          // number

      setStatus(inventory.status || "active");
    }
  }, [inventory, mode]);


  // 🔹 Submit form data to backend

  const handleSubmit = async () => {
    try {
      const payload = {
        org_id: "",
        item_number: itemNumber,
        item_name: itemName,
        item_description: description || null,
        category: category || null,
        subcategory: subcategory || null,
        unit_of_measure: unitOfMeasure || null,
        cost: cost || null,
        price: price || null,
        supplier_id: supplierId ? Number(supplierId) : null,
        stock_quantity: stockQty || null,
        minimum_stock: minStock || null,
        maximum_stock: maxStock || null,
        reorder_point: reorderPoint || null,
        warehouse_location: null,
        bin_location: null,
        serial_tracked: serialTracked,
        lot_tracked: lotTracked,
        expiry_date: expiryDate ? expiryDate.toISOString() : null,
        weight: weight || null,
        dimensions: null,
        barcode: null,
        image_url: null,
        status: status || "active",
      };

      const data = await api.post("/inventory", payload);
      console.log("Inventory added:", data);
      alert("Inventory added successfully!");
      navigation.goBack();
    } catch (error: any) {
      console.error("Error adding inventory:", error);
      alert(error?.message || "Failed to add inventory item");
    }
  };




  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FormHeader
        title={
          isCreateMode
            ? "Add Inventory Items"
            : isEditMode
              ? "Edit Inventory"
              : "View Inventory"
        }
        subtitle={
          isCreateMode
            ? "Add a new Work Order to your inventory"
            : isEditMode
              ? "Update existing Work Order details"
              : "View Work Order information"
        }
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container}>
        {/* Section Header */}
        <View style={styles.headerRow}>
          <Text style={styles.subHeader}>Inventory</Text>
          {isViewMode && (
            <TouchableOpacity
              style={styles.editSmallButton}
              onPress={() =>
                navigation.navigate("CreateInventory", {
                  mode: "edit",
                  inventory,
                })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editSmallButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BASIC INFORMATION */}
        <Text style={styles.sectionHeader}>BASIC INFORMATION</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Item Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item number"
              value={itemNumber}
              onChangeText={setItemNumber}
              editable={!isViewMode}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item name"
              value={itemName}
              onChangeText={setItemName}
              editable={!isViewMode}
            />
          </View>
        </View>

        <Text style={styles.label}>Item Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          editable={!isViewMode}
          multiline
        />

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category"
              value={category}
              onChangeText={setCategory}
              editable={!isViewMode}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Subcategory</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter subcategory"
              value={subcategory}          // ✅ state bind
              onChangeText={setSubcategory} //
              editable={!isViewMode}
            />
          </View>
        </View>

        <Text style={styles.label}>Unit of Measure</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. pcs/box"
          onChangeText={setUnitOfMeasure} // ✅ update state
          value={unitOfMeasure}         // ✅ state bind
          editable={!isViewMode}
        />

        {/* PRICING & STOCK */}
        <Text style={styles.sectionHeader}>PRICING & STOCK</Text>
        <View style={styles.row}>
          <NumericInput label="Cost (₹)" value={cost} onChange={setCost} />
          <NumericInput label="Price (₹)" value={price} onChange={setPrice} />
        </View>

        <View style={styles.row}>
          <NumericInput
            label="Stock Quantity"
            value={stockQty}
            onChange={setStockQty}
            editable={!isViewMode}

          />
          <NumericInput
            label="Min Stock"
            value={minStock}
            onChange={setMinStock}
            editable={!isViewMode}
          />
        </View>

        <View style={styles.row}>
          <NumericInput
            label="Max Stock"
            value={maxStock}
            onChange={setMaxStock}
            editable={!isViewMode}
          />
          <NumericInput
            label="Reorder Point"
            value={reorderPoint}
            onChange={setReorderPoint}
            editable={!isViewMode}
          />
        </View>

        <Text style={styles.label}>Supplier ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter supplier ID"
          keyboardType="numeric"
          value={supplierId}               // ✅ string
          onChangeText={setSupplierId}     // ✅ (text: string) => void
          editable={!isViewMode}
        />

        {/* WAREHOUSE & LOCATION */}
        <Text style={styles.sectionHeader}>WAREHOUSE & LOCATION</Text>
        <Text style={styles.label}>Warehouse Location</Text>
        <TextInput style={styles.input}
          placeholder="Enter warehouse location"
          value={warehouseLocation}
          onChangeText={setWarehouseLocation}
          editable={!isViewMode}
        />

        <Text style={styles.label}>Bin Location</Text>
        <TextInput style={styles.input}
          placeholder="Enter bin location"
          value={binLocation}
          onChangeText={setBinLocation}
          editable={!isViewMode}
        />

        {/* TRACKING & ADDITIONAL INFO */}
        <Text style={styles.sectionHeader}>TRACKING & ADDITIONAL INFO</Text>

        <View style={styles.checkboxRow}>
          <View style={styles.checkboxColumn}>
  <Checkbox
  value={serialTracked}
  onValueChange={setSerialTracked}
  color={serialTracked ? "#6A1B9A" : undefined}
/>

            <Text style={styles.checkboxLabel}>Serial Tracked</Text>
          </View>

          <View style={styles.checkboxColumn}>
         <Checkbox
  value={lotTracked}
  onValueChange={setLotTracked}
  color={lotTracked ? "#6A1B9A" : undefined}
/>
            <Text style={styles.checkboxLabel}>Lot Tracked</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Barcode</Text>
            <TextInput style={styles.input}
              placeholder="Enter barcode"
              value={barcode}
              onChangeText={setBarcode}
              editable={!isViewMode}
            />
          </View>
          <View style={styles.column}>
            <NumericInput
              label="Weight (kg)"
              value={weight}
              onChange={setWeight}
              editable={!isViewMode}
            />
          </View>
        </View>

        <View style={styles.row}>
          {/* Dimensions Field */}
          <View style={styles.column}>
            <Text style={styles.label}>Dimensions (L × W × H)</Text>
            <TextInput style={styles.input}
              placeholder="0 × 0 × 0"
              value={dimensions}
              onChangeText={setDimensions}
              editable={!isViewMode}
            />
          </View>

          {/* Expiry Date Field */}
          <View style={styles.column}>
            <Text style={styles.label}>Expiry Date</Text>
            <TouchableOpacity onPress={() => setShowExpiry(true)}>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Select date"
                  editable={false}
                  value={expiryDate ? expiryDate.toDateString() : ""}

                />
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#777"
                  style={styles.iconRight}
                />
              </View>
            </TouchableOpacity>

            {showExpiry && (
              <DateTimePicker
                value={expiryDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={(e, date) => {
                  setShowExpiry(false);
                  if (date) setExpiryDate(date);
                }}
              />
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Upload or paste link"
              value={imageUrl}
              onChangeText={setImageUrl}
              editable={!isViewMode}

            />
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>Status</Text>
            <View
              style={[styles.pickerContainer, isViewMode && styles.disabledPicker]}
            >
              <Picker
                enabled={!isViewMode}
                selectedValue={status}
                onValueChange={setStatus}
              >
                <Picker.Item label="Select status" value="" />
                <Picker.Item label="Active" value="active" />
                <Picker.Item label="Inactive" value="inactive" />
                <Picker.Item label="Repair" value="repair" />
                <Picker.Item label="Retired" value="retired" />
              </Picker>
            </View>
          </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          {(isCreateMode || isEditMode) && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>
                {isCreateMode ? "Save Asset" : "Update Asset"}
              </Text>
            </TouchableOpacity>
          )}

          {isViewMode && (
            <TouchableOpacity
              style={styles.cancelButton}
            // onPress={handleDelete}
            >
              <Text style={styles.cancelText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateInventoryForm;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",


  },
  editSmallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6234E2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  editSmallButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6A1B9A",
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginTop: 18,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 30,
    marginTop: 10,
  },
  checkboxColumn: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#6A1B9A",
    marginLeft: 6,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#6A1B9A",
    marginTop: 10,
    marginBottom: 4,
  },
  pickerContainer: {
    backgroundColor: '#E5E5E5',
    borderWidth: 0.5,
    borderColor: '#535351B2',
    borderRadius: 4,
    height: 45,
    justifyContent: 'center',
  },
  disabledPicker: {
    backgroundColor: '#f5f5f5'
  },
  input: {
    backgroundColor: "#E5E5E5",
    borderColor: "#535351B2",
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E5E5E5",
    borderColor: "#535351B2",
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 40,
    marginBottom: 12,
  },
  iconRight: {
    marginLeft: 6,
  },
  textArea: {
    height: 80,
  },

  buttonContainer: { marginTop: 30, marginBottom: 50 },
  createButton: {
    backgroundColor: "#6234E2",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "#02923E",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#535351",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  cancelText: { color: "#fff", fontWeight: "600" },


});