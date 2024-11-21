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


// Write price data to the database
export async function writeToDB(userId, data, collectionName) {
  if (!userId) throw new Error("User ID is required");

  try {
    const docRef = await addDoc(collection(database, collectionName), {
      ...data,
      userId,
      comments: {},
      updatedAt: new Date().toISOString(),
    });
    console.log("Price Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (err) {
    console.log("Write to db error: ", err);
    throw err;
  }
}

// Update price data in the database
export async function updateData(userId, data, collectionName, id) {
  if (!userId) throw new Error("User ID is required");

  try {
    // Verify the user owns this price
    const priceRef = doc(database, collectionName, id);
    const priceDoc = await getDoc(priceRef);

    if (!priceDoc.exists()) {
      throw new Error("Price not found");
    }

    if (priceDoc.data().userId !== userId) {
      throw new Error("Unauthorized to update this price");
    }

    await updateDoc(priceRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    console.log("Price document updated");
  } catch (err) {
    console.log("Update data error: ", err);
    throw err;
  }
}

// Delete price data from the database
export async function deleteData(userId, collectionName, id) {
  if (!userId) throw new Error("User ID is required");

  try {
    // Verify the user owns this price
    const priceRef = doc(database, collectionName, id);
    const priceDoc = await getDoc(priceRef);

    if (!priceDoc.exists()) {
      throw new Error("Price not found");
    }

    if (priceDoc.data().userId !== userId) {
      throw new Error("Unauthorized to delete this price");
    }

    await deleteDoc(priceRef);
    console.log("Document deleted");
  } catch (err) {
    console.log("Delete data error: ", err);
    throw err;
  }
}

// Listen for prices by product barcode
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

// Listen for prices by location
export function subscribeToPricesByLocation(locationId, onPricesUpdate) {
  try {
    const pricesQuery = query(
      collection(database, "prices"),
      where("locationId", "==", locationId)
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
    console.error("Error in prices by location listener:", error);
    throw error;
  }
}

// Listen for price details
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

// Write comment to a price
export async function writeComment(userId, comment, priceId) {
  if (!userId) throw new Error("User ID is required");

  try {
    const priceRef = doc(database, "prices", priceId);
    const commentId = `comment_${Date.now()}`;

    const commentData = {
      [`comments.${commentId}`]: {
        userId,
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
