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
  const listRef = doc(database, "shoppingLists", userId);

  try {
    await runTransaction(database, async (transaction) => {
      const listDoc = await transaction.get(listRef);

      if (!listDoc.exists()) {
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
  const priceListeners = new Map();

  try {
    // Main shopping list listener
    const listUnsubscribe = onSnapshot(listRef, async (snapshot) => {
      // Handle empty or non-existent list
      if (!snapshot.exists() || !snapshot.data()?.items) {
        onUpdate([]);
        priceListeners.forEach((listener) => listener());
        priceListeners.clear();
        return;
      }

      // Get price IDs from shopping list
      const priceIds = [];
      Object.values(snapshot.data().items).forEach((locationPrices) => {
        priceIds.push(...Object.keys(locationPrices));
      });

      if (priceIds.length === 0) {
        onUpdate([]);
        priceListeners.forEach((listener) => listener());
        priceListeners.clear();
        return;
      }

      // Cleanup old listeners
      priceListeners.forEach((listener, priceId) => {
        if (!priceIds.includes(priceId)) {
          listener();
          priceListeners.delete(priceId);
        }
      });

      // Setup price document listeners
      for (const priceId of priceIds) {
        if (!priceListeners.has(priceId)) {
          const priceRef = doc(database, "prices", priceId);
          const unsubscribe = onSnapshot(
            priceRef,
            async (priceDoc) => {
              if (!priceDoc.exists()) {
                // Automatically remove deleted prices
                try {
                  await removeFromShoppingList(userId, priceId);
                  // Update UI right away
                  const updatedSnapshot = await getDoc(listRef);
                  handleUpdate(updatedSnapshot, onUpdate);
                } catch (error) {
                  console.error("Error handling deleted price:", error);
                }
                return;
              }
              // Update UI for any price changes
              handleUpdate(snapshot, onUpdate);
            },
            (error) => {
              console.error("Error in price listener:", error);
            }
          );
          priceListeners.set(priceId, unsubscribe);
        }
      }

      // Initial update
      handleUpdate(snapshot, onUpdate);
    });

    // Return cleanup function
    return () => {
      listUnsubscribe();
      priceListeners.forEach((listener) => listener());
      priceListeners.clear();
    };
  } catch (error) {
    console.error("Error in shopping list subscription:", error);
    throw error;
  }
}

// Helper function to handle updates
async function handleUpdate(snapshot, onUpdate) {
  try {
    if (!snapshot.exists() || !snapshot.data()?.items) {
      onUpdate([]);
      return;
    }

    // Get all price IDs
    const priceIds = [];
    Object.values(snapshot.data().items).forEach((locationPrices) => {
      priceIds.push(...Object.keys(locationPrices));
    });

    if (priceIds.length === 0) {
      onUpdate([]);
      return;
    }

    // Fetch prices in batches of 10
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < priceIds.length; i += batchSize) {
      const batch = priceIds.slice(i, i + batchSize);
      const pricesQuery = query(
        collection(database, "prices"),
        where("__name__", "in", batch)
      );
      batches.push(getDocs(pricesQuery));
    }

    const batchResults = await Promise.all(batches);
    const allPrices = batchResults.flatMap((querySnapshot) =>
      querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    // Process each price with location data
    const pricesPromises = allPrices.map(async (priceData) => {
      const locationData = await getLocationById(priceData.locationId);
      if (!locationData) return null;

      const isValid = locationData.chain?.dealCycle
        ? isWithinCurrentCycle(
            priceData.createdAt,
            locationData.chain.dealCycle
          )
        : false;

      return {
        id: priceData.id,
        locationId: priceData.locationId,
        locationName: locationData.location.name,
        chainName: locationData.chain?.chainName || "Other",
        ...priceData,
        isValid,
        isMasterPrice:
          isValid &&
          Math.min(
            ...allPrices
              .filter((p) => p.code === priceData.code)
              .map((p) => p.price)
          ) === priceData.price,
      };
    });

    const validPrices = (await Promise.all(pricesPromises)).filter(Boolean);

    // Group by chain
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

    // Convert to array with totals
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
  } catch (error) {
    console.error("Error handling update:", error);
  }
}

// DELETE - Remove single item
export async function removeFromShoppingList(userId, priceId, locationId) {
  const listRef = doc(database, "shoppingLists", userId);

  try {
    await runTransaction(database, async (transaction) => {
      const listDoc = await transaction.get(listRef);
      if (!listDoc.exists()) return;

      const data = listDoc.data();
      const items = data.items || {};

      // If we know the location
      if (locationId && items[locationId]?.[priceId]) {
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
      } else {
        // Search all locations for the price
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

      items.forEach(({ priceId, locationId }) => {
        if (!locationItemCounts[locationId]) {
          locationItemCounts[locationId] = 1;
        } else {
          locationItemCounts[locationId]++;
        }
        updates[`items.${locationId}.${priceId}`] = deleteField();
      });

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
