import { StyleSheet, Text, View, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PressableButton from "./PressableButton";

export default function ShoppingListItem({
  price,
  onPress,
  onCheckboxPress,
  isSelected,
  isManaging,
}) {
  return (
    <View style={styles.container}>
      <PressableButton
        onPress={() => onPress(price)}
        componentStyle={styles.pressableContent}
        pressedStyle={styles.pressedContent}
      >
        <View style={styles.content}>
          {/* Image */}
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

          {/* Details */}
          <View style={styles.detailsContainer}>
            {/* Product name and price */}
            <View style={styles.topRow}>
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
                  styles.price,
                  price.isMasterPrice && styles.masterPrice,
                  !price.isValid && styles.expiredText,
                ]}
              >
                ${price.price.toFixed(2)}
              </Text>
            </View>

            {/* Location */}
            <Text
              style={[
                styles.locationName,
                !price.isValid && styles.expiredText,
              ]}
              numberOfLines={1}
            >
              {price.locationName}
            </Text>

            {/* Badges */}
            <View style={styles.badgeRow}>
              {price.isMasterPrice && (
                <View style={styles.masterBadge}>
                  <MaterialIcons name="verified" size={12} color="#007AFF" />
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
            <View style={styles.dateRow}>
              <MaterialIcons name="schedule" size={12} color="#666" />
              <Text
                style={[styles.dateText, !price.isValid && styles.expiredText]}
              >
                {new Date(price.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </PressableButton>

      {/* Expired overlay */}
      {!price.isValid && (
        <View style={styles.expiredOverlay} pointerEvents="none" />
      )}

      {/* Checkbox on top */}
      <PressableButton
        onPress={() => onCheckboxPress(price)}
        componentStyle={styles.checkboxContainer}
      >
        <MaterialIcons
          name={isSelected ? "check-box" : "check-box-outline-blank"}
          size={24}
          color={isSelected ? "#007AFF" : "#666"}
        />
      </PressableButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    position: "relative",
  },
  pressableContent: {
    backgroundColor: "transparent",
    zIndex: 1,
  },
  pressedContent: {
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 12,
    paddingLeft: 44,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 6,
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
  },
  detailsContainer: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  locationName: {
    fontSize: 13,
    color: "#666",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  masterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#007AFF20",
  },
  masterText: {
    marginLeft: 2,
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  validBadge: {
    backgroundColor: "#E8F5E9",
  },
  expiredBadge: {
    backgroundColor: "#dedede",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  validText: {
    color: "#2E7D32",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  masterPrice: {
    color: "#007AFF",
    fontWeight: "700",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
  expiredText: {
    color: "#666",
  },
  expiredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: 2,
    pointerEvents: "none", 
  },
  checkboxContainer: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 4,
    zIndex: 3, 
  },
});
