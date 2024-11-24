import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseSetup";
import { writeUserToDB } from "../../services/userService";
import PressableButton from "../../components/PressableButton";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleRegister = async () => {
    if (
      email.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      Alert.alert("Error", "All fields should be provided");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Check password strength
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      Alert.alert(
        "Weak Password",
        "Your password should be at least 8 characters long and contain at least one uppercase letter and one number."
      );
      return;
    }

    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user document in Firestore
      await writeUserToDB(userCredential.user.uid, {
        email: userCredential.user.email,
        nickname: nickname || email.split("@")[0], // Use nickname if provided, otherwise use email username
      });

      console.log("Registered user:", userCredential.user.uid);
      navigation.replace("Login");
    } catch (error) {
      console.log("Register error:", error);
      if (error.code === "auth/invalid-email") {
        Alert.alert("Error", "The email address is not valid");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
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

          {/* Nickname Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Enter your nickname (Optional)"
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize={false}
              autoComplete="name"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#666" />
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              placeholder="Create password"
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#666" />
            <TextInput
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <PressableButton
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              componentStyle={styles.eyeIcon}
            >
              <MaterialIcons
                name={showConfirmPassword ? "visibility" : "visibility-off"}
                size={20}
                color="#666"
              />
            </PressableButton>
          </View>

          {/* Register Button */}
          <PressableButton
            onPress={handleRegister}
            componentStyle={styles.registerButton}
            pressedStyle={styles.registerButtonPressed}
          >
            <Text style={styles.registerButtonText}>Sign Up</Text>
          </PressableButton>
        </View>

        {/* Sign In Section */}
        <View style={styles.signinContainer}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <PressableButton
            onPress={() => navigation.replace("Login")}
          >
            <Text style={styles.signinLink}>Sign In</Text>
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
    marginBottom: 40,
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
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonPressed: {
    backgroundColor: '#0056b3',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signinText: {
    color: '#666',
    fontSize: 14,
  },
  signinLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
