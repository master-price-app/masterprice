import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { auth } from "../../services/firebaseSetup";
import { useAuth } from "../../contexts/AuthContext";
import PressableButton from "../../components/PressableButton";

export default function LoginScreen({ navigation, route }) {
  const returnScreen = route.params?.returnScreen;
  const returnParams = route.params?.returnParams;
  const isGoBack = route.params?.isGoBack;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const { loading } = useAuth();

  const handleLogin = async () => {
    // Validation
    if (email.length === 0 || password.length === 0) {
      Alert.alert("Error", "All fields should be provided");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Logged in user:", userCredential.user.uid);

      // Handle navigation after successful login
      if (returnScreen) {
        // Navigate back to the intended screen
        navigation.replace(returnScreen, returnParams);
      } else if (isGoBack) {
        navigation.goBack();
      } else {
        // Default navigation
        navigation.replace("Home");
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert("Error", "Invalid email or password");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset Email Sent",
        "Please check your email to reset your password."
      );
    } catch (error) {
      console.log("Forgot password error:", error);
      if (error.code === "auth/invalid-email") {
        Alert.alert("Error", "Please enter a valid email address.");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#666" />
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <PressableButton
              onPress={() => setShowPassword(!showPassword)}
              componentStyle={styles.eyeIcon}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color="#666"
              />
            </PressableButton>
          </View>

          {/* Forgot Password */}
          <PressableButton
            onPress={handleForgotPassword}
            componentStyle={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </PressableButton>

          {/* Login Button */}
          <PressableButton
            onPress={handleLogin}
            componentStyle={styles.loginButton}
            pressedStyle={styles.loginButtonPressed}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </PressableButton>
        </View>

        {/* Sign Up Section */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <PressableButton
            onPress={() => navigation.replace("Register", {
              returnScreen,
              returnParams,
            })}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
          </PressableButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 120 : 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonPressed: {
    backgroundColor: '#0056b3',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
