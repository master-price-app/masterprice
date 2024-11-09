import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PriceFormScreen from '../../screens/common/PriceFormScreen';
import ProductDetailScreen from '../../screens/common/ProductDetailScreen';
import PriceDetailScreen from '../../screens/common/PriceDetailScreen';
import MartDetailScreen from '../../screens/common/MartDetailScreen';

const Stack = createNativeStackNavigator();

export default function CommonStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PriceForm" component={PriceFormScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="PriceDetail" component={PriceDetailScreen} />
      <Stack.Screen name="MartDetail" component={MartDetailScreen} />
    </Stack.Navigator>
  );
}
