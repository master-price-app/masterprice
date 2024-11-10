import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  subscribeToCommentsByPrice,
  writeComment,
} from "../../services/priceService";
import PressableButton from "../../components/PressableButton";

export default function PriceDetailScreen({ route }) {
  const { priceData, productName, productQuantity, productUnit, productImage } =
    route.params;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCommentsByPrice(
      priceData.id,
      (newComments) => {
        setComments(newComments);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [priceData.id]);

  const handleSubmitComment = async () => {
    if (newComment.trim()) {
      await writeComment(newComment, priceData.id);
      setNewComment("");
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Text>{item.comment}</Text>
      <Text>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text>
          {productName} - ${priceData.price}
        </Text>
        <Text>
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
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={<Text>Leave your comments</Text>}
          />
        </View>

        <View style={styles.commentInput}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Share your thoughts"
            style={styles.input}
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
  image: {
    width: "100%",
    height: 200,
    marginVertical: 10,
  },
  priceInfo: {
    marginVertical: 10,
  },
  commentsSection: {
    marginTop: 20,
  },
  commentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
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
    borderRadius: 4,
  },
});
