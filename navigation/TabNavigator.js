import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import SearchScreen from '../screens/search/SearchScreen';
import ShoppingListScreen from '../screens/list/ShoppingListScreen';
import AccountScreen from '../screens/account/AccountScreen';

export default function TabNavigator() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator>
      <Tab.Screen
        name='Search'
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name='search' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='List'
        component={ShoppingListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name='list-alt' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='Account'
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name='account-circle' color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
