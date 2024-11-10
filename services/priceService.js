import { database } from "./firebaseSetup";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

const PLACEHOLDER_USER_ID = "user123"; // Temporary until auth is implemented

export async function writeToDB(data, collectionName) {
  try {
    const docRef = await addDoc(collection(database, collectionName), {
      ...data,
      userId: PLACEHOLDER_USER_ID,
      storeId: `store_${data.store.replace(/\s+/g, "_").toLowerCase()}`,
      comments: {},
      inShoppingList: {},
      updatedAt: new Date().toISOString(),
    });
    console.log("Price Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (err) {
    console.log("Write to db error: ", err);
    throw err;
  }
}

export async function updateData(data, collectionName, id) {
  try {
    await updateDoc(doc(database, collectionName, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    console.log("Price document updated");
  } catch (err) {
    console.log("Update data error: ", err);
    throw err;
  }
}

export async function deleteData(collectionName, id) {
  try {
    await deleteDoc(doc(database, collectionName, id));
    console.log("Document deleted");
  } catch (err) {
    console.log("Delete data error: ", err);
    throw err;
  }
}

export function subscribeToPricesByProduct(code, onPricesUpdate) {
  try {
    const pricesQuery = query(
      collection(database, "prices"),
      where("code", "==", code)
    );

    const unsubscribe = onSnapshot(pricesQuery, (querySnapshot) => {
      const prices = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onPricesUpdate(prices);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error in prices listener:", error);
    throw error;
  }
}

// Add subscribeToPriceDetails function
export function subscribeToPriceDetails(priceId, onPriceUpdate) {
  try {
    const priceRef = doc(database, "prices", priceId);

    const unsubscribe = onSnapshot(priceRef, (doc) => {
      if (doc.exists()) {
        const priceData = {
          id: doc.id,
          ...doc.data(),
        };
        onPriceUpdate(priceData);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error in price details listener:", error);
    throw error;
  }
}

// Add writeComment function
export async function writeComment(comment, priceId) {
  try {
    const priceRef = doc(database, "prices", priceId);
    const commentId = `comment_${Date.now()}`;

    const commentData = {
      [`comments.${commentId}`]: {
        userId: PLACEHOLDER_USER_ID,
        content: comment,
        createdAt: new Date().toISOString(),
      },
    };

    await updateDoc(priceRef, commentData);
    console.log("Comment added successfully");
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}
