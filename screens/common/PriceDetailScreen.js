import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  FlatList,
} from "react-native";
import { subscribeToPriceDetails, writeComment } from "../../services/priceService";
import PressableButton from "../../components/PressableButton";

export default function PriceDetailScreen({ route }) {
  const {
    priceData: initialPriceData,
    productName,
    productQuantity,
    productUnit,
    productImage,
  } = route.params;

  const [priceData, setPriceData] = useState(initialPriceData);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToPriceDetails(
      initialPriceData.id,
      (updatedPriceData) => {
        setPriceData(updatedPriceData);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [initialPriceData.id]);

  const handleSubmitComment = async () => {
    if (newComment.trim()) {
      await writeComment(newComment, priceData.id);
      setNewComment("");
    }
  };

  // Convert comments object to array and sort by creation date
  const commentsArray = priceData.comments
    ? Object.entries(priceData.comments)
        .map(([id, comment]) => ({
          id,
          ...comment,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Text>{item.content}</Text>
      <Text style={styles.commentMeta}>
        User: {item.userId} • {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <ScrollView>
      <View style={styles.container}>
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
          <Text>{new Date(priceData.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Comments</Text>
          <FlatList
            data={commentsArray}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={<Text>Be the first to comment!</Text>}
          />
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
