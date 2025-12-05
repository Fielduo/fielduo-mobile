import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { useAuthStore } from "../../store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons } from "@expo/vector-icons";
import { AuthStackParamList } from "@/src/navigation/StackNavigator/AuthNavigator";
import { login } from "@/src/api/auth";

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const route = useRoute();
  const { from } = (route.params as { from?: string }) || {};

  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Enter email & password");
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      const { user, tokens } = data;

      if (!user) {
        return Alert.alert("Login failed", "User data not found");
      }

      // Store user in Zustand
      setUser(user);

      // Save token if available
      if (tokens?.access) {
        await AsyncStorage.setItem("authToken", tokens.access);
      }

      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          // onPress: () => {
          //   // Navigate after login
          //   if (from) navigation.navigate(from as keyof AuthStackParamList);
          //   else navigation.navigate("Home" as keyof AuthStackParamList); // replace with your main screen
          // },
        },
      ]);
    } catch (err: any) {
      console.log("Login error:", err);
      Alert.alert("Login failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
<KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 25, paddingBottom: 80 }}
      keyboardShouldPersistTaps="handled"
    >
     
        {/* ===== Logo Section ===== */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.signInTitle}>SIGNIN</Text>
        <Text style={styles.signInSubtitle}>
          Sign in to continue to your account
        </Text>

        {/* ===== Illustration ===== */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/login.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.welcomeText}>Welcome Back</Text>

        {/* ===== Email Input ===== */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#6234E2" style={styles.icon} />
          <TextInput
            placeholder="Enter email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            style={styles.textInput}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* ===== Password Input ===== */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#6234E2" style={styles.icon} />
          <TextInput
            placeholder="Enter Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.textInput}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#6234E2"
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.forgotContainer}
          onPress={() => navigation.navigate("ForgetPassword" as never)}
        >
          <Text style={styles.forgotText}>Forget Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.signInText}>
            {loading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup" as never)}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginTop: 80,
    marginBottom:30,
    
  },
  logo: {
    width: 86,
    height: 56,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,

  },
  illustration: {
    width: 280,
    height: 217,
  },
  signInTitle: {
    fontSize: 20,
    color: "#6234E2",
    fontWeight: "800",
    textAlign: "center",
  },
  signInSubtitle: {
    fontSize: 12,
    color: "#263238",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#263238",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 35,
  },
  label: {
    fontSize: 12,
    color: "#263238CC",
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00000080",
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#263238",
  },
  forgotContainer: {
    alignItems: "flex-end",
    marginTop: 5,
  },
  forgotText: {
    color: "#6234E2",
    fontSize: 12,
    fontWeight: "600",
  },
  signInButton: {
    backgroundColor: "#6234E2",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 40,
  },
  signInText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  bottomText: {
    color: "#333",
    fontSize: 14,
  },
  signupText: {
    color: "#6234E2",
    fontWeight: "600",
    fontSize: 14,
  },
});
