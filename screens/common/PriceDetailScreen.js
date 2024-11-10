import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Menu } from "react-native-paper";
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
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading price details...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        {isCurrentUserPrice && (
          <View style={styles.menuContainer}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <PressableButton
                  pressedHandler={() => setMenuVisible(true)}
                  text="Manage Post"
                />
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
                titleStyle={{ color: "red" }}
              />
            </Menu>
          </View>
        )}

        <Text style={styles.productName}>
          {productName} - ${priceData.price}
        </Text>
        <Text style={styles.productInfo}>
          {productQuantity} {productUnit}
        </Text>

        {productImage && (
          <Image source={{ uri: productImage }} style={styles.image} />
        )}

        <View style={styles.priceInfo}>
          <Text>Found At: {priceData.store}</Text>
          <Text>Shared by: {priceData.userId}</Text>
          <Text>{new Date(priceData.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Comments</Text>
          {commentsArray.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Text>{comment.content}</Text>
              <Text style={styles.commentMeta}>
                By: {comment.userId} •{" "}
                {new Date(comment.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.commentInput}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Share your thoughts"
            style={styles.input}
            multiline
          />
          <PressableButton pressedHandler={handleSubmitComment} text="Post" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
    zIndex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productInfo: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  image: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  priceInfo: {
    marginVertical: 10,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  commentItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  commentMeta: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    minHeight: 40,
  },
});
