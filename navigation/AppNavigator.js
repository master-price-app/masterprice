import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import TabNavigator from "./TabNavigator";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import PriceFormScreen from "../screens/common/PriceFormScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import AccountSecurityScreen from "../screens/account/AccountSecurityScreen";
import TermsAndConditionsScreen from "../screens/account/TermsAndConditionsScreen";

const Stack = createNativeStackNavigator();

// // Auth Stack (Login/Register screens)
// const AuthScreens = [
//   { name: "Login", component: LoginScreen },
//   { name: "Register", component: RegisterScreen },
// ];

// // Protected Stack (Requires authentication)
// const ProtectedScreens = [
//   { name: "AccountMain", component: AccountScreen },
//   { name: "AccountSecurity", component: AccountSecurityScreen },
//   { name: "EditProfile", component: EditProfileScreen },
//   { name: "MyPosts", component: MyPostsScreen },
//   { name: "Notifications", component: NotificationsScreen },
//   { name: "TermsAndConditions", component: TermsAndConditionsScreen },
//   { name: "ShoppingList", component: ShoppingListScreen },
// ];

// // Public Stack (No authentication required)
// const PublicScreens = [
//   { name: "Home", component: TabNavigator, options: { headerShown: false } },
//   { name: "MartDetail", component: MartDetailScreen },
//   { name: "PriceDetail", component: PriceDetailScreen },
//   { name: "ProductDetail", component: ProductDetailScreen },
//   { name: "Search", component: SearchScreen },
//   { name: "SearchResult", component: SearchResultScreen },
//   { name: "BarcodeScanner", component: BarcodeScannerScreen },
// ];

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
      <Stack.Screen
        name="Home"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="PriceForm" component={PriceFormScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
    </Stack.Navigator>
  );
}
