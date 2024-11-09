import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { writeToDB } from "../../services/priceService";

export default function PriceFormScreen() {
  const navigation = useNavigation();
  const [productName, setProductName] = useState("");
  const [barcodeNumber, setBarcodeNumber] = useState("");
  const [price, setPrice] = useState("");

  function validateProductName(productName) {
    if (!productName) {
      Alert.alert("Error", "Product name is required");
      return false;
    }
    return true;
  }

  function validateBarcodeNumber(barcodeNumber) {
    if (isNaN(barcodeNumber)) {
      Alert.alert("Error", "Barcode number must be a number");
      return false;
    }
    return true;
  }

  function validatePrice(price) {
    if (isNaN(price)) {
      Alert.alert("Error", "Price must be a number");
      return false;
    }
    return true;
  }

  const handleSubmit = async () => {
    try {
      if (!validateProductName(productName)) {
        return;
      }
      if (!validateBarcodeNumber(barcodeNumber)) {
        return;
      }
      if (!validatePrice(price)) {
        return;
      }

      await writeToDB(
        {
          productName,
          barcodeNumber,
          price: parseFloat(price),
          createdAt: new Date().toISOString(),
        },
        "prices"
      );

      Alert.alert("Success", "Price submitted successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting price:", error);
      Alert.alert("Error", "Failed to submit price");
    }
  };

  return (
    <View>
      <Text>PriceFormScreen</Text>

      <View>
        <Text>Product Name</Text>
        <TextInput
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
        />
      </View>

      <View>
        <Text>Barcode Number</Text>
        <TextInput
          value={barcodeNumber}
          onChangeText={setBarcodeNumber}
          placeholder="Enter barcode number"
          keyboardType="numeric"
        />
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

      <Button onPress={handleSubmit} title="Submit" />
    </View>
  );
}

const styles = StyleSheet.create({});
