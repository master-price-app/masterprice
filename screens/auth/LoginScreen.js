import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseSetup";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen({ navigation, route }) {
  const returnScreen = route.params?.returnScreen;
  const returnParams = route.params?.returnParams;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading } = useAuth();

  const handleLogin = async () => {
    // validation
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
      } else {
        // Default navigation
        navigation.replace("Home");
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert("Error", "Invalid email or password");
      } else {
      Alert.alert("Error", error.message);
      };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry={true}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
      <Button
        title="New User? Create An Account"
        onPress={() => {
          // Preserve return navigation when going to register
          navigation.replace("Register", {
            returnScreen,
            returnParams,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});
