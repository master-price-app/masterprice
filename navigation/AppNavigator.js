import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import PriceFormScreen from "../screens/common/PriceFormScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import AccountSecurityScreen from "../screens/account/AccountSecurityScreen";
import TermsAndConditionsScreen from "../screens/account/TermsAndConditionsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
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
