import { StyleSheet, Text, View, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PressableButton from "./PressableButton";

export default function ShoppingListItem({
  price,
  onPress,
  isSelected,
  showCheckbox,
}) {
  return (
    <PressableButton onPress={onPress}>
      <View
        style={[
          styles.container,
          price.isMasterPrice && styles.masterPriceContainer,
          !price.isValid && styles.expiredContainer,
        ]}
      >
        <View style={styles.content}>
          {/* Image Section */}
          <View style={styles.imageContainer}>
            {price.productImageUrl ? (
              <Image
                source={{ uri: price.productImageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialIcons name="image" size={24} color="#ccc" />
              </View>
            )}
          </View>
          {/* Details Section */}
          <View style={styles.detailsContainer}>
            {/* Header - Name, Location, Price */}
            <View style={styles.header}>
              {showCheckbox && (
                <MaterialIcons
                  name={isSelected ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color={isSelected ? "#007AFF" : "#666"}
                  style={styles.checkbox}
                />
              )}
              <View style={styles.nameContainer}>
                <Text
                  style={[
                    styles.productName,
                    !price.isValid && styles.expiredText,
                  ]}
                  numberOfLines={1}
                >
                  {price.productName}
                </Text>
                <Text
                  style={[
                    styles.locationName,
                    !price.isValid && styles.expiredText,
                  ]}
                  numberOfLines={1}
                >
                  {price.locationName}
                </Text>
              </View>
              <Text
                style={[
                  styles.price,
                  price.isMasterPrice && styles.masterPrice,
                  !price.isValid && styles.expiredText,
                ]}
              >
                ${price.price.toFixed(2)}
              </Text>
            </View>

            {/* Status Badges */}
            <View style={styles.badgeContainer}>
              {price.isMasterPrice && (
                <View style={styles.masterBadge}>
                  <MaterialIcons name="verified" size={14} color="#007AFF" />
                  <Text style={styles.masterText}>Master Price</Text>
                </View>
              )}
              <View
                style={[
                  styles.statusBadge,
                  price.isValid ? styles.validBadge : styles.expiredBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    price.isValid ? styles.validText : styles.expiredText,
                  ]}
                >
                  {price.isValid ? "Valid" : "Expired"}
                </Text>
              </View>
            </View>

            {/* Date */}
            <View style={styles.footer}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text
                style={[styles.dateText, !price.isValid && styles.expiredText]}
              >
                {new Date(price.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Expired overlay */}
        {!price.isValid && <View style={styles.expiredOverlay} />}
      </View>
    </PressableButton>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    position: "relative",
    overflow: "hidden",
  },
  masterPriceContainer: {
    backgroundColor: "#f0f9ff",
  },
  expiredContainer: {
    backgroundColor: "#f8f8f8",
  },
  expiredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: 1,
  },
  content: {
    padding: 16,
    flexDirection: "row",
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  detailsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  locationName: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  masterPrice: {
    color: "#007AFF",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  masterBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  masterText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  validBadge: {
    backgroundColor: "#E8F5E9",
  },
  expiredBadge: {
    backgroundColor: "#dedede",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  validText: {
    color: "#2E7D32",
  },
  expiredText: {
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  masterPrice: {
    color: "#007AFF",
    fontWeight: "700", // Make it bolder
  },
  masterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff", // Light blue background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#007AFF20", // Very light blue border
  },
  masterText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600", // Make it slightly bolder
  },
});
