import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Menu } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';
import {
  subscribeToPriceDetails,
  writeComment,
  deleteData,
} from "../../services/priceService";
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

  const handleSubmitComment = async () => {
    if (newComment.trim() && priceData.id) {
      await writeComment(newComment, priceData.id);
      setNewComment("");
    }
  };

  const commentsArray = priceData.comments
    ? Object.entries(priceData.comments).map(([id, comment]) => ({
        id,
        ...comment,
      }))
    : [];

  const isCurrentUserPrice = priceData.userId === PLACEHOLDER_USER_ID;

  if (!priceData || !priceData.id) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {isCurrentUserPrice && (
          <View style={styles.menuContainer}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <PressableButton
                  pressedHandler={() => setMenuVisible(true)}
                  componentStyle={styles.menuButton}
                >
                  <MaterialIcons name="more-vert" size={24} color="#666" />
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
                      store: priceData.store,
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
          </View>
        )}

        <View style={styles.productCard}>
          {productImage && (
            <Image
              source={{ uri: productImage }}
              style={styles.productImage}
            />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.quantity}>
              {productQuantity} {productUnit}
            </Text>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>${priceData.price.toFixed(2)}</Text>
            </View>
            <View style={styles.storeInfo}>
              <MaterialIcons name="store" size={16} color="#666" />
              <PressableButton
                pressedHandler={() => navigation.navigate("MartDetail", { 
                  store: priceData.store 
                })}
                componentStyle={styles.storeButton}
              >
                <Text style={styles.storeText}>{priceData.store}</Text>
                <MaterialIcons name="chevron-right" size={16} color="#666" />
              </PressableButton>
            </View>
            <View style={styles.dateInfo}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.dateText}>
                {new Date(priceData.createdAt).toLocaleDateString()}
              </Text>
            </View>
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
                  {comment.userId || '• Anonymous User'}
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
              !newComment.trim() && styles.submitButtonDisabled
            ]}
            disabled={!newComment.trim()}
          >
            <Text style={[
              styles.submitButtonText,
              !newComment.trim() && styles.submitButtonTextDisabled
            ]}>
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
  },
  menuContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  menuButton: {
    padding: 8,
  },
  productCard: {
    padding: 16,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quantity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
    paddingVertical: 4,
  },
  storeText: {
    fontSize: 16,
    color: '#333',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  commentsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthor: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentContent: {
    fontSize: 16,
    color: '#333',
    marginLeft: 32,
    lineHeight: 22,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonTextDisabled: {
    color: '#fff8',
  },
});
