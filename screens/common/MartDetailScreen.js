import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getLocationById, chainLogoMapping } from "../../services/martService";

export default function MartDetailScreen({ navigation, route }) {
  const { locationId } = route.params;
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    const loadLocationData = async () => {
      if (locationId) {
        const data = await getLocationById(locationId);
        setLocationData(data);
      }
    };
    loadLocationData();
  }, [locationId]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Loading state
  if (!locationData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { chain, location } = locationData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* TODO: Remove this button may be not needed */}
        {/* Back Button */}
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        {/* Chain Logo */}
        <Image
          source={chainLogoMapping[chain.chainId.toLowerCase()]}
          style={styles.logo}
        />
        {/* Chain Name */}
        <Text style={styles.chainName}>{chain.chainName}</Text>
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="location-on" size={24} color="#E31837" />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <Text style={styles.locationName}>{location.name}</Text>
        <Text style={styles.address}>
          {location.address.street}
          {"\n"}
          {location.address.city}, {location.address.province}
          {"\n"}
          {location.address.postalCode}
        </Text>
      </View>
    </View>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "white",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logo: {
    width: 150,
    height: 60,
    resizeMode: "contain",
    marginHorizontal: 16,
  },
  chainName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  section: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
});
