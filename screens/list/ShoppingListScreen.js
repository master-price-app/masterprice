import { useEffect, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { subscribeToPricesByShoppingList, removeFromShoppingList } from '../../services/priceService';
import PressableButton from '../../components/PressableButton';
import ShoppingListItem from '../../components/ShoppingListItem';

const PLACEHOLDER_USER_ID = "user123"; // Temporary use, waiting for authentication system implementation
// Temporary data
const DUMMY_DATA = [
  {
    title: "Walmart",
    data: [
      {
        id: "1",
        store: "Walmart",
        price: 2.99,
        productName: "Coca-Cola",
        productQuantity: "330ml",
        createdAt: "2024-03-15",
        isMasterPrice: true,
      },
      {
        id: "2",
        store: "Walmart",
        price: 4.99,
        productName: "Lay's Potato Chips",
        productQuantity: "235g",
        createdAt: "2024-03-14",
      },
    ],
  },
  {
    title: "Costco",
    data: [
      {
        id: "3",
        store: "Costco",
        price: 15.99,
        productName: "Kirkland Paper Towel",
        productQuantity: "12 rolls",
        createdAt: "2024-03-13",
        isMasterPrice: true,
      },
    ],
  },
  {
    title: "Save-On-Foods",
    data: [
      {
        id: "4",
        store: "Save-On-Foods",
        price: 5.99,
        productName: "Bread",
        productQuantity: "675g",
        createdAt: "2024-03-12",
      },
      {
        id: "5",
        store: "Save-On-Foods",
        price: 3.99,
        productName: "Milk",
        productQuantity: "2L",
        createdAt: "2024-03-12",
      },
    ],
  },
];

export default function ShoppingListScreen({ navigation }) {
  const [shoppingList, setShoppingList] = useState([]);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Simulate loading data delay
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate network request delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setShoppingList(DUMMY_DATA);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set the header right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <PressableButton
          pressedHandler={() => setIsManaging(!isManaging)}
          componentStyle={styles.headerButton}
          pressedStyle={styles.headerButtonPressed}
        >
          <Text style={styles.headerButtonText}>
            {isManaging ? 'Done' : 'Manage'}
          </Text>
        </PressableButton>
      ),
    });
  }, [isManaging]);

  // Subscribe to prices by shopping list
  /*
  useEffect(() => {
    const unsubscribe = subscribeToPricesByShoppingList(
      PLACEHOLDER_USER_ID,
      (prices) => {
        // Group the prices by store
        const groupedPrices = prices.reduce((groups, price) => {
          const store = price.store;
          if (!groups[store]) {
            groups[store] = [];
          }
          groups[store].push(price);
          return groups;
        }, {});

        // Convert to the format needed for SectionList
        const sections = Object.entries(groupedPrices).map(([store, data]) => ({
          title: store,
          data,
        }));

        setShoppingList(sections);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);
  */

  const handleItemPress = (price) => {
    if (isManaging) {
      // Multiple selection mode
      setSelectedItems(prev => {
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

  const handleDelete = async () => {
    const selectedIds = Array.from(selectedItems);
    const newShoppingList = shoppingList.map(section => ({
      ...section,
      data: section.data.filter(item => !selectedIds.includes(item.id))
    })).filter(section => section.data.length > 0);

    setShoppingList(newShoppingList);
    setSelectedItems(new Set());
    setIsManaging(false);

    /*
    try {
      // Batch delete selected items
      const deletePromises = Array.from(selectedItems).map(priceId =>
        // TODO: removeFromShoppingList(priceId, PLACEHOLDER_USER_ID)
        console.log("delete priceId: ", priceId)
      );
      await Promise.all(deletePromises);
      
      // Reset the selected state
      setSelectedItems(new Set());
      setIsManaging(false);
    } catch (error) {
      console.error('Failed to delete items:', error);
      // TODO: Show error message
    }
    */
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={shoppingList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeader}>
            <MaterialIcons name="store" size={20} color="#666" />
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.itemCount}>{data.length} items</Text>
          </View>
        )}
        renderItem={({ item, section }) => (
          <ShoppingListItem
            price={item}
            onPress={() => handleItemPress(item)}
            isSelected={selectedItems.has(item.id)}
            showCheckbox={isManaging}
          />
        )}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        stickySectionHeadersEnabled={false}
        renderSectionFooter={() => <View style={styles.sectionFooter} />}
      />

      {/* Delete button - only show when managing and selected items */}
      {isManaging && selectedItems.size > 0 && (
        <View style={styles.deleteButtonContainer}>
          <PressableButton
            pressedHandler={handleDelete}
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    color: '#007AFF',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionSeparator: {
    height: 16,
  },
  sectionFooter: {
    height: 8,
    backgroundColor: 'white',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  deleteButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
