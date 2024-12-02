import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { database } from "../../services/firebaseSetup";
import { useAuth } from "../../contexts/AuthContext";
import { getPriceImageUrl } from "../../services/priceService";
import { subscribeToMartCycles } from "../../services/martService";
import { isWithinCurrentCycle, isMasterPrice } from "../../utils/priceUtils";
import MyPostsSkeleton from "../../components/skeleton/MyPostsSkeleton";
import PricePostListItem from "../../components/PricePostListItem";

export default function MyPostsScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [martCycles, setMartCycles] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Subscribe to mart cycles
  useEffect(() => {
    const unsubscribe = subscribeToMartCycles((cyclesData) => {
      setMartCycles(cyclesData);
    });
    return () => unsubscribe?.();
  }, []);

  // Load user's posts
  useEffect(() => {
    if (!user) {
      navigation.replace("Login", {
        isGoBack: true,
      });
      return;
    }

    const pricesQuery = query(
      collection(database, "prices"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(pricesQuery, async (querySnapshot) => {
      const allPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch product details and images for each post
      const processedPosts = await Promise.all(
        allPosts.map(async (post) => {
          const locationCycle = martCycles[post.locationId];
          const isValid = locationCycle?.chain
            ? isWithinCurrentCycle(post.createdAt, locationCycle.chain)
            : false;

          let productImageUrl = null;

          // First try to get user-uploaded image
          if (post.imagePath) {
            try {
              productImageUrl = await getPriceImageUrl(post.imagePath);
            } catch (error) {
              console.error("Error getting uploaded image:", error);
            }
          }

          // If no user image, try to get API image
          if (!productImageUrl) {
            try {
              const response = await fetch(
                `https://world.openfoodfacts.net/api/v2/product/${post.code}`
              );
              const data = await response.json();
              productImageUrl = data.product?.image_url || null;
            } catch (error) {
              console.error("Error fetching product details:", error);
            }
          }

          return {
            id: post.id,
            productId: post.code,
            productName: post.productName,
            productImageUrl,
            price: post.price,
            locationId: post.locationId,
            createdAt: post.createdAt,
            isValid,
            isMasterPrice: isMasterPrice(post, allPosts, martCycles),
            imagePath: post.imagePath, // Keep original imagePath
          };
        })
      );

      // Sort by date, most recent first
      const sortedPosts = processedPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setPosts(sortedPosts);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user, martCycles]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
  };

  if (loading) {
    return <MyPostsSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="post-add" size={48} color="#999" />
        <Text style={styles.emptyText}>You haven't posted any prices yet</Text>
        <Text style={styles.subText}>
          Share prices to help others find the best deals
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={posts}
      renderItem={({ item }) => (
        <PricePostListItem
          post={item}
          pressedStyle={styles.postItemPressed}
          onPress={() =>
            navigation.navigate("PriceDetail", {
              priceData: {
                id: item.id,
                code: item.productId,
                price: item.price,
                locationId: item.locationId,
                userId: user.uid,
                createdAt: item.createdAt,
                updatedAt: item.createdAt,
                comments: {},
                imagePath: item.imagePath, // Include imagePath if it exists
              },
              productName: item.productName,
              productImage: null, // This will be overridden by imagePath if it exists
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
  postItemPressed: {
    transform: [{ scale: 0.98 }],
  },
});
