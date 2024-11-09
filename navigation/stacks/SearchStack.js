import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from '../../screens/search/SearchScreen';
import SearchResultScreen from '../../screens/search/SearchResultScreen';

const Stack = createNativeStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SearchHome" component={SearchScreen} />
      <Stack.Screen name="SearchResult" component={SearchResultScreen} />
    </Stack.Navigator>
  );
}
