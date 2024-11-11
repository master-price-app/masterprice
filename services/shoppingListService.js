import { database } from "./firebaseSetup";
import {
  doc,
  getDoc,
  setDoc,
  deleteField,
  runTransaction,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getLocationById } from "./martService";

// CREATE - Add item to shopping list
export async function addToShoppingList(userId, priceId, locationId) {
  const listRef = doc(database, "shoppingLists", userId);

  try {
    await setDoc(
      listRef,
      {
        userId,
        [`items.${locationId}.${priceId}`]: true,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Error adding to shopping list:", error);
    throw error;
  }
}

// READ - Check if item is in shopping list
export async function isInShoppingList(userId, priceId) {
  try {
    const listDoc = await getDoc(doc(database, "shoppingLists", userId));
    if (!listDoc.exists()) return false;

    const items = listDoc.data().items || {};
    // Check all locations for this priceId
    return Object.values(items).some((location) => location[priceId]);
  } catch (error) {
    console.error("Error checking shopping list:", error);
    return false;
  }
}

// READ - Get transformed shopping list for display
export async function getTransformedShoppingList(userId) {
  try {
    const listDoc = await getDoc(doc(database, "shoppingLists", userId));
    if (!listDoc.exists()) {
      return [];
    }

    const data = listDoc.data();
    const locations = data.items || {};

    // Get all locationIds and priceIds
    const locationPromises = Object.entries(locations).map(
      async ([locationId, prices]) => {
        // Get location data including chain info
        const locationData = await getLocationById(locationId);

        // Get all prices for this location
        const pricePromises = Object.keys(prices).map(async (priceId) => {
          const priceDoc = await getDoc(doc(database, "prices", priceId));
          return {
            id: priceId,
            mart: locationData.chain.chainName, 
            ...priceDoc.data(),
          };
        });

        const pricesData = await Promise.all(pricePromises);

        return {
          locationId,
          chainName: locationData.chain.chainName,
          prices: pricesData,
        };
      }
    );

    const locationResults = await Promise.all(locationPromises);

    // Group by chain for SectionList
    const chainGroups = locationResults.reduce((groups, location) => {
      if (!groups[location.chainName]) {
        groups[location.chainName] = {
          title: location.chainName,
          data: [],
        };
      }

      groups[location.chainName].data.push(...location.prices);
      return groups;
    }, {});

    return Object.values(chainGroups);
  } catch (error) {
    console.error("Error getting shopping list:", error);
    throw error;
  }
}

// DELETE - Remove single item
export async function removeFromShoppingList(userId, priceId, locationId) {
  const listRef = doc(database, "shoppingLists", userId);

  try {
    await runTransaction(database, async (transaction) => {
      const listDoc = await transaction.get(listRef);

      if (!listDoc.exists()) {
        throw new Error("Shopping list not found");
      }

      const data = listDoc.data();
      const location = data.items[locationId];

      if (!location || !location[priceId]) {
        throw new Error("Item not found in shopping list");
      }

      // If this is the last price in the location
      if (Object.keys(location).length === 1) {
        transaction.update(listRef, {
          [`items.${locationId}`]: deleteField(),
          lastUpdated: serverTimestamp(),
        });
      } else {
        transaction.update(listRef, {
          [`items.${locationId}.${priceId}`]: deleteField(),
          lastUpdated: serverTimestamp(),
        });
      }
    });

    return true;
  } catch (error) {
    console.error("Error removing from shopping list:", error);
    throw error;
  }
}

// DELETE - Remove multiple items
export async function removeMultipleFromShoppingList(userId, items) {
  // items should be an array of { priceId, locationId } objects
  const listRef = doc(database, "shoppingLists", userId);

  try {
    await runTransaction(database, async (transaction) => {
      const listDoc = await transaction.get(listRef);

      if (!listDoc.exists()) {
        throw new Error("Shopping list not found");
      }

      const updates = {};

      items.forEach(({ priceId, locationId }) => {
        updates[`items.${locationId}.${priceId}`] = deleteField();
      });

      transaction.update(listRef, {
        ...updates,
        lastUpdated: serverTimestamp(),
      });
    });

    return true;
  } catch (error) {
    console.error("Error removing multiple items:", error);
    throw error;
  }
}
