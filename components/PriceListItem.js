import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { chainLogoMapping } from "../services/martService";
import { getLocationById } from "../services/martService";
import PressableButton from "./PressableButton";

export default function PriceListItem({
  price,
  onPress,
  isMasterPrice,
  isValid,
}) {
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    async function loadLocationData() {
      if (price.locationId) {
        const data = await getLocationById(price.locationId);
        setLocationData(data);
      }
    }

    loadLocationData();
  }, [price.locationId]);

  const getChainLogo = (chainId) => {
    if (!chainId) return null;
    return chainLogoMapping[chainId.toLowerCase()] || null;
  };

  return (
    <View style={styles.wrapper}>
      <PressableButton
        onPress={onPress}
        componentStyle={[
          styles.container,
          isMasterPrice && styles.masterPriceItem,
          !isValid && styles.expiredItem,
        ]}
        pressedStyle={[
          styles.containerPressed,
          isMasterPrice && styles.masterPricePressed,
        ]}
      >
        <View style={styles.priceItem}>
          {/* Main Row with Logo and Price */}
          <View style={styles.mainRow}>
            <View style={styles.chainLogoContainer}>
              {locationData?.chain?.chainId ? (
                <Image
                  source={getChainLogo(locationData.chain.chainId)}
                  onError={(error) =>
                    console.log("Error loading chain logo: ", error)
                  }
                  style={[styles.chainLogo, !isValid && styles.expiredImage]}
                />
              ) : (
                <MaterialIcons
                  name="store"
                  size={24}
                  color={!isValid ? "#999" : "#666"}
                />
              )}
            </View>

            <View style={styles.priceContainer}>
              <Text
                style={[
                  styles.priceText,
                  isMasterPrice && styles.masterPriceText,
                  !isValid && styles.expiredText,
                ]}
              >
                ${price.price.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Info Row with Store Name and Badge */}
          <View style={styles.infoRow}>
            <Text
              style={[styles.storeText, !isValid && styles.expiredText]}
              numberOfLines={2}
            >
              {locationData?.location?.name || "Loading..."}
            </Text>
            {isMasterPrice && isValid ? (
              <View style={styles.masterBadge}>
                <MaterialIcons name="verified" size={14} color="#007AFF" />
                <Text style={styles.masterText}>Master Price</Text>
              </View>
            ) : !isValid ? (
              <View style={styles.expiredBadge}>
                <MaterialIcons name="timer-off" size={14} color="#6B7280" />
                <Text style={styles.expiredBadgeText}>Expired</Text>
              </View>
            ) : null}
          </View>

          {/* Date Row */}
          <View style={styles.dateRow}>
            <MaterialIcons
              name="schedule"
              size={14}
              color={!isValid ? "#9CA3AF" : "#6B7280"}
            />
            <Text style={[styles.dateText, !isValid && styles.expiredText]}>
              Found on {new Date(price.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </PressableButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 4,
    width: "100%",
    flexGrow: 1, 
  },
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerPressed: {
    backgroundColor: "#F3F4F6",
  },
  masterPriceItem: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#007AFF20",
  },
  masterPricePressed: {
    backgroundColor: "#E1F0FF",
  },
  expiredItem: {
    backgroundColor: "#F9FAFB",
    opacity: 0.9,
  },
  priceItem: {
    padding: 16,
    gap: 8,
  },
  mainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chainLogoContainer: {
    width: 80,
    height: 30,
    justifyContent: "center",
  },
  chainLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  expiredImage: {
    opacity: 0.6,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 12,
  },
  masterPriceText: {
    color: "#007AFF",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  storeText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  expiredText: {
    color: "#9CA3AF",
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
  expiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  expiredBadgeText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
  },
});