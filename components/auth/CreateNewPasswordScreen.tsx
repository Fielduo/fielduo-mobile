// components/auth/CreateNewPasswordScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function CreateNewPasswordScreen() {
    const navigation = useNavigation();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const passwordRegex = /^[a-zA-Z0-9]{8,20}$/; // backend constraint: alphanumeric 8-20

    const handleSave = async () => {
        // basic validations
        if (!password || !confirmPassword) {
            Alert.alert("Error", "Please fill both password fields.");
            return;
        }

        if (!passwordRegex.test(password)) {
            Alert.alert(
                "Invalid password",
                "Password must be alphanumeric and 8–20 characters long."
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Mismatch", "Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // Simulate success after 2 seconds
            setTimeout(() => {
                setLoading(false);
                Alert.alert("Success", "Password updated successfully.", [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("Login" as never),
                    },
                ]);
            }, 2000); // ✅ add duration
        } catch (err: any) {
            setLoading(false);
            Alert.alert("Error", err.message || "Failed to update password.");
        }

    };
        return (
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                        {/* Header */}
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back" size={22} color="#6B4EFF" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Create New Password</Text>
                            <View style={{ width: 22 }} />
                        </View>

                        {/* Body */}
                        <View style={styles.body}>
                            <Text style={styles.heading}>Forget Password?</Text>
                            <Text style={styles.note}>
                                Your New Password must be different from previously used password
                            </Text>

                            {/* Password */}
                            <Text style={styles.fieldLabel}>Password</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.leftIcon}>
                                    <Ionicons name="lock-closed-outline" size={18} color="#6234E2" />
                                </View>
                                <TextInput
                                    placeholder="Enter password"
                                    placeholderTextColor="#999"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    style={styles.input}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.rightIcon}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#666" />
                                </TouchableOpacity>
                            </View>

                            {/* Confirm Password */}
                            <Text style={[styles.fieldLabel, { marginTop: 30 }]}>Confirm Password</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.leftIcon}>
                                    <Ionicons name="lock-closed-outline" size={18} color="#6234E2" />
                                </View>
                                <TextInput
                                    placeholder="Enter confirm password"
                                    placeholderTextColor="#999"
                                    secureTextEntry={!showConfirm}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    style={styles.input}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.rightIcon}>
                                    <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color="#666" />
                                </TouchableOpacity>
                            </View>

                            {/* Save Button */}
                            <TouchableOpacity
                                style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                <Text style={styles.saveBtnText}>{loading ? "Saving..." : "Save"}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    const styles = StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: "#FFF" },
        container: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 50,
            
        },
        headerRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 30,
        },
        headerTitle: {
            fontSize: 18,
            color: "#6234E2",
            fontWeight: "700",
        },

        body: {
            marginTop: 6,
            paddingHorizontal: 2,
        },
        heading: {
            fontSize: 18,
            fontWeight: "700",
            color: "#263238",
            marginBottom: 12,
        },
        note: {
            color: "#263238",
            fontSize: 12,
            marginBottom: 20,
            fontWeight: "600",
        },

        fieldLabel: {
            fontSize: 12,
            color: "#263238CC",
            marginBottom: 10,
            fontWeight: "600",
        },

        inputRow: {
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000080",
            borderRadius: 6,
            height: 45,
            backgroundColor: "#fff",
            overflow: "hidden",
        },
        leftIcon: {
            width: 48,
            alignItems: "center",
            justifyContent: "center",
            borderRightWidth: 0,
        },
        input: {
            flex: 1,
            paddingHorizontal: 10,
            fontSize: 14,
            fontWeight: "600",
            color: "#263238",
        },
        rightIcon: {
            width: 48,
            alignItems: "center",
            justifyContent: "center",
        },

        saveBtn: {
            marginTop: 295,
            backgroundColor: "#6234E2",
            borderRadius: 6,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#6234E2",
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 2,
        },
        saveBtnText: {
            color: "#fff",
            fontWeight: "700",
            fontSize: 20,
        },
    });
