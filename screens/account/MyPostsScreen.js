import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { database } from "../../services/firebaseSetup";
import PricePostListItem from "../../components/PricePostListItem";

const PLACEHOLDER_USER_ID = "user123";

export default function MyPostsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  // TODO: Move to a custom hook
  // Load posts
  const loadPosts = () => {
    try {
      const pricesQuery = query(
        collection(database, "prices"),
        where("userId", "==", PLACEHOLDER_USER_ID)
      );

      const unsubscribe = onSnapshot(pricesQuery, (querySnapshot) => {
        const userPosts = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            productId: data.code,
            productName: data.productName,
            productImageUrl: null,
            price: data.price,
            locationId: data.locationId, // Store locationId instead of mart info
            createdAt: data.createdAt,
            expiryDate:
              new Date(data.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000,
            status: "active",
            isMasterPrice: false,
          };
        });
        setPosts(userPosts);
        setLoading(false);
        setRefreshing(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Failed to load posts:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // TODO: Move to a custom hook
  // Refresh posts
  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // TODO: Move to a custom hook
  // If no posts show empty message
  if (posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="post-add" size={48} color="#999" />
        <Text style={styles.emptyText}>You haven't posted any prices yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={posts}
      renderItem={({ item }) => (
        <PricePostListItem
          post={item}
          onPress={() =>
            navigation.navigate("PriceDetail", {
              priceData: {
                id: item.id,
                code: item.productId,
                price: item.price,
                locationId: item.locationId, // Pass locationId
                userId: PLACEHOLDER_USER_ID,
                createdAt: item.createdAt,
                updatedAt: item.createdAt,
                comments: {},
                inShoppingList: {},
              },
              productName: item.productName,
            })
          }
        />
      )}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
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
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});