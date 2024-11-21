import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Menu } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PressableButton from '../../components/PressableButton';

export default function EditProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    avatar: 'https://via.placeholder.com/150',
    nickname: 'Fiona',
    email: 'fiona@example.com',
    phone: '778-123-456',
    address: '123 Main St, Burnaby, Canada',
  });
  const [menuVisible, setMenuVisible] = useState(false);

  const handleImageSelection = async (useCamera) => {
    try {
      setMenuVisible(false);

      // Request permission
      const permissionType = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionType.status !== 'granted') {
        Alert.alert('Sorry', `Need ${useCamera ? 'camera' : 'photo library'} permission to change avatar`);
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
        setProfile(prev => ({
          ...prev,
          avatar: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Error selecting image');
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Save profile to Firestore
      // await updateUserProfile(profile);
      Alert.alert('Success', 'Profile updated');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  }

  return (
    <View style={styles.container}>
      {/* Avatar section */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <PressableButton
            // style={styles.avatarContainer} 
            // onPress={handleChangeAvatar}
            onPress={() => setMenuVisible(true)}
            componentStyle={styles.avatarContainer}
            pressedStyle={styles.avatarContainerPressed}
          >
            <Image
              source={{ uri: profile.avatar }}
              onError={(error) =>
                console.log("Error loading avatar: ", error)
              }
              style={styles.avatar}
            />
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
            onChangeText={(text) => setProfile({ ...profile, nickname: text })}
            placeholder="Enter your nickname"
            maxLength={20}
          />
        </View>
      </View>

      {/* Save button */}
      <PressableButton
        // style={styles.saveButton} 
        // onPress={handleSave}
        onPress={handleSave}
        componentStyle={styles.saveButton}
        pressedStyle={styles.saveButtonPressed}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </PressableButton>
    </View>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatarContainerPressed: {
    backgroundColor: '#f0f0f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    marginLeft: 4,
  },
  form: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  inputGroup: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    margin: 16,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonPressed: {
    backgroundColor: '#0056b3',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
