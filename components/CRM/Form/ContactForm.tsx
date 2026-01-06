import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import FormHeader from "../../common/FormHeader";
import { api } from "@/src/api/cilent";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";

type ContactFormNavigationProp = NativeStackNavigationProp<
    SearchMenuStackParamList,
    'ContactForm'
>;

// ----------------------------------------
const ContactForm = () => {

    const navigation = useNavigation<ContactFormNavigationProp>();
    const route = useRoute<RouteProp<SearchMenuStackParamList, 'ContactForm'>>();
    const [accounts, setAccounts] = useState<any[]>([]);

    const { mode, data } = route.params || {};
    const isView = mode === "view";

    const [form, setForm] = useState({
        account: data?.account_id || "", // or map account_name to id if needed
        firstName: data?.first_name || "",
        lastName: data?.last_name || "",
        email: data?.email || "",
        phone: data?.phone || "",
        type: data?.type || "Primary",
        preferredMethod: data?.preferred_contact_method || "Phone",
        street: data?.street || "",
        city: data?.city || "",
        state: data?.state || "",
        postalCode: data?.postal_code || "",
        country: data?.country || "",
        lastServiceDate: data?.last_service_date ? new Date(data.last_service_date) : null,
        instructions: data?.special_instructions || "",
    });


    const [showDate, setShowDate] = useState(false);

    const handleChange = (key: keyof typeof form, value: any) => {
        setForm({ ...form, [key]: value });
    };

    const fetchAccounts = async () => {
        try {
            const accountsData = await api.get<any[]>("/accounts");

            if (Array.isArray(accountsData)) {
                setAccounts(accountsData);
            } else {
                setAccounts([]);
            }
        } catch (err) {
            console.error("Error fetching accounts:", err);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (accounts.length && data?.account_id) {
            const matchedAccount = accounts.find(acc => acc.id === data.account_id);
            if (matchedAccount) {
                setForm(prev => ({ ...prev, account: matchedAccount.id }));
            }
            console.log("Matched account:", matchedAccount);

        }
    }, [accounts, data]);

    const handleSubmit = async () => {
        if (!form.account) {
            alert("Please select an account before saving.");
            return;
        }
        try {
            const payload = {
                account_id: form.account,
                first_name: form.firstName,
                last_name: form.lastName,
                email: form.email,
                phone: form.phone,
                type: form.type,
                street: form.street,
                city: form.city,
                state: form.state,
                postal_code: form.postalCode,
                country: form.country,
                preferred_contact_method: form.preferredMethod,
                last_service_date: form.lastServiceDate?.toISOString().split("T")[0] || null,
                special_instructions: form.instructions,
            };
            console.log("Payload before sending:", payload);
            let response;
            if (mode === "edit") {
                // Update existing contact
                response = await api.put(`/contacts/${data.id}`, payload);
                console.log("Contact updated:", response);
            } else {
                // Create new contact
                response = await api.post("/contacts", payload);
                console.log("Contact created:", response);
            }

            navigation.goBack();
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    // ---------------- Delete Handler ----------------
    const handleDelete = async () => {
        if (!data?.id) return;
        try {
            await api.delete(`/contacts/${data.id}`);
            console.log("Contact deleted");
            navigation.goBack();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };
    const getAccountName = (id: string) => {
        const acc = accounts.find(a => a.id === id);
        return acc ? acc.name : "-";
    };

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
                        ? "Create Contact"
                        : mode === "view"
                            ? "View Contact"
                            : "Edit Contact"
                }
                subtitle={
                    mode === "view"
                        ? "Contact details"
                        : mode === "edit"
                            ? "Update contact information"
                            : "Add a new contact"
                }
                onBackPress={() => navigation.goBack()}
            />


            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    {isView && (
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() =>
                                navigation.navigate("ContactForm", {
                                    mode: "edit",
                                    data: route.params.data // send original data, not form
                                })
                            }
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={20} color="#fff" />

                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* ACCOUNT */}
                <Text style={styles.label}>Account *</Text>
                {isView ? (
                    <View style={styles.readOnlyView}>

                        <Text style={styles.readOnlyText}>{getAccountName(form.account)}</Text>

                    </View>
                ) : (
                    <View style={styles.dropdownWrapper}>
                        <Picker
                            enabled={!isView}
                            selectedValue={form.account}
                            onValueChange={(value) => handleChange("account", value)}
                            style={{ height: 50 }}          // 🔥 MUST
                            itemStyle={{ height: 50 }}     // 🔥 ANDROID FIX
                            mode="dropdown"                // 🔥
                        >

                            <Picker.Item label="Select Account" value="" />
                            {accounts.map((acc) => (
                                <Picker.Item
                                    key={acc.id}
                                    label={acc.name}   // UI shows name
                                    value={acc.id}     // value is UUID
                                />
                            ))}
                        </Picker>


                    </View>
                )}

                {/* First + Last Name */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>First Name *</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.firstName || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabled]}
                                value={form.firstName}
                                onChangeText={(t) => handleChange("firstName", t)}
                                placeholder="First Name"
                            />
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Last Name</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.lastName || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabled]}
                                value={form.lastName}
                                onChangeText={(t) => handleChange("lastName", t)}
                                placeholder="Last Name"
                            />
                        )}
                    </View>
                </View>

                {/* Email + Phone */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Email</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.email || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                style={[styles.input, isView && styles.disabled]}
                                editable={!isView}
                                value={form.email}
                                onChangeText={(t) => handleChange("email", t)}
                                placeholder="example@gmail.com"
                            />
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Phone</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.phone || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                style={[styles.input, isView && styles.disabled]}
                                editable={!isView}
                                value={form.phone}
                                onChangeText={(t) => handleChange("phone", t)}
                                placeholder="Phone Number"
                            />
                        )}
                    </View>
                </View>

                {/* Type + Preferred Contact Method */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Type</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.type || "-"}   </Text>
                            </View>
                        ) : (
                            <View style={styles.dropdownWrapper}>
                                <Picker
                                    enabled={!isView}
                                    selectedValue={form.type}
                                    onValueChange={(v) => handleChange("type", v)}
                                >
                                    <Picker.Item label="Primary" value="Primary" />
                                    <Picker.Item label="Secondary" value="Secondary" />
                                    <Picker.Item label="Secondary" value="Secondary" />
                                    <Picker.Item label="Billing" value="Billing" />
                                    <Picker.Item label="Technical" value="Technical" />
                                    <Picker.Item label="Emergency" value="Emergenc" />
                                </Picker>
                            </View>
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Preferred Contact Method</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.preferredMethod || "-"}   </Text>
                            </View>
                        ) : (
                            <View style={styles.dropdownWrapper}>
                                <Picker
                                    enabled={!isView}
                                    selectedValue={form.preferredMethod}
                                    onValueChange={(v) => handleChange("preferredMethod", v)}
                                >
                                    <Picker.Item label="Phone" value="Phone" />
                                    <Picker.Item label="Email" value="Email" />
                                    <Picker.Item label="SMS" value="SMS" />
                                    <Picker.Item label="Whatsapp" value="Whatsapp" />
                                </Picker>
                            </View>
                        )}
                    </View>
                </View>

                {/* Street */}
                <Text style={styles.label}>Street</Text>
                {isView ? (
                    <View style={styles.readOnlyView}>

                        <Text style={styles.readOnlyText}>{form.street || "-"}   </Text>
                    </View>
                ) : (
                    <TextInput
                        style={[styles.input, isView && styles.disabled]}
                        editable={!isView}
                        value={form.street}
                        onChangeText={(t) => handleChange("street", t)}
                        placeholder="Street Address"
                    />
                )}
                {/* City + State */}
                <View style={styles.row}>
                    <View style={styles.col}>

                        <Text style={styles.label}>City</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.city || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabled]}
                                value={form.city}
                                onChangeText={(t) => handleChange("city", t)}
                                placeholder="City"
                            />
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>State</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.state || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabled]}
                                value={form.state}
                                onChangeText={(t) => handleChange("state", t)}
                                placeholder="State"
                            />
                        )}
                    </View>
                </View>

                {/* Postal + Country */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Postal Code</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.postalCode || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                style={[styles.input, isView && styles.disabled]}
                                editable={!isView}
                                value={form.postalCode}
                                onChangeText={(t) => handleChange("postalCode", t)}
                                placeholder="Postal Code"
                            />
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Country</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>

                                <Text style={styles.readOnlyText}>{form.country || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                style={[styles.input, isView && styles.disabled]}
                                editable={!isView}
                                value={form.country}
                                onChangeText={(t) => handleChange("country", t)}
                                placeholder="Country"
                            />
                        )}
                    </View>
                </View>

                {/* Date */}
                <Text style={styles.label}>Last Service Date</Text>
                {isView ? (
                    <View style={styles.readOnlyView}>

                        <Text style={styles.readOnlyText}>{form.lastServiceDate
                            ? form.lastServiceDate.toLocaleDateString()
                            : "mm/dd/yyyy"}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        disabled={isView}
                        style={styles.dateBox}
                        onPress={() => setShowDate(true)}
                    >
                        <Text style={styles.dateText}>
                            {form.lastServiceDate
                                ? form.lastServiceDate.toLocaleDateString()
                                : "mm/dd/yyyy"}
                        </Text>
                        <Ionicons name="calendar" size={20} />
                    </TouchableOpacity>
                )}
                {showDate && (
                    <DateTimePicker
                        value={form.lastServiceDate || new Date()}
                        onChange={(event, date) => {
                            if (Platform.OS !== "ios") setShowDate(false);
                            if (date) handleChange("lastServiceDate", date);
                        }}
                    />
                )}

                {/* Instructions */}
                <Text style={styles.label}>Special Instructions</Text>
                {isView ? (
                    <View style={styles.readOnlyView}>

                        <Text style={styles.readOnlyText}>{form.country || "-"}   </Text>
                    </View>
                ) : (
                    <TextInput
                        editable={!isView}
                        style={[styles.textarea, isView && styles.disabled]}
                        value={form.instructions}
                        onChangeText={(t) => handleChange("instructions", t)}
                        multiline
                        placeholder="Special instructions..."
                    />
                )}
                <Text style={styles.sectionTitle}>System Information</Text>
                {isView && (
                    <View style={styles.systemInfo}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Created by:</Text>
                                <Text style={styles.infoValue}>{data?.created_by_name || "-"}</Text>
                            </View>

                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Updated by:</Text>
                                <Text style={styles.infoValue}>{data?.updated_by_name || "-"}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Created at:</Text>
                                <Text style={styles.infoValue}>{formatDate(data?.created_at)}</Text>
                            </View>

                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Updated at:</Text>
                                <Text style={styles.infoValue}>{formatDate(data?.updated_at)}</Text>
                            </View>
                        </View>
                    </View>
                )}


                {/* Buttons */}
                {!isView && (
                    <>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveNewBtn}>
                            <Text style={styles.saveNewText}>Save & New</Text>
                        </TouchableOpacity>
                    </>
                )}
                {isView && (
                    <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: "#FF3B30" }]} onPress={handleDelete}>
                        <Text style={styles.cancelText}>Delete</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// ---------------- Styles ----------------
const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "#fff" },
    sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
    label: { fontSize: 14, marginTop: 8, marginBottom: 8, color: "#6234E2" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 6,
        backgroundColor: "#fff",
    },
    disabled: { backgroundColor: "#eee" },
    row: { flexDirection: "row", justifyContent: "space-between" },
    col: { width: "48%" },
    dropdownWrapper: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 6,
        height: 50,          // 🔥 MUST
        justifyContent: "center",
    },

    dateBox: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateText: { color: "#555" },
    textarea: {
        borderWidth: 1,
        borderColor: "#ccc",
        minHeight: 90,
        borderRadius: 6,
        padding: 12,
        textAlignVertical: "top",
    },
    saveBtn: {
        marginTop: 20,
        backgroundColor: "#673de6",
        padding: 14,
        borderRadius: 6,
        alignItems: "center",
    },
    saveText: { color: "#fff", fontSize: 16 },
    saveNewBtn: {
        marginTop: 10,
        backgroundColor: "green",
        padding: 14,
        borderRadius: 6,
        alignItems: "center",
    },
    saveNewText: { color: "#fff", fontSize: 16 },
    cancelBtn: {
        marginTop: 10,
        backgroundColor: "#555",
        padding: 14,
        borderRadius: 6,
        alignItems: "center",
    },
    cancelText: { color: "#fff", fontSize: 16 },
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

export default ContactForm;
