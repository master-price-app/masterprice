import { database } from "./firebaseSetup";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

/* 
  This file contains functions that interact with the Firestore database.
  The functions are used to write, update, and delete data from the database.
*/
export async function writeToDB(data, collectionName) {
  try {
    const docRef = await addDoc(collection(database, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("Price Document written with ID: ", docRef.id);
  } catch (err) {
    console.log("Write to db error: ", err);
  }
}

export async function updateData(data, collectionName, id) {
  try {
    await updateDoc(doc(database, collectionName, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    console.log("Price document updated", docRef.id);
  } catch (err) {
    console.log("Update data error: ", err);
  }
}

export async function deleteData(collectionName, id) {
  try {
    await deleteDoc(doc(database, collectionName, id));
    console.log("Document deleted");
  } catch (err) {
    console.log("Delete data error: ", err);
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
  }
}


// Function to write a comment to the database
export async function writeComment(comment, priceId) {
  return writeToDB(
    {
      comment,
      priceId,
    },
    "comments"
  );
}

// Function to subscribe to comments for a specific price
export function subscribeToCommentsByPrice(priceId, onCommentsUpdate) {
  try {
    const commentsQuery = query(
      collection(database, "comments"),
      where("priceId", "==", priceId),
    );

    const unsubscribe = onSnapshot(commentsQuery, (querySnapshot) => {
      const comments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onCommentsUpdate(comments);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error in comments listener:", error);
  }
}