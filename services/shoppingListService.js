import { database } from "./firebaseSetup";
import {
  doc,
  getDoc,
  setDoc,
  deleteField,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  query,
  collection,
  where,  
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
        // Update existing document
        transaction.update(listRef, {
          [`items.${locationId}.${priceId}`]: true,
          lastUpdated: serverTimestamp(),
        });
      }
    });

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
    return Object.values(items).some((locationItems) =>
      Object.keys(locationItems).includes(priceId)
    );
  } catch (error) {
    console.error("Error checking shopping list:", error);
    return false;
  }
}

// Subscribe to shopping list changes
export function subscribeToShoppingList(userId, onUpdate) {
  const listRef = doc(database, "shoppingLists", userId);

  try {
    // First get the list of priceIds from shopping list
    const unsubscribe = onSnapshot(listRef, async (snapshot) => {
      if (!snapshot.exists() || !snapshot.data()?.items) {
        onUpdate([]);
        return;
      }

      // Get all priceIds from the shopping list
      const priceIds = [];
      Object.values(snapshot.data().items).forEach((locationPrices) => {
        priceIds.push(...Object.keys(locationPrices));
      });

      if (priceIds.length === 0) {
        onUpdate([]);
        return;
      }

      // Create a query to listen to these prices
      const pricesQuery = query(
        collection(database, "prices"),
        where("__name__", "in", priceIds)
      );

      // Subscribe to price updates
      const priceUnsubscribe = onSnapshot(
        pricesQuery,
        async (querySnapshot) => {
          try {
            // Get all prices with location data
            const pricesPromises = querySnapshot.docs.map(async (doc) => {
              const priceData = doc.data();
              const locationData = await getLocationById(priceData.locationId);

              if (!locationData) return null;

              return {
                id: doc.id,
                locationId: priceData.locationId,
                locationName: locationData.location.name,
                chainName: locationData.chain?.chainName || "Other",
                ...priceData,
                isMasterPrice: false,
              };
            });

            const prices = (await Promise.all(pricesPromises)).filter(Boolean);

            // Group by chain
            const chainGroups = prices.reduce((groups, price) => {
              if (!groups[price.chainName]) {
                groups[price.chainName] = {
                  title: price.chainName,
                  data: [],
                };
              }
              groups[price.chainName].data.push(price);
              return groups;
            }, {});

            onUpdate(Object.values(chainGroups));
          } catch (error) {
            console.error("Error processing prices:", error);
            onUpdate([]);
          }
        }
      );

      // Clean up price subscription when shopping list changes
      return () => priceUnsubscribe();
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
        return; // Just exit if no list exists
      }

      const data = listDoc.data();
      const items = data.items || {};

      // If location exists and has this price
      if (items[locationId]?.[priceId]) {
        // If this is the last price in the location
        if (Object.keys(items[locationId]).length === 1) {
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
      }
      // If locationId not found but priceId exists somewhere else
      else {
        for (const [loc, prices] of Object.entries(items)) {
          if (prices[priceId]) {
            if (Object.keys(prices).length === 1) {
              transaction.update(listRef, {
                [`items.${loc}`]: deleteField(),
                lastUpdated: serverTimestamp(),
              });
            } else {
              transaction.update(listRef, {
                [`items.${loc}.${priceId}`]: deleteField(),
                lastUpdated: serverTimestamp(),
              });
            }
            break;
          }
        }
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
