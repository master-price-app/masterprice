import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Skeleton from './Skeleton';

export default function AccountScreenSkeleton() {
  const MenuItemSkeleton = () => (
    <View style={styles.menuItem}>
      <Skeleton width={24} height={24} style={styles.menuIcon} />

      <View style={styles.menuItemText}>
        <Skeleton width={120} height={16} style={styles.menuItemTitle} />
      </View>

      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <Skeleton width={100} height={100} style={styles.avatar} />
        </View>

        <View style={styles.userInfo}>
          <Skeleton width={150} height={20} style={styles.nickname} />
          <Skeleton width={200} height={14} style={styles.email} />
          <Skeleton width={120} height={12} style={styles.joinDate} />
        </View>
      </View>

      <View style={styles.menuSection}>
        {[1, 2, 3, 4, 5].map((item) => (
          <MenuItemSkeleton key={`menu-${item}`} />
        ))}
      </View>

      <View style={styles.dangerSection}>
        {[1, 2].map((item) => (
          <MenuItemSkeleton key={`danger-${item}`} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    borderRadius: 50,
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  nickname: {
    marginBottom: 8,
    borderRadius: 4,
  },
  email: {
    marginBottom: 8,
    borderRadius: 4,
  },
  joinDate: {
    borderRadius: 4,
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
  menuIcon: {
    borderRadius: 4,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    borderRadius: 4,
  },
});
