import { useState, useEffect } from "react";
import { Text, View, Image, FlatList } from "react-native";
import PressableButton from "../../components/PressableButton";

export default function SearchResultScreen({ navigation, route }) {
  const { barcode, keyword } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // For barcode scan - direct navigation
  useEffect(() => {
    if (barcode && products.length === 1) {
      // Navigate to the CommonStack and then to ProductDetail
      navigation.navigate("Common", {
        screen: "ProductDetail",
        params: { code: barcode },
      });
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
          fields:
            "code,product_name,product_quantity,product_quantity_unit,brands,image_url",
        });
        url = `${baseUrl}?${params.toString()}`;
      } else if (barcode) {
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
      const products = keyword ? data.products : data.products || [];
      setProducts(products);
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // For search result item press
  const handleProductPress = (code) => {
    navigation.navigate("Common", {
      screen: "ProductDetail",
      params: { code },
    });
  };

  const renderProduct = ({ item }) => (
    <PressableButton
      pressedHandler={() => handleProductPress(item.code)}
      componentStyle={{ marginVertical: 5 }}
    >
      <View>
        <Image
          source={{ uri: item.image_url }}
          style={{ width: 80, height: 80 }}
        />
        <Text>{item.code}</Text>
        <Text>{item.product_name}</Text>
        <Text>{item.brands}</Text>
        <Text>
          {item.product_quantity
            ? `${item.product_quantity}${item.product_quantity_unit}`
            : "Quantity not specified"}
        </Text>
      </View>
    </PressableButton>
  );

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>{error}</Text>;
  if (!products.length)
    return (
      <View>
        <Text>Didn't find what you are looking for?</Text>
        <Text>Try another keyword.</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.code}
        ListFooterComponent={() => (
          <View>
            <Text>Didn't find what you are looking for?</Text>
            <Text>Try another keyword.</Text>
          </View>
        )}
      />
    </View>
  );
}
