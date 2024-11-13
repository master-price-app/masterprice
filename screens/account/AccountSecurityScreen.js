import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function AccountSecurityScreen({ navigation }) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleChangePassword = async () => {
    // TODO: will be updated when firebase authentication system is implemented

    // Basic validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (passwords.new.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return;
    }

    try {
      // TODO: Call API to update password
      // await updatePassword(passwords.current, passwords.new);
      Alert.alert('Success', 'Password updated', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update password');
    }
  }

  const PasswordInput = ({ label, value, onChangeText, isLast }) => (
    <View style={[styles.inputGroup, !isLast && styles.inputBorder]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <PasswordInput
          label="Current Password"
          value={passwords.current}
          onChangeText={(text) => setPasswords({ ...passwords, current: text })}
        />
        <PasswordInput
          label="New Password"
          value={passwords.new}
          onChangeText={(text) => setPasswords({ ...passwords, new: text })}
        />
        <PasswordInput
          label="Confirm New Password"
          value={passwords.confirm}
          onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
          isLast
        />
      </View>

      {/* TODO: Replace with PressableButton */}
      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleChangePassword}
      >
        <Text style={styles.submitButtonText}>Change Password</Text>
      </TouchableOpacity>

      {/* TODO: Replace with PressableButton */}
      {/* Forgot Password Button */}
      <TouchableOpacity 
        style={styles.forgotButton}
        onPress={() => {/* TODO: Implement forgot password functionality */}}
      >
        <Text style={styles.forgotButtonText}>Forgot Password?</Text>
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
  form: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  inputGroup: {
    paddingVertical: 12,
  },
  inputBorder: {
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
  submitButton: {
    margin: 16,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotButton: {
    alignItems: 'center',
    padding: 16,
  },
  forgotButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
