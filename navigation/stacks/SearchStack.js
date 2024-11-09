import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from '../../screens/search/SearchScreen';
import SearchResultScreen from '../../screens/search/SearchResultScreen';
import BarcodeScannerScreen from '../../screens/search/BarcodeScannerScreen';

const Stack = createNativeStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SearchHome" component={SearchScreen} />
      <Stack.Screen name="SearchResult" component={SearchResultScreen} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
    </Stack.Navigator>
  );
}
