import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";

export default function CustomMarker({
  location,
  locationPrice,
  product,
  navigation,
  isMasterPrice,
}) {
  const priceDisplay = locationPrice?.price.toFixed(2);
  const title = location.name;
  const description = `$${priceDisplay}`;

  const handleNavigate = () => {
    navigation.navigate("PriceDetail", {
      priceData: locationPrice,
      productName: product.product_name,
      productQuantity: product.product_quantity,
      productUnit: product.product_quantity_unit,
      productImage: product.image_url,
    });
  };

  return (
    <Marker
      coordinate={{
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
      }}
      pinColor={
        isMasterPrice
          ? styles.markerColor.isMasterPrice
          : styles.markerColor.notMasterPrice
      }
      tracksViewChanges={false}
    >
      <Callout tooltip={true} onPress={handleNavigate}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.calloutDescription}>{description}</Text>
            {isMasterPrice && (
              <View style={styles.masterBadge}>
                <MaterialIcons name="verified" size={14} color="#007AFF" />
                <Text style={styles.masterText}>Master Price</Text>
              </View>
            )}
          </View>
          <Text style={styles.calloutLink}>See details</Text>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerColor: {
    isMasterPrice: "#007AFF",
    notMasterPrice: "#FF0000",
  },
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    marginBottom: 8,
  },
  calloutDescription: {
    fontSize: 14,
    color: "#666",
  },
  masterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  masterText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  calloutLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
    textAlign: "right",
    marginTop: 4,
  },
});
