import { database } from "./firebaseSetup";
import {
  doc,
  getDoc,
  setDoc,
  deleteField,
  runTransaction,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { getLocationById } from "./martService";

// CREATE - Add item to shopping list
export async function addToShoppingList(userId, priceId, locationId) {
  const listRef = doc(database, "shoppingLists", userId);

  try {
    await runTransaction(database, async (transaction) => {
      const listDoc = await transaction.get(listRef);

      if (!listDoc.exists()) {
        // Create new document with nested structure
        transaction.set(listRef, {
          userId,
          items: {
            [locationId]: {
              [priceId]: true,
            },
          },
          lastUpdated: serverTimestamp(),
        });
      } else {
        // Update existing document maintaining nested structure
        transaction.update(listRef, {
          [`items.${locationId}.${priceId}`]: true,
          lastUpdated: serverTimestamp(),
        });
      }
    });

    console.log("Successfully added item to shopping list");
    return true;
  } catch (error) {
    console.error("Error adding to shopping list:", error);
    throw error;
  }
}

// READ - Check if item is in shopping list
export async function isInShoppingList(userId, priceId) {
  try {
    const listRef = doc(database, "shoppingLists", userId);
    const listDoc = await getDoc(listRef);

    if (!listDoc.exists()) return false;

    const data = listDoc.data();
    const items = data.items || {};

    // Check each location's prices for the priceId
    return Object.values(items).some((locationItems) => locationItems[priceId]);
  } catch (error) {
    console.error("Error checking shopping list:", error);
    return false;
  }
}

// Subscribe to shopping list changes
export function subscribeToShoppingList(userId, onUpdate) {
  const listRef = doc(database, "shoppingLists", userId);

  try {
    const unsubscribe = onSnapshot(listRef, async (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate([]);
        return;
      }

      const data = snapshot.data();
      if (!data?.items) {
        onUpdate([]);
        return;
      }

      try {
        const locationPromises = Object.entries(data.items).map(
          async ([locationId, priceIds]) => {
            try {
              // Get location data using existing function
              const locationData = await getLocationById(locationId);
              if (!locationData) return null;

              // Get all prices for this location
              const pricePromises = Object.keys(priceIds).map(
                async (priceId) => {
                  const priceRef = doc(database, "prices", priceId);
                  const priceSnapshot = await getDoc(priceRef);

                  if (!priceSnapshot.exists()) return null;

                  const priceData = priceSnapshot.data();
                  return {
                    id: priceId,
                    locationId,
                    locationName: locationData.location.name, // Access name from the correct path
                    ...priceData,
                    productQuantity: priceData.quantity || "",
                    isMasterPrice: false,
                  };
                }
              );

              const pricesData = (await Promise.all(pricePromises)).filter(
                Boolean
              );
              if (!pricesData.length) return null;

              return {
                locationId,
                chainName: locationData.chain?.chainName || "Other",
                prices: pricesData,
              };
            } catch (error) {
              console.error(`Error processing location ${locationId}:`, error);
              return null;
            }
          }
        );

        const locationResults = (await Promise.all(locationPromises)).filter(
          Boolean
        );

        // Group by chain for SectionList
        const chainGroups = locationResults.reduce((groups, location) => {
          if (!location?.prices?.length) return groups;

          if (!groups[location.chainName]) {
            groups[location.chainName] = {
              title: location.chainName,
              data: [],
            };
          }

          groups[location.chainName].data.push(...location.prices);
          return groups;
        }, {});

        onUpdate(Object.values(chainGroups));
      } catch (error) {
        console.error("Error transforming shopping list data:", error);
        onUpdate([]);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to shopping list:", error);
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
      const locationItems = data.items[locationId];

      if (!locationItems || !locationItems[priceId]) {
        throw new Error("Item not found in shopping list");
      }

      // If this is the last price in the location, remove the location
      if (Object.keys(locationItems).length === 1) {
        transaction.update(listRef, {
          [`items.${locationId}`]: deleteField(),
          lastUpdated: serverTimestamp(),
        });
      } else {
        // Just remove the price from the location
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
  const listRef = doc(database, "shoppingLists", userId);

  try {
    await runTransaction(database, async (transaction) => {
      const listDoc = await transaction.get(listRef);

      if (!listDoc.exists()) {
        throw new Error("Shopping list not found");
      }

      const updates = {};
      const locationItemCounts = {};

      // Count items per location and prepare updates
      items.forEach(({ priceId, locationId }) => {
        if (!locationItemCounts[locationId]) {
          locationItemCounts[locationId] = 1;
        } else {
          locationItemCounts[locationId]++;
        }
        updates[`items.${locationId}.${priceId}`] = deleteField();
      });

      // Check if any locations should be completely removed
      const data = listDoc.data();
      Object.entries(locationItemCounts).forEach(([locationId, count]) => {
        const locationItems = data.items[locationId];
        if (locationItems && Object.keys(locationItems).length === count) {
          updates[`items.${locationId}`] = deleteField();
        }
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
