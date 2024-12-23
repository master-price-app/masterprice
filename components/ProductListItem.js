import { Image, Text, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PressableButton from "./PressableButton";

export default function ProductListItem({
  product,
  masterPrice,
  onPress,
  pressedStyle,
}) {
  return (
    <PressableButton
      onPress={() => onPress(product.code)}
      componentStyle={styles.container}
      pressedStyle={pressedStyle}
    >
      <View style={styles.content}>
        <Image
          source={{ uri: product.image_url }}
          onError={(error) =>
            console.log("Error loading product image: ", error)
          }
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {product.product_name}
          </Text>
          {product.brands && (
            <Text style={styles.brand} numberOfLines={1}>
              {product.brands}
            </Text>
          )}
          <Text style={styles.quantity}>
            {product.product_quantity
              ? `${product.product_quantity}${product.product_quantity_unit}`
              : "Quantity not specified"}
          </Text>
          <Text style={styles.code}>Barcode: {product.code}</Text>
        </View>

        <View style={styles.priceContainer}>
          {masterPrice !== null && (
            <>
              <Text style={styles.fromText}>From</Text>
              <Text style={styles.priceLabel}>${masterPrice.toFixed(2)}</Text>
            </>
          )}
        </View>
      </View>
    </PressableButton>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  code: {
    fontSize: 12,
    color: "#999",
  },
  priceContainer: {
    marginLeft: "auto",
    paddingLeft: 12,
    alignItems: "flex-end",
    minWidth: 80,
  },
  fromText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  noPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  noPriceText: {
    fontSize: 12,
    color: "#999",
  },
});
