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
import { getLocationById } from "./martService";

const PLACEHOLDER_USER_ID = "user123"; // Temporary until auth is implemented

// function to write price data to the database
export async function writeToDB(data, collectionName) {
  try {
    
    const docRef = await addDoc(collection(database, collectionName), {
      ...data,
      userId: PLACEHOLDER_USER_ID, // temporary until auth is implemented
      comments: {}, // initialize comments object
      //inShoppingList: {},
      updatedAt: new Date().toISOString(),
    });
    console.log("Price Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (err) {
    console.log("Write to db error: ", err);
    throw err;
  }
}

// function to update price data in the database
export async function updateData(data, collectionName, id) {
  try {
    // For updates, we don't need to modify the userId or initialize comments/shopping list
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

// function to delete price data by id from the database
export async function deleteData(collectionName, id) {
  try {
    await deleteDoc(doc(database, collectionName, id));
    console.log("Document deleted");
  } catch (err) {
    console.log("Delete data error: ", err);
    throw err;
  }
}

// function to listen for price data by product barcode
export function subscribeToPricesByProduct(code, onPricesUpdate) {
  try {
    const pricesQuery = query(
      collection(database, "prices"),
      where("code", "==", code)
    );
    // onSnapshot is a listener that triggers when the data changes
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

// function to get prices by martLocation
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

// function to get price details by id
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

// function to write comment to a price document
export async function writeComment(comment, priceId) {
  try {
    const priceRef = doc(database, "prices", priceId);
    const commentId = `comment_${Date.now()}`;

    const commentData = {
      [`comments.${commentId}`]: {
        userId: PLACEHOLDER_USER_ID,  // temporary until auth is implemented
        content: comment,
        createdAt: new Date().toISOString(),
      },
    };

    await updateDoc(priceRef, commentData); // update the comments object in the price document
    console.log("Comment added successfully");
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}
