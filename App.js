import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import AppNavigator from "./navigation/AppNavigator";
// temporary import to initialize Mart data
import { initializeMartData } from './services/martService';

// temporary initialization of Mart data
console.log("Starting mart data initialization...");
initializeMartData()
  .then(() => console.log("Mart data initialized successfully"))
  .catch(console.error);

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
