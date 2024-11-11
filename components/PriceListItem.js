import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { chainLogoMapping } from "../services/martService";
import { getLocationById } from "../services/martService";
import PressableButton from "./PressableButton";

export default function PriceListItem({ price, onPress }) {
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
    <PressableButton pressedHandler={onPress}>
      <View
        style={[
          styles.priceItem,
          price.isMasterPrice && styles.masterPriceItem,
        ]}
      >
        <View style={styles.priceHeader}>
          <View style={styles.storeInfo}>
            {locationData?.chain?.chainId ? (
              <View style={styles.chainLogoContainer}>
                <Image
                  source={getChainLogo(locationData.chain.chainId)}
                  style={styles.chainLogo}
                />
              </View>
            ) : (
              <>
                <MaterialIcons name="store" size={16} color="#666" />
                <Text style={styles.storeText}>
                  {locationData?.location?.name || "Loading..."}
                </Text>
              </>
            )}
          </View>
          <View style={styles.priceInfo}>
            <Text
              style={[
                styles.priceText,
                price.isMasterPrice && styles.masterPriceText,
              ]}
            >
              ${price.price.toFixed(2)}
            </Text>
            {price.isMasterPrice && (
              <View style={styles.masterBadge}>
                <MaterialIcons name="verified" size={14} color="#007AFF" />
                <Text style={styles.masterText}>Master Price</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.priceFooter}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.dateText}>
            {new Date(price.createdAt).toLocaleDateString()}
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
  storeText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
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
