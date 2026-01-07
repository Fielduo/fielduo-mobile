import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { quoteService } from "@/src/api/auth";
import { Ionicons } from "@expo/vector-icons";

type NavProp = NativeStackNavigationProp<SearchMenuStackParamList, "Quotes">;

const Quotes: React.FC = () => {
    const navigation = useNavigation<NavProp>();
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    type ViewMode = "all" | "recent";
    const [viewMode, setViewMode] = useState<ViewMode>("all");
    const [recentQuoteIds, setRecentQuoteIds] = useState<string[]>([]);
    const [searchText, setSearchText] = useState("");

    // --- Fetch quotes ---
    useEffect(() => {
        const loadQuotes = async () => {
            try {
                setLoading(true);
                const res = await quoteService.getQuotes();
                if (res.success) setQuotes(res.quotes);
            } catch (err) {
                console.log("Quotes Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadQuotes();
    }, []);

    // --- Format date ---
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("en-IN");
    };

    // --- Handle quote press ---
    const handleQuotePress = (quote: any) => {
        setRecentQuoteIds((prev) => {
            const filtered = prev.filter((id) => id !== quote.id);
            return [quote.id, ...filtered].slice(0, 10);
        });

        navigation.navigate("QuotesForm", { mode: "view", quote });
    };

    // --- Filter quotes by search text & recent ---
    const filteredQuotes = useMemo(() => {
        return quotes.filter((q) => {
            const text = searchText.toLowerCase();

            if (viewMode === "recent" && !recentQuoteIds.includes(q.id)) return false;

            return (
                q.quote_number?.toLowerCase().includes(text) ||
                q.customer_name?.toLowerCase().includes(text) ||
                q.status?.toLowerCase().includes(text) ||
                q.work_order_number?.toLowerCase().includes(text) ||
                q.currency?.toLowerCase().includes(text) ||
                String(q.total_amount)?.includes(text) ||
                formatDate(q.valid_until).includes(text)
            );
        });
    }, [quotes, searchText, viewMode, recentQuoteIds]);

    return (
        <View style={{ flex: 1, backgroundColor: "#FFF" }}>
            <Header />

            {/* Header with direct search */}
            <HeaderSection
                title="What services do you need?"
                buttonText="+ New Quotes"
                onButtonClick={() => navigation.navigate("QuotesForm", { mode: "create" })}
                searchValue={searchText}
                onSearchChange={setSearchText}
            />

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>BILLING</Text>
                        <Text style={styles.title}>Quotes</Text>
                        <Text style={styles.subtitle}>{quotes.length} items</Text>
                    </View>
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

                {/* Quotes List */}
                {loading ? (
                    <ActivityIndicator size="large" color="#000" />
                ) : (
                    <ScrollView>
                        {filteredQuotes.map((quote) => (
                            <TouchableOpacity
                                key={quote.id}
                                onPress={() => handleQuotePress(quote)}
                            >
                                <View style={styles.card}>
                                    <View style={styles.cardInner}>
                                        {/* Column 1 */}
                                        <View style={styles.col}>
                                            <Text style={styles.colLabel}>Quote Number</Text>
                                            <Text style={styles.colValue}>{quote.quote_number}</Text>

                                            <Text style={[styles.colLabel, { marginTop: 14 }]}>Status</Text>
                                            <View style={styles.statusPill}>
                                                <Text style={styles.statusText}>{quote.status}</Text>
                                            </View>

                                            <Text style={[styles.colLabel, { marginTop: 14 }]}>Valid Until</Text>
                                            <Text style={styles.colValue}>
                                                {quote.valid_until ? formatDate(quote.valid_until) : "-"}
                                            </Text>
                                        </View>

                                        {/* Column 2 */}
                                        <View style={styles.vDivider} />
                                        <View style={styles.col}>
                                            <Text style={styles.colLabel}>Customer</Text>
                                            <Text style={styles.colValue}>{quote.customer_name}</Text>

                                            <Text style={[styles.colLabel, { marginTop: 14 }]}>Total Amount</Text>
                                            <Text style={styles.amountText}>
                                                {quote.currency} {Number(quote.total_amount || 0).toFixed(2)}
                                            </Text>
                                        </View>

                                        {/* Column 3 */}
                                        <View style={styles.vDivider} />
                                        <View style={styles.col}>
                                            <Text style={styles.colLabel}>Work Order</Text>
                                            <Text style={styles.colValue}>{quote.work_order_number}</Text>

                                            <Text style={[styles.colLabel, { marginTop: 14 }]}>Currency</Text>
                                            <Text style={styles.colValue}>{quote.currency}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

export default Quotes;


const PURPLE = "#6B46F6"; // label color
const MUTED = "#6B6B78";
const LIGHT_GREY = "#F5F5F7";
const CARD_BORDER = "#545454";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,

    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
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

    sectionHeader: {

        paddingTop: 10,
        backgroundColor: "#FFF",
    },
    dropdownText: {
        color: "#212121",
        fontSize: 13,
        fontWeight: "500",
    },
    sectionLabel: {
        color: PURPLE,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        lineHeight: 30,
    },
    subtitle: {
        fontSize: 10,
        color: "#535351CC",
        marginBottom: 8,

    },
    recentBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: CARD_BORDER,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    recentText: {
        marginRight: 6,
        color: PURPLE,
        fontSize: 10,
        fontWeight: "600",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: CARD_BORDER,
        // shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        // elevation (Android)
        elevation: 3,
        padding: 20,
        marginBottom: 20,

    },
    cardInner: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    col: {
        width: "30%",
    },
    colLabel: {
        color: PURPLE,
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 6,
    },
    colValue: {
        color: "#111827",
        fontSize: 12,
        fontWeight: "600",
    },

    vDivider: {
        width: 1,
        backgroundColor: "#D9D9D9",
        marginHorizontal: 14,
        alignSelf: "stretch",
        borderRadius: 1,
    },

    statusPill: {
        marginTop: 4,
        alignSelf: "flex-start",
        backgroundColor: "#F1F1F3",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#4B4B4F",
    },

    amountBadge: {
        marginTop: 6,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: "#C6F0E8",
        backgroundColor: "#F6FFFB",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    amountText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#006B5A",
    },
});
