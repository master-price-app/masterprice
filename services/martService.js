import { database } from "./firebaseSetup";
import { collection, addDoc, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { martChainsData, martLocationsData } from "./martHelper";

// Initialize mart chains data and mart locations data in Firestore
export async function initializeMartData() {
  try {
    console.log("Starting mart data initialization...");

    // Add all mart chains
    const chainPromises = Object.values(martChainsData).map((chain) =>
      addDoc(collection(database, "martChains"), chain)  
    );
    await Promise.all(chainPromises);
    console.log("Mart chains added successfully");

    // Add all mart locations
    const locationPromises = martLocationsData.map((location) =>
      addDoc(collection(database, "martLocations"), location)
    );
    await Promise.all(locationPromises); // Wait for all promises to resolve
    console.log("Mart locations added successfully");

    console.log("All mart data initialized successfully");
  } catch (error) {
    console.error("Error initializing mart data:", error);
    throw error;
  }
}

// Get all mart chains by ID
export async function getMartChain(chainId) {
  try {
    const chainQuery = query(
      collection(database, "martChains"),
      where("chainId", "==", chainId)
    );
    const querySnapshot = await getDocs(chainQuery);
    return querySnapshot.docs[0]?.data();
  } catch (error) {
    console.error("Error getting mart chain:", error);
    throw error;
  }
}

// Get all mart locations by chain ID
export async function getMartLocations(chainId) {
  try {
    const locationsQuery = query(
      collection(database, "martLocations"),
      where("chainId", "==", chainId)
    );
    const querySnapshot = await getDocs(locationsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting mart locations:", error);
    throw error;
  }
}


// Get all locations with their Firebase IDs
export async function getLocations() {
  try {
    const querySnapshot = await getDocs(collection(database, "martLocations"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,  // Firebase-generated ID
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting locations:", error);
    throw error;
  }
}

// Get location by Firebase ID
export async function getLocationById(locationId) {
  try {
    if (!locationId) {
      console.log("No locationId provided");
      return null;
    }

    const locationRef = doc(database, "martLocations", locationId);
    const locationDoc = await getDoc(locationRef);

    if (!locationDoc.exists()) {
      console.log("Location not found");
      return null;
    }

    const locationData = locationDoc.data();
    // Get chain data if chainId is provided
    const chainData = locationData.chainId
      ? martChainsData[locationData.chainId]
      : null;

    return {
      location: {
        id: locationDoc.id,
        ...locationData,
      },
      chain: chainData,
    };
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

// mart chain logos stored in assets/martLogos used for displaying chain logos in UI
export const chainLogoMapping = {
  walmart: require("../assets/martLogos/Walmart_logo.png"),
  costco: require("../assets/martLogos/Costco_logo.png"),
  superstore: require("../assets/martLogos/Superstore_logo.png"),
  tnt: require("../assets/martLogos/T&T_Logo.png"),
};