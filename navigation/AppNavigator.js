import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Tab Navigator
import TabNavigator from "./TabNavigator";

// Protected Screens (require auth)
import AccountScreen from "../screens/account/AccountScreen";
import AccountSecurityScreen from "../screens/account/AccountSecurityScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import MyPostsScreen from "../screens/account/MyPostsScreen";
import NotificationsScreen from "../screens/account/NotificationsScreen";
import TermsAndConditionsScreen from "../screens/account/TermsAndConditionsScreen";
import ShoppingListScreen from "../screens/list/ShoppingListScreen";
import PriceFormScreen from "../screens/common/PriceFormScreen";

// Public Screens (no auth required)
import MartDetailScreen from "../screens/common/MartDetailScreen";
import PriceDetailScreen from "../screens/common/PriceDetailScreen";
import ProductDetailScreen from "../screens/common/ProductDetailScreen";
import SearchScreen from "../screens/search/SearchScreen";
import SearchResultScreen from "../screens/search/SearchResultScreen";
import BarcodeScannerScreen from "../screens/search/BarcodeScannerScreen";

const Stack = createNativeStackNavigator();

// Auth Stack (Login/Register screens)
const AuthStack = () => (
  <>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </>
);

// Protected Stack (Requires authentication)
const ProtectedStack = () => (
  <>
    <Stack.Screen name="AccountMain" component={AccountScreen} />
    <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="MyPosts" component={MyPostsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
    <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
    <Stack.Screen name="PriceForm" component={PriceFormScreen} />
  </>
);

// Public Stack (No authentication required)
const PublicStack = () => (
  <>
    <Stack.Screen
      name="Home"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="MartDetail" component={MartDetailScreen} />
    <Stack.Screen name="PriceDetail" component={PriceDetailScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="SearchResult" component={SearchResultScreen} />
    <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
  </>
);

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {PublicStack()}
      {user ? ProtectedStack() : AuthStack()}
    </Stack.Navigator>
  );
}
