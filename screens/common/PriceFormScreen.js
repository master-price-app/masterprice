import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { writeToDB, updateData } from "../../services/priceService";
import PressableButton from "../../components/PressableButton";

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
      <View style={styles.formCard}>
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
          <View style={styles.inputContainer}>
            <MaterialIcons name="attach-money" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Enter price"
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="store" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter store location"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <PressableButton
          pressedHandler={handleSubmit}
          componentStyle={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>
            {editMode ? "Update Price" : "Share Price"}
          </Text>
        </PressableButton>
      </View>
    </View>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoSection: {
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: '#333',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
