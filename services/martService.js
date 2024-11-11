import { database } from "./firebaseSetup";
import { collection, addDoc, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { martChainsData, martLocationsData } from "./martHelper";

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
    await Promise.all(locationPromises);
    console.log("Mart locations added successfully");

    console.log("All mart data initialized successfully");
  } catch (error) {
    console.error("Error initializing mart data:", error);
    throw error;
  }
}

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
    const locationDoc = await getDoc(doc(database, "martLocations", locationId));
    if (!locationDoc.exists()) return null;
    
    const locationData = {
      id: locationDoc.id,
      ...locationDoc.data()
    };
    
    const chain = martChainsData[locationData.chainId];
    return {
      location: locationData,
      chain
    };
  } catch (error) {
    console.error("Error getting location:", error);
    throw error;
  }
}

export const chainLogoMapping = {
  walmart: require("../assets/martLogos/Walmart_logo.png"),
  costco: require("../assets/martLogos/Costco_logo.png"),
  superstore: require("../assets/martLogos/Superstore_logo.png"),
  tnt: require("../assets/martLogos/T&T_Logo.png"),
};