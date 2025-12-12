import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";


export type InvoiceItem = {
    line_item_id: string | null;
    type: string;
    name: string;
    description: string;
    qty: string;
    price: string;
    tax: string;
    discount: string;
};

type Props = {
    items: InvoiceItem[];
    setItems: (items: InvoiceItem[]) => void;
    mode: "create" | "edit" | "view"; // 👈 MODE ADDED
};

export default function InvoiceLineItem({ items, setItems, mode }: Props) {

    const isView = mode === "view"; // 👈 CHECK VIEW MODE

    const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
        const updated = [...items];
        // Preserve existing line_item_id
        updated[index] = { ...updated[index], [field]: value, line_item_id: updated[index].line_item_id };
        setItems(updated);
    };
    const addItem = () => {
        if (isView) return;
        setItems([
            ...items,
            {
                type: "Service",
                name: "",
                description: "",
                qty: "1",
                price: "0",
                tax: "0",
                discount: "0",
                line_item_id: null, // <- ADD THIS explicitly
            },
        ]);
    };


    const removeItem = (index: number) => {
        if (isView) return;
        const updated = items.filter((_, i) => i !== index);
        setItems(updated);
    };

    const calculateSummary = () => {
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        items.forEach((item: InvoiceItem) => {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            const discount = parseFloat(item.discount) || 0;
            const tax = parseFloat(item.tax) || 0;

            const lineSubtotal = qty * price;
            const taxAmount = lineSubtotal * (tax / 100);

            subtotal += lineSubtotal;
            totalDiscount += discount;
            totalTax += taxAmount;
        });

        return {
            subtotal,
            discount: totalDiscount,
            tax: totalTax,
            total: subtotal - totalDiscount + totalTax,
        };
    };

    const summary = calculateSummary();

    return (
        <View style={{ marginTop: 20 }}>

            {/* HEADER ROW */}
            <View style={styles.headerRow}>
                <Text style={styles.headerText}>Invoice Line Items</Text>

                {/* ADD BUTTON ONLY IN EDIT/CREATE */}
                {!isView && (
                    <TouchableOpacity style={styles.addBtn} onPress={addItem}>
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addBtnText}>Add Item</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* LINE ITEMS */}
            {items.map((item: InvoiceItem, index: number) => (
                <View key={index} style={styles.card}>

                    {/* ================= ROW 1 ================= */}
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Type</Text>

                            <View style={[styles.pickerBox, isView && styles.disabledBox]}>
                                <Picker
                                    enabled={!isView}
                                    selectedValue={item.type}
                                    onValueChange={(v) => updateItem(index, "type", v)}
                                >
                                    <Picker.Item label="Service" value="service" />
                                    <Picker.Item label="Part" value="part" />
                                    <Picker.Item label="Labour" value="labour" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Item Name</Text>
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabledBox]}
                                value={item.name}
                                onChangeText={(v) => updateItem(index, "name", v)}
                            />
                        </View>
                    </View>

                    {/* ================= ROW 2 ================= */}
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabledBox]}
                                value={item.description}
                                onChangeText={(v) => updateItem(index, "description", v)}
                            />
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Qty</Text>
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabledBox]}
                                keyboardType="numeric"
                                value={item.qty}
                                onChangeText={(v) => updateItem(index, "qty", v)}
                            />
                        </View>
                    </View>

                    {/* ================= ROW 3 ================= */}
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Price</Text>
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabledBox]}
                                keyboardType="numeric"
                                value={item.price}
                                onChangeText={(v) => updateItem(index, "price", v)}
                            />
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Tax %</Text>
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabledBox]}
                                keyboardType="numeric"
                                value={item.tax}
                                onChangeText={(v) => updateItem(index, "tax", v)}
                            />
                        </View>
                    </View>

                    {/* ================= ROW 4 ================= */}
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Discount</Text>
                            <TextInput
                                editable={!isView}
                                style={[styles.input, isView && styles.disabledBox]}
                                keyboardType="numeric"
                                value={item.discount}
                                onChangeText={(v) => updateItem(index, "discount", v)}
                            />
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Line Total</Text>
                            <TextInput
                                editable={false}
                                style={[styles.input, { backgroundColor: "#eee" }]}
                                value={(
                                    parseFloat(item.qty) * parseFloat(item.price) -
                                    parseFloat(item.discount || "0") +
                                    (parseFloat(item.qty) * parseFloat(item.price)) *
                                    (parseFloat(item.tax) / 100)
                                ).toFixed(2)}
                            />
                        </View>
                    </View>

                    {/* REMOVE BUTTON (HIDDEN IN VIEW MODE) */}
                    {!isView && (
                        <View style={styles.row}>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(index)}>
                                <Ionicons name="trash" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                </View>
            ))}

            {/* ================= SUMMARY ================= */}
            <View style={styles.summaryGrid}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLine}>Subtotal: USD {summary.subtotal.toFixed(2)}</Text>
                    <Text style={styles.summaryLine}>Discount: USD {summary.discount.toFixed(2)}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLine}>Tax: USD {summary.tax.toFixed(2)}</Text>
                    <Text style={[styles.summaryLine, { fontWeight: "700", color: "#0047AB", textAlign: "right" }]}>
                        Total: USD {summary.total.toFixed(2)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerText: { fontSize: 17, fontWeight: "600" ,color: "#555"},

    addBtn: {
        flexDirection: "row",
        backgroundColor: "#6C5CE7",
        padding: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        alignItems: "center",
    },
    addBtnText: { color: "#fff", fontSize: 13, marginLeft: 5 },

    card: {
        backgroundColor: "#f9f9f9",
        padding: 12,
        marginTop: 12,
        borderRadius: 10,
        elevation: 2,
    },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    col: { flex: 1, marginRight: 10 },

    label: { fontSize: 12, marginBottom: 4, color: "#333" },
    input: {
        backgroundColor: "#fff",
        height: 40,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    disabledBox: {
        backgroundColor: "#f1f1f1",
        borderColor: "#ccc",
    },
    pickerBox: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        backgroundColor: "#fff",
        height: 40,
        justifyContent: "center",
    },

    removeBtn: {
        backgroundColor: "#E74C3C",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
    },

    summaryGrid: {
        marginTop: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
    summaryLine: { fontSize: 14, fontWeight: "600", flex: 1 ,color: "#555" },
});
