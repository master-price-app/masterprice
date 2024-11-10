import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import React, { useState } from "react";
import { writeToDB } from "../../services/priceService";

export default function PriceFormScreen({ navigation, route }) {
  const { code, productName } = route.params;
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");

  function validatePrice(price) {
    if (isNaN(price)) {
      Alert.alert("Error", "Price must be a number");
      return false;
    }
    return true;
  }

  function validateLocation(location) {
    if (!location) {
      Alert.alert("Error", "Location is required");
      return false;
    }
    return true;
  }

  const handleSubmit = async () => {
    try {
      if (!validatePrice(price)) {
        return;
      }
      if (!validateLocation(location)) {
        return;
      }

      await writeToDB(
        {
          code, // Using barcode from route params
          productName, // Using product name from route params
          price: parseFloat(price),
          store: location,
          createdAt: new Date().toISOString(),
        },
        "prices"
      );

      Alert.alert("Success", "New price shared successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting price:", error);
      Alert.alert("Error", "Failed to submit price");
    }
  };

  return (
    <View>
      <View>
        <Text>Product Name</Text>
        <Text>{productName}</Text>
      </View>

      <View>
        <Text>Barcode Number</Text>
        <Text>{code}</Text>
      </View>

      <View>
        <Text>Price</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          keyboardType="decimal-pad"
        />
      </View>

      <View>
        <Text>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Enter store location"
        />
      </View>

      <Button onPress={handleSubmit} title="Submit" />
    </View>
  );
}
