import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebaseSetup";
import { useAuth } from "../../contexts/AuthContext";
import {
  getUserData,
  deleteUserData,
  writeUserToDB,
  subscribeToUser,
} from "../../services/userService";

export default function AccountScreen({ navigation }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up real-time user data listener
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUser(user.uid, (data) => {
      setUserData({
        nickname: data.nickname,
        email: user.email,
        imageUrl: data.imageUrl,
        createdAt: data.createdAt
          ? new Date(data.createdAt.toDate()).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signOut(auth);
            // Navigation will be handled automatically by AuthContext
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserData(user.uid);
              // Navigation will be handled automatically by AuthContext
            } catch (error) {
              console.error("Delete account error:", error);
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: "profile",
      icon: "person",
      title: "Edit Profile",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      id: "security",
      icon: "security",
      title: "Account Security",
      onPress: () => navigation.navigate("AccountSecurity"),
    },
    {
      id: "posts",
      icon: "list-alt",
      title: "My Posts",
      onPress: () => navigation.navigate("MyPosts"),
    },
    {
      id: "notifications",
      icon: "notifications",
      title: "Notifications",
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      id: "terms",
      icon: "description",
      title: "Terms & Conditions",
      onPress: () => navigation.navigate("TermsAndConditions"),
    },
  ];

  const dangerousActions = [
    {
      id: "logout",
      icon: "logout",
      title: "Logout",
      onPress: handleLogout,
    },
    {
      id: "delete",
      icon: "delete-forever",
      title: "Delete Account",
      onPress: handleDeleteAccount,
      dangerous: true,
    },
  ];

  const MenuItem = ({ icon, title, subtitle, onPress, dangerous }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <MaterialIcons
        name={icon}
        size={24}
        color={dangerous ? "#ff3b30" : "#333"}
      />
      <View style={styles.menuItemText}>
        <Text style={[styles.menuItemTitle, dangerous && styles.dangerousText]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User information section */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          {userData?.imageUrl ? (
            <Image
              source={{ uri: userData.imageUrl }}
              style={styles.avatar}
              onError={(error) => {
                console.log("Error loading avatar: ", error);
              }}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialIcons name="account-circle" size={80} color="#999" />
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.nickname}>{userData?.nickname}</Text>
          <Text style={styles.email}>{userData?.email}</Text>
          <Text style={styles.joinDate}>Joined: {userData?.createdAt}</Text>
        </View>
      </View>

      {/* Menu section */}
      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <MenuItem key={item.id} {...item} />
        ))}
      </View>

      {/* Dangerous actions section */}
      <View style={styles.dangerSection}>
        {dangerousActions.map((item) => (
          <MenuItem key={item.id} {...item} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  userSection: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    alignItems: "center",
  },
  nickname: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: "#999",
  },
  menuSection: {
    marginTop: 20,
    backgroundColor: "#fff",
  },
  dangerSection: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    color: "#333",
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  dangerousText: {
    color: "#ff3b30",
  },
});
