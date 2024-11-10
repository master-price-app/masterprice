import { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function EditProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    avatar: 'https://via.placeholder.com/150',
    nickname: 'Fiona',
    email: 'fiona@example.com',
    phone: '778-123-456',
    address: '123 Main St, Burnaby, Canada',
  });

  const handleSave = async () => {
    try {
      // TODO: Save profile to API
      // await updateUserProfile(profile);
      Alert.alert('Success', 'Profile updated');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  }

  const handleChangeAvatar = () => {
    // TODO: Change avatar
    Alert.alert('Success', 'Avatar changed');
  }

  return (
    <View style={styles.container}>
      {/* Avatar section */}
      <TouchableOpacity 
        style={styles.avatarContainer} 
        onPress={handleChangeAvatar}
      >
        <Image 
          source={{ uri: profile.avatar }} 
          style={styles.avatar} 
        />
        <View style={styles.avatarOverlay}>
          <MaterialIcons name="camera-alt" size={24} color="#fff" />
          <Text style={styles.avatarText}>Change Avatar</Text>
        </View>
      </TouchableOpacity>

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
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
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
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
