import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import PressableButton from "../components/PressableButton";
import SearchScreen from "../screens/search/SearchScreen";
import ShoppingListScreen from "../screens/list/ShoppingListScreen";
import AccountScreen from "../screens/account/AccountScreen";

const Tab = createBottomTabNavigator();

// Authentication placeholder screens
function AuthPlaceholder({ navigation }) {
  return (
    <View style={styles.container}>
    <View style={styles.content}>
      <MaterialIcons name="account-circle" size={80} color="#007AFF" />
      <Text style={styles.title}>Sign In Required</Text>
      <Text style={styles.subtitle}>
        Please sign in to access this feature
      </Text>
      
      <PressableButton
        onPress={() => navigation.navigate("Login")}
        componentStyle={styles.signInButton}
        pressedStyle={styles.signInButtonPressed}
      >
        <Text style={styles.signInButtonText}>Sign In</Text>
      </PressableButton>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <PressableButton
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.registerLink}>Sign Up</Text>
        </PressableButton>
      </View>
    </View>
  </View>
  );
}

export default function TabNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#666",
      }}
    >
      {/* Public Tab */}
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" color={color} size={size} />
          ),
        }}
      />

      {/* Protected Tabs */}
      <Tab.Screen
        name="ListTab"
        component={user ? ShoppingListScreen : AuthPlaceholder}
        options={{
          title: "List",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list-alt" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={user ? AccountScreen : AuthPlaceholder}
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Temporary styles for AuthPlaceholder
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  signInButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonPressed: {
    backgroundColor: "#0056b3",
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 24,
  },
  registerText: {
    color: "#666",
    fontSize: 14,
  },
  registerLink: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
