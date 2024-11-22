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
      navigation.replace("Login");
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToShoppingList(user.uid, (transformedData) => {
      setShoppingList(transformedData);

      // Calculate total price of valid items
      const total = transformedData.reduce(
        (sum, section) =>
          sum +
          section.data.reduce(
            (sectionSum, item) => sectionSum + (item.isValid ? item.price : 0),
            0
          ),
        0
      );
      setTotalPrice(total);
      setLoading(false);
    });

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
      });
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
            onPress={() => handleItemPress(item)}
            isSelected={selectedItems.has(item.id)}
            showCheckbox={isManaging}
          />
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[
          styles.listContent,
          isManaging && styles.listContentWithActions,
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
        ListFooterComponent={
          !isManaging && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
            </View>
          )
        }
      />

      {isManaging && (
        <View style={styles.bottomActionsContainer}>
          <PressableButton
            onPress={handleDelete}
            componentStyle={[
              styles.actionButton,
              styles.deleteButton,
              !selectedItems.size && styles.disabledButton,
            ]}
            pressedStyle={styles.deleteButtonPressed}
            disabled={!selectedItems.size}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </PressableButton>

          <View style={styles.selectedTotalContainer}>
            <Text style={styles.selectedTotalLabel}>Selected:</Text>
            <Text style={styles.selectedTotalAmount}>
              ${selectedTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
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
    paddingBottom: 90, // Extra padding when actions are shown
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
});
