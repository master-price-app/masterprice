import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
// Search
import SearchScreen from '../screens/search/SearchScreen';
import SearchResultScreen from '../screens/search/SearchResultScreen';
import BarcodeScannerScreen from '../screens/search/BarcodeScannerScreen';
// List
import ShoppingListScreen from '../screens/list/ShoppingListScreen';
// Account
import AccountScreen from '../screens/account/AccountScreen';
import EditProfileScreen from '../screens/account/EditProfileScreen';
import MyPostsScreen from '../screens/account/MyPostsScreen';
import AccountSecurityScreen from '../screens/account/AccountSecurityScreen';
import TermsAndConditionsScreen from '../screens/account/TermsAndConditionsScreen';
// Common
import PriceFormScreen from '../screens/common/PriceFormScreen';
import ProductDetailScreen from '../screens/common/ProductDetailScreen';
import PriceDetailScreen from '../screens/common/PriceDetailScreen';
import MartDetailScreen from '../screens/common/MartDetailScreen';

export default function AppNavigator() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Home'
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      {/* Tab Screens */}
      <Stack.Screen name='Search' component={SearchScreen} />
      <Stack.Screen name='ShoppingList' component={ShoppingListScreen} />
      <Stack.Screen name='Account' component={AccountScreen} />
      {/* Search Flow */}
      <Stack.Screen name='SearchResult' component={SearchResultScreen} />
      <Stack.Screen name='BarcodeScanner' component={BarcodeScannerScreen} />
      {/* Account Flow */}
      <Stack.Screen name='EditProfile' component={EditProfileScreen} />
      <Stack.Screen name='MyPosts' component={MyPostsScreen} />
      <Stack.Screen name='AccountSecurity' component={AccountSecurityScreen} />
      <Stack.Screen name='TermsAndConditions' component={TermsAndConditionsScreen} />
      {/* Common Flow */}
      <Stack.Screen name='PriceForm' component={PriceFormScreen} />
      <Stack.Screen name='ProductDetail' component={ProductDetailScreen} />
      <Stack.Screen name='PriceDetail' component={PriceDetailScreen} />
      <Stack.Screen name='MartDetail' component={MartDetailScreen} />
    </Stack.Navigator>
  );
}
