import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Menu } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import {
  subscribeToPriceDetails,
  writeComment,
  deleteData,
} from "../../services/priceService";
import { getLocationById, chainLogoMapping } from "../../services/martService";
import PressableButton from "../../components/PressableButton";

const PLACEHOLDER_USER_ID = "user123";

export default function PriceDetailScreen({ navigation, route }) {
  const {
    priceData: initialPriceData = {},
    productName = "",
    productQuantity = "",
    productUnit = "",
    productImage = null,
  } = route.params || {};

  const [priceData, setPriceData] = useState(initialPriceData);
  const [newComment, setNewComment] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [martData, setMartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the price is posted by the current user
    const isCurrentUserPost = priceData.userId === PLACEHOLDER_USER_ID;

    navigation.setOptions({
      // Set the title
      title: productName,
      // Set the right edit button
      headerRight: () => isCurrentUserPost ? (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <PressableButton
              pressedHandler={() => setMenuVisible(true)}
              componentStyle={styles.headerButton}
              pressedStyle={styles.headerButtonPressed}
            >
              <MaterialIcons name="edit" size={24} color="#007AFF" />
            </PressableButton>
          }
        >
          <Menu.Item
            onPress={() => {
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
                },
              });
            }}
            title="Edit"
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={async () => {
              setMenuVisible(false);
              try {
                await deleteData("prices", priceData.id);
                navigation.goBack();
              } catch (error) {
                console.error("Error deleting price:", error);
              }
            }}
            title="Delete"
            leadingIcon="delete"
            titleStyle={{ color: "#ff3b30" }}
          />
        </Menu>
      ) : null
    });
  }, [menuVisible]);

  useEffect(() => {
    if (initialPriceData && initialPriceData.id) {
      const unsubscribe = subscribeToPriceDetails(
        initialPriceData.id,
        (updatedPriceData) => {
          setPriceData(updatedPriceData);
        }
      );

      return () => unsubscribe && unsubscribe();
    }
  }, [initialPriceData]);

  useEffect(() => {
    async function loadLocationData() {
      try {
        if (priceData.locationId) {
          const data = await getLocationById(priceData.locationId);
          setMartData(data);
        }
      } catch (error) {
        console.error("Error loading location data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLocationData();
  }, [priceData.locationId]);

  const getChainLogo = (chainId) => {
    return chainId ? chainLogoMapping[chainId.toLowerCase()] : null;
  };

  const handleSubmitComment = async () => {
    if (newComment.trim() && priceData.id) {
      await writeComment(newComment, priceData.id);
      setNewComment("");
    }
  };

  const handleLogoPress = () => {
    if (priceData?.locationId) {
      navigation.navigate("MartDetail", { locationId: priceData.locationId });
    }
  };

  const handleLocationPress = () => {
    if (priceData?.locationId) {
      navigation.navigate("MartDetail", { locationId: priceData.locationId });
    }
  };

  const handleAddToList = () => {
    // TODO: Implement add to list logic
    Alert.alert(
      "Success",
      "Added to shopping list",
      [{ text: "OK", onPress: () => {} }]
    );
  };

  const commentsArray = priceData.comments
    ? Object.entries(priceData.comments).map(([id, comment]) => ({
        id,
        ...comment,
      }))
    : [];

  if (!priceData || !priceData.id || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.productCard}>
          {productImage && (
            <Image source={{ uri: productImage }} style={styles.productImage} />
          )}

          <View style={styles.productInfo}>
            <View style={styles.userInfo}>
              <MaterialIcons name="account-circle" size={24} color="#666" />
              <Text style={styles.userText}>
                By {priceData.userId} Found At{" "}
              </Text>
              {martData && (
                <TouchableOpacity onPress={handleLogoPress}>
                  <View style={styles.chainLogoContainer}>
                    <Image
                      source={getChainLogo(martData.chain.chainId)}
                      style={styles.chainLogoSmall}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.dateText}>
              on{" "}
              {new Date(priceData.createdAt).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>

            {martData && (
              <TouchableOpacity
                style={styles.locationInfo}
                onPress={handleLocationPress}
              >
                <MaterialIcons name="location-on" size={24} color="#E31837" />
                <Text style={styles.locationText}>
                  {martData.location?.address.street},{" "}
                  {martData.location?.address.city}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>${priceData.price.toFixed(2)}</Text>
            </View>

            <PressableButton
              pressedHandler={handleAddToList}
              componentStyle={styles.addToListButton}
              pressedStyle={styles.addToListButtonPressed}
            >
              <View style={styles.addToListContent}>
                <MaterialIcons name="add-shopping-cart" size={24} color="#fff" />
                <Text style={styles.addToListText}>Add to Shopping List</Text>
              </View>
            </PressableButton>
          </View>
        </View>
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comments</Text>
        {commentsArray.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <View style={styles.commentUser}>
                <MaterialIcons name="account-circle" size={24} color="#666" />
                <Text style={styles.commentAuthor}>
                  {comment.userId || "• Anonymous User"}
                </Text>
              </View>
              <Text style={styles.commentDate}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.commentContent}>{comment.content}</Text>
          </View>
        ))}

        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Share your thoughts..."
            multiline
          />
          <PressableButton
            pressedHandler={handleSubmitComment}
            componentStyle={[
              styles.submitButton,
              !newComment.trim() && styles.submitButtonDisabled,
            ]}
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
  headerButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  headerButtonPressed: {
    backgroundColor: '#E5E5E5',
  },
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
  chainLogoContainer: {
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  chainLogoSmall: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  dateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    marginLeft: 32,
  },
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
  addToListButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginTop: 16,
    paddingVertical: 12,
  },
  addToListButtonPressed: {
    opacity: 0.8,
  },
  addToListContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToListText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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
