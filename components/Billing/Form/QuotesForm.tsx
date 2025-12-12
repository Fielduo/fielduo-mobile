import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";

import FormHeader from "../../common/FormHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";

import { Picker } from "@react-native-picker/picker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";


import SearchDropdown from "../../common/searchDropdown";
import QuoteLineItems from "./QuoteLineItems";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";



type QuoteFormRouteProp = RouteProp<SearchMenuStackParamList, "QuotesForm">;

const validStatuses = ["Draft", "Sent", "Approved", "Rejected"];
const validCurrencies = ["USD", "INR", "EUR", "GBP"];

interface LineItem {
    id: string;
    type: string;
    name: string;
    description: string;
    qty: number;
    price: string;
    tax: number;
    discount: string;
}

interface LineItemResponse {
    id: string;
    item_type: string;
    item_name: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    discount: number;
}
const QuotesForm = () => {
    const route = useRoute<QuoteFormRouteProp>();
    const { mode, quote } = route.params;
    const navigation = useNavigation();

    const [currentMode, setCurrentMode] = useState(mode);
    const isView = currentMode === "view";
    const isEdit = currentMode === "edit";


    const [status, setStatus] = useState(quote?.status || "Draft");
    const [currency, setCurrency] = useState(quote?.currency || "USD");
    const [validUntil, setValidUntil] = useState(quote?.valid_until || "");
    const [notes, setNotes] = useState(quote?.notes || "");

    const [subtotal, setSubtotal] = useState(quote?.subtotal || 0);
    const [taxAmount, setTaxAmount] = useState(quote?.tax_amount || 0);
    const [discount, setDiscount] = useState(quote?.discount || 0);
    const [totalAmount, setTotalAmount] = useState(quote?.total_amount || 0);

    const [lineItems, setLineItems] = useState<LineItem[]>(quote?.line_items || []);


    const [customer, setCustomer] = useState("");
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [customerSearchResults, setCustomerSearchResults] = useState<string[]>([]);

    const [workOrder, setWorkOrder] = useState("");
    const [workOrderId, setWorkOrderId] = useState<number | null>(null);
    const [workOrderSearchResults, setWorkOrderSearchResults] = useState<string[]>([]);
    const [allCustomerData, setAllCustomerData] = useState<any[]>([]);
    const [allWorkOrderData, setAllWorkOrderData] = useState<any[]>([]);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");
    const [workOrderSearchQuery, setWorkOrderSearchQuery] = useState("");

    useEffect(() => {
        if (!quote) return;

        console.log("Quote loaded from DB:", quote);

        // Set basic fields
        setStatus(quote.status || "Draft");
        setCurrency(quote.currency || "USD");
        setValidUntil(quote.valid_until || "");
        setNotes(quote.notes || "");

        setSubtotal(Number(quote.subtotal) || 0);
        setTaxAmount(Number(quote.tax_amount) || 0);
        setDiscount(Number(quote.discount) || 0);
        setTotalAmount(Number(quote.total_amount) || 0);

        setCustomer(quote.customer_name || "");
        setCustomerId(quote.customer_id || null);

        setWorkOrder(quote.work_order_name || quote.work_order_number || quote.work_order || "");
        setWorkOrderId(quote.work_order_id || null);

        const fetchLineItems = async () => {
            try {
                // Fetch line items
                const response = await api.get<LineItemResponse[]>(`/quotes/${quote.id}/line_items`);

                // 🟢 CRT LOG: raw response
                console.log("CRT: Line Items Raw Response:", response);

                const items: LineItem[] = response.map((li: any) => ({
                    id: li.line_item_id, // ✅ use correct field
                    type: li.item_type,
                    name: li.item_name,
                    description: li.description,
                    qty: Number(li.quantity) || 0,
                    price: li.unit_price?.toString() || "0",
                    tax: Number(li.tax_rate) || 0,
                    discount: li.discount?.toString() || "0",
                }));


                // 🟢 CRT LOG: mapped items
                console.log("CRT: Mapped Line Items:", items);

                setLineItems(items);
            } catch (err) {
                console.error("CRT: Failed to fetch line items:", err);
                setLineItems([]);
            }
        };

        fetchLineItems();
    }, [quote]);





    useEffect(() => {
        const searchCustomers = async () => {
            if (customerSearchQuery.trim().length < 2) {
                setCustomerSearchResults([]);
                return;
            }

            try {
                const results = (await api.get("/accounts/search?q=" + customerSearchQuery)) as any[];
                setAllCustomerData(results);
                setCustomerSearchResults(results.map((r) => r.name));

            } catch (err) {
                console.error("Customer search error:", err);
            }
        };

        const debounce = setTimeout(searchCustomers, 300);
        return () => clearTimeout(debounce);
    }, [customerSearchQuery]);

    useEffect(() => {
        const searchWorkOrders = async () => {
            if (workOrderSearchQuery.trim().length < 1) {
                setWorkOrderSearchResults([]);
                return;
            }

            try {
                const response = await api.get("/work_order/search?q=" + workOrderSearchQuery);
                const results = response as any[];

                console.log("Work order search results:", results);

                setAllWorkOrderData(results);

                // 🔥 FIXED: use `name`
                setWorkOrderSearchResults(results.map((r) => r.name));

            } catch (err) {
                console.error("Work Order search error:", err);
            }
        };

        const debounce = setTimeout(searchWorkOrders, 300);
        return () => clearTimeout(debounce);
    }, [workOrderSearchQuery]);

    const formattedLineItems = lineItems.map((it: LineItem, index: number) => ({
        line_item_id: it.id, // instead of `id`
        item_type: it.type,
        item_name: it.name,
        description: it.description,
        quantity: it.qty,
        unit_price: Number(it.price) || 0,
        tax_rate: it.tax,
        discount: Number(it.discount) || 0,
        line_total: (it.qty * Number(it.price || 0)) - Number(it.discount || 0),
        sort_order: index + 1
    }));


    // ---------- SUBMIT HANDLER ----------
    const handleSubmit = async () => {
        try {
            // Recalculate line items to ensure latest changes
            const formattedLineItems = lineItems.map((it: LineItem, index: number) => ({
                line_item_id: it.id,
                item_type: it.type,
                item_name: it.name,
                description: it.description,
                quantity: it.qty,
                unit_price: Number(it.price) || 0,
                tax_rate: it.tax,
                discount: Number(it.discount) || 0,
                line_total: (it.qty * Number(it.price || 0)) - Number(it.discount || 0),
                sort_order: index + 1
            }));

            const payload = {
                customer_id: customerId || quote?.customer_id,
                work_order_id: workOrderId || quote?.work_order_id || null,
                status,
                currency,
                valid_until: validUntil,
                notes,
                subtotal,
                tax_amount: taxAmount,
                discount,
                total_amount: totalAmount,
                line_items: formattedLineItems,
            };

            console.log("CRT: Submitting payload:", JSON.stringify(payload, null, 2));

            let response;
            if (isEdit) {
                response = await api.put(`/quotes/${quote.id}`, payload);
                console.log("CRT: PUT response:", response);
            } else {
                response = await api.post(`/quotes`, payload);
                console.log("CRT: POST response:", response);
            }

            Alert.alert("Success", "Quote has been saved successfully!");
            navigation.goBack();
        } catch (err: any) {
            console.error("CRT: Submit Error full object:", err);
            if (err?.response?.data) {
                console.error("CRT: Submit Error response data:", err.response.data);
            }
            Alert.alert(
                "Error",
                err?.response?.data?.message || "Something went wrong. Please try again."
            );
        }
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
                    currentMode === "create"
                        ? "Create Quote"
                        : currentMode === "view"
                            ? "View Quote"
                            : "Edit Quote"
                }
                subtitle={
                    currentMode === "view"
                        ? "Viewing quote details"
                        : currentMode === "edit"
                            ? "Update quote details"
                            : "Add a new quote"
                }
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* TOP HEADER + EDIT BUTTON */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Quote Information</Text>

                    {isView && (
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => setCurrentMode("edit")}
                        >
                            <Ionicons name="pencil-outline" size={20} color="#fff" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* RELATIONSHIPS */}
                <Text style={styles.section}>Relationships</Text>

                <View style={styles.row}>
                    <View style={styles.fieldBox}>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.label}>Customer</Text>
                                <Text style={styles.readOnlyText}>{customer || "-"}   </Text>
                            </View>
                        ) : (
                            <SearchDropdown
                                label="Customer *"
                                placeholder="Search customer"
                                value={customer}
                                editable={!isView}
                                data={customerSearchResults}

                                onSearch={(q) => setCustomerSearchQuery(q)}
                                onSelect={(name) => {
                                    setCustomer(name);
                                    const selected = allCustomerData.find((c) => c.name === name);
                                    setCustomerId(selected?.id || null);
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.fieldBox}>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.label}>Work Order</Text>
                                <Text style={styles.readOnlyText}>{workOrder || "-"}   </Text>
                            </View>
                        ) : (
                            <SearchDropdown
                                label="Work Order"
                                placeholder="Search work order"
                                value={workOrder}
                                editable={!isView}
                                data={workOrderSearchResults}
                                onSearch={(q) => setWorkOrderSearchQuery(q)}
                                onSelect={(name) => {
                                    setWorkOrder(name);
                                    const selected = allWorkOrderData.find((w) => w.name === name);
                                    setWorkOrderId(selected?.id || null);
                                }}
                            />
                        )}

                    </View>
                </View>

                {/* QUOTE LINE ITEMS */}
                <QuoteLineItems
                    mode={currentMode}
                    items={lineItems}  // ✅ pass the prefilled data
                    onTotalsChange={(t: any) => {
                        setSubtotal(t.subtotal);
                        setTaxAmount(t.taxTotal);
                        setDiscount(t.discounts);
                        setTotalAmount(t.totalAmount);
                        setLineItems(t.lineItems);
                    }}
                />

                {/* BASIC INFO */}
                <Text style={styles.section}>Basic Information</Text>

                <View style={styles.row}>
                    <View style={styles.fieldBox}>
                        <Text style={styles.label}>Status</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{status || "-"}</Text>
                            </View>
                        ) : (
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={status}
                                    onValueChange={setStatus}
                                    style={styles.picker}
                                >
                                    {validStatuses.map((s) => (
                                        <Picker.Item label={s} value={s} key={s} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    </View>

                    <View style={styles.fieldBox}>
                        <Text style={styles.label}>Currency</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{currency || "-"}</Text>
                            </View>
                        ) : (
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={currency}
                                    onValueChange={setCurrency}
                                    style={styles.picker}
                                >
                                    {validCurrencies.map((c) => (
                                        <Picker.Item label={c} value={c} key={c} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    </View>

                </View>

                {/* FINANCIAL SUMMARY */}
                <Text style={styles.section}>Financial Summary</Text>

                <View style={styles.row}>
                    <View style={styles.fieldBox}>
                        <Text style={styles.label}>Subtotal</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{String(subtotal) || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                editable={!isView}
                                keyboardType="numeric"
                                value={String(subtotal)}
                                onChangeText={(v) => setSubtotal(Number(v) || 0)}
                                style={[styles.numInput, isView && styles.readOnly]}
                            />
                        )}
                    </View>

                    <View style={styles.fieldBox}>
                        <Text style={styles.label}>Tax Amount</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{String(taxAmount) || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                editable={!isView}
                                keyboardType="numeric"
                                value={String(taxAmount)}
                                onChangeText={(v) => setTaxAmount(Number(v) || 0)}
                                style={[styles.numInput, isView && styles.readOnly]}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.fieldBox}>
                        <Text style={styles.label}>Discount</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{String(discount) || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                editable={!isView}
                                keyboardType="numeric"
                                value={String(discount)}
                                onChangeText={(v) => setDiscount(Number(v) || 0)}
                                style={[styles.numInput, isView && styles.readOnly]}
                            />
                        )}
                    </View>

                    <View style={styles.fieldBox}>
                        <Text style={styles.label}>Total</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{String(totalAmount) || "-"}   </Text>
                            </View>
                        ) : (
                            <TextInput
                                editable={!isView}
                                keyboardType="numeric"
                                value={String(totalAmount)}
                                onChangeText={(v) => setTotalAmount(Number(v) || 0)}
                                style={[styles.numInput, isView && styles.readOnly]}
                            />
                        )}
                    </View>
                </View>

                {/* VALID UNTIL */}
                <Text style={styles.section}>Additional Information</Text>
                <Text style={styles.label}>Valid Until</Text>
                {isView ? (
                    <View style={styles.readOnlyView}>
                        <Text style={styles.readOnlyText}>
                            {validUntil
                                ? new Date(validUntil).toLocaleDateString("en-US")
                                : "-"}
                        </Text>

                    </View>
                ) : (
                    <TouchableOpacity
                        disabled={isView}
                        style={[styles.dateInputWrap, isView && styles.readOnly]}
                        onPress={() =>
                            DateTimePickerAndroid.open({
                                value: validUntil ? new Date(validUntil) : new Date(),
                                onChange: (_, date) => {
                                    if (date) {
                                        const formatted =
                                            `${(date.getMonth() + 1)
                                                .toString()
                                                .padStart(2, "0")}/${date
                                                    .getDate()
                                                    .toString()
                                                    .padStart(2, "0")}/${date.getFullYear()}`;
                                        setValidUntil(formatted);
                                    }
                                },
                                mode: "date",
                            })
                        }
                    >
                        <Text style={styles.dateInput}>
                            {validUntil || "mm/dd/yyyy"}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#6B6B78" />
                    </TouchableOpacity>
                )}
                {/* NOTES */}
                <Text style={styles.label}>Notes</Text>
                {isView ? (
                    <View style={styles.readOnlyView}>
                        <Text style={styles.readOnlyText}>{notes || "-"}   </Text>
                    </View>
                ) : (
                    <TextInput
                        editable={!isView}
                        multiline
                        style={[styles.notes, isView && styles.readOnly]}
                        value={notes}
                        onChangeText={setNotes}
                    />
                )}
                <Text style={styles.section}>System Information</Text>
                {isView && (
                    <View style={styles.systemInfo}>

                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Created by:</Text>
                                <Text style={styles.infoValue}>{quote?.created_by_name}</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Updated by:</Text>
                                <Text style={styles.infoValue}>{quote?.updated_by_name}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Created at:</Text>
                                <Text style={styles.infoValue}>{formatDate(quote?.created_at)}</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Updated at:</Text>
                                <Text style={styles.infoValue}>{formatDate(quote?.updated_at)}</Text>
                            </View>
                        </View>

                    </View>
                )}

                {/* BUTTONS */}
                {isView ? (
                    <View style={{ marginTop: 20 }}>
                        {/* Delete Button */}
                        <TouchableOpacity
                            style={[styles.cancelBtn, { backgroundColor: "#FF3B30" }]}
                            onPress={() => {
                                Alert.alert(
                                    "Confirm Delete",
                                    "Are you sure you want to delete this quote?",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Delete",
                                            style: "destructive",
                                            onPress: async () => {
                                                try {
                                                    await api.delete(`/quotes/${quote?.id}`);
                                                    Alert.alert("Deleted", "Quote has been deleted!");
                                                    navigation.goBack();
                                                } catch (err) {
                                                    console.error(err);
                                                    Alert.alert("Error", "Failed to delete quote.");
                                                }
                                            },
                                        },
                                    ]
                                );
                            }}
                        >
                            <Text style={styles.cancelBtnText}>Delete</Text>
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity style={styles.createBtn} onPress={handleSubmit}>
                            <Text style={styles.createBtnText}>
                                {isEdit ? "Update Quote" : "Create Quote"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default QuotesForm;

const PURPLE = "#6B46F6";

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        paddingBottom: 40,
    },

    title: {
        color: PURPLE,
        fontSize: 16,
        fontWeight: "700",

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
    section: {
        fontSize: 16,
        fontWeight: "700",
        color: "#4B4B4F",
        marginVertical: 10,
    },

    row: {
        flexDirection: "row",
        gap: 14,
        marginBottom: 12,
    },

    fieldBox: {
        flex: 1,
    },
    readOnly: {
        backgroundColor: "#F3F3F3",
        color: "#777",
    },
    label: {
        color: PURPLE,
        fontSize: 13,
        marginBottom: 6,
        fontWeight: "600",
    },

    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F7",
        borderWidth: 1,
        borderColor: "#E5E5ED",
        paddingHorizontal: 10,
        borderRadius: 5,
        height: 42,
    },

    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: "#111",
    },

    pickerWrapper: {
        backgroundColor: "#F5F5F7",
        borderWidth: 1,
        borderColor: "#E5E5ED",
        borderRadius: 5,
        height: 42,
        justifyContent: "center",
    },

    picker: {
        height: 60,
        color: "#111",
        fontSize: 14,
    },


    disabledField: {
        backgroundColor: "#EFEFF1",
    },

    disabledText: {
        color: "#9D9DA4",
    },

    numInput: {
        backgroundColor: "#F5F5F7",
        height: 42,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E5ED",
        paddingHorizontal: 12,
        fontSize: 14,
        color: "#111",
    },

    dateInputWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F7",
        borderWidth: 1,
        borderColor: "#E5E5ED",
        height: 44,
        borderRadius: 5,
        paddingHorizontal: 12,
        marginBottom: 12,
    },

    dateInput: {
        flex: 1,
        fontSize: 14,
        color: "#111",
    },

    notes: {
        height: 110,
        borderWidth: 1,
        borderColor: "#E5E5ED",
        backgroundColor: "#F5F5F7",
        borderRadius: 5,
        padding: 12,
        fontSize: 14,
        color: "#111",
        marginBottom: 20,
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

    createBtn: {
        height: 48,
        backgroundColor: PURPLE,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
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
    createBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    cancelBtn: {
        height: 48,
        backgroundColor: "#3C3C43",
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    cancelBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
