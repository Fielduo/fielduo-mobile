import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { CountryPicker, CountryItem } from "react-native-country-codes-picker";
import { signup } from "@/app/api/auth";
import { Ionicons } from "@expo/vector-icons";


export default function Signup() {
    const navigation = useNavigation();
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phonenumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Country picker
    const [callingCode, setCallingCode] = useState("91");
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState("🇮🇳");

    const handleSignup = async () => {
        if (
            !firstname ||
            !lastname ||
            !email ||
            !phonenumber ||
            !password ||
            !confirmPassword
        ) {
            Alert.alert("Error", "All fields are required.");
            return;
        }

        try {
            setLoading(true);
            const response = await signup({
                firstname,
                lastname,
                email,
                phonenumber,
                password,
                confirmPassword,
                countryCode: `+${callingCode}`,
            });

            if (response.success) {
                Alert.alert("Success", "Signup completed successfully!");
                navigation.navigate("Login" as never);
            } else {
                Alert.alert("Error", response.message || "Signup failed");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.container}>
                {/* ====== Logo Section ====== */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../../assets/images/Logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* ====== Title Section ====== */}
                <Text style={styles.signupTitle}>SIGNUP</Text>
                <Text style={styles.subtitle}>Create Account</Text>
                <Text style={styles.desc}>Join us and get started today</Text>

                {/* ====== Input Fields ====== */}
                <View style={styles.form}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={18} color="#6234E2" />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your first name"
                            placeholderTextColor="#10131899"
                            value={firstname}
                            onChangeText={setFirstname}
                        />
                    </View>

                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={18} color="#6234E2" />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your last name"
                            placeholderTextColor="#10131899"
                            value={lastname}
                            onChangeText={setLastname}
                        />
                    </View>

                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={18} color="#6234E2" />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            placeholderTextColor="#10131899"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* ====== Phone ====== */}
                    <Text style={styles.label}>Phone</Text>

                    <View style={styles.inputWrapper}>

                        <TouchableOpacity onPress={() => setShowCountryPicker(true)}>
                            <Text style={styles.callingCode}>+{callingCode}</Text>
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                            placeholderTextColor="#10131899"
                            value={phonenumber}
                            onChangeText={setPhoneNumber}
                        />
                        <Text style={styles.flag}>{selectedFlag}</Text>
                    </View>
                    <CountryPicker
                        show={showCountryPicker}
                        lang="en"
                        pickerButtonOnPress={(country: CountryItem) => {
                            setCallingCode(country.dial_code.replace("+", ""));
                            setSelectedFlag(country.flag); // ✅ Set flag emoji
                            setShowCountryPicker(false);
                        }}
                        onBackdropPress={() => setShowCountryPicker(false)}
                    />
                    {/* ====== Passwords ====== */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={18} color="#6234E2" />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            secureTextEntry
                            placeholderTextColor="#10131899"
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={18} color="#6234E2" />
                        <TextInput
                            style={styles.input}
                            placeholder="Re-enter your password"
                            secureTextEntry
                            placeholderTextColor="#10131899"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    {/* ====== Checkbox ====== */}
                    <View style={styles.checkboxRow}>
                        <TouchableOpacity onPress={() => setChecked(!checked)}>
                            <View style={[styles.checkbox, checked && styles.checkedBox]}>
                                {checked && <Ionicons name="checkmark" color="#fff" size={14} />}
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.checkboxText}>
                            I agree with your <Text style={styles.linkText}>Terms & Conditions</Text>
                        </Text>
                    </View>

                    {/* ====== Submit ====== */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Get Started</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
                            <Text style={styles.linkText}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        paddingHorizontal: 25,
    },
    logoContainer: { alignItems: "center", marginTop: 60 },
    logo: { width: 86, height: 56 },
    signupTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#6234E2",
        textAlign: "center",
        marginTop: 25,
    },
    subtitle: {
        textAlign: "center",
        color: "#263238",
        marginTop: 12,
        fontSize: 16,
        fontWeight: "600",
    },
    desc: {
        textAlign: "center",
        color: "#263238",
        fontSize: 12,
        fontWeight: "500",
        marginTop: 6,
    },
    form: { marginTop: 20 },
    label: { color: "#263238", fontSize: 12, marginBottom: 8, fontWeight: "600" },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#B0B0B0",
        borderRadius: 6,
        paddingHorizontal: 12,
        marginBottom: 14,
        backgroundColor: "#fff",
        height: 36,
    },
    input: {
        flex: 1,
        fontSize: 11,
        color: "#101318",
        paddingVertical: 0,
        marginLeft: 8,
    },
    callingCode: {
        fontSize: 14,
        color: "#101318",
        marginRight: 6,
        fontWeight: "500",
    },
    flag: {
        fontSize: 20,
        marginRight: 6,
    },

    checkboxRow: { flexDirection: "row", alignItems: "center" },
    checkbox: {
        width: 13,
        height: 13,
        borderWidth: 1,
        borderColor: "#6234E2",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    checkedBox: { backgroundColor: "#6234E2" },
    checkboxText: { color: "#101318" },
    linkText: { color: "#6234E2", fontWeight: "600" },
    button: {
        backgroundColor: "#6234E2",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 40,
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
    footerText: { color: "#101318", fontSize: 14 },
});
