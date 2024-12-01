import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import {
  removeMultipleFromShoppingList,
  subscribeToShoppingList,
} from "../../services/shoppingListService";
import { getPriceImageUrl } from "../../services/priceService";
import PressableButton from "../../components/PressableButton";
import ShoppingListItem from "../../components/ShoppingListItem";

export default function ShoppingListScreen({ navigation }) {
  const { user } = useAuth();
  const [shoppingList, setShoppingList] = useState([]);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);

  // Subscribe to shopping list
  useEffect(() => {
    if (!user) {
      navigation.replace("Login", {
        isGoBack: true,
      });
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToShoppingList(
      user.uid,
      async (transformedData) => {
        // Process each section's data to include image URLs
        const processedSections = await Promise.all(
          transformedData.map(async (section) => {
            const processedItems = await Promise.all(
              section.data.map(async (item) => {
                let productImageUrl = null;

                // Try to get user-uploaded image first
                if (item.imagePath) {
                  try {
                    productImageUrl = await getPriceImageUrl(item.imagePath);
                  } catch (error) {
                    console.error("Error getting uploaded image:", error);
                  }
                }

                // If no user image, try to get API image
                if (!productImageUrl && item.code) {
                  try {
                    const response = await fetch(
                      `https://world.openfoodfacts.net/api/v2/product/${item.code}`
                    );
                    const data = await response.json();
                    productImageUrl = data.product?.image_url || null;
                  } catch (error) {
                    console.error("Error fetching product API image:", error);
                  }
                }

                return {
                  ...item,
                  productImageUrl,
                };
              })
            );

            return {
              ...section,
              data: processedItems,
            };
          })
        );

        setShoppingList(processedSections);

        // Calculate total price of valid items
        const total = processedSections.reduce(
          (sum, section) =>
            sum +
            section.data.reduce(
              (sectionSum, item) =>
                sectionSum + (item.isValid ? item.price : 0),
              0
            ),
          0
        );
        setTotalPrice(total);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Update selected total when selections change
  useEffect(() => {
    const selected = Array.from(selectedItems);
    const selectedSum = shoppingList.reduce((total, section) => {
      return (
        total +
        section.data.reduce((sum, item) => {
          if (selected.includes(item.id) && item.isValid) {
            return sum + item.price;
          }
          return sum;
        }, 0)
      );
    }, 0);
    setSelectedTotal(selectedSum);
  }, [selectedItems, shoppingList]);

  // Set the header right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <PressableButton
          onPress={() => {
            setIsManaging(!isManaging);
            setSelectedItems(new Set()); // Clear selections when toggling manage mode
          }}
          componentStyle={styles.headerButton}
          pressedStyle={styles.headerButtonPressed}
        >
          <Text style={styles.headerButtonText}>
            {isManaging ? "Done" : "Manage"}
          </Text>
        </PressableButton>
      ),
    });
  }, [isManaging]);

  // Handle item press
  const handleItemPress = (price) => {
    if (isManaging) {
      setSelectedItems((prev) => {
        const newSelected = new Set(prev);
        if (newSelected.has(price.id)) {
          newSelected.delete(price.id);
        } else {
          newSelected.add(price.id);
        }
        return newSelected;
      });
    } else {
      navigation.navigate("PriceDetail", {
        priceData: price,
        productName: price.productName,
        productImage: price.productImageUrl,
      });
    }
  };

  // Handle delete single item
  const handleDeleteSingleItem = async (item) => {
    if (!user) return;

    try {
      await removeMultipleFromShoppingList(user.uid, [
        {
          priceId: item.id,
          locationId: item.locationId,
        },
      ]);
    } catch (error) {
      console.error("Failed to delete item:", error);
      Alert.alert("Error", "Failed to delete item", [{ text: "OK" }]);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user) return;

    try {
      const itemsToDelete = Array.from(selectedItems).map((id) => {
        const section = shoppingList.find((s) =>
          s.data.some((item) => item.id === id)
        );
        const item = section?.data.find((item) => item.id === id);

        return {
          priceId: id,
          locationId: item.locationId,
        };
      });

      await removeMultipleFromShoppingList(user.uid, itemsToDelete);

      setSelectedItems(new Set());
      setIsManaging(false);
    } catch (error) {
      console.error("Failed to delete items:", error);
      Alert.alert("Error", "Failed to delete selected items", [{ text: "OK" }]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (shoppingList.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="shopping-cart" size={48} color="#999" />
        <Text style={styles.emptyText}>Your shopping list is empty</Text>
        <Text style={styles.subText}>
          Add items from product pages to start your list
        </Text>
      </View>
    );
  }

return (
  <View style={styles.container}>
    <SectionList
      sections={shoppingList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ShoppingListItem
          price={item}
          onPress={() =>
            navigation.navigate("PriceDetail", {
              priceData: item,
              productName: item.productName,
              productImage: item.productImageUrl,
            })
          }
          onCheckboxPress={(price) => {
            setSelectedItems((prev) => {
              const newSelected = new Set(prev);
              if (newSelected.has(price.id)) {
                newSelected.delete(price.id);
              } else {
                newSelected.add(price.id);
              }
              return newSelected;
            });
          }}
          onDelete={handleDeleteSingleItem}
          isSelected={selectedItems.has(item.id)}
          isManaging={isManaging}
        />
      )}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={[
        styles.listContent,
        styles.listContentWithActions,
      ]}
      renderSectionHeader={({ section: { title, data } }) => (
        <View style={styles.sectionHeader}>
          <MaterialIcons name="store" size={20} color="#666" />
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.itemCount}>
            {data.length} item{data.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}
      renderSectionFooter={({ section }) => {
        const sectionTotal = section.data.reduce(
          (sum, item) => sum + (item.isValid ? item.price : 0),
          0
        );
        return (
          <View style={styles.sectionFooter}>
            <Text style={styles.sectionTotal}>
              Section Total: ${sectionTotal.toFixed(2)}
            </Text>
          </View>
        );
      }}
    />

    {/* bottom actions container */}
    <View style={styles.bottomActionsContainer}>
      {isManaging ? (
        <View style={styles.deleteContainer}>
          <PressableButton
            onPress={handleDelete}
            componentStyle={[
              styles.deleteSelectedButton,
              !selectedItems.size && styles.disabledButton,
            ]}
            pressedStyle={styles.deleteSelectedButtonPressed}
            disabled={!selectedItems.size}
          >
            <Text style={styles.deleteSelectedText}>Delete Selected</Text>
          </PressableButton>
        </View>
      ) : (
        <View style={styles.totalContainer}>
          <Text style={styles.selectedTotalLabel}>Selected Total:</Text>
          <Text style={styles.selectedTotalAmount}>
            ${selectedTotal.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
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
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listContentWithActions: {
    paddingBottom: 90,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 1,
  },
  sectionTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  sectionFooter: {
    padding: 12,
    backgroundColor: "white",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 16,
  },
  sectionTotal: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "right",
  },
  totalContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
  },
  bottomActionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
  },
  deleteButtonPressed: {
    backgroundColor: "#dd3228",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedTotalContainer: {
    alignItems: "flex-end",
  },
  selectedTotalLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  selectedTotalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
  },
  listContentWithActions: {
    paddingBottom: 90,
  },
  bottomActionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteContainer: {
    alignItems: "flex-end",
  },
  deleteSelectedButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
  },
  deleteSelectedButtonPressed: {
    backgroundColor: "#dd3228",
  },
  deleteSelectedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedTotalLabel: {
    fontSize: 16,
    color: "#666",
  },
  selectedTotalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  disabledCheckbox: {
    opacity: 0.5,
  },
});
