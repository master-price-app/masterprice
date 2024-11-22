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
  getDocs,
} from "firebase/firestore";
import { getLocationById } from "./martService";
import { isWithinCurrentCycle, isMasterPrice } from "../utils/priceUtils";

// CREATE - Add item to shopping list
export async function addToShoppingList(userId, priceId, locationId) {
  // Reference to the user's shopping list
  const listRef = doc(database, "shoppingLists", userId);

  try {
    // Run transaction to add item to shopping list
    // runTransaction is used to ensure data consistency
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

      // Get all prices
      const pricesQuery = query(
        collection(database, "prices"),
        where("__name__", "in", priceIds)
      );

      const pricesSnapshot = await getDocs(pricesQuery);
      const allPrices = pricesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get all prices with location data
      const pricesPromises = allPrices.map(async (priceData) => {
        const locationData = await getLocationById(priceData.locationId);

        if (!locationData) return null;

        // Check validity using mart cycle
        const isValid = locationData.chain?.dealCycle
          ? isWithinCurrentCycle(
              priceData.createdAt,
              locationData.chain.dealCycle
            )
          : false;

        // Group prices by product code for master price check
        const productPrices = allPrices.filter(
          (p) => p.code === priceData.code
        );

        return {
          id: priceData.id,
          locationId: priceData.locationId,
          locationName: locationData.location.name,
          chainName: locationData.chain?.chainName || "Other",
          ...priceData,
          isValid,
          isMasterPrice:
            isValid &&
            productPrices.length > 0 &&
            Math.min(...productPrices.map((p) => p.price)) === priceData.price,
        };
      });

      const validPrices = (await Promise.all(pricesPromises)).filter(Boolean);

      // Group by chain for UI
      const chainGroups = validPrices.reduce((groups, price) => {
        if (!groups[price.chainName]) {
          groups[price.chainName] = {
            title: price.chainName,
            data: [],
          };
        }
        groups[price.chainName].data.push(price);
        return groups;
      }, {});

      // Convert to array and calculate section totals
      const sectionsWithTotals = Object.entries(chainGroups).map(
        ([title, section]) => ({
          title,
          data: section.data,
          total: section.data.reduce(
            (sum, price) => sum + (price.isValid ? price.price : 0),
            0
          ),
        })
      );

      onUpdate(sectionsWithTotals);
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
        // Check each location for the priceId
        for (const [loc, prices] of Object.entries(items)) {
          // If priceId exists in this location
          if (prices[priceId]) {
            // If this is the last price in the location
            if (Object.keys(prices).length === 1) {
              // Remove the location and all its prices
              transaction.update(listRef, {
                [`items.${loc}`]: deleteField(),
                lastUpdated: serverTimestamp(),
              });
            } else {
              // Remove the price from the location
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
        // Increment count for this location
        if (!locationItemCounts[locationId]) {
          locationItemCounts[locationId] = 1;
        } else {
          locationItemCounts[locationId]++;
        }
        // remove the item from the location
        updates[`items.${locationId}.${priceId}`] = deleteField();
      });

      // Check if any locations should be completely removed
      const data = listDoc.data();
      // Remove locations with all items removed
      Object.entries(locationItemCounts).forEach(([locationId, count]) => {
        const locationItems = data.items[locationId];
        if (locationItems && Object.keys(locationItems).length === count) {
          updates[`items.${locationId}`] = deleteField();
        }
      });
      // Update the shopping list with all changes
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
