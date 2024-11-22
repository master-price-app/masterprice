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
    <PressableButton onPress={onPress}>
      <View
        style={[
          styles.priceItem,
          isMasterPrice && styles.masterPriceItem,
          !isValid && styles.expiredItem,
        ]}
      >
        <View style={styles.priceHeader}>
          <View style={styles.storeInfo}>
            {locationData?.chain?.chainId ? (
              <View style={styles.chainLogoContainer}>
                <Image
                  source={getChainLogo(locationData.chain.chainId)}
                  onError={(error) =>
                    console.log("Error loading chain logo: ", error)
                  }
                  style={[styles.chainLogo, !isValid && styles.expiredImage]}
                />
              </View>
            ) : (
              <>
                <MaterialIcons
                  name="store"
                  size={16}
                  color={!isValid ? "#999" : "#666"}
                />
                <Text
                  style={[styles.storeText, !isValid && styles.expiredText]}
                >
                  {locationData?.location?.name || "Loading..."}
                </Text>
              </>
            )}
          </View>
          <View style={styles.priceInfo}>
            <Text
              style={[
                styles.priceText,
                isMasterPrice && styles.masterPriceText,
                !isValid && styles.expiredText,
              ]}
            >
              ${price.price.toFixed(2)}
            </Text>
            {isMasterPrice && isValid && (
              <View style={styles.masterBadge}>
                <MaterialIcons name="verified" size={14} color="#007AFF" />
                <Text style={styles.masterText}>Master Price</Text>
              </View>
            )}
            {!isValid && (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredBadgeText}>Expired</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.priceFooter}>
          <Text style={[styles.dateText, !isValid && styles.expiredText]}>
            Found on {new Date(price.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </PressableButton>
  );
}

const styles = StyleSheet.create({
  priceItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  masterPriceItem: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF20",
    marginVertical: 4,
  },
  expiredItem: {
    backgroundColor: "#f5f5f5",
    opacity: 0.8,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chainLogoContainer: {
    width: 80,
    height: 30,
    marginRight: 8,
  },
  chainLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  expiredImage: {
    opacity: 0.5,
  },
  storeText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  expiredText: {
    color: "#999",
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  masterPriceText: {
    color: "#007AFF",
  },
  masterBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  masterText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  expiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  expiredBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#ba1100",
    fontWeight: "500",
  },
  priceFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
});
