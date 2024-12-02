import { useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import ProductListItem from "../../components/ProductListItem";

export default function SearchResultScreen({ navigation, route }) {
  const { barcode, keyword } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dummyProduct = require("../../assets/dummyData/dummyProduct.json");

  useEffect(() => {
    fetchProducts();
  }, []);

  // For barcode scan - direct navigation
  useEffect(() => {
    if (barcode && products.length === 1) {
      // Navigate to the CommonStack and then to ProductDetail
      navigation.navigate("ProductDetail", { code: barcode });
    }
  }, [products, barcode]);

  // TODO: Move to services
  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const baseUrl = keyword
        ? "https://world.openfoodfacts.org/cgi/search.pl"
        : "https://world.openfoodfacts.net/api/v2/search";

      let url;
      if (keyword) {
        // Search by keyword
        const params = new URLSearchParams({
          search_terms: keyword,
          json: 1,
          page_size: 5,
          fields:
            "code,product_name,product_quantity,product_quantity_unit,brands,image_url",
        });
        url = `${baseUrl}?${params.toString()}`;
      } else if (barcode) {
        // Search by barcode
        const params = new URLSearchParams({
          code: barcode,
          fields:
            "code,product_name,product_quantity,product_quantity_unit,brands,image_url",
          page_size: 5,
        });
        url = `${baseUrl}?${params.toString()}`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        const products = keyword ? data.products : data.products || [];
        setProducts(products);
      } catch (apiError) {
        console.log("API no response, read from dummy data", apiError);
        // Use dummy data as fallback
        if (barcode) {
          // If scanning barcode, use the dummy product directly
          setProducts([
            {
              code: dummyProduct.code,
              product_name: dummyProduct.product.product_name,
              product_quantity: dummyProduct.product.product_quantity,
              product_quantity_unit: dummyProduct.product.product_quantity_unit,
              brands: dummyProduct.product.brands,
              image_url: dummyProduct.product.image_url,
            },
          ]);
        } else if (keyword) {
          // If searching by keyword, create an array with the dummy product
          setProducts([
            {
              code: dummyProduct.code,
              product_name: dummyProduct.product.product_name,
              product_quantity: dummyProduct.product.product_quantity,
              product_quantity_unit: dummyProduct.product.product_quantity_unit,
              brands: dummyProduct.product.brands,
              image_url: dummyProduct.product.image_url,
            },
          ]);
        }
      }
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // For search result item press
  // Navigate to product detail
  const handleProductPress = (code) => {
    navigation.navigate("ProductDetail", { code });
  };

  // Render product item
  const renderProduct = ({ item }) => (
    <ProductListItem
      product={item}
      onPress={handleProductPress}
      pressedStyle={styles.productItemPressed}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!products.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          Didn't find what you are looking for?
        </Text>
        <Text style={styles.subText}>Try another keyword.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Didn't find what you are looking for?
            </Text>
            <Text style={styles.subText}>Try another keyword.</Text>
          </View>
        )}
      />
    </View>
  );
}

// Temporary styles
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
  listContent: {
    paddingVertical: 8,
  },
  productItemPressed: {
    backgroundColor: "#f8f8f8",
    transform: [{ scale: 0.98 }],
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});