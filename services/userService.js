import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { database, storage, auth } from "./firebaseSetup";
import { signOut } from "firebase/auth";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Upload profile image to Firebase Storage
export async function uploadProfileImage(uri, userId) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create unique filename using userId
    const filename = `profile_images/${userId}.jpg`;
    const storageRef = ref(storage, filename);

    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Return promise that resolves with storage path
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calculate progress percentage
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

// Delete profile image from Firebase Storage
export async function deleteProfileImage(imagePath) {
  if (!imagePath) return;

  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    console.log("Profile image deleted successfully");
  } catch (error) {
    console.error("Error deleting profile image:", error);
    throw error;
  }
}

// Get download URL for profile image
export async function getProfileImageUrl(imagePath) {
  if (!imagePath) return null;

  try {
    const imageRef = ref(storage, imagePath);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error getting profile image URL:", error);
    return null;
  }
}

// Write new user to database
export async function writeUserToDB(userId, userData) {
  try {
    const userRef = doc(database, "users", userId);
    const newUser = {
      email: userData.email,
      nickname: userData.nickname || userData.email.split("@")[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      notificationOn: false,
      imagePath: null, // Add imagePath field
    };

    await setDoc(userRef, newUser);
    console.log("User written to database:", userId);
    return newUser;
  } catch (error) {
    console.error("Error writing user to database:", error);
    throw error;
  }
}

// Get user data (including profile image URL)
export async function getUserData(userId) {
  try {
    const userRef = doc(database, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    let imageUrl = null;

    if (userData.imagePath) {
      imageUrl = await getProfileImageUrl(userData.imagePath);
    }

    return {
      id: userDoc.id,
      ...userData,
      imageUrl,
    };
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}

// Update user data
export async function updateUser(userId, updates) {
  try {
    const userRef = doc(database, "users", userId);

    // Handle image upload if provided
    if (updates.imageUri) {
      const currentData = (await getDoc(userRef)).data();

      // Delete old image if exists
      if (currentData.imagePath) {
        await deleteProfileImage(currentData.imagePath);
      }

      // Upload new image
      const imagePath = await uploadProfileImage(updates.imageUri, userId);

      // Remove imageUri and add storage path
      const { imageUri, ...restUpdates } = updates;
      updates = {
        ...restUpdates,
        imagePath,
      };
    }

    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updatedData);
    console.log("User updated:", userId);
    return await getUserData(userId);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete user
export async function deleteUserData(userId) {
  try {
    // Get user data to check for profile image
    const userData = await getUserData(userId);

    // Delete profile image if exists
    if (userData.imagePath) {
      await deleteProfileImage(userData.imagePath);
    }

    // Delete user document from Firestore
    await deleteDoc(doc(database, "users", userId));

    // Logout the user
    await signOut(auth);
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
}

// Function for real-time user data subscription
export function subscribeToUser(userId, onUpdate) {
  if (!userId) return () => {};

  const userRef = doc(database, "users", userId);
  
  const unsubscribe = onSnapshot(userRef, async (doc) => {
    try {
      if (!doc.exists()) return;

      const userData = doc.data();
      // Get image URL if there's an imagePath
      const imageUrl = userData.imagePath ? 
        await getProfileImageUrl(userData.imagePath) : null;

      onUpdate({
        ...userData,
        imageUrl,
      });
    } catch (error) {
      console.error("Error in user subscription:", error);
    }
  });

  return unsubscribe;
}