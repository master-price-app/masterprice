import { useState, useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getLocationById, chainLogoMapping } from "../services/martService";
import PressableButton from "./PressableButton";

export default function PricePostListItem({ post, onPress }) {
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    async function loadLocationData() {
      if (post.locationId) {
        const data = await getLocationById(post.locationId);
        setLocationData(data);
      }
    }
    loadLocationData();
  }, [post.locationId]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getChainLogo = (chainId) => {
    if (!chainId) return null;
    return chainLogoMapping[chainId.toLowerCase()] || null;
  };

  return (
    <PressableButton onPress={onPress}>
      <View style={[styles.card, !post.isValid && styles.expiredCard]}>
        <View style={styles.cardContent}>
          {/* Left: Product Image */}
          <Image
            source={{ uri: post.productImageUrl }}
            style={styles.productImage}
            onError={(error) => console.log("Error loading image:", error)}
            defaultSource={require("../assets/default-product.png")}
          />

          {/* Right: Product Info */}
          <View style={styles.infoContainer}>
            {/* Header with product name and price */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.productName,
                    !post.isValid && styles.expiredText,
                  ]}
                  numberOfLines={2}
                >
                  {post.productName}
                </Text>
                {post.isMasterPrice && (
                  <View style={styles.masterBadge}>
                    <MaterialIcons name="verified" size={16} color="#007AFF" />
                    <Text style={styles.masterText}>Master Price</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.price, !post.isValid && styles.expiredText]}>
                ${post.price.toFixed(2)}
              </Text>
            </View>

            {/* Details */}
            <View style={styles.details}>
              <View style={styles.storeDetail}>
                {locationData?.chain?.chainId ? (
                  <View style={styles.chainLogoContainer}>
                    <Image
                      source={getChainLogo(locationData.chain.chainId)}
                      onError={(error) =>
                        console.log("Error loading chain logo:", error)
                      }
                      style={styles.chainLogo}
                    />
                  </View>
                ) : (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="store" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {locationData?.location?.name || "Loading..."}
                    </Text>
                  </View>
                )}
              </View>

              {/* Date */}
              <View style={styles.detailRow}>
                <MaterialIcons name="schedule" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Posted: {formatDate(post.createdAt)}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.footer}>
              <View
                style={[
                  styles.statusBadge,
                  post.isValid ? styles.validBadge : styles.expiredBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    post.isValid ? styles.validText : styles.expiredText,
                  ]}
                >
                  {post.isValid ? "Valid" : "Expired"}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#999" />
            </View>
          </View>
        </View>

        {/* Expired overlay */}
        {!post.isValid && <View style={styles.expiredOverlay} />}
      </View>
    </PressableButton>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  expiredCard: {
    backgroundColor: "#f8f8f8",
  },
  expiredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: 1,
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  masterBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  masterText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  details: {
    marginBottom: 8,
  },
  storeDetail: {
    marginBottom: 4,
  },
  chainLogoContainer: {
    width: 80,
    height: 24,
    marginVertical: 4,
  },
  chainLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    color: "#333",
  },
});
