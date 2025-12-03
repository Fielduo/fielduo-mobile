import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "@/app/navigation/StackNavigator/AuthNavigator";
import { Ionicons } from "@expo/vector-icons";


type VerifyEmailNavProp = NativeStackNavigationProp<
    AuthStackParamList,
    "VerifyEmail"
>;

type VerifyEmailRouteProp = ReturnType<typeof useRoute> & {
    params: { email: string };
};

export default function VerificationCodeScreen() {
    const navigation = useNavigation<VerifyEmailNavProp>();
    const route = useRoute() as unknown as { params: { email: string } }; // ✅ fix here
    const { email } = route.params;

    const [otp, setOtp] = useState(["", "", "", ""]);
    const inputs = useRef<Array<TextInput | null>>([]);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (timer > 0) {
            const countdown = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(countdown);
        }
    }, [timer]);

    const handleChange = (text: string, index: number) => {
        if (text.length > 1) text = text.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleResend = () => {
        setTimer(30);
        // TODO: call resend API here
    };

    const handleConfirm = () => {
        const code = otp.join("");
        if (code.length === 4) {
            alert(`Code verified successfully`);
            navigation.navigate("ResetPassword", { email });
        } else {
            alert("Please enter the full 4-digit code");
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#7B3AF5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verification Code</Text>
                <View style={{ width: 22 }} />
            </View>

            <View style={styles.content}>
                <Image
                    source={require("../../assets/images/VerifyEmail.png")}
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Verify Email Address</Text>
                <Text style={styles.subtitle}>
                    Verification code sent to{" "}
                    <Text style={styles.email}>{email}</Text>
                </Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                inputs.current[index] = ref;
                            }}
                            style={styles.otpBox}
                            keyboardType="numeric"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                        />
                    ))}
                </View>

                <View style={styles.timerRow}>
                    <Text style={styles.timerText}>
                        {timer > 0 ? `00:${timer.toString().padStart(2, "0")}` : "00:00"}
                    </Text>
                    {timer === 0 ? (
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={styles.resendText}>Resend Code</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={[styles.resendText, { opacity: 0.4 }]}>
                            Resend Code
                        </Text>
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                <Text style={styles.buttonText}>Confirm Code</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 80,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#7B3AF5",
    },
    content: {
        alignItems: "center",
        flex: 1,
    },
    image: {
        width: 261,
        height: 221,
        marginBottom: 37,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#263238",
        marginBottom: 11,
    },
    subtitle: {
        fontSize: 12,
        color: "#263238",
        marginBottom: 25,
    },
    email: {
        color: "#7B3AF5",
        fontWeight: "500",
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "70%",
        marginBottom: 15,
    },
    otpBox: {
        width: 55,
        height: 55,
        borderWidth: 1.5,
        borderColor: "#00000080",
        borderRadius: 6,
        textAlign: "center",
        fontSize: 20,
        color: "#000",
    },
    timerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    timerText: {
        fontSize: 14,
        color: "#00000080",
    },
    resendText: {
        fontSize: 12,
        color: "#7B3AF5",
        fontWeight: "500",
    },
    button: {
        backgroundColor: "#7B3AF5",
        paddingVertical: 15,
        borderRadius: 6,
        alignItems: "center",
        marginBottom: 160,
    },
    buttonText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
    },
});
