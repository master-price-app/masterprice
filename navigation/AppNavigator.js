import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SearchStack from './stacks/SearchStack';
import ListStack from './stacks/ListStack';
import AccountStack from './stacks/AccountStack';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="List" component={ListStack} />
      <Tab.Screen name="Account" component={AccountStack} />
    </Tab.Navigator>
  );
}
