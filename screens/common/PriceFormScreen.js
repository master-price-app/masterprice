import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../contexts/AuthContext";
import { writeToDB, updateData } from "../../services/priceService";
import { getLocations } from "../../services/martService";
import PressableButton from "../../components/PressableButton";

export default function PriceFormScreen({ navigation, route }) {
  const { user } = useAuth();
  const { code, productName, editMode, priceData } = route.params;
  const [price, setPrice] = useState(
    editMode ? priceData.price.toString() : ""
  );
  const [selectedLocationId, setSelectedLocationId] = useState(
    editMode ? priceData.locationId : ""
  );
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
      return;
    }
  }, [user]);

  // TODO: will be replaced with location and map integration
  useEffect(() => {
    async function loadLocations() {
      try {
        const locationData = await getLocations();
        setLocations(locationData);
      } catch (error) {
        console.error("Error loading locations:", error);
        Alert.alert("Error", "Failed to load store locations");
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, []);

  // Image selection handler
  const handleImageSelection = async (useCamera) => {
    try {
      const permissionType = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionType.status !== "granted") {
        Alert.alert(
          "Sorry",
          `Need ${
            useCamera ? "camera" : "photo library"
          } permission to upload images`
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            cameraType: ImagePicker.CameraType.back,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "Error selecting image");
    }
  };

  // Validate price
  function validatePrice(price) {
    if (isNaN(price)) {
      Alert.alert("Error", "Price must be a number");
      return false;
    }
    return true;
  }

  // Validate location
  function validateLocation() {
    if (!selectedLocationId) {
      Alert.alert("Error", "Please select a store location");
      return false;
    }
    return true;
  }

  // Submit price
  const handleSubmit = async () => {
    if (!user) {
      navigation.replace("Login");
      return;
    }

    try {
      if (!validatePrice(price)) return;
      if (!validateLocation()) return;

      const newPriceData = {
        code,
        productName,
        price: parseFloat(price),
        locationId: selectedLocationId,
        createdAt: new Date().toISOString(),
      };

      if (editMode) {
        await updateData(
          user.uid,
          newPriceData,
          "prices",
          route.params.priceData.id
        );
        Alert.alert("Success", "Price updated successfully!");
      } else {
        await writeToDB(user.uid, newPriceData, "prices");
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollViewContainer}>
      <View style={styles.container}>
        <View style={styles.formCard}>
          {/* Upload Product Image Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Product Image (Optional)</Text>
            <View style={styles.imageSection}>
              {imageUri ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageUri }}
                    onError={(error) =>
                      console.log("Error loading product image: ", error)
                    }
                    style={styles.previewImage}
                  />
                  {/* Remove image button */}
                  <PressableButton
                    onPress={() => setImageUri(null)}
                    componentStyle={styles.removeImageButton}
                  >
                    <MaterialIcons name="close" size={20} color="#fff" />
                  </PressableButton>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={40}
                    color="#666"
                  />
                  <Text style={styles.imagePlaceholderText}>
                    Add Product Photo
                  </Text>
                </View>
              )}
              {/* Image selection buttons */}
              <View style={styles.imageButtons}>
                {/* Take photo */}
                <PressableButton
                  onPress={() => handleImageSelection(true)}
                  componentStyle={styles.imageButton}
                  pressedStyle={styles.imageButtonPressed}
                >
                  <MaterialIcons name="camera-alt" size={20} color="#007AFF" />
                  <Text style={styles.imageButtonText}>Take Photo</Text>
                </PressableButton>
                {/* Choose photo from library */}
                <PressableButton
                  onPress={() => handleImageSelection(false)}
                  componentStyle={styles.imageButton}
                  pressedStyle={styles.imageButtonPressed}
                >
                  <MaterialIcons
                    name="photo-library"
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.imageButtonText}>Choose Photo</Text>
                </PressableButton>
              </View>
            </View>
          </View>

          {/* Product Name Section */}
          <View style={styles.infoSection}>
            <Text style={styles.label}>Product Name</Text>
            <Text style={styles.value}>{productName}</Text>
          </View>

          {/* Barcode Number Section */}
          <View style={styles.infoSection}>
            <Text style={styles.label}>Barcode Number</Text>
            <Text style={styles.value}>{code}</Text>
          </View>

          {/* Price Section */}
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

          {/* Store Location Section,   // TODO: will be replaced with location and map integration */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Store Location</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLocationId}
                onValueChange={(value) => setSelectedLocationId(value)}
              >
                <Picker.Item label="Select a location" value="" />
                {locations.map((location) => (
                  <Picker.Item
                    key={location.id}
                    label={location.name}
                    value={location.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Submit Button */}
          <PressableButton
            onPress={handleSubmit}
            componentStyle={styles.submitButton}
            pressedStyle={styles.submitButtonPressed}
          >
            <Text style={styles.submitButtonText}>
              {editMode ? "Update Price" : "Share Price"}
            </Text>
          </PressableButton>
        </View>
      </View>
    </ScrollView>
  );
}
// Temporary styles
const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: "100%",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  imagePlaceholderText: {
    color: "#666",
    marginTop: 8,
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    minWidth: 120,
    justifyContent: "center",
  },
  imageButtonPressed: {
    backgroundColor: "#ddd",
  },
  imageButtonText: {
    color: "#007AFF",
    marginLeft: 8,
    fontSize: 14,
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
    color: "#333",
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonPressed: {
    backgroundColor: "#0056b3",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
