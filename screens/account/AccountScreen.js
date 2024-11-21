import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function AccountScreen({ navigation }) {
  // TODO: Get user information from Firebase Auth and Firestore
  const user = {
    avatar: 'https://via.placeholder.com/150',
    nickname: 'Fiona',
    email: 'fiona@example.com',
    phone: '778-123-456',
    address: '123 Main St, Burnaby, Canada',
    joinDate: '2024-01-01',
    contributions: 10,
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => console.log('Logout') },
    ]);
  }

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => console.log('Delete') },
    ]);
  }

  const menuItems = [
    {
      id: 'profile',
      icon: 'person',
      title: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'posts',
      icon: 'list-alt',
      title: 'My Posts',
      subtitle: `Published ${user.contributions} posts`,
      onPress: () => navigation.navigate('MyPosts'),
    },
    {
      id: 'security',
      icon: 'security',
      title: 'Account Security',
      onPress: () => navigation.navigate('AccountSecurity'),
    },
    {
      id: 'notifications',
      icon: 'notifications',
      title: 'Notification Settings',
      // onPress: () => navigation.navigate('NotificationSettings'),
      onPress: () => Alert.alert('Notification Settings', 'This feature is not available yet.'),
    },
    {
      id: 'terms',
      icon: 'description',
      title: 'Terms & Conditions',
      onPress: () => navigation.navigate('TermsAndConditions'),
    },
    {
      id: 'about',
      icon: 'info',
      title: 'About Us',
      // onPress: () => navigation.navigate('About'),
      onPress: () => Alert.alert('About Us', 'This feature is not available yet.'),
    },
  ];

  const dangerousActions = [
    {
      id: 'logout',
      icon: 'logout',
      title: 'Logout',
      onPress: () => handleLogout(),
    },
    {
      id: 'delete',
      icon: 'delete-forever',
      title: 'Delete Account',
      onPress: () => handleDeleteAccount(),
      dangerous: true,
    },
  ];

  const MenuItem = ({ icon, title, subtitle, onPress, dangerous }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
    >
      <MaterialIcons
        name={icon} 
        size={24} 
        color={dangerous ? '#ff3b30' : '#333'} 
      />
      <View style={styles.menuItemText}>
        <Text style={[
          styles.menuItemTitle,
          dangerous && styles.dangerousText
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User information section */}
      <View style={styles.userSection}>
        <Image
          source={{ uri: user.avatar }}
          onError={(error) =>
            console.log("Error loading avatar: ", error)
          }
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.joinDate}>
            Joined: {user.joinDate}
          </Text>
        </View>
      </View>

      {/* Menu section */}
      <View style={styles.menuSection}>
        {menuItems.map(item => (
          <MenuItem key={item.id} {...item} />
        ))}
      </View>

      {/* Dangerous actions section */}
      <View style={styles.dangerSection}>
        {dangerousActions.map(item => (
          <MenuItem key={item.id} {...item} />
        ))}
      </View>
    </ScrollView>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    marginLeft: 20,
  },
  nickname: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  menuSection: {
    marginTop: 20,
    backgroundColor: '#fff',
  },
  dangerSection: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#333',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  dangerousText: {
    color: '#ff3b30',
  },
});
