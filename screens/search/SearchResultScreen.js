import { Text, View, Image, FlatList } from "react-native";
import { useState, useEffect } from "react";

export default function SearchResultScreen({ navigation, route }) {
  const { barcode, keyword } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Use API v1 for text search as mentioned in the documentation
      const baseUrl = keyword
        ? "https://world.openfoodfacts.org/cgi/search.pl"
        : "https://world.openfoodfacts.net/api/v2/search";

      let url;
      if (keyword) {
        // API v1 for text search
        const params = new URLSearchParams({
          search_terms: keyword,
          json: 1,  // Use JSON format
          page_size: 5,  // Limit to 5 results
          fields:
            "code,product_name,product_quantity,product_quantity_unit,brands,image_url",
        });
        url = `${baseUrl}?${params.toString()}`;
      } else if (barcode) {
        // API v2 for barcode search
        const params = new URLSearchParams({
          code: barcode,
          fields:
            "code,product_name,product_quantity,product_quantity_unit,brands,image_url",
          page_size: 5,
        });
        url = `${baseUrl}?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      // Handle different response structures between v1 and v2
      const products = keyword ? data.products : data.products || [];
      setProducts(products);
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains the same
  const renderProduct = ({ item }) => (
    <View>
      <Image
        source={{ uri: item.image_url }}
        style={{ width: 80, height: 80 }}
      />
      <Text>{item.product_name || "Unknown Product"}</Text>
      <Text>{item.brands || "Unknown Brand"}</Text>
      <Text>
        {item.product_quantity
          ? `${item.product_quantity}${item.product_quantity_unit || ""}`
          : "Quantity not specified"}
      </Text>
      <Text>Code: {item.code}</Text>
    </View>
  );

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>{error}</Text>;
  if (products.length === 0) return <Text>No products found</Text>;

  return (
    <View>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.code}
      />
    </View>
  );
}
