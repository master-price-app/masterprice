import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShoppingListScreen from '../../screens/list/ShoppingListScreen';

const Stack = createNativeStackNavigator();

export default function ListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ShoppingListHome" component={ShoppingListScreen} />
    </Stack.Navigator>
  );
}
