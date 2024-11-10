import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";
import { subscribeToPricesByProduct } from "../../services/priceService";
import PressableButton from "../../components/PressableButton";

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

const renderPriceItem = ({ item }) => (
  <PressableButton
    pressedHandler={() =>
      navigation.navigate("PriceDetail", {
        priceData: item,
        productName: product.product_name,
        productQuantity: product.product_quantity,
        productUnit: product.product_quantity_unit,
        productImage: product.image_url,
      })
    }
  >
    <View
      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}
    >
      <Text>Store: {item.store}</Text>
      <Text>Price: ${item.price}</Text>
      <Text>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  </PressableButton>
);

 const handleAddPrice = () => {
   navigation.navigate("PriceForm", {
     code,
     productName: product.product_name,
   });
 };

  if (error) return <Text>{error}</Text>;
  if (!product) return <Text>Loading...</Text>;

  return (
    <ScrollView>
      <View>
        {product.image_url && (
          <Image
            source={{ uri: product.image_url }}
            style={{ width: "100%", height: 200 }}
          />
        )}
        <Text>Name: {product.product_name}</Text>
        <Text>Brand: {product.brands}</Text>
        <Text>
          Quantity: {product.product_quantity}
          {product.product_quantity_unit}
        </Text>
        <Text>Code: {code}</Text>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          Price History
        </Text>

        <FlatList
          data={prices}
          renderItem={renderPriceItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={<Text>No price information available yet.</Text>}
          ListFooterComponent={
            <Pressable onPress={handleAddPrice}>
              <View
                style={{
                  padding: 15,
                  alignItems: "center",
                  backgroundColor: "#eee",
                  margin: 10,
                  borderRadius: 8,
                }}
              >
                <Text>Found a cheaper price?</Text>
              </View>
            </Pressable>
          }
        />
      </View>
    </ScrollView>
  );
}
