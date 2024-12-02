import { useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { collection, query, where } from "firebase/firestore";
import { database } from "../../services/firebaseSetup";
import { subscribeToPricesByProduct } from "../../services/priceService";
import { subscribeToMartCycles } from "../../services/martService";
import { isMasterPrice, isWithinCurrentCycle } from "../../utils/priceUtils";
import ProductListItem from "../../components/ProductListItem";

export default function SearchResultScreen({ navigation, route }) {
  const { barcode, keyword } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productPrices, setProductPrices] = useState({});
  const [martCycles, setMartCycles] = useState({});
  const dummyProduct = require("../../assets/dummyData/dummyProduct.json");

  // Subscribe to mart cycles
  useEffect(() => {
    const unsubscribe = subscribeToMartCycles((cyclesData) => {
      setMartCycles(cyclesData);
    });
    return () => unsubscribe?.();
  }, []);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  // Subscribe to prices for each product
  useEffect(() => {
    const priceSubscriptions = {};
    
    products.forEach(product => {
      const unsubscribe = subscribeToPricesByProduct(product.code, (prices) => {
        setProductPrices(prev => ({
          ...prev,
          [product.code]: prices.map(price => ({
            ...price,
            isValid: martCycles[price.locationId]?.chain 
              ? isWithinCurrentCycle(price.createdAt, martCycles[price.locationId].chain)
              : false
          }))
        }));
      });
      priceSubscriptions[product.code] = unsubscribe;
    });

    return () => {
      Object.values(priceSubscriptions).forEach(unsubscribe => unsubscribe?.());
    };
  }, [products, martCycles]);

  // For barcode scan - direct navigation
  useEffect(() => {
    if (barcode && products.length === 1) {
      navigation.navigate("ProductDetail", { code: barcode });
    }
  }, [products, barcode]);

  const fetchProducts = async () => {
    try {
      const baseUrl = keyword
        ? "https://world.openfoodfacts.org/cgi/search.pl"
        : "https://world.openfoodfacts.net/api/v2/search";

      let url;
      if (keyword) {
        const params = new URLSearchParams({
          search_terms: keyword,
          json: 1,
          page_size: 5,
          fields: "code,product_name,product_quantity,product_quantity_unit,brands,image_url",
        });
        url = `${baseUrl}?${params.toString()}`;
      } else if (barcode) {
        const params = new URLSearchParams({
          code: barcode,
          fields: "code,product_name,product_quantity,product_quantity_unit,brands,image_url",
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
        if (barcode || keyword) {
          setProducts([{
            code: dummyProduct.code,
            product_name: dummyProduct.product.product_name,
            product_quantity: dummyProduct.product.product_quantity,
            product_quantity_unit: dummyProduct.product.product_quantity_unit,
            brands: dummyProduct.product.brands,
            image_url: dummyProduct.product.image_url,
          }]);
        }
      }
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMasterPrice = (productCode) => {
    const prices = productPrices[productCode] || [];
    const validPrices = prices.filter(price => price.isValid);
    
    if (validPrices.length === 0) return null;

    return Math.min(...validPrices.map(price => price.price));
  };

  const handleProductPress = (code) => {
    navigation.navigate("ProductDetail", { code });
  };

  const renderProduct = ({ item }) => (
    <ProductListItem
      product={item}
      masterPrice={getMasterPrice(item.code)}
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

