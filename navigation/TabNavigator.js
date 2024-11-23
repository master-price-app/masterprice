import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import PressableButton from "../components/PressableButton";

import ProductDetailScreen from "../screens/common/ProductDetailScreen";
import PriceDetailScreen from "../screens/common/PriceDetailScreen";
import PriceFormScreen from "../screens/common/PriceFormScreen";
import MartDetailScreen from "../screens/common/MartDetailScreen";

import SearchScreen from "../screens/search/SearchScreen";
import SearchResultScreen from "../screens/search/SearchResultScreen";
import BarcodeScannerScreen from "../screens/search/BarcodeScannerScreen";

import ShoppingListScreen from "../screens/list/ShoppingListScreen";

import AccountScreen from "../screens/account/AccountScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import AccountSecurityScreen from "../screens/account/AccountSecurityScreen";
import MyPostsScreen from "../screens/account/MyPostsScreen";
import NotificationsScreen from "../screens/account/NotificationsScreen";
import TermsAndConditionsScreen from "../screens/account/TermsAndConditionsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

const CommonScreens = () => (
  <>
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="PriceDetail" component={PriceDetailScreen} />
    <Stack.Screen
      name="PriceForm"
      component={PriceFormScreen}
      options={{ tabBarStyle: { display: "none" } }}
    />
    <Stack.Screen name="MartDetail" component={MartDetailScreen} />
  </>
);

const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="SearchResult" component={SearchResultScreen} />
    <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
    {CommonScreens()}
  </Stack.Navigator>
);

const ListStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
    {CommonScreens()}
  </Stack.Navigator>
);

const AccountStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Account" component={AccountScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
    <Stack.Screen name="MyPosts" component={MyPostsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
    {CommonScreens()}
  </Stack.Navigator>
);

// const CommonScreens = [
//   { name: "ProductDetail", component: ProductDetailScreen },
//   { name: "PriceDetail", component: PriceDetailScreen },
//   { name: "PriceForm", component: PriceFormScreen },
//   { name: "MartDetail", component: MartDetailScreen },
// ];

// const SearchStack = [
//   { name: "Search", component: SearchScreen },
//   { name: "SearchResult", component: SearchResultScreen },
//   { name: "BarcodeScanner", component: BarcodeScannerScreen },
//   ...CommonScreens,
// ];

// const ListStack = [
//   { name: "ShoppingList", component: ShoppingListScreen },
//   ...CommonScreens,
// ];

// const AccountStack = [
//   { name: "Account", component: AccountScreen },
//   { name: "EditProfile", component: EditProfileScreen },
//   { name: "AccountSecurity", component: AccountSecurityScreen },
//   { name: "MyPosts", component: MyPostsScreen },
//   { name: "Notifications", component: NotificationsScreen },
//   { name: "TermsAndConditions", component: TermsAndConditionsScreen },
//   ...CommonScreens,
// ];

// function StackNavigator({ screens }) {
//   return (
//     <Stack.Navigator>
//       {screens.map(screen => (
//         <Stack.Screen
//           name={screen.name}
//           component={screen.component}
//           options={screen.options}
//         />
//       ))}
//     </Stack.Navigator>
//   );
// }

export default function TabNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
      }}
    >
      {/* Public Tab */}
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
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
        component={user ? ListStack : AuthPlaceholder}
        options={{
          title: "List",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list-alt" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={user ? AccountStack : AuthPlaceholder}
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
