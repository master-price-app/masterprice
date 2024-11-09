import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountScreen from '../../screens/account/AccountScreen';
import EditProfileScreen from '../../screens/account/EditProfileScreen';
import MyPostsScreen from '../../screens/account/MyPostsScreen';
import AccountSecurityScreen from '../../screens/account/AccountSecurityScreen';
import TermsAndConditionsScreen from '../../screens/account/TermsAndConditionsScreen';

const Stack = createNativeStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AccountHome" component={AccountScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyPosts" component={MyPostsScreen} />
      <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
    </Stack.Navigator>
  );
}
