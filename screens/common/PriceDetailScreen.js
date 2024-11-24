import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Menu } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import {
  subscribeToPriceDetails,
  writeComment,
  deleteData,
  getPriceImageUrl,
} from "../../services/priceService";
import {
  isInShoppingList,
  addToShoppingList,
  removeFromShoppingList,
} from "../../services/shoppingListService";
import { getLocationById, chainLogoMapping } from "../../services/martService";
import { getUserData } from "../../services/userService";
import PressableButton from "../../components/PressableButton";

// Comments list component
const CommentsList = ({ comments, userNicknames }) => {
  if (!Array.isArray(comments) || comments.length === 0) {
    return (
      <Text style={styles.noComments}>
        No comments yet. Be the first to comment!
      </Text>
    );
  }

  return comments.map((comment) => (
    <View key={comment.id} style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentUser}>
          <MaterialIcons name="account-circle" size={24} color="#666" />
          <Text style={styles.commentAuthor}>
            {userNicknames[comment.userId] || "Anonymous User"}
          </Text>
        </View>
        <Text style={styles.commentDate}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
    </View>
  ));
};

export default function PriceDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const {
    priceData: initialPriceData = {},
    productName = "",
    productQuantity = "",
    productUnit = "",
    productImage = null,
  } = route.params || {};

  const [priceData, setPriceData] = useState(initialPriceData);
  const [isInList, setIsInList] = useState(false);
  const [martData, setMartData] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userNicknames, setUserNicknames] = useState({});
  const [imageUrl, setImageUrl] = useState(null);

  // Load poster's nickname immediately when priceData changes
  useEffect(() => {
    async function loadPosterNickname() {
      if (!priceData?.userId) return;

      try {
        const userData = await getUserData(priceData.userId);
        setUserNicknames((prev) => ({
          ...prev,
          [priceData.userId]:
            userData.nickname ||
            userData.email?.split("@")[0] ||
            "Anonymous User",
        }));
      } catch (error) {
        console.error(`Error loading poster nickname:`, error);
        setUserNicknames((prev) => ({
          ...prev,
          [priceData.userId]: "Anonymous User",
        }));
      }
    }

    loadPosterNickname();
  }, [priceData?.userId]);

  // Handle image loading
  useEffect(() => {
    async function loadImage() {
      try {
        if (priceData?.imagePath) {
          // If there's a user uploaded image, get its URL
          const url = await getPriceImageUrl(priceData.imagePath);
          setImageUrl(url);
        } else if (productImage) {
          // If there's an API product image
          setImageUrl(productImage);
        } else {
          setImageUrl(null);
        }
      } catch (error) {
        console.error("Error loading image:", error);
        setImageUrl(null);
      }
    }

    loadImage();
  }, [priceData?.imagePath, productImage]);

  // Subscribe to price updates and setup menu
  useEffect(() => {
    if (!initialPriceData?.id) return;

    // Setup menu based on ownership
    const isCurrentUserPost = user && initialPriceData.userId === user.uid;
    navigation.setOptions({
      title: productName,
      headerRight: isCurrentUserPost ? renderMenu : null,
    });

    // Subscribe to price updates
    const unsubscribe = subscribeToPriceDetails(
      initialPriceData.id,
      (updatedPriceData) => {
        setPriceData(updatedPriceData);
      }
    );

    return () => unsubscribe();
  }, [initialPriceData, menuVisible, user]);

  // Load initial data and check shopping list status
  useEffect(() => {
    async function loadData() {
      if (!priceData?.locationId || !priceData?.id) return;

      try {
        const [locationData, inList] = await Promise.all([
          getLocationById(priceData.locationId),
          user
            ? isInShoppingList(user.uid, priceData.id)
            : Promise.resolve(false),
        ]);

        setMartData(locationData);
        setIsInList(inList);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [priceData, user]);

  // Update shopping list status on screen focus
  useEffect(() => {
    if (!user) return;

    const unsubscribe = navigation.addListener("focus", () => {
      if (priceData?.id) {
        isInShoppingList(user.uid, priceData.id)
          .then(setIsInList)
          .catch(console.error);
      }
    });

    return unsubscribe;
  }, [navigation, priceData, user]);

  // Load comment user nicknames
  const loadCommentUserNickname = async (userId) => {
    if (!userId || userNicknames[userId]) return;

    try {
      const userData = await getUserData(userId);
      setUserNicknames((prev) => ({
        ...prev,
        [userId]:
          userData.nickname ||
          userData.email?.split("@")[0] ||
          "Anonymous User",
      }));
    } catch (error) {
      console.error(`Error loading nickname for user ${userId}:`, error);
      setUserNicknames((prev) => ({
        ...prev,
        [userId]: "Anonymous User",
      }));
    }
  };

  // Load nicknames for comment authors
  useEffect(() => {
    const comments = priceData?.comments
      ? Object.values(priceData.comments)
      : [];
    const userIds = new Set(
      comments.map((comment) => comment.userId).filter(Boolean)
    );

    userIds.forEach(loadCommentUserNickname);
  }, [priceData?.comments]);

  // Menu rendering and handlers
  const renderMenu = () => (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <PressableButton
          onPress={() => setMenuVisible(true)}
          componentStyle={styles.headerButton}
          pressedStyle={styles.headerButtonPressed}
        >
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </PressableButton>
      }
    >
      <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
      <Menu.Item
        onPress={handleDelete}
        title="Delete"
        leadingIcon="delete"
        titleStyle={{ color: "#ff3b30" }}
      />
    </Menu>
  );

  // Navigate to price form
  const handleEdit = () => {
    if (!user) return;

    setMenuVisible(false);
    navigation.navigate("PriceForm", {
      code: priceData.code,
      productName,
      editMode: true,
      priceData: {
        id: priceData.id,
        price: priceData.price,
        locationId: priceData.locationId,
        code: priceData.code,
        imagePath: imageUrl,
      },
    });
  };

  // Delete price
  const handleDelete = async () => {
    if (!user) return;

    setMenuVisible(false);
    try {
      await deleteData(user.uid, "prices", priceData.id);
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting price:", error);
      Alert.alert("Error", "Failed to delete price");
    }
  };

  // Toggle shopping list
  const handleShoppingListToggle = async () => {
    if (!user) {
      navigation.navigate("Login", {
        returnScreen: "PriceDetail",
        returnParams: route.params,
      });
      return;
    }

    try {
      if (isInList) {
        await removeFromShoppingList(
          user.uid,
          priceData.id,
          priceData.locationId
        );
      } else {
        await addToShoppingList(user.uid, priceData.id, priceData.locationId);
      }
      setIsInList(!isInList);
    } catch (error) {
      console.error("Error updating shopping list:", error);
      Alert.alert("Error", "Failed to update shopping list");
    }
  };

  // Submit comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !priceData?.id) return;

    if (!user) {
      navigation.navigate("Login", {
        returnScreen: "PriceDetail",
        returnParams: route.params,
      });
      return;
    }

    try {
      await writeComment(user.uid, newComment, priceData.id);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      Alert.alert("Error", "Failed to post comment");
    }
  };

  // Navigate to mart detail
  const handleLocationPress = () => {
    if (priceData?.locationId) {
      navigation.navigate("MartDetail", { locationId: priceData.locationId });
    }
  };

  // Format comments helper
  const formatComments = (priceData) => {
    return priceData?.comments
      ? Object.entries(priceData.comments).map(([id, comment]) => ({
          id,
          ...comment,
        }))
      : [];
  };

  // Loading state
  if (!priceData || !priceData.id || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const commentsArray = formatComments(priceData);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.productCard}>
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              onError={(error) => {
                console.log("Error loading image:", error);
                setImageUrl(null);
              }}
            />
          )}

          <View style={styles.productInfo}>
            <View style={styles.userInfo}>
              <MaterialIcons name="account-circle" size={24} color="#666" />
              <Text style={styles.userText}>
                By {userNicknames[priceData.userId] || "Anonymous User"} Found
                At{" "}
              </Text>
              {martData && (
                <Image
                  source={
                    chainLogoMapping[martData.chain.chainId.toLowerCase()]
                  }
                  onError={(error) =>
                    console.log("Error loading chain logo: ", error)
                  }
                  style={styles.chainLogoSmall}
                />
              )}
            </View>

            {/* Date */}
            <Text style={styles.dateText}>
              on{" "}
              {new Date(priceData.createdAt).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>

            {/* Mart Location */}
            {martData && (
              <PressableButton
                onPress={handleLocationPress}
                componentStyle={styles.locationInfo}
                pressedStyle={styles.locationInfoPressed}
              >
                <MaterialIcons name="location-on" size={24} color="#E31837" />
                <Text style={styles.locationText}>
                  {martData.location?.address.street},{" "}
                  {martData.location?.address.city}
                </Text>
              </PressableButton>
            )}

            {/* Price */}
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>${priceData.price.toFixed(2)}</Text>
            </View>

            {/* Add/Remove from Shopping List Button */}
            <PressableButton
              onPress={handleShoppingListToggle}
              componentStyle={[
                styles.shoppingListButton,
                isInList && styles.removeButton,
              ]}
            >
              <MaterialIcons
                name={isInList ? "remove-shopping-cart" : "add-shopping-cart"}
                size={24}
                color="#fff"
              />
              <Text style={styles.shoppingListButtonText}>
                {isInList ? "Remove from List" : "Add to List"}
              </Text>
            </PressableButton>
          </View>
        </View>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comments</Text>
        <CommentsList comments={commentsArray} userNicknames={userNicknames} />
        <View style={styles.commentInput}>
          {/* Comment input */}
          <TextInput
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Share your thoughts..."
            multiline
          />
          {/* Submit comment button */}
          <PressableButton
            onPress={handleSubmitComment}
            componentStyle={[
              styles.submitButton,
              !newComment.trim() && styles.submitButtonDisabled,
            ]}
            pressedStyle={styles.submitButtonPressed}
            disabled={!newComment.trim()}
          >
            <Text
              style={[
                styles.submitButtonText,
                !newComment.trim() && styles.submitButtonTextDisabled,
              ]}
            >
              Post
            </Text>
          </PressableButton>
        </View>
      </View>
    </ScrollView>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    overflow: "hidden",
  },

  // Header Menu
  headerButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  headerButtonPressed: {
    backgroundColor: "#E5E5E5",
  },

  // Product Section
  productCard: {
    padding: 16,
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
  },

  // User Info
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    marginRight: 4,
  },
  chainLogoSmall: {
    width: 80,
    height: 40,
    resizeMode: "contain",
  },
  dateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    marginLeft: 32,
  },

  // Location
  locationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    flex: 1,
    lineHeight: 24,
  },
  locationInfoPressed: {
    opacity: 0.7,
  },
  // Price
  priceInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  price: {
    fontSize: 24,
    fontWeight: "600",
    color: "#007AFF",
  },

  // Shopping List Button
  shoppingListButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  removeButton: {
    backgroundColor: "#FF3B30",
  },
  shoppingListButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Comments Section
  commentsSection: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAuthor: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  commentDate: {
    fontSize: 12,
    color: "#999",
  },
  commentContent: {
    fontSize: 16,
    color: "#333",
    marginLeft: 32,
    lineHeight: 22,
  },

  // Comment Input
  commentInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonPressed: {
    backgroundColor: "#0056b3",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  submitButtonTextDisabled: {
    color: "#fff8",
  },
});
