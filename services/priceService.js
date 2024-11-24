import { database, storage } from "./firebaseSetup";
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
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Upload image to Firebase Storage and return the storage path
export async function uploadPriceImage(uri, userId) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create unique filename using userId and timestamp
    const filename = `price_images/${userId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Return promise that resolves with storage path
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload progress:", progress);
        },
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        () => {
          resolve(filename);
        }
      );
    });
  } catch (error) {
    console.error("Error preparing image upload:", error);
    throw error;
  }
}

// Delete image from Firebase Storage
export async function deletePriceImage(imagePath) {
  if (!imagePath) return;
  
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    console.log("Image deleted successfully");
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

// Get download URL for an image path
export async function getPriceImageUrl(imagePath) {
  if (!imagePath) return null;

  try {
    const imageRef = ref(storage, imagePath);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error getting image URL:", error);
    return null;
  }
}


// Write price data to the database
export async function writeToDB(userId, data, collectionName) {
  if (!userId) throw new Error("User ID is required");

  try {
    let imagePath = null;

    // Handle image upload if present
    if (data.imagePath) {
      imagePath = await uploadPriceImage(data.imagePath, userId);
    }

    // Remove the local imageUri and add Firebase storage path
    const { imageUri, ...restData } = data;

    const now = new Date().toISOString();

    const docRef = await addDoc(collection(database, collectionName), {
      ...restData,
      imagePath,
      userId,
      comments: {},
      createdAt: now, // Add createdAt for new documents
      updatedAt: now,
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
    const priceRef = doc(database, collectionName, id);
    const priceDoc = await getDoc(priceRef);

    if (!priceDoc.exists()) {
      throw new Error("Price not found");
    }

    if (priceDoc.data().userId !== userId) {
      throw new Error("Unauthorized to update this price");
    }

    const currentData = priceDoc.data();
    let imagePath = currentData.imagePath;

    // Handle image update
    if (data.imagePath) {
      // Delete old image if exists
      if (currentData.imagePath) {
        await deletePriceImage(currentData.imagePath);
      }
      // Upload new image
      imagePath = await uploadPriceImage(data.imagePath, userId);
    }

    // Remove the local imageUri and update storage path
    const { imageUri, ...restData } = data;

    await updateDoc(priceRef, {
      ...restData,
      imagePath,
      updatedAt: new Date().toISOString(),
      // Do NOT update createdAt on updates
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
    const priceRef = doc(database, collectionName, id);
    const priceDoc = await getDoc(priceRef);

    if (!priceDoc.exists()) {
      throw new Error("Price not found");
    }

    if (priceDoc.data().userId !== userId) {
      throw new Error("Unauthorized to delete this price");
    }

    // Delete associated image if exists
    if (priceDoc.data().imagePath) {
      await deletePriceImage(priceDoc.data().imagePath);
    }

    await deleteDoc(priceRef);
    console.log("Document and associated image deleted");
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



// Listen for price details
export function subscribeToPriceDetails(priceId, onPriceUpdate) {
  try {
    const priceRef = doc(database, "prices", priceId);

    const unsubscribe = onSnapshot(priceRef, async (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        let imageUrl = null;

        // Get download URL if image exists
        if (data.imagePath) {
          imageUrl = await getPriceImageUrl(data.imagePath);
        }

        const priceData = {
          id: doc.id,
          ...data,
          imageUrl,
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
