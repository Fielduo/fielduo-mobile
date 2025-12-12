import React, { useState, useMemo, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const DEFAULT_TAXES = [
    { label: "0%", value: 0 },
    { label: "5%", value: 5 },
    { label: "12%", value: 12 },
    { label: "18%", value: 18 },
    { label: "28%", value: 28 },
];

const DEFAULT_TYPES = [
    { label: "Service", value: "service" },
    { label: "Part", value: "part" },
    { label: "Labour", value: "labour" },
];

interface TotalsType {
    subtotal: number;
    taxTotal: number;
    discounts: number;
    totalAmount: number;
}

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

type QuoteLineItemsProps = {
    mode: "create" | "edit" | "view";
    items?: LineItem[];
    onChange?: (items: LineItem[]) => void;
    onTotalsChange: (totals: TotalsType & { lineItems?: LineItem[] }) => void;
};

export default function QuoteLineItems({
    mode,
    items: externalItems,
    onChange,
    onTotalsChange
}: QuoteLineItemsProps) {

    const isView = mode === "view";
    const isEdit = mode === "edit";
    const isCreate = mode === "create";

    const canEdit = isEdit || isCreate;

    const [items, setItems] = useState<LineItem[]>([
        {
            id: Date.now().toString(),
            type: "service",
            name: "",
            description: "",
            qty: 1,
            price: "",
            tax: 18,
            discount: "",
        },
    ]);
    useEffect(() => {
        if (externalItems && externalItems.length > 0) {
            setItems(externalItems);
        }
    }, [externalItems]);

    const updateItem = (id: string, changes: Partial<LineItem>) => {
        if (!canEdit) return;
        setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, ...changes } : it))
        );
    };

    const totals = useMemo(() => {
        let subtotal = 0, taxTotal = 0, discounts = 0;

        items.forEach((it) => {
            const q = Number(it.qty) || 0;
            const p = Number(it.price) || 0;
            const d = Number(it.discount) || 0;

            const base = q * p;
            subtotal += base;
            discounts += d;

            const afterDiscount = Math.max(0, base - d);
            taxTotal += (afterDiscount * Number(it.tax)) / 100;
        });

        return {
            subtotal,
            taxTotal,
            discounts,
            totalAmount: subtotal - discounts + taxTotal,
        };
    }, [items]);


    useEffect(() => {
        onTotalsChange({
            ...totals,
            lineItems: items      // 👈 VERY IMPORTANT
        });
    }, [items]);


    return (
        <View>
            <Text style={styles.header}>Quote Line Items</Text>

            {items.map((it) => (
                <View key={it.id} style={styles.lineBox}>
                    {/* Row 1 */}
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.pickerBox}>
                                <Picker
                                    enabled={canEdit}
                                    selectedValue={it.type}
                                    onValueChange={(v) => updateItem(it.id, { type: v })}
                                >
                                    {DEFAULT_TYPES.map((t) => (
                                        <Picker.Item key={t.value} label={t.label} value={t.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Item Name</Text>
                            <TextInput
                                editable={canEdit}
                                style={styles.input}
                                value={it.name}
                                placeholder="Item name"
                                onChangeText={(v) => updateItem(it.id, { name: v })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                editable={canEdit}
                                style={[styles.input, { height: 45 }]}
                                value={it.description}
                                onChangeText={(v) => updateItem(it.id, { description: v })}
                            />
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Qty</Text>
                            <View style={styles.qtyContainer}>
                                {/* Decrease Button */}
                                <TouchableOpacity
                                    disabled={!canEdit}
                                    style={styles.qtyButton}
                                    onPress={() => updateItem(it.id, { qty: Math.max(1, it.qty - 1) })}
                                >
                                    <Text style={styles.qtyButtonText}>-</Text>
                                </TouchableOpacity>

                                {/* Number Input */}
                                <TextInput
                                    editable={canEdit}
                                    style={styles.qtyInput}
                                    keyboardType="number-pad"
                                    value={String(it.qty)}
                                    onChangeText={(v) => {
                                        const num = v.replace(/[^0-9]/g, "");
                                        updateItem(it.id, { qty: parseInt(num || "1") });
                                    }}
                                />

                                {/* Increase Button */}
                                <TouchableOpacity
                                    disabled={!canEdit}
                                    style={styles.qtyButton}
                                    onPress={() => updateItem(it.id, { qty: it.qty + 1 })}
                                >
                                    <Text style={styles.qtyButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>


                        </View>
                    </View>

                    {/* Row 3 */}
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Price</Text>
                            
                            <TextInput
                                editable={canEdit}
                                style={styles.input}
                                keyboardType="decimal-pad"
                                value={String(it.price)}
                                onChangeText={(v) => updateItem(it.id, { price: v })}
                            />
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Tax</Text>
                            <View style={styles.pickerBox}>
                                <Picker
                                    enabled={canEdit}
                                    selectedValue={it.tax}
                                    onValueChange={(v) => updateItem(it.id, { tax: v })}
                                >
                                    {DEFAULT_TAXES.map((t) => (
                                        <Picker.Item key={t.value} label={t.label} value={t.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {/* Row 4 */}
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Discount</Text>
                            <TextInput
                                editable={canEdit}
                                style={styles.input}
                                keyboardType="decimal-pad"
                                value={String(it.discount)}
                                onChangeText={(v) => updateItem(it.id, { discount: v })}
                            />
                        </View>

                        {canEdit && (
                            <View style={[styles.col, { alignItems: "flex-end" }]}>
                                <TouchableOpacity
                                    style={styles.removeBtn}
                                    onPress={() =>
                                        setItems((prev) =>
                                            prev.length > 1
                                                ? prev.filter((x) => x.id !== it.id)
                                                : prev
                                        )
                                    }
                                >
                                    <Text style={styles.removeText}>X</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </View>
            ))}

            {/* ---- TOTALS SECTION ---- */}
            <View style={styles.totalsContainer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalValue}>USD {totals.subtotal.toFixed(2)}</Text>
                </View>

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tax Total:</Text>
                    <Text style={styles.totalValue}>USD {totals.taxTotal.toFixed(2)}</Text>
                </View>

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Discounts:</Text>
                    <Text style={styles.totalValue}>{totals.discounts.toFixed(2)}</Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.totalRow}>
                    <Text style={styles.totalAmountLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmountValue}>USD {totals.totalAmount.toFixed(2)}</Text>
                </View>
            </View>

            {canEdit && (
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() =>
                        setItems((prev) => [
                            ...prev,
                            {
                                id: Date.now().toString(),
                                type: "service",
                                name: "",
                                description: "",
                                qty: 1,
                                price: "",
                                tax: 18,
                                discount: "",
                            },
                        ])
                    }
                >
                    <Text style={styles.addBtnText}>+ Add Item</Text>
                </TouchableOpacity>
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    header: { fontSize: 16, fontWeight: "700", marginBottom: 10 },

    lineBox: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
    },

    row: { flexDirection: "row" },

    col: { flex: 1, marginHorizontal: 4 },

    label: { color: "#6234E2", marginBottom: 8, fontWeight: "600" },

    input: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 5,
        height: 40,
        paddingHorizontal: 8,
        marginBottom: 8,
    },

    pickerBox: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 5,
        height: 40,
        justifyContent: "center",
        overflow: "hidden",
    },

    removeBtn: {
        borderWidth: 1,
        borderColor: "red",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 5,
        marginTop: 10,
    },

    removeText: { color: "red", fontWeight: "700" },

    addBtn: {
        borderWidth: 1,
        borderColor: "#DDD",
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },

    qtyContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        overflow: "hidden",
        width: 160,
        height: 45,
    },
    qtyButton: {
        width: 50,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#eee",
    },
    qtyButtonText: {
        fontSize: 22,
        fontWeight: "bold",
    },
    qtyInput: {
        flex: 2,
        textAlign: "center",
        fontSize: 18,
    },


    addBtnText: { fontWeight: "700" },
    totalsContainer: {
        backgroundColor: "#F9FAFB",
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#EEE",
    },

    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4,
    },

    totalLabel: {
        fontSize: 14,
        color: "#000",
    },

    totalValue: {
        fontSize: 14,
        color: "#000",
    },

    separator: {
        marginVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#E5E7EB",
    },

    totalAmountLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0C1D5A",
    },

    totalAmountValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0C1D5A",
    },

});
