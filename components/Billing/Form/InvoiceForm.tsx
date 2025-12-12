import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import FormHeader from '../../common/FormHeader';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';


// ✅ FIX — IMPORT InvoiceItem TYPE
import InvoiceLineItem, { InvoiceItem } from './InvoiceLineItem';

import SearchDropdown from '../../common/searchDropdown';
import { SearchMenuStackParamList } from '@/src/navigation/StackNavigator/SearchmenuNavigator';
import { api } from '@/src/api/cilent';
import { InvoiceService } from '@/src/api/auth';
import { Ionicons } from '@expo/vector-icons';


// ---------------- TYPES ----------------

type InvoiceFormState = {
    customer_id: string;
    customer_name: string;
    quote_id: string;
    quote: string;
    work_order_id: string
    workOrder: string;
    invoiceNumber: string;
    invoiceDate: Date | null;
    dueDate: Date | null;

    subtotal: string;
    taxAmount: string;
    discount: string;
    totalAmount: string;

    currency: string;
    status: string;
    paymentStatus: string;
    paymentDate: Date | null;
    paymentMethod: string;
    notes: string;
    created_by_name?: string;
    updated_by_name?: string;
    created_at?: string;
    updated_at?: string;
    line_items: InvoiceItem[];
};


const defaultState: InvoiceFormState = {
    customer_id: "",
    customer_name: "",
    quote_id: "",
    quote: "",
    work_order_id: "",
    workOrder: "",
    invoiceNumber: "INV-001",
    invoiceDate: null,
    dueDate: null,

    subtotal: "0",
    taxAmount: "0",
    discount: "0",
    totalAmount: "0",

    currency: "USD",
    status: "Draft",
    paymentStatus: "Pending",
    paymentDate: null,
    paymentMethod: "",
    notes: "",
    line_items: [],
};

type InvoiceResponse = {
    id: string;
    customer_id: string;
    customer_name?: string;
    quote_id?: string;
    quote?: string;
    quote_number?: string;        // ✅ ADD THIS

    work_order_id?: string;
    workOrder?: string;
    work_order_name?: string;  // ✅ ADD THIS
    invoice_number: string;
    invoice_date?: string;
    due_date?: string;
    subtotal?: number;
    tax_amount?: number;
    discount?: number;
    total_amount?: number;
    currency?: string;
    status?: string;
    payment_status?: string;
    payment_date?: string;
    payment_method?: string;
    notes?: string;
    created_by_name?: string;
    updated_by_name?: string;
    created_at?: string;
    updated_at?: string;
};

type LineItemResponse = {
    line_item_id: string | null;
    item_type: string;
    item_name: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    discount: number;
};


type InvoiceFormRouteProp = RouteProp<
    SearchMenuStackParamList,
    "InvoicesForm"
>;

// ---------------- COMPONENT ----------------

type Customer = {
    id: string;
    name: string;
    label?: string;
};
type Quote = {
    id: string;
    name: string;          // label to show in UI
    quote_number: string;  // optional
};

type WorkOrder = {
    id: string;
    name: string;              // label to show in UI
    work_order_number: string; // optional
};

export default function InvoicesForm() {
    const route = useRoute<InvoiceFormRouteProp>();
    const navigation = useNavigation();

    const { mode, data } = route.params ?? { mode: "create", data: null };

    const [screenMode, setScreenMode] = useState<"create" | "edit" | "view">(mode);

    const isView = screenMode === "view";
    const isEdit = screenMode === "edit";


    const [form, setForm] = useState<InvoiceFormState>(defaultState);
    const [customerMap, setCustomerMap] = useState<Customer[]>([]);
    const [customerResults, setCustomerResults] = useState<string[]>([]);

    const [quoteResults, setQuoteResults] = useState<string[]>([]);
    const [quoteMap, setQuoteMap] = useState<any[]>([]);

    const [workOrderResults, setWorkOrderResults] = useState<string[]>([]);
    const [workOrderMap, setWorkOrderMap] = useState<any[]>([]);

    const [showInvoiceDate, setShowInvoiceDate] = useState(false);
    const [showDueDate, setShowDueDate] = useState(false);
    const [showPaymentDate, setShowPaymentDate] = useState(false);

    const handleChange = (key: keyof InvoiceFormState, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const searchCustomers = async (q: string) => {
        if (!q.trim()) return setCustomerResults([]);

        try {
            const res: Customer[] = await api.get<Customer[]>(
                `/accounts/search?q=${encodeURIComponent(q)}`
            );

            const list = Array.isArray(res) ? res : [];

            setCustomerMap(list);                   // store full objects
            setCustomerResults(list.map(c => c.name)); // show names in dropdown

        } catch (err) {
            console.log("❌ Error searching customers:", err);
            setCustomerResults([]);
            setCustomerMap([]);
        }
    };

    const searchQuotes = async (q: string) => {
        if (!q.trim()) return setQuoteResults([]);

        try {
            const res = await api.get<Quote[]>(`/quotes/search?q=${encodeURIComponent(q)}`);

            const list = Array.isArray(res) ? res : [];

            setQuoteMap(list);                 // Full objects
            setQuoteResults(list.map(i => i.name)); // Only names for dropdown
        } catch (err) {
            console.log("❌ Quotes Search Error:", err);
            setQuoteResults([]);
        }
    };


    const searchWorkOrders = async (q: string) => {
        if (!q.trim()) return setWorkOrderResults([]);

        try {
            const res = await api.get<WorkOrder[]>(`/work_order/search?q=${encodeURIComponent(q)}`);

            const list = Array.isArray(res) ? res : [];

            setWorkOrderMap(list);
            setWorkOrderResults(list.map(i => i.name));
        } catch {
            setWorkOrderResults([]);
        }
    };


    const fetchInvoiceData = async (invoiceId: string) => {
        try {
            // 1️⃣ Fetch main invoice
            const invoice: InvoiceResponse = await api.get<InvoiceResponse>(
                `/invoices/${invoiceId}`
            );


            // 2️⃣ Fetch line items
            const lineItemsRes: LineItemResponse[] = await api.get<LineItemResponse[]>(
                `/invoices/${invoiceId}/line_items`
            );
            const lineItems: InvoiceItem[] = lineItemsRes.map((item: LineItemResponse) => ({
                line_item_id: item.line_item_id,
                type: item.item_type,
                name: item.item_name,
                description: item.description,
                qty: item.quantity.toString(),
                price: item.unit_price.toString(),
                tax: item.tax_rate.toString(),
                discount: item.discount.toString(),
            }));

            let quoteLabel = "";
            if (invoice.quote_id) {
                const quoteRes: Quote = await api.get(`/quotes/${invoice.quote_id}`);
                quoteLabel = quoteRes.quote_number; // e.g., "QT-00000011"
                setQuoteMap([{
                    id: quoteRes.id,
                    name: quoteRes.quote_number,
                    quote_number: quoteRes.quote_number
                }]);
            }

            // 2️⃣ Fetch the work order by ID
            let workOrderLabel = "";
            if (invoice.work_order_id) {
                const woRes: { success: boolean; work_order: WorkOrder } = await api.get(`/work_order/${invoice.work_order_id}`);
                // Access nested work_order
                const actualWO = woRes.work_order;

                workOrderLabel = actualWO.work_order_number || actualWO.id;

                setWorkOrderMap([{
                    id: actualWO.id,
                    name: workOrderLabel,           // display label in dropdown
                    work_order_number: actualWO.work_order_number || actualWO.id
                }]);

                setForm(prev => ({
                    ...prev,
                    work_order_id: actualWO.id,
                    workOrder: workOrderLabel,    // display "12" in UI
                }));
            }

            // 4️⃣ Update form state
            setForm({
                customer_id: invoice.customer_id,
                customer_name: invoice.customer_name || "",

                quote_id: invoice.quote_id || "",
                quote: quoteLabel || "",      // display correct quote number
                work_order_id: invoice.work_order_id || "",
                workOrder: workOrderLabel || "", // display correct work order number


                invoiceNumber: invoice.invoice_number,
                invoiceDate: invoice.invoice_date ? new Date(invoice.invoice_date) : null,
                dueDate: invoice.due_date ? new Date(invoice.due_date) : null,
                subtotal: invoice.subtotal?.toString() || "0",
                taxAmount: invoice.tax_amount?.toString() || "0",
                discount: invoice.discount?.toString() || "0",
                totalAmount: invoice.total_amount?.toString() || "0",
                currency: invoice.currency || "USD",
                status: invoice.status || "Draft",
                paymentStatus: invoice.payment_status || "Pending",
                paymentDate: invoice.payment_date ? new Date(invoice.payment_date) : null,
                paymentMethod: invoice.payment_method || "",
                notes: invoice.notes || "",
                line_items: lineItems,
                created_by_name: invoice.created_by_name || "",
                updated_by_name: invoice.updated_by_name || "",
                created_at: invoice.created_at || "",
                updated_at: invoice.updated_at || "",
            });
        } catch (err) {
            console.error("Error loading invoice:", err);
            alert("Failed to load invoice data");
        }
    };


    useEffect(() => {
        if (screenMode !== "create" && data?.id) {
            fetchInvoiceData(data.id);  // call your function here
        }
    }, [screenMode, data?.id]);

    // ---------------------------- TOTAL CALCULATION ----------------------------

    const updateFinancialFromItems = (items: InvoiceItem[]) => {
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        items.forEach((item) => {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            const discount = parseFloat(item.discount) || 0;
            const tax = parseFloat(item.tax) || 0;

            const lineSub = qty * price;
            const taxAmount = lineSub * (tax / 100);

            subtotal += lineSub;
            totalDiscount += discount;
            totalTax += taxAmount;
        });

        const total = subtotal - totalDiscount + totalTax;

        setForm(prev => ({
            ...prev,
            subtotal: subtotal.toFixed(2),
            discount: totalDiscount.toFixed(2),
            taxAmount: totalTax.toFixed(2),
            totalAmount: total.toFixed(2),
            line_items: items,  // <-- this should update line_items
        }));
    };

    // ---------------------------- BUTTON ACTIONS ----------------------------

    const buildPayload = () => {
        const payload = {
            customer_id: form.customer_id || null,
            quote_id: form.quote_id || null,
            work_order_id: form.work_order_id || null,
            invoice_number: form.invoiceNumber,
            invoice_date: form.invoiceDate?.toISOString().split("T")[0] || null,
            due_date: form.dueDate?.toISOString().split("T")[0] || null,
            subtotal: parseFloat(form.subtotal),
            tax_amount: parseFloat(form.taxAmount),
            discount: parseFloat(form.discount),
            total_amount: parseFloat(form.totalAmount),
            currency: form.currency,
            status: form.status,
            payment_status: form.paymentStatus,
            payment_date: form.paymentDate?.toISOString().split("T")[0] || null,
            payment_method: form.paymentMethod,
            notes: form.notes || null,

            line_items: form.line_items.map((i, idx) => ({
                line_item_id: i.line_item_id || null,
                item_type: i.type,
                item_name: i.name,
                description: i.description,
                quantity: parseFloat(i.qty) || 0,
                unit_price: parseFloat(i.price) || 0,
                tax_rate: parseFloat(i.tax) || 0,
                discount: parseFloat(i.discount) || 0,
                sort_order: idx + 1,
            }))

        };

        // 🔥 SAFE LOG (does NOT recursively call buildPayload)
        console.log("📦 FINAL PAYLOAD BEFORE UPDATE:", JSON.stringify(payload, null, 2));

        return payload;
    };



    const onCreate = async () => {
        try {
            const payload = buildPayload();

            const res = await InvoiceService.createInvoice(payload);
            alert("Invoice Created Successfully");
            console.log("CREATE RESPONSE:", res);

            navigation.goBack();
        } catch (err) {
            console.log("Create Error:", err);
            alert("Failed to create invoice");
        }
    };

    const onUpdate = async () => {
        try {

            const payload = buildPayload();

            const res = await InvoiceService.updateInvoice(data.id, payload);

            alert("Invoice Updated Successfully");
            console.log("UPDATE RESPONSE:", res);

            navigation.goBack();
        } catch (err) {
            console.log("Update Error:", err);
            alert("Failed to update invoice");
        }
    };

    // ---------------------------- UI ----------------------------
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
                    screenMode === "create"
                        ? "Create Invoice"
                        : screenMode === "edit"
                            ? "Edit Invoice"
                            : "View Invoice"
                }
                subtitle={
                    screenMode === "view"
                        ? "Viewing invoice"
                        : screenMode === "edit"
                            ? "Modify invoice"
                            : "Add new invoice"
                }
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.container}>

                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Invoice Information</Text>

                    {isView && (
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => setScreenMode("edit")}
                        >
                            <Ionicons name="pencil-outline" size={20} color="#fff" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* CUSTOMER + QUOTE */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.label}>Customer</Text>
                                <Text style={styles.readOnlyText}>{form.customer_name || "-"}</Text>
                            </View>
                        ) : (
                            <SearchDropdown
                                label="Customer"
                                placeholder="Search customer"
                                value={form.customer_name}       // show selected customer name
                                data={customerResults}           // only labels
                                editable={!isView}
                                onSearch={searchCustomers}
                                onSelect={(val) => {
                                    const selected = customerMap.find(c => c.name === val);
                                    handleChange("customer_id", selected?.id || null);  // store the ID
                                    handleChange("customer_name", selected?.name || ""); // store the label
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.col}>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.label}>Quote</Text>
                                <Text style={styles.readOnlyText}>{form.quote || "-"}</Text>
                            </View>
                        ) : (
                            <SearchDropdown
                                label="Quote"
                                placeholder="Search quote"
                                value={form.quote}
                                data={quoteResults}
                                editable={!isView}
                                onSearch={searchQuotes}
                                onSelect={(selectedName) => {
                                    const item = quoteMap.find(q => q.name === selectedName);
                                    if (item) {
                                        handleChange("quote", item.name);   // UI label
                                        handleChange("quote_id", item.id);  // DB ID
                                    }
                                }}
                            />
                        )}

                    </View>
                </View>

                {/* WORK ORDER + INVOICE NUMBER */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.label}>Work Order</Text>
                                <Text style={styles.readOnlyText}>{form.workOrder || "-"}</Text>
                            </View>
                        ) : (
                            <SearchDropdown
                                label="Work Order"
                                placeholder="Search work order"
                                value={form.workOrder}
                                data={workOrderResults}
                                editable={!isView}
                                onSearch={searchWorkOrders}
                                onSelect={(selectedName) => {
                                    const item = workOrderMap.find(w => w.name === selectedName);
                                    if (item) {
                                        handleChange("workOrder", item.name); // UI label
                                        handleChange("work_order_id", item.id); // DB id
                                    }
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Invoice Number</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{form.invoiceNumber || "-"}</Text>
                            </View>
                        ) : (
                            <TextInput
                                value={form.invoiceNumber}
                                onChangeText={t => handleChange('invoiceNumber', t)}
                                placeholder="INV-001"
                                editable={!isView}
                                style={styles.input}
                            />
                        )}
                    </View>
                </View>
                <View style={styles.row}>
                    {/* INVOICE DATE + DUE DATE */}
                    <View style={styles.col}>
                        <Text style={styles.label}>Invoice Date</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}> {form.invoiceDate?.toLocaleDateString() || "dd-mm-yyyy"}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => !isView && setShowInvoiceDate(true)}
                                style={styles.dateContainer}
                            >
                                <Text style={styles.dateText}>
                                    {form.invoiceDate?.toLocaleDateString() || "dd-mm-yyyy"}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => !isView && setShowInvoiceDate(true)}
                                    disabled={isView}
                                >
                                    <Ionicons name="calendar" size={22} color="#555" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                        {showInvoiceDate && (
                            <DateTimePicker
                                value={form.invoiceDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(_, d) => {
                                    setShowInvoiceDate(false);
                                    if (d) handleChange("invoiceDate", d);
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Due Date</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}> {form.dueDate?.toLocaleDateString() || "dd-mm-yyyy"}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => !isView && setShowDueDate(true)}
                                style={styles.dateContainer}
                            >
                                <Text style={styles.dateText}>
                                    {form.dueDate?.toLocaleDateString() || "dd-mm-yyyy"}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => !isView && setShowDueDate(true)}
                                    disabled={isView}
                                >
                                    <Ionicons name="calendar" size={22} color="#555" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                        {showDueDate && (
                            <DateTimePicker
                                value={form.dueDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(_, d) => {
                                    setShowDueDate(false);
                                    if (d) handleChange("dueDate", d);
                                }}
                            />
                        )}
                    </View>
                </View>

                {/* LINE ITEMS */}
                <InvoiceLineItem
                    items={form.line_items}
                    setItems={(items) => updateFinancialFromItems(items)}
                    mode={screenMode}
                />



                {/* FINANCIAL SUMMARY */}
                <Text style={styles.sectionTitle}>Financial Summary</Text>

                <View style={styles.rowWrap}>
                    {[
                        ["Subtotal", form.subtotal],
                        ["Tax Amount", form.taxAmount],
                        ["Discount", form.discount],
                        ["Total Amount", form.totalAmount],
                    ].map(([label, value]) => (
                        <View style={styles.smallCol} key={label}>
                            <Text style={styles.label}>{label}</Text>
                            {isView ? (
                                <View style={styles.readOnlyView}>
                                    <Text style={styles.readOnlyText}>{value || "-"}</Text>
                                </View>
                            ) : (
                                <TextInput
                                    value={value}
                                    editable={false}
                                    style={[styles.input, { backgroundColor: "#eee" }]}
                                />
                            )}
                        </View>
                    ))}

                </View>
                <View style={styles.row}>
                    <View style={styles.colFull}>
                        <Text style={styles.label}>Currency</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{form.currency || "-"}</Text>
                            </View>
                        ) : (
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={form.currency}
                                    onValueChange={v => handleChange('currency', v)}
                                    enabled={!isView}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="USD" value="USD" />
                                    <Picker.Item label="EUR" value="EUR" />
                                    <Picker.Item label="INR" value="INR" />
                                </Picker>
                            </View>
                        )}
                    </View>
                </View>

                {/* CURRENCY */}
                <Text style={styles.sectionTitle}>Payment</Text>

                {/* STATUS */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Status</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{form.status || "-"}</Text>
                            </View>
                        ) : (
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={form.status}
                                    onValueChange={v => handleChange('status', v)}
                                    enabled={!isView}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Draft" value="Draft" />
                                    <Picker.Item label="Sent" value="Sent" />
                                    <Picker.Item label="Paid" value="Paid" />
                                    <Picker.Item label="Overdue" value="Overdue" />
                                    <Picker.Item label="Cancelled" value="Cancelled" />
                                </Picker>
                            </View>
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Payment Status</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{form.paymentStatus || "-"}</Text>
                            </View>
                        ) : (
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={form.paymentStatus}
                                    onValueChange={v => handleChange('paymentStatus', v)}
                                    enabled={!isView}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Pending" value="Pending" />
                                    <Picker.Item label="Paid" value="Paid" />
                                    <Picker.Item label="Partial" value="Partial" />
                                    <Picker.Item label="Failed" value="Failed" />
                                </Picker>
                            </View>
                        )}
                    </View>

                </View>
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Payment Date</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}> {form.paymentDate?.toLocaleDateString() || "dd-mm-yyyy"}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => !isView && setShowPaymentDate(true)}
                                style={styles.dateContainer}
                            >
                                <Text style={styles.dateText}>
                                    {form.paymentDate?.toLocaleDateString() || "dd-mm-yyyy"}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => !isView && setShowPaymentDate(true)}
                                    disabled={isView}
                                >
                                    <Ionicons name="calendar" size={22} color="#555" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                        {showPaymentDate && (
                            <DateTimePicker
                                value={form.paymentDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(_, d) => {
                                    setShowPaymentDate(false);
                                    if (d) handleChange("paymentDate", d);
                                }}
                            />
                        )}
                    </View>


                    <View style={styles.col}>
                        <Text style={styles.label}>Payment Method</Text>
                        {isView ? (
                            <View style={styles.readOnlyView}>
                                <Text style={styles.readOnlyText}>{form.paymentMethod || "-"}</Text>
                            </View>
                        ) : (
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={form.paymentMethod}
                                    onValueChange={v => handleChange("paymentMethod", v)}
                                    enabled={!isView}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select payment method" value="" />
                                    <Picker.Item label="Cash" value="cash" />
                                    <Picker.Item label="Credit Card" value="credit_card" />
                                    <Picker.Item label="Debit Card" value="debit_card" />
                                    <Picker.Item label="Bank Transfer" value="bank_transfer" />
                                    <Picker.Item label="Check" value="check" />
                                    <Picker.Item label="Paypal" value="paypal" />
                                </Picker>
                            </View>
                        )}
                    </View>
                </View>

                {/* NOTES */}
                <Text style={styles.label}>Notes</Text>
                {isView ? (
                    <View style={styles.readOnlyView}>
                        <Text style={styles.readOnlyText}>{form.notes || "-"}</Text>
                    </View>
                ) : (
                    <TextInput
                        value={form.notes}
                        onChangeText={t => handleChange('notes', t)}
                        placeholder="Additional information..."
                        editable={!isView}
                        style={[styles.input, styles.textArea]}
                        multiline
                    />

                )}
                <Text style={styles.sectionTitle}>System Information</Text>
                {isView && (
                    <View style={styles.systemInfo}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Created by:</Text>
                                <Text style={styles.infoValue}>{form.updated_by_name}</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Updated by:</Text>
                                <Text style={styles.infoValue}>{form.updated_by_name}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Created at:</Text>
                                <Text style={styles.infoValue}>{formatDate(form.created_at)}</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Updated at:</Text>
                                <Text style={styles.infoValue}>{formatDate(form.updated_at)}</Text>
                            </View>
                        </View>
                    </View>
                )}


                {isView && (
                    <View style={styles.buttonColumn}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* BUTTONS */}
                {!isView && (
                    <View style={styles.buttonColumn}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={isEdit ? onUpdate : onCreate}
                        >

                            <Text style={styles.primaryButtonText}>
                                {isEdit ? "Update Invoice" : "Create Invoice"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        color: '#555',
        marginBottom: 8,
        fontWeight: '600',
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 45,
        backgroundColor: "#F1F5F9",
    },

    dateText: {
        fontSize: 14,
        color: "#333",
    },

    col: {
        flex: 1,
        marginRight: 8,
    },
    colFull: {
        flex: 1,
    },
    smallCol: {
        width: '48%',
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        color: '#6B46F6',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 6,
        backgroundColor: '#fafafa',
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

    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    pickerWrap: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#fafafa',
    },
    buttonColumn: {
        marginTop: 20,
    },

    primaryButton: {
        backgroundColor: "#6C5CE7",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },

    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    secondaryButton: {
        backgroundColor: "#E74C3C",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },

    secondaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
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



});
