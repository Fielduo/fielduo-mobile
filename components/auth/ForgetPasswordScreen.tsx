import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthStackParamList } from "@/app/navigation/StackNavigator/AuthNavigator";


type ForgetPasswordNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  "ForgetPassword"
>;

const ForgetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const navigation = useNavigation<ForgetPasswordNavProp>();

  const handleConfirmMail = () => {
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }
    alert(`Confirmation mail sent to ${email}`);
    navigation.navigate("VerifyEmail", { email });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#6A0DAD" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Forget Password</Text>
          </View>

          {/* Illustration */}
          <Image
            source={require("../../assets/images/ForgotPassword.png")}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>Forget Password?</Text>
          <Text style={styles.subtitle}>
            Please write your email to receive a confirmation code to set a new
            password
          </Text>

          {/* Email Input */}
          <View style={{ width: "100%", marginTop: 20 }}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6A0DAD" />
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={handleConfirmMail}>
            <Text style={styles.buttonText}>Confirm mail</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    left: 0,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6234E2",
    textAlign: "center",
  },
  image: {
    width: 309,
    height: 309,
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6234E2",
    marginTop: 16,
  },
  subtitle: {
    textAlign: "center",
    color: "",
    fontSize: 12,
    marginVertical: 10,
    paddingHorizontal: 50,
  },
  label: {
    color: "#263238CC",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00000080",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 45,
    width: "100%",
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#263238",
  },
  button: {
    backgroundColor: "#6234E2",
    width: "100%",
    height: 50,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 18,
  },
});
