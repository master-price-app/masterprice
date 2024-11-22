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
import { getUserData } from "../../services/userService";

export default function AccountScreen({ navigation }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

const loadUserData = async () => {
  try {
    if (!user) return;

    let data;
    try {
      data = await getUserData(user.uid);
    } catch (error) {
      if (error.message === "User not found") {
        // If user document doesn't exist, create it
        data = await writeUserToDB(user.uid, {
          email: user.email,
          nickname: user.email.split("@")[0],
        });
      } else {
        throw error;
      }
    }

    setUserData({
      nickname: data.nickname,
      email: user.email,
      createdAt: data.createdAt
        ? new Date(data.createdAt.toDate()).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error loading user data:", error);
    Alert.alert("Error", "Failed to load user data");
  } finally {
    setLoading(false);
  }
};

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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Feature Coming Soon",
              "Account deletion will be available in a future update."
            );
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
    {
      id: "about",
      icon: "info",
      title: "About Us",
      onPress: () =>
        Alert.alert("About Us", "This feature is not available yet."),
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

  if (loading || !userData) {
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
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          onError={(error) => console.log("Error loading avatar: ", error)}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.nickname}>{userData.nickname}</Text>
          <Text style={styles.email}>{userData.email}</Text>
          <Text style={styles.joinDate}>Joined: {userData.createdAt}</Text>
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
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  joinDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
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
