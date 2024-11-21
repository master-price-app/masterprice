import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { database } from "./firebaseSetup";

// Write new user to database
export async function writeUserToDB(userId, userData) {
  try {
    const userRef = doc(database, "users", userId);
    const newUser = {
      email: userData.email,
      nickname: userData.nickname || userData.email.split("@")[0], // Default to email username
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      notificationOn: false, // Default notification setting
    };

    await setDoc(userRef, newUser);
    console.log("User written to database:", userId);
    return newUser;
  } catch (error) {
    console.error("Error writing user to database:", error);
    throw error;
  }
}

// Get user data
export async function getUserData(userId) {
  try {
    const userRef = doc(database, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}

// Update user data
export async function updateUser(userId, updates) {
  try {
    const userRef = doc(database, "users", userId);
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
export async function deleteUser(userId) {
  try {
    const userRef = doc(database, "users", userId);
    await deleteDoc(userRef);
    console.log("User deleted:", userId);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
