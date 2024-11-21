import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import SearchScreen from "../screens/search/SearchScreen";
import ShoppingListScreen from "../screens/list/ShoppingListScreen";
import AccountScreen from "../screens/account/AccountScreen";

const Tab = createBottomTabNavigator();

// Authentication placeholder screens
function AuthPlaceholder({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Please login to access this feature</Text>
      <Button title="Login" onPress={() => navigation.navigate("Login")} />
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
