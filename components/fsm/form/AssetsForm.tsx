import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FormHeader from '../../common/FormHeader';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../../store/useAuthStore';
import { SearchMenuStackParamList } from '@/src/navigation/StackNavigator/SearchmenuNavigator';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/api/cilent';
import { searchContacts } from '@/src/api/searchContacts';
import { Asset } from '@/types/Worker';
import { validateAsset } from '@/store/assetValidator';
import { CameraView, useCameraPermissions } from "expo-camera";




type CreateAssetRouteProp = RouteProp<SearchMenuStackParamList, 'CreateAsset'>;

export default function CreateAssetScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const route = useRoute<CreateAssetRouteProp>();
  const { mode = 'create', asset } = route.params || {} as {
    mode?: string;
    asset?: Asset
  };
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // ---------------- States ----------------
  const [assetName, setAssetName] = useState('');
  const [assetNumber, setAssetNumber] = useState('');
  const [description, setDescription] = useState('');
  const [parentAsset, setParentAsset] = useState('');
  const [assetType, setAssetType] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState<{ id: string; name: string } | null>(null);
  const [contactQuery, setContactQuery] = useState('');
  const [contactSuggestions, setContactSuggestions] = useState<any[]>([]);
  const [product, setProduct] = useState('');
  const [address, setAddress] = useState('');
  const [giai, setGiai] = useState('');
  const [status, setStatus] = useState('');

  // Dates
  const [orderedDate, setOrderedDate] = useState<Date | null>(null);
  const [installationDate, setInstallationDate] = useState<Date | null>(null);
  const [purchasedDate, setPurchasedDate] = useState<Date | null>(null);
  const [warrantyExpiration, setWarrantyExpiration] = useState<Date | null>(null);

  // Pickers
  const [showOrderedPicker, setShowOrderedPicker] = useState(false);
  const [showInstallPicker, setShowInstallPicker] = useState(false);
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showWarrantyPicker, setShowWarrantyPicker] = useState(false);

  const [createdBy, setCreatedBy] = useState('');
  const [updatedBy, setUpdatedBy] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const token = useAuthStore.getState().token;

  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [activeScanField, setActiveScanField] = useState<"giai" | "assetNumber" | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);


  // ---------------- Load Asset for Edit/View ----------------
  useEffect(() => {
    if (asset && mode !== 'create') {
      setAssetName(asset.asset_name);
      setAssetNumber(asset.asset_number);
      setDescription(asset.description || '');
      setParentAsset(asset.parent_asset || '');
      setAssetType(asset.asset_type);
      setCompany(asset.company);
      setContact(asset.contact || null);
      setProduct(asset.product);
      setAddress(asset.address || '');
      setGiai(asset.giai || '');
      setStatus(asset.status || '');
      setOrderedDate(asset.ordered_date ? new Date(asset.ordered_date) : null);
      setInstallationDate(asset.installation_date ? new Date(asset.installation_date) : null);
      setPurchasedDate(asset.purchased_date ? new Date(asset.purchased_date) : null);
      setWarrantyExpiration(asset.warranty_expiration ? new Date(asset.warranty_expiration) : null);
      setCreatedBy(asset.created_by_name || '');
      setUpdatedBy(asset.updated_by_name || '');
      setCreatedAt(asset.created_at || '');
      setUpdatedAt(asset.updated_at || '');
    }
  }, [asset]);


  // ---------------- Contact Auto Search ----------------
  useEffect(() => {
    const fetchContacts = async () => {
      if (contactQuery.trim().length >= 2) {
        const results = await searchContacts(contactQuery);
        setContactSuggestions(results);
      } else {
        setContactSuggestions([]);
      }
    };

    fetchContacts();
  }, [contactQuery]);

  // ---------------- Save Asset ----------------
  const handleSave = async () => {
    const error = validateAsset({ assetName, assetType, status });
    if (error) return Alert.alert('Validation Error', error);

    try {
      const payload = {
        asset_name: assetName,
        asset_number: assetNumber,
        description,
        parent_asset: parentAsset,
        asset_type: assetType,
        status,
        company,
        contact: contact?.id, // ✅ send only UUID
        product,
        address,
        giai,
        ordered_date: orderedDate,
        installation_date: installationDate,
        purchased_date: purchasedDate,
        warranty_expiration: warrantyExpiration,
      };

      console.log('➡️ Sending payload:', payload);
      const response = await api.post('/newassets', payload);

      Alert.alert('✅ Success', 'Asset saved successfully!');
      navigation.goBack();
    } catch (err: any) {
      console.error('❌ Axios error:', err.response?.status, err.response?.data);
      Alert.alert('Error', `Failed to save asset: ${err.message}`);
    }
  };

  const handleQRScanned = ({ data }: { data: string }) => {
    console.log("🔳 Scanned:", data);

    let scannedValue = data;

    try {
      // QR may contain JSON
      const parsed = JSON.parse(data);

      if (parsed.giai) {
        scannedValue = parsed.giai;
      } else if (parsed.assetNumber) {
        scannedValue = parsed.assetNumber;
      }
    } catch (error) {
      // Normal barcode → keep raw data
      scannedValue = data;
    }

    // 🔁 Assign to correct field
    if (activeScanField === "giai") {
      setGiai(scannedValue);
    } else if (activeScanField === "assetNumber") {
      setAssetNumber(scannedValue);
    }

    setScannerVisible(false);
    setActiveScanField(null);
  };



  const renderDatePicker = (
    label: string,
    value: Date | null,
    show: boolean,
    setShow: (val: boolean) => void,
    setValue: (val: Date) => void
  ) => (
    <View style={{ flex: 1, marginRight: 8 }}>
      <Text style={styles.label}>{label}</Text>

      {isViewMode ? (
        // 👁️ View Mode — show plain text
        <View style={styles.readOnlyView}>
          <Text style={styles.readOnlyText}>
            {value ? value.toDateString() : "Not specified"}
          </Text>
        </View>
      ) : (
        // ✏️ Edit Mode — show input + picker
        <TouchableOpacity onPress={() => setShow(true)}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="mm/dd/yyyy"
              editable={false}
              value={value ? value.toDateString() : ''}
            />
            <Ionicons name="calendar-outline" size={18} color="#777" />
          </View>
        </TouchableOpacity>
      )}

      {/* Date picker (hidden in view mode) */}
      {!isViewMode && show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={(e, date) => {
            setShow(false);
            if (date) setValue(date);
          }}
        />
      )}
    </View>
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",    // Oct
      day: "2-digit",    // 18
      year: "numeric",   // 2025
      hour: "2-digit",
      minute: "2-digit",
      hour12: true       // 12-hour format with AM/PM
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FormHeader
        title={isCreateMode ? 'Create Asset' : isEditMode ? 'Edit Asset' : 'View Asset'}
        subtitle={
          isCreateMode
            ? 'Add a new asset'
            : isEditMode
              ? 'Update asset details'
              : 'View asset information'
        }
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={{ padding: 16 }}>
        {scannerVisible && (
          <View style={styles.cameraOverlay}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "code128", "ean13", "ean8"], //  QR + BARCODE
              }}
              onBarcodeScanned={handleQRScanned}
            />

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setScannerVisible(false)}
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>

            {/* Scan frame */}
            <View style={styles.scanFrame} />
          </View>
        )}

        {/* Section Header */}


        <View style={styles.headerRow}>
          <Text style={styles.subHeader}>ASSET DETAILS</Text>
        
          {isViewMode && (
            <TouchableOpacity
              style={styles.editSmallButton}
              onPress={() =>
                navigation.navigate('CreateAsset', {
                  mode: 'edit',
                  asset, // pass the current asset
                })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editSmallButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>


        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Asset Name *</Text>
            {isViewMode ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{assetName || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, isViewMode && styles.readOnly]}
                placeholder="Enter asset name"
                value={assetName}
                editable={!isViewMode}
                onChangeText={(text) => {
                  console.log('Asset Name changed:', text); // <-- log here
                  setAssetName(text);
                }}
              />
            )}
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>Asset Number</Text>

            {isViewMode ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{assetNumber || "-"}</Text>
              </View>
            ) : (
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Enter asset number"
                  value={assetNumber}
                  onChangeText={setAssetNumber}
                />

                <TouchableOpacity
                  onPress={() => {
                    setActiveScanField("assetNumber");
                    setScannerVisible(true);
                  }}
                >
                  <Ionicons name="qr-code-outline" size={22} color="#6234E2" />
                </TouchableOpacity>
              </View>
            )}
          </View>

        </View>

        <Text style={styles.label}>Description</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{description || "-"}</Text>
          </View>
        ) : (
          <TextInput
            style={[styles.input, styles.textArea, isViewMode && styles.readOnly]}
            placeholder="Enter description"
            value={description}
            editable={!isViewMode}
            multiline
            onChangeText={setDescription}
          />
        )}

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Product</Text>
            {isViewMode ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{product || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, isViewMode && styles.readOnly]}
                placeholder="Enter product"
                value={product}
                editable={!isViewMode}
                onChangeText={setProduct}
              />
            )}
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Parent Asset</Text>
            {isViewMode ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{parentAsset || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, isViewMode && styles.readOnly]}
                placeholder="Enter parent asset"
                value={parentAsset}
                editable={!isViewMode}
                onChangeText={setParentAsset}
              />
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>GIAI</Text>

            {isViewMode ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{giai || "-"}</Text>
              </View>
            ) : (
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Enter GIAI"
                  value={giai}
                  onChangeText={setGiai}
                />

                <TouchableOpacity
                  onPress={() => {
                    setActiveScanField("giai");
                    setScannerVisible(true);
                  }}
                >
                  <Ionicons name="qr-code-outline" size={22} color="#6234E2" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>Asset Type</Text>
            {isViewMode ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{assetType || "-"}</Text>
              </View>
            ) : (
              <View style={[styles.pickerContainer, isViewMode && styles.disabledPicker]}>
                <Picker enabled={!isViewMode} selectedValue={assetType} onValueChange={setAssetType}>
                  <Picker.Item label="Select asset type" value="" />
                  <Picker.Item label="Hardware" value="hardware" />
                  <Picker.Item label="Software" value="software" />
                  <Picker.Item label="License" value="license" />
                  <Picker.Item label="Furniture" value="furniture" />
                  <Picker.Item label="Vehicle" value="vehicle" />

                </Picker>
              </View>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Status</Text>
            {isViewMode ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{status || "-"}</Text>
              </View>
            ) : (
              <View style={[styles.pickerContainer, isViewMode && styles.disabledPicker]}>
                <Picker enabled={!isViewMode} selectedValue={status} onValueChange={setStatus}>
                  <Picker.Item label="Select status" value="" />
                  <Picker.Item label="Active" value="active" />
                  <Picker.Item label="Inactive" value="inactive" />
                  <Picker.Item label="Repair" value="repair" />
                  <Picker.Item label="Retired" value="retired" />
                </Picker>
              </View>
            )}
          </View>
        </View>

        {/* DATES */}
        <Text style={styles.subHeader}>IMPORTANT DATES</Text>
        <View style={styles.row}>

          {renderDatePicker('Ordered Date', orderedDate, showOrderedPicker, setShowOrderedPicker, setOrderedDate)}
          {renderDatePicker('Installation Date', installationDate, showInstallPicker, setShowInstallPicker, setInstallationDate)}
        </View>
        <View style={styles.row}>
          {renderDatePicker('Purchased Date', purchasedDate, showPurchasePicker, setShowPurchasePicker, setPurchasedDate)}
          {renderDatePicker('Warranty Expiration', warrantyExpiration, showWarrantyPicker, setShowWarrantyPicker, setWarrantyExpiration)}
        </View>

        {/* CONTACT DETAILS */}
        <Text style={styles.subHeader}>CONTACT DETAILS</Text>

        <Text style={styles.label}>Company</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{company || "-"}</Text>
          </View>
        ) : (
          <TextInput
            style={[styles.input, isViewMode && styles.readOnly]}
            placeholder="Enter company"
            value={company}
            editable={!isViewMode}
            onChangeText={setCompany}
          />
        )}
        <Text style={styles.label}>Contact</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{contact?.name || contactQuery || "-"}</Text>
          </View>
        ) : (
          <TextInput
            style={[styles.input, isViewMode && styles.readOnly]}
            placeholder="Search contact..."
            value={contact?.name || contactQuery}
            editable={!isViewMode}
            onChangeText={(text) => {
              setContactQuery(text);
              setContact(null);
            }}
          />
        )}
        {!isViewMode && contactSuggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            {contactSuggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setContact({ id: item.id, name: item.name });
                  setContactQuery('');
                  setContactSuggestions([]);
                }}
              >
                <Text style={styles.suggestionItem}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ADDRESS */}
        <Text style={styles.subHeader}>ADDRESS</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{address || "-"}</Text>
          </View>
        ) : (
          <TextInput
            style={[styles.input, styles.textArea, isViewMode && styles.readOnly]}
            placeholder="Enter address"
            value={address}
            editable={!isViewMode}
            multiline
            onChangeText={setAddress}
          />
        )}
        <Text style={styles.subHeader}>System Information</Text>
        {isViewMode && (
          <View style={styles.systemInfo}>
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Created by:</Text>
                <Text style={styles.infoValue}>{createdBy}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Updated by:</Text>
                <Text style={styles.infoValue}>{updatedBy}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Created at:</Text>
                <Text style={styles.infoValue}>{formatDate(createdAt)}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Updated at:</Text>
                <Text style={styles.infoValue}>{formatDate(updatedAt)}</Text>
              </View>
            </View>
          </View>
        )}


        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          {(isCreateMode || isEditMode) && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>{isCreateMode ? 'Save Asset' : 'Update Asset'}</Text>
            </TouchableOpacity>
          )}

          {isViewMode && (
            <>

              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelText}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16

  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  editSmallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6234E2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  editSmallButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    color: '#6234E2',
    marginTop: 12,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  column: {
    flex: 1
  },
  input: {
    backgroundColor: '#E5E5E5',
    borderWidth: 0.5,
    borderColor: '#535351B2',
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 45,
  },
  readOnlyInput: {

    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 12,
    color: "#101318CC",

  },
  readOnlyView: {
    paddingVertical: 14,
    paddingHorizontal: 12,

  },
  readOnlyText: {
    fontSize: 12,
    color: "#101318CC",
  },
  suggestionBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#fff',
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  readOnly: {
    backgroundColor: '#f5f5f5',
    color: '#555'
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    borderColor: '#535351B2',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 45,
    justifyContent: 'space-between',
  },
  textArea: {
    height: 80
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30
  },
  saveButton: {
    backgroundColor: '#6234E2',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#535351B2',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600'
  },
  systemInfo: {
    marginBottom: 10,
    padding: 12,

  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B46F6",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 6,
  },
  infoValue: {
    fontSize: 14,
    color: "#111",
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 999,
  },

  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },

  scanFrame: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    height: 220,
    borderWidth: 2,
    borderColor: "#00FF9C",
    borderRadius: 12,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#E5E5E5',
    borderColor: '#535351B2',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 45,
  },

  inputFlex: {
    flex: 1,
    paddingVertical: 10,
  },

});
