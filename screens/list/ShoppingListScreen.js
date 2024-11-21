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

  // Subscribe to shopping list
  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToShoppingList(user.uid, (transformedData) => {
      setShoppingList(transformedData);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  // Set the header right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <PressableButton
          onPress={() => setIsManaging(!isManaging)}
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
      // Multiple selection mode
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
      // Normal mode - navigate to price detail
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

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Empty state
  if (shoppingList.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="shopping-cart" size={48} color="#999" />
        <Text style={styles.emptyText}>Your shopping list is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={shoppingList}
        keyExtractor={(item) => item.id}
        renderItem={({ item, section }) => (
          <ShoppingListItem
            price={item}
            onPress={() => handleItemPress(item)}
            isSelected={selectedItems.has(item.id)}
            showCheckbox={isManaging}
          />
        )}
        stickySectionHeadersEnabled={false}
        // List content style
        contentContainerStyle={styles.listContent}
        // Render section header
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeader}>
            <MaterialIcons name="store" size={20} color="#666" />
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.itemCount}>{data.length} items</Text>
          </View>
        )}
        // Render section footer
        renderSectionFooter={() => <View style={styles.sectionFooter} />}
      />

      {/* Delete button - only show when managing and selected items */}
      {isManaging && selectedItems.size > 0 && (
        <View style={styles.deleteButtonContainer}>
          <PressableButton
            onPress={handleDelete}
            componentStyle={styles.deleteButton}
            pressedStyle={styles.deleteButtonPressed}
          >
            <MaterialIcons name="delete" size={24} color="#fff" />
            <Text style={styles.deleteButtonText}>
              Delete Selected ({selectedItems.size})
            </Text>
          </PressableButton>
        </View>
      )}
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
  emptyText: {
    marginTop: 12,
    fontSize: 16,
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
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  sectionTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sectionFooter: {
    height: 16,
    marginBottom: 16,
    backgroundColor: "white",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  deleteButtonContainer: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff3b30",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
