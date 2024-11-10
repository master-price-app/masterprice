import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { writeToDB, updateData } from "../../services/priceService";

export default function PriceFormScreen({ navigation, route }) {
  const { code, productName, editMode, priceData } = route.params;
  const [price, setPrice] = useState(
    editMode ? priceData.price.toString() : ""
  );
  const [location, setLocation] = useState(editMode ? priceData.store : "");

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

      const priceData = {
        code,
        productName,
        price: parseFloat(price),
        store: location,
        createdAt: new Date().toISOString(),
      };

      if (editMode) {
        await updateData(priceData, "prices", route.params.priceData.id);
        Alert.alert("Success", "Price updated successfully!");
      } else {
        await writeToDB(priceData, "prices");
        Alert.alert("Success", "New price shared successfully!");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error submitting price:", error);
      Alert.alert(
        "Error",
        editMode ? "Failed to update price" : "Failed to submit price"
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Product Name</Text>
        <Text style={styles.value}>{productName}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Barcode Number</Text>
        <Text style={styles.value}>{code}</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter store location"
        />
      </View>

      <Button
        onPress={handleSubmit}
        title={editMode ? "Update Price" : "Submit"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
});
