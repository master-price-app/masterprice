import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Menu } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../../contexts/AuthContext";
import { updateUser, getUserData } from "../../services/userService";
import PressableButton from "../../components/PressableButton";

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    avatar: null,
    imageUri: null,
    nickname: "",
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigation.replace("Login", {
        returnScreen: "EditProfile",
      });
      return;
    }

    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      const userData = await getUserData(user.uid);
      setProfile({
        avatar: userData.imageUrl,
        nickname: userData.nickname || "",
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = async (useCamera) => {
    try {
      setMenuVisible(false);

      const permissionType = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionType.status !== "granted") {
        Alert.alert(
          "Sorry",
          `Need ${
            useCamera ? "camera" : "photo library"
          } permission to change avatar`
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            cameraType: ImagePicker.CameraType.front,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });

      if (!result.canceled) {
        setProfile((prev) => ({
          ...prev,
          avatar: result.assets[0].uri,
          imageUri: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "Error selecting image");
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigation.replace("Login", {
        returnScreen: "EditProfile",
      });
      return;
    }

    try {
      await updateUser(user.uid, {
        nickname: profile.nickname,
        imageUri: profile.imageUri || null, // Include imageUri if changed
      });

      Alert.alert("Success", "Profile updated");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar section */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <PressableButton
            onPress={() => setMenuVisible(true)}
            componentStyle={styles.avatarContainer}
            pressedStyle={styles.avatarContainerPressed}
          >
            {profile.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={styles.avatar}
                onError={(error) => {
                  console.log("Error loading avatar:", error);
                  setProfile((prev) => ({ ...prev, avatar: null }));
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={50} color="#999" />
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <MaterialIcons name="camera-alt" size={24} color="#fff" />
              <Text style={styles.avatarText}>Change Avatar</Text>
            </View>
          </PressableButton>
        }
      >
        <Menu.Item
          onPress={() => handleImageSelection(false)}
          title="Select from library"
          leadingIcon="image"
        />
        <Menu.Item
          onPress={() => handleImageSelection(true)}
          title="Take a photo"
          leadingIcon="camera"
        />
      </Menu>

      {/* Form section */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nickname</Text>
          <TextInput
            style={styles.input}
            value={profile.nickname}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, nickname: text }))
            }
            placeholder="Enter your nickname"
            maxLength={20}
          />
        </View>
      </View>

      {/* Save button */}
      <PressableButton
        onPress={handleSave}
        componentStyle={styles.saveButton}
        pressedStyle={styles.saveButtonPressed}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </PressableButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  avatarContainerPressed: {
    backgroundColor: "#f0f0f0",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    marginLeft: 4,
  },
  form: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  inputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    marginLeft: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  saveButton: {
    margin: 16,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonPressed: {
    backgroundColor: "#0056b3",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
