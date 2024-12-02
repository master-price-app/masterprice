import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { isWithinCurrentCycle, isMasterPrice } from "../../utils/priceUtils";
import { calculateRegion, handleLocationTracking } from "../../utils/mapUtils";
import { subscribeToPricesByProduct } from "../../services/priceService";
import {
  getLocationById,
  subscribeToMartCycles,
} from "../../services/martService";
import { useAuth } from "../../contexts/AuthContext";
import ProductDetailSkeleton from "../../components/skeleton/ProductDetailSkeleton";
import PressableButton from "../../components/PressableButton";
import PriceListItem from "../../components/PriceListItem";
import CustomMarker from "../../components/CustomMarker";

// Import dummy data for backup
const dummyProduct = require("../../assets/dummyData/dummyProduct.json");

export default function ProductDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const { code } = route.params;
  const [product, setProduct] = useState(null);
  const [prices, setPrices] = useState([]);
  const [martCycles, setMartCycles] = useState({});
  const [sortByLowest, setSortByLowest] = useState(false);
  const [martLocations, setMartLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Fetch product details from API
  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://world.openfoodfacts.net/api/v2/product/${code}`
        );
        const data = await response.json();

        if (data.product) {
          setProduct(data.product);
        } else {
          console.log("Loading backup data");
          setProduct(dummyProduct.product);
        }
      } catch (err) {
        console.error("API Error:", err);
        console.log("Loading backup data");
        setProduct(dummyProduct.product);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [code]);

  // Fetch mart locations for Firebase
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationPromises = prices.map((price) => {
          return getLocationById(price.locationId);
        });
        const locations = await Promise.all(locationPromises);

        // Filter invalid locations and remove duplicates using Map
        const uniqueLocations = [
          ...new Map(
            locations
              .filter((loc) => loc?.location?.coordinates)
              .map((loc) => [loc.location.id, loc.location])
          ).values(),
        ];

        setMartLocations(uniqueLocations);
      } catch (err) {
        console.error("Error fetching mart locations: ", err);
      }
    };

    if (prices.length > 0) {
      fetchLocations();
    }
  }, [prices]);

  // Subscribe to mart cycles
  useEffect(() => {
    const unsubscribe = subscribeToMartCycles((newMartCycles) => {
      setMartCycles(newMartCycles);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Subscribe to prices
  useEffect(() => {
    const unsubscribe = subscribeToPricesByProduct(code, (newPrices) => {
      setPrices(newPrices);
    });

    return () => unsubscribe && unsubscribe();
  }, [code]);

  // Process and sort prices
  const processedPrices = prices.map((price) => {
    const locationCycle = martCycles[price.locationId];

    return {
      ...price,
      isValid: locationCycle?.chain
        ? isWithinCurrentCycle(price.createdAt, locationCycle.chain)
        : false,
      isMasterPrice: isMasterPrice(price, prices, martCycles),
    };
  });

  // Sort prices based on the toggle
  const sortedPrices = [...processedPrices].sort((a, b) => {
    if (sortByLowest) {
      return a.price - b.price;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Handle locating user
  const handleLocateUser = useCallback(async () => {
    // Get all the mart points
    const martPoints = martLocations.map((location) => ({
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
    }));

    await handleLocationTracking({
      setUserLocation,
      setLocationSubscription,
      locationSubscription,
      mapRef,
      points: martPoints,
    });
  }, [locationSubscription, martLocations]);

  // Handle add price button press
  const handleAddPrice = () => {
    if (!user) {
      navigation.navigate("Login", {
        returnScreen: "PriceForm",
        returnParams: {
          code,
          productName: product.product_name,
        },
      });
      return;
    }

    navigation.navigate("PriceForm", {
      code,
      productName: product.product_name,
    });
  };

  const renderPriceItem = ({ item }) => (
    <PriceListItem
      price={item}
      isMasterPrice={item.isMasterPrice}
      isValid={item.isValid}
      onPress={() =>
        navigation.navigate("PriceDetail", {
          priceData: item,
          productName: product.product_name,
          productQuantity: product.product_quantity,
          productUnit: product.product_quantity_unit,
          productImage: product.image_url,
        })
      }
    />
  );

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Loading state
  if (loading || !product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Header */}
      <View style={styles.productHeader}>
        <View style={styles.productBasicInfo}>
          {product.image_url && (
            <Image
              source={{ uri: product.image_url }}
              onError={(error) =>
                console.log("Error loading product image: ", error)
              }
              style={styles.productThumbnail}
            />
          )}
          <View style={styles.productTextInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.product_name}
            </Text>
            <Text style={styles.productSubInfo} numberOfLines={1}>
              {product.brands} · {product.product_quantity}
              {product.product_quantity_unit}
            </Text>
          </View>
        </View>
      </View>

      {/* Map Section */}
      <View style={styles.mapSection}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={calculateRegion(
            martLocations.map((location) => ({
              latitude: location.coordinates.latitude,
              longitude: location.coordinates.longitude,
            }))
          )}
        >
          {martLocations.map((location) => {
            const locationPrice = sortedPrices.find(
              (price) => price.locationId === location.id
            );
            const isMasterPrice = locationPrice?.isMasterPrice;

            return (
              <CustomMarker
                key={location.id}
                location={location}
                locationPrice={locationPrice}
                product={product}
                navigation={navigation}
                isMasterPrice={isMasterPrice}
              />
            );
          })}
          {userLocation && (
            <Marker coordinate={userLocation}>
              <View style={styles.userLocationMarker}>
                <View style={styles.userLocationDot} />
              </View>
            </Marker>
          )}
        </MapView>

        <PressableButton
          onPress={handleLocateUser}
          componentStyle={[
            styles.locationButton,
            userLocation && styles.locationButtonActive,
          ]}
        >
          <MaterialIcons
            name="my-location"
            size={24}
            color={userLocation ? "#007AFF" : "#666"}
          />
        </PressableButton>
      </View>

      {/* Prices Section */}
      <View style={styles.priceSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Price History</Text>
          <PressableButton
            onPress={handleAddPrice}
            componentStyle={styles.addButton}
          >
            <Text style={styles.addButtonText}>Share New Price</Text>
          </PressableButton>
        </View>

        {/* Sort Toggle */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortText}>
            {sortByLowest ? "Lowest Price" : "Latest Posted"}
          </Text>
          <Switch
            value={sortByLowest}
            onValueChange={setSortByLowest}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={sortByLowest ? "#007AFF" : "#f4f3f4"}
          />
        </View>

        {/* Price List */}
        <FlatList
          data={sortedPrices}
          renderItem={renderPriceItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No price information available yet.
            </Text>
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 16,
    textAlign: "center",
  },
  // Product Header
  productHeader: {
    backgroundColor: "white",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  productBasicInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  productThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  productTextInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
  },
  productSubInfo: {
    fontSize: 14,
    color: "#666",
  },
  // Map Section
  mapSection: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerLogo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "white",
  },
  locationButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "white",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationButtonActive: {
    backgroundColor: "#f0f9ff",
  },
  // Prices Section
  priceSection: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 16,
  },
  sortText: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginTop: 16,
  },
});
