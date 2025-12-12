import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import Checkbox from 'expo-checkbox';

import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import FormHeader from "../../common/FormHeader";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { FieldWorker } from "@/types/Worker";
import { createWorker, deleteWorker, updateWorker } from "@/src/api/auth";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Ionicons } from "@expo/vector-icons";



// TypeScript types
type WorkspaceFormRouteProp = RouteProp<SearchMenuStackParamList, "WorkForceForm">;

interface WorkerAddress {
  street: string;
  city: string;
  state: string;
  country: string;
}
const TIMEZONES = [
  // Asia Pacific (APAC) Regions
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Japan)', country: 'Japan' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul (South Korea)', country: 'South Korea' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (China)', country: 'China' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (Hong Kong)', country: 'Hong Kong' },
  { value: 'Asia/Taipei', label: 'Asia/Taipei (Taiwan)', country: 'Taiwan' },
  { value: 'Asia/Manila', label: 'Asia/Manila (Philippines)', country: 'Philippines' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (Singapore)', country: 'Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur (Malaysia)', country: 'Malaysia' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (Thailand)', country: 'Thailand' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (Vietnam)', country: 'Vietnam' },
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (Indonesia)', country: 'Indonesia' },
  { value: 'Asia/Makassar', label: 'Asia/Makassar (Indonesia - Central)', country: 'Indonesia' },
  { value: 'Asia/Jayapura', label: 'Asia/Jayapura (Indonesia - Eastern)', country: 'Indonesia' },
  { value: 'Asia/Yangon', label: 'Asia/Yangon (Myanmar)', country: 'Myanmar' },
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka (Bangladesh)', country: 'Bangladesh' },
  { value: 'Asia/Colombo', label: 'Asia/Colombo (Sri Lanka)', country: 'Sri Lanka' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (India)', country: 'India' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (Pakistan)', country: 'Pakistan' },
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (Nepal)', country: 'Nepal' },
  { value: 'Asia/Kabul', label: 'Asia/Kabul (Afghanistan)', country: 'Afghanistan' },
  { value: 'Asia/Tashkent', label: 'Asia/Tashkent (Uzbekistan)', country: 'Uzbekistan' },
  { value: 'Asia/Almaty', label: 'Asia/Almaty (Kazakhstan)', country: 'Kazakhstan' },
  { value: 'Asia/Ulaanbaatar', label: 'Asia/Ulaanbaatar (Mongolia)', country: 'Mongolia' },

  // Australia & Pacific
  { value: 'Australia/Perth', label: 'Australia/Perth (Western Australia)', country: 'Australia' },
  { value: 'Australia/Adelaide', label: 'Australia/Adelaide (South Australia)', country: 'Australia' },
  { value: 'Australia/Darwin', label: 'Australia/Darwin (Northern Territory)', country: 'Australia' },
  { value: 'Australia/Brisbane', label: 'Australia/Brisbane (Queensland)', country: 'Australia' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (New South Wales)', country: 'Australia' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne (Victoria)', country: 'Australia' },
  { value: 'Australia/Hobart', label: 'Australia/Hobart (Tasmania)', country: 'Australia' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (New Zealand)', country: 'New Zealand' },
  { value: 'Pacific/Fiji', label: 'Pacific/Fiji (Fiji)', country: 'Fiji' },
  { value: 'Pacific/Port_Moresby', label: 'Pacific/Port_Moresby (Papua New Guinea)', country: 'Papua New Guinea' },
  { value: 'Pacific/Noumea', label: 'Pacific/Noumea (New Caledonia)', country: 'New Caledonia' },
  { value: 'Pacific/Guam', label: 'Pacific/Guam (Guam)', country: 'Guam' },
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (Hawaii, USA)', country: 'United States' },
  { value: 'Pacific/Samoa', label: 'Pacific/Samoa (Samoa)', country: 'Samoa' },

  // Americas
  { value: 'America/Anchorage', label: 'America/Anchorage (Alaska)', country: 'United States' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time)', country: 'United States' },
  { value: 'America/Denver', label: 'America/Denver (Mountain Time)', country: 'United States' },
  { value: 'America/Chicago', label: 'America/Chicago (Central Time)', country: 'United States' },
  { value: 'America/New_York', label: 'America/New_York (Eastern Time)', country: 'United States' },
  { value: 'America/Phoenix', label: 'America/Phoenix (Arizona)', country: 'United States' },
  { value: 'America/Toronto', label: 'America/Toronto (Canada - Eastern)', country: 'Canada' },
  { value: 'America/Vancouver', label: 'America/Vancouver (Canada - Pacific)', country: 'Canada' },
  { value: 'America/Mexico_City', label: 'America/Mexico_City (Mexico)', country: 'Mexico' },
  { value: 'America/Bogota', label: 'America/Bogota (Colombia)', country: 'Colombia' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (Brazil)', country: 'Brazil' },
  { value: 'America/Santiago', label: 'America/Santiago (Chile)', country: 'Chile' },
  { value: 'America/Buenos_Aires', label: 'America/Buenos_Aires (Argentina)', country: 'Argentina' },

  // Europe
  { value: 'Europe/London', label: 'Europe/London (UK)', country: 'United Kingdom' },
  { value: 'Europe/Paris', label: 'Europe/Paris (France)', country: 'France' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (Germany)', country: 'Germany' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow (Russia)', country: 'Russia' },

  // Middle East
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UAE)', country: 'United Arab Emirates' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (Saudi Arabia)', country: 'Saudi Arabia' },
  { value: 'Asia/Tehran', label: 'Asia/Tehran (Iran)', country: 'Iran' },

  // Africa
  { value: 'Africa/Cairo', label: 'Africa/Cairo (Egypt)', country: 'Egypt' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (South Africa)', country: 'South Africa' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (Kenya)', country: 'Kenya' },

  // UTC
  { value: 'UTC', label: 'UTC - Universal Time Coordinated', country: 'UTC' },
];
interface FieldWorkerAPI extends Omit<FieldWorker, 'skills' | 'certificate'> {
  skills: string;
  certifications: string;
}

const CreateWorkSpaceForm = () => {
  const navigation = useNavigation();
  const route = useRoute<WorkspaceFormRouteProp>();
  const { mode: initialMode, worker }: { mode: string; worker?: any } =
    route.params || { mode: "create", worker: undefined };

  const [mode, setMode] = useState(initialMode);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<Date | undefined>(worker?.dob ? new Date(worker.dob) : undefined);
  const [gender, setGender] = useState(worker?.gender || "");
  const [fullName, setFullName] = useState(worker?.full_name || "");
  const [phone, setPhone] = useState(worker?.mobile || "");
  const [altPhone, setAltPhone] = useState(worker?.alt_mobile || "");
  const [email, setEmail] = useState(worker?.email || "");
  const [govId, setGovId] = useState(worker?.gov_id || "");
  const [availability, setAvailability] = useState(worker?.availability || "");
  const [workLocation, setWorkLocation] = useState(worker?.work_location || "");
  const [gps, setGps] = useState(worker?.gps || "");
  const [medicalInfo, setMedicalInfo] = useState(worker?.medical || "");
  const [currentAddress, setCurrentAddress] = useState(worker?.current_address || "");
  const [currentAddressCity, setCurrentAddressCity] = useState(worker?.city || "");
  const [currentAddressState, setCurrentAddressState] = useState(worker?.state || "");
  const [currentAddressCountry, setCurrentAddressCountry] = useState(worker?.country || "");
const [createdByName, setCreatedByName] = useState(worker?.created_by_name || "");
const [updatedByName, setUpdatedByName] = useState(worker?.updated_by_name || "");
const [createdAt, setCreatedAt] = useState(worker?.created_at || "");
const [updatedAt, setUpdatedAt] = useState(worker?.updated_at || "");

  const [permanentAddress, setPermanentAddress] = useState<WorkerAddress>(
    worker?.permanent_address
      ? typeof worker.permanent_address === "string"
        ? JSON.parse(worker.permanent_address)
        : worker.permanent_address
      : { street: "", city: "", state: "", country: "" }
  );

  const [emergencyName, setEmergencyName] = useState(worker?.emergency_name || "");
  const [emergencyPhone, setEmergencyPhone] = useState(worker?.emergency_phone || "");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [certificate, setCertificate] = useState(worker?.certificate || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = mode === "view";

  const [skills, setSkills] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<string>("");

  const [cert, setCert] = useState<string>("");
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const openStartTimePicker = () => setShowStartPicker(true);
  const openEndTimePicker = () => setShowEndPicker(true);

  const [commonSkills] = useState<string[]>([
    "HVAC", "Plumbing", "Electrical", "Carpentry",
    "Welding", "Equipment Operation", "Diagnostics",
    "Installation", "Repair", "Maintenance", "Inspection"
  ]);

  const [commonCertifications] = useState<string[]>([
    "OSHA Certification", "EPA Certification", "Electrician License",
    "HVAC Certification", "Plumbing License", "Safety Training",
    "First Aid", "Equipment Operator License"
  ]);

  const filterList = (text: string, list: string[]) => {
    return list.filter(item =>
      item.toLowerCase().includes(text.toLowerCase()) &&
      !selectedSkills.includes(item)
    );
  };

  const filterCertList = (text: string) => {
    return commonCertifications.filter(item =>
      item.toLowerCase().includes(text.toLowerCase()) &&
      !selectedCertifications.includes(item)
    );
  };

  const addSkill = (item: string) => {
    if (!selectedSkills.includes(item)) {
      setSelectedSkills([...selectedSkills, item]);
    }
    setSkills("");
  };

  const removeSkill = (item: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== item));
  };

  const addCertification = (item: string) => {
    if (!selectedCertifications.includes(item)) {
      setSelectedCertifications([...selectedCertifications, item]);
    }
    setCert("");
  };

  const removeCertification = (item: string) => {
    setSelectedCertifications(selectedCertifications.filter(c => c !== item));
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!date) newErrors.dob = "Date of Birth is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!phone.trim()) newErrors.phone = "Phone Number is required";
    else if (!/^\d{10}$/.test(phone)) newErrors.phone = "Phone Number must be 10 digits";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid Email";
    if (!agreeTerms) newErrors.agreeTerms = "You must agree to the terms";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  // Optionally, validate email format if provided

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill all required fields.");
      return;
    }

    const payload: FieldWorker = {
      full_name: fullName,
      dob: date?.toISOString().split("T")[0],
      gender,
      mobile: phone,
      alt_mobile: altPhone || null,
      email: email || null,
      emergency_name: emergencyName || null,
      emergency_phone: emergencyPhone || null,
      current_address: currentAddress,
      city: currentAddressCity || null,
      state: currentAddressState || null,
      country: currentAddressCountry || null,
      permanent_address: permanentAddress || null,
      gov_id: govId || null,

      // Keep arrays here for TypeScript
      skills: selectedSkills,               // array
      certificate: selectedCertifications, // array

      experience_years: experienceYears ? Number(experienceYears) : 0,
      availability: availability || null,
      work_location: workLocation || null,
      gps: gps || null,
      medical: medicalInfo || null,
      working_hours_start: startTime,
      working_hours_end: endTime,
      timezone: timezone,
    };

    // When sending to API, convert arrays to strings
    const apiPayload = {
      ...payload,
      skills: payload.skills.join(","),          // string for backend
      certifications: payload.certificate, // string for backend
    } as unknown as FieldWorker; // TypeScript trick


    console.log("Payload before API:", payload);
    try {
      if (mode === "create") {
        await createWorker(apiPayload);  // ✅ send converted payload
        Alert.alert("Success", "Worker created successfully");
      } else if (mode === "edit" && worker?.id) {
        await updateWorker(worker.id, apiPayload); // ✅ send converted payload
        Alert.alert("Success", "Worker updated successfully");
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }


  }

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this worker?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!worker?.id) return;
            try {
              await deleteWorker(worker.id);
              Alert.alert("Deleted", "Worker deleted successfully");
              navigation.goBack();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Could not delete worker");
            }
          },
        },
      ]
    );
  };

  // Inside your component, after useState declarations
  useEffect(() => {
    if (worker) {
      // Populate skills array
      if (worker.skills) {
        const skillsArray = Array.isArray(worker.skills)
          ? worker.skills
          : worker.skills.split(","); // if backend sends comma-separated string
        setSelectedSkills(skillsArray);
      }

      // Populate certifications array
      if (worker.certifications || worker.certificate) {
        const certArray = Array.isArray(worker.certifications)
          ? worker.certifications
          : (worker.certifications || worker.certificate).split(",");
        setSelectedCertifications(certArray);
      }

      // Populate experience years
      if (worker.experience_years !== undefined && worker.experience_years !== null) {
        setExperienceYears(String(worker.experience_years));
      }
    }
  }, [worker]);

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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FormHeader
        title={
          mode === "create"
            ? "Create Field Worker"
            : mode === "edit"
              ? "Edit Field Worker"
              : "View Field Worker"
        }
        subtitle={
          mode === "create"
            ? "Register a new field worker"
            : mode === "edit"
              ? "Update existing worker details"
              : "View worker profile"
        }
        onBackPress={() => navigation.goBack()}
      />



      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionHeader}>Worker Information</Text>

          {readOnly && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setMode("edit")}
            >
              <Ionicons name="pencil-outline" size={20} color="#fff" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* PERSONAL INFORMATION */}
        <Text style={styles.subHeader}>PERSONAL INFORMATION</Text>
        <View style={styles.row}>
          {/* Full Name */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Full Name *</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{fullName || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Full name"
                value={fullName}
                onChangeText={setFullName}
              />
            )}
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          {/* Date of Birth */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Date of Birth</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{date ? date.toLocaleDateString() : "-"}</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.input, styles.dateInput]}
              >
                <Text style={styles.dateText}>
                  {date ? date.toLocaleDateString() : "mm/dd/yy"}
                </Text>
               <Ionicons name="calendar-outline" size={20} color="#6C35D1" />

              </TouchableOpacity>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        </View>


        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Gender *</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{gender || "Not specified"}</Text>
              </View>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={gender}
                  onValueChange={setGender}
                  style={styles.pickerStyle}
                  enabled={!readOnly}
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            )}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Phone Number *</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{phone || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="Enter number.."
                value={phone}
                onChangeText={setPhone}
              />
            )}
          </View>

        </View>

        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Alternate Phone</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{altPhone || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, readOnly && styles.readOnlyInput]}
                keyboardType="phone-pad"
                placeholder="Alternate number"
                editable={!readOnly}
                value={altPhone}
                onChangeText={setAltPhone}
              />
            )}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Email Address</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{email || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, readOnly && styles.readOnlyInput]}
                keyboardType="email-address"
                placeholder="Email"
                editable={!readOnly}
                value={email}
                onChangeText={setEmail}
              />
            )}
          </View>
        </View>

        {/* EMERGENCY CONTACT */}
        <Text style={styles.subHeader}>EMERGENCY CONTACT</Text>
        <View style={styles.inputBoxFull}>
          <Text style={styles.label}>Emergency Contact Name</Text>
          {readOnly ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{emergencyName || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, readOnly && styles.readOnlyInput]}
              placeholder="Emergency Name"
              editable={!readOnly}
              value={emergencyName}
              onChangeText={setEmergencyName}
            />
          )}
        </View>
        <View style={styles.inputBoxFull}>
          <Text style={styles.label}>Emergency Contact Phone</Text>
          {readOnly ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{emergencyPhone || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, readOnly && styles.readOnlyInput]}
              keyboardType="phone-pad"
              placeholder="Emergency Phone"
              editable={!readOnly}
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
            />
          )}
        </View>

        {/* CURRENT ADDRESS */}
        <Text style={styles.subHeader}>CURRENT ADDRESS</Text>
        <View style={styles.inputBoxFull}>
          <Text style={styles.label}>Address</Text>
          {readOnly ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{currentAddress || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, styles.textArea, readOnly && styles.readOnlyInput]}
              placeholder="Current address"
              multiline
              editable={!readOnly}
              value={currentAddress}
              onChangeText={setCurrentAddress}
            />
          )}
          <View style={styles.row}>
            <View style={styles.inputBox}>
              <Text style={styles.label}>City</Text>
              {readOnly ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{currentAddressCity || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={[styles.input, readOnly && styles.readOnlyInput]}
                  placeholder="City"
                  editable={!readOnly}
                  value={currentAddressCity}
                  onChangeText={setCurrentAddressCity}
                />
              )}
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.label}>State</Text>
              {readOnly ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{currentAddressState || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={[styles.input, readOnly && styles.readOnlyInput]}
                  placeholder="State"
                  editable={!readOnly}
                  value={currentAddressState}
                  onChangeText={setCurrentAddressState}
                />
              )}
            </View>
          </View>
          <View style={styles.inputBoxFull}>
            <Text style={styles.label}>Country</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{currentAddressCountry || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, readOnly && styles.readOnlyInput]}
                placeholder="Country"
                editable={!readOnly}
                value={currentAddressCountry}
                onChangeText={setCurrentAddressCountry}
              />
            )}
          </View>
        </View>

        {/* PERMANENT ADDRESS */}
        <Text style={styles.subHeader}>PERMANENT ADDRESS</Text>
        <View style={styles.inputBoxFull}>

          <Text style={styles.label}>Street</Text>
          {readOnly ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{permanentAddress.street || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, styles.textArea, readOnly && styles.readOnlyInput]}
              placeholder="Street"
              multiline
              editable={!readOnly}
              value={permanentAddress.street}
              onChangeText={(text) => setPermanentAddress({ ...permanentAddress, street: text })}
            />
          )}
        </View>
        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>City</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{permanentAddress.city || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, readOnly && styles.readOnlyInput]}
                placeholder="City"
                editable={!readOnly}
                value={permanentAddress.city}
                onChangeText={(text) => setPermanentAddress({ ...permanentAddress, city: text })}
              />
            )}
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>State</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{permanentAddress.state || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, readOnly && styles.readOnlyInput]}
                placeholder="State"
                editable={!readOnly}
                value={permanentAddress.state}
                onChangeText={(text) => setPermanentAddress({ ...permanentAddress, state: text })}
              />
            )}
          </View>
        </View>
        <View style={styles.inputBoxFull}>
          <Text style={styles.label}>Country</Text>
          {readOnly ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{permanentAddress.country || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, readOnly && styles.readOnlyInput]}
              placeholder="Country"
              editable={!readOnly}
              value={permanentAddress.country}
              onChangeText={(text) => setPermanentAddress({ ...permanentAddress, country: text })}
            />
          )}
        </View>

        {/* WORK INFORMATION */}
        <Text style={styles.subHeader}>WORK INFORMATION</Text>
        <View style={styles.inputBoxFull}>
          <Text style={styles.label}>Government ID Number</Text>
          {readOnly ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{govId || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, readOnly && styles.readOnlyInput]}
              placeholder="Government ID"
              editable={!readOnly}
              value={govId}
              onChangeText={setGovId}
            />
          )}
        </View>

        {/* Skills */}
        <View style={styles.inputBoxFull}>
          <Text style={styles.label}>Skills *</Text>

          {!readOnly && (
            <TextInput
              style={styles.input}
              placeholder="Type a skill..."
              value={skills}
              onChangeText={setSkills}
            />
          )}

          {/* Suggestions */}
          {!readOnly && skills.length > 0 && (
            <View style={styles.suggestionBox}>
              {filterList(skills, commonSkills).map((item, index) => (
                <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => addSkill(item)}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected Chips */}
          <View style={styles.chipContainer}>
            {selectedSkills.map((item, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
                {!readOnly && (
                  <TouchableOpacity onPress={() => removeSkill(item)}>
                    <Text style={styles.chipClose}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Experience Years */}
        <View style={styles.inputBoxFull}>
          <Text style={styles.label}>Experience Years *</Text>
          {readOnly ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{experienceYears || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Enter experience in years"
              value={experienceYears}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, "");
                setExperienceYears(filtered);
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          )}
        </View>

        {/* Certifications */}
        <View style={styles.inputBoxFull}>
          <Text style={styles.label}>Certifications *</Text>

          {!readOnly && (
            <TextInput
              style={styles.input}
              placeholder="Add certification..."
              value={cert}
              onChangeText={setCert}
            />
          )}

          {/* Suggestions */}
          {!readOnly && cert.length > 0 && (
            <View style={styles.suggestionBox}>
              {filterCertList(cert).map((item, index) => (
                <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => addCertification(item)}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected Chips */}
          <View style={styles.chipContainer}>
            {selectedCertifications.map((item, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
                {!readOnly && (
                  <TouchableOpacity onPress={() => removeCertification(item)}>
                    <Text style={styles.chipClose}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>



        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Availability</Text>

            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{availability || "Not specified"}</Text>
              </View>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker selectedValue={availability} onValueChange={setAvailability} style={styles.pickerStyle}>
                  <Picker.Item label="Select Availability" value="" />
                  <Picker.Item label="Full-time" value="full-time" />
                  <Picker.Item label="Part-time" value="part-time" />
                </Picker>
              </View>
            )}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Work Location / Region</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{workLocation || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, readOnly && styles.readOnlyInput]}
                placeholder="Work Location"
                editable={!readOnly}
                value={workLocation}
                onChangeText={setWorkLocation}
              />
            )}
          </View>
        </View>

        <View style={styles.inputBoxFull}>
          <Text style={styles.label}>Medical Information</Text>
          {readOnly ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{medicalInfo || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, styles.textArea, readOnly && styles.readOnlyInput]}
              multiline
              placeholder="Medical Information"
              editable={!readOnly}
              value={medicalInfo}
              onChangeText={setMedicalInfo}
            />
          )}
        </View>



        <Text style={styles.subHeader}>Work Schedule</Text>
        {/* Row 1 - Two Columns */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Working Hours Start</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{startTime || "Not specified"}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => openStartTimePicker()}
              >
                <Text style={styles.input}>{startTime}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Working Hours End</Text>
            {readOnly ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{endTime || "Not specified"}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => openEndTimePicker()}
              >
                <Text style={styles.input}>{endTime}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {showStartPicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (date) {
                const newTime = date.toTimeString().slice(0, 5);
                setStartTime(newTime);
              }
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={(event, date) => {
              setShowEndPicker(false);
              if (date) {
                const newTime = date.toTimeString().slice(0, 5);
                setEndTime(newTime);
              }
            }}
          />
        )}

        {/* Row 2 - Full width */}
        <View style={styles.fullCol}>
          <Text style={styles.label}>Timezone</Text>
          {readOnly ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{timezone || "Not specified"}</Text>
            </View>
          ) : (
            <Picker
              selectedValue={timezone}
              onValueChange={(value) => setTimezone(value)}
              style={styles.picker}
            >
              {TIMEZONES.map((zone, index) => (
                <Picker.Item
                  key={index}
                  label={zone.label}
                  value={zone.value}
                />
              ))}
            </Picker>
          )}
        </View>

        {!readOnly && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <Checkbox
  value={agreeTerms}
  onValueChange={setAgreeTerms}
  color={agreeTerms ? "#6C35D1" : undefined}
/>
            <Text style={{ marginLeft: 8, color: "#333" }}>
              I agree to the Data Collection Policy & Terms *
            </Text>
          </View>
        )}


        <Text style={styles.subHeader}>System Information</Text>
 {readOnly && (
  <View style={styles.systemInfo}>
    <View style={styles.infoRow}>
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Created by:</Text>
        <Text style={styles.infoValue}>{createdByName || "-"}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Updated by:</Text>
        <Text style={styles.infoValue}>{updatedByName || "-"}</Text>
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


        {!readOnly ? (
          <>
            {/* Edit/Create mode buttons */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>
                {mode === "edit" ? "Update" : "Submit"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: "#00A86B" }]}
              onPress={handleSubmit}
            >
              <Text style={styles.btnTexts}>Save & New</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.CancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.CancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* View mode buttons */}
            <TouchableOpacity
              style={styles.CancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.CancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "#FF4D4F" }]}
              onPress={handleDelete}
            >
              <Text style={styles.submitText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}


      </ScrollView>
    </View>
  );
};

export default CreateWorkSpaceForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,

  },
  inputError: {
    borderColor: "#E63946",
  },
  errorText: {
    color: "#E63946",
    fontSize: 12,
    marginTop: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C95F9",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 5,

  },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 6 },
  sectionHeader: {
    color: "#6234E2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  subHeader: {
    color: "#535351",
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 10,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
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
  inputBox: {
    flex: 1,
    marginBottom: 12,
    marginTop: 10,
  },
  inputBoxFull: {
    width: "100%",
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: "#6234E2",
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 12,
    height: 50,
    color: "#101318CC",
    backgroundColor: "#fff",
  },
  col: {
    width: "48%",
  },

  fullCol: {
    width: "100%",

    marginBottom: 12,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 5,
    backgroundColor: "#fff",
    justifyContent: "center",
    height: 50,
    paddingHorizontal: 8,
  },
  pickerStyle: {
    fontSize: 12,
    color: "#101318CC",
    width: "100%",
    height: 50,
  },
  picker: {
    backgroundColor: "#e8eef7",
    borderRadius: 10,

  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    color: "#555",
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: "#6234E2",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 4,
    marginTop: 14,
    alignItems: "center",
  },
  btnTexts: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
  CancelButton: {
    backgroundColor: "#535351B2",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  CancelText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },


  suggestionBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 4,
    padding: 8,
  },
  suggestionItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  chip: {
    flexDirection: "row",
    backgroundColor: "#c5f7d5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    margin: 4,
  },
  chipText: {
    marginRight: 6,
  },
  chipClose: {
    color: "red",
    fontWeight: "bold",
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

});
