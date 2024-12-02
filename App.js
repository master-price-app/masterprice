import React from "react";
import { SafeAreaView } from "react-native";
import { PaperProvider } from "react-native-paper";
import Toast from 'react-native-toast-message';
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./contexts/AuthContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <Toast />
        </PaperProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}
