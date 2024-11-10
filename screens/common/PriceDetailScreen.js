import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Menu } from "react-native-paper";
import {
  subscribeToPriceDetails,
  writeComment,
  deleteData,
} from "../../services/priceService";
import PressableButton from "../../components/PressableButton";


const PLACEHOLDER_USER_ID = "user123"; // Same as in priceService.js

export default function PriceDetailScreen({ navigation, route }) {
  const {
    priceData: initialPriceData,
    productName,
    productQuantity,
    productUnit,
    productImage,
  } = route.params;

  const [priceData, setPriceData] = useState(initialPriceData);
  const [newComment, setNewComment] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPriceDetails(
      initialPriceData.id,
      (updatedPriceData) => {
        setPriceData(updatedPriceData);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [initialPriceData.id]);

  const handleDeletePrice = () => {
    Alert.alert("Delete Price", "Are you sure you want to delete this price?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteData("prices", priceData.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert("Error", "Failed to delete price");
          }
        },
      },
    ]);
  };

  const handleEditPrice = () => {
    navigation.navigate("PriceForm", {
      code: priceData.code,
      productName,
      editMode: true,
      priceData: priceData,
    });
  };

  const handleSubmitComment = async () => {
    if (newComment.trim()) {
      await writeComment(newComment, priceData.id);
      setNewComment("");
    }
  };

  // Convert comments object to array and sort by creation date
  const commentsArray = priceData.comments
    ? Object.entries(priceData.comments).map(([id, comment]) => ({
        id,
        ...comment,
      }))
    : [];

  const isCurrentUserPrice = priceData.userId === PLACEHOLDER_USER_ID;

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* User Management Menu */}
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
              <Menu.Item onPress={handleEditPrice} title="Edit" />
              <Menu.Item
                onPress={handleDeletePrice}
                title="Delete"
                style={styles.deleteButton}
              />
            </Menu>
          </View>
        )}

        {/* Price Information */}
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

        {/* Comments Section */}
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
  menuContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 50, // Add space for the menu button
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
  deleteButton: {
    color: "red",
  },
});
