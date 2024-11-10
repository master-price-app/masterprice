import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { subscribeToPricesByProduct } from "../../services/priceService";
import PressableButton from "../../components/PressableButton";
import PriceListItem from "../../components/PriceListItem";

export default function ProductDetailScreen({ navigation, route }) {
  const { code } = route.params;
  const [product, setProduct] = useState(null);
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState(null);

  // Fetch product details from API
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(
          `https://world.openfoodfacts.net/api/v2/product/${code}`
        );
        const data = await response.json();
        if (data.product) {
          setProduct(data.product);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Failed to fetch product details");
        console.error(err);
      }
    };

    fetchProductDetail();
  }, [code]);

  // Subscribe to prices from Firebase using priceService
  useEffect(() => {
    const unsubscribe = subscribeToPricesByProduct(code, (newPrices) => {
      setPrices(newPrices);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe && unsubscribe();
  }, [code]);



  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const renderPriceItem = ({ item }) => (
    <PriceListItem
      price={item}
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

 const handleAddPrice = () => {
   navigation.navigate("PriceForm", {
     code,
     productName: product.product_name,
   });
 };

  return (
<ScrollView style={styles.container}>
      <View style={styles.productCard}>
        {product.image_url && (
          <Image
            source={{ uri: product.image_url }}
            style={styles.productImage}
          />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.product_name}</Text>
          {product.brands && (
            <Text style={styles.brandText}>{product.brands}</Text>
          )}
          <Text style={styles.quantityText}>
            {product.product_quantity}
            {product.product_quantity_unit}
          </Text>
          <Text style={styles.codeText}>Barcode: {code}</Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Price History</Text>
          <PressableButton
            pressedHandler={handleAddPrice}
            componentStyle={styles.addButton}
          >
            <Text style={styles.addButtonText}>Share New Price</Text>
          </PressableButton>
        </View>

        <FlatList
          data={prices}
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

// Temporary styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  brandText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  codeText: {
    fontSize: 12,
    color: '#999',
  },
  priceSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
  },
});