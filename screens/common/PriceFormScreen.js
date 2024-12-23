import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { writeToDB, updateData } from "../../services/priceService";
import { getLocations, chainLogoMapping } from "../../services/martService";
import { calculateRegion } from "../../utils/mapUtils";
import PriceFormSkeleton from "../../components/skeleton/PriceFormSkeleton";
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
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState(
    editMode && priceData.imagePath ? priceData.imagePath : null
  );
  const mapRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigation.replace("Login", { isGoBack: true });
      return;
    }
  }, [user]);

  // Load locations
  useEffect(() => {
    async function loadLocations() {
      setLoading(true);
      try {
        const locationData = await getLocations();
        setLocations(locationData);

        // If editing, find and set the selected location
        if (editMode && priceData.locationId) {
          const selectedLoc = locationData.find(
            (loc) => loc.id === priceData.locationId
          );
          setSelectedLocation(selectedLoc);
        }
      } catch (error) {
        console.error("Error loading locations:", error);
        Alert.alert("Error", "Failed to load store locations");
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, []);

  // Handle marker press
  const handleMarkerPress = (location) => {
    setSelectedLocationId(location.id);
    setSelectedLocation(location);

    // Center map on selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
    }
  };

  // Image selection handler
  const handleImageSelection = async (useCamera) => {
    try {
      const permissionType = useCamera
        ? await ImagePicker.getCameraPermissionsAsync()
        : await ImagePicker.getMediaLibraryPermissionsAsync();

      if (!permissionType.granted) {
        Alert.alert(
          `"MasterPrice" Would Like to Access Your ${
            useCamera ? "Camera" : "Photos"
          }`,
          `This lets you ${
            useCamera ? "take" : "choose"
          } photos to share product prices.`,
          [
            { text: "Don't Allow", style: "cancel" },
            {
              text: "OK",
              onPress: async () => {
                const newPermission = useCamera
                  ? await ImagePicker.requestCameraPermissionsAsync()
                  : await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (newPermission.granted) {
                  // Retry the image selection after permission is granted
                  handleImageSelection(useCamera);
                }
              },
            },
          ]
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
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Form validation
  const validateForm = () => {
    if (isNaN(price) || price.trim() === "") {
      Alert.alert("Error", "Please enter a valid price");
      return false;
    }
    if (!selectedLocationId) {
      Alert.alert("Error", "Please select a store location");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      navigation.replace("Login", {
        isGoBack: true,
      });
      return;
    }

    if (!validateForm()) return;

    try {
      const priceData = {
        code,
        productName,
        price: parseFloat(price),
        locationId: selectedLocationId,
      };

      // Add image URI if image was selected
      if (imageUri) {
        priceData.imagePath = imageUri;
      }

      if (editMode) {
        await updateData(
          user.uid,
          priceData,
          "prices",
          route.params.priceData.id
        );
        Alert.alert("Success", "Price updated successfully!");
      } else {
        await writeToDB(user.uid, priceData, "prices");
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
    return <PriceFormSkeleton />;
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
                    style={styles.previewImage}
                    onError={(error) => {
                      console.error("Error loading image:", error);
                      setImageUri(null); // Reset to placeholder if image fails to load
                    }}
                  />
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
                <PressableButton
                  onPress={() => handleImageSelection(true)}
                  componentStyle={styles.imageButton}
                  pressedStyle={styles.imageButtonPressed}
                >
                  <MaterialIcons name="camera-alt" size={20} color="#007AFF" />
                  <Text style={styles.imageButtonText}>Take Photo</Text>
                </PressableButton>
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

          {/* Map Location Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Store Location</Text>

            {/* Selected Location Display */}
            {selectedLocation && (
              <View style={styles.selectedLocationContainer}>
                <Image
                  source={
                    chainLogoMapping[selectedLocation.chainId.toLowerCase()]
                  }
                  style={styles.chainLogo}
                  resizeMode="contain"
                />
                <Text style={styles.selectedLocationText}>
                  {selectedLocation.name}
                </Text>
              </View>
            )}

            {/* Map View */}
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={calculateRegion(
                  locations.map((loc) => ({
                    latitude: loc.coordinates.latitude,
                    longitude: loc.coordinates.longitude,
                  }))
                )}
              >
                {locations.map((location) => (
                  <Marker
                    key={location.id}
                    coordinate={{
                      latitude: location.coordinates.latitude,
                      longitude: location.coordinates.longitude,
                    }}
                    onPress={() => handleMarkerPress(location)}
                    pinColor={
                      selectedLocationId === location.id ? "#007AFF" : "#FF3B30"
                    }
                  >
                    <Callout>
                      <View style={styles.calloutContainer}>
                        <Text style={styles.calloutTitle}>{location.name}</Text>
                        <Text style={styles.calloutAddress}>
                          {location.address.street}
                        </Text>
                      </View>
                    </Callout>
                  </Marker>
                ))}
              </MapView>
            </View>
          </View>

          {/* Submit Button*/}
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
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
  },
  map: {
    flex: 1,
  },
  selectedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    marginBottom: 8,
  },
  chainLogo: {
    width: 80,
    height: 30,
    marginRight: 12,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  calloutContainer: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: "#666",
  },
});
