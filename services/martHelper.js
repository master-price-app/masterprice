export const martChainsData = {
  walmart: {
    chainId: "walmart",
    chainName: "Walmart",
    // use asset logo
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
    dealCycle: {
      startDay: 4, // Thursday
      endDay: 3, // Wednesday
    },
  },
  costco: {
    chainId: "costco",
    chainName: "Costco",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/59/Costco_Wholesale_logo_2010-10-26.svg",
    dealCycle: {
      startDay: 1, // Monday
      endDay: 7, // Sunday
    },
  },
  superstore: {
    chainId: "superstore",
    chainName: "Real Canadian Superstore",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/en/b/bb/Real_Canadian_Superstore_logo.svg",
    dealCycle: {
      startDay: 4, // Thursday
      endDay: 3, // Wednesday
    },
  },
  tnt: {
    chainId: "tnt",
    chainName: "T&T Supermarket",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/9b/T%26T_Supermarket_Logo.svg",
    dealCycle: {
      startDay: 5, // Friday
      endDay: 4, // Thursday
    },
  },
  /* TODO: Add more chains */
};


export const martLocationsData = [
  // Walmart locations
  {
    chainId: "walmart",
    name: "Walmart Richmond",
    coordinates: {
      latitude: 49.1838,
      longitude: -123.1335
    },
    address: {
      street: "9251 Alderbridge Way",
      city: "Richmond",
      province: "BC",
      postalCode: "V6X 0N1",
      country: "Canada"
    },
    isActive: true
  },
  {
    chainId: "walmart",
    name: "Walmart Metrotown",
    coordinates: {
      latitude: 49.2276,
      longitude: -122.9971
    },
    address: {
      street: "4545 Central Boulevard",
      city: "Burnaby",
      province: "BC",
      postalCode: "V5H 4J5",
      country: "Canada"
    },
    isActive: true
  },

  // Superstore locations
  {
    chainId: "superstore",
    name: "Real Canadian Superstore Metrotown",
    coordinates: {
      latitude: 49.2267,
      longitude: -123.0016
    },
    address: {
      street: "4700 Kingsway #1105",
      city: "Burnaby",
      province: "BC",
      postalCode: "V5H 4M1",
      country: "Canada"
    },
    isActive: true
  },
  {
    chainId: "superstore",
    name: "Real Canadian Superstore Marine Drive",
    coordinates: {
      latitude: 49.2094,
      longitude: -123.0902
    },
    address: {
      street: "350 SE Marine Drive",
      city: "Vancouver",
      province: "BC",
      postalCode: "V5X 2S5",
      country: "Canada"
    },
    isActive: true
  },

  // Costco locations
  {
    chainId: "costco",
    name: "Costco Downtown Vancouver",
    coordinates: {
      latitude: 49.2786,
      longitude: -123.1083
    },
    address: {
      street: "605 Expo Boulevard",
      city: "Vancouver",
      province: "BC",
      postalCode: "V6B 1V4",
      country: "Canada"
    },
    isActive: true
  },
  {
    chainId: "costco",
    name: "Costco Still Creek",
    coordinates: {
      latitude: 49.2594,
      longitude: -123.0083
    },
    address: {
      street: "4500 Still Creek Drive",
      city: "Burnaby",
      province: "BC",
      postalCode: "V5C 0E5",
      country: "Canada"
    },
    isActive: true
  },

  // T&T locations
  {
    chainId: "tnt",
    name: "T&T Supermarket International Village",
    coordinates: {
      latitude: 49.2799,
      longitude: -123.1075
    },
    address: {
      street: "179 Keefer Place",
      city: "Vancouver",
      province: "BC",
      postalCode: "V6B 2L2",
      country: "Canada"
    },
    isActive: true
  },
  {
    chainId: "tnt",
    name: "T&T Supermarket Metrotown",
    coordinates: {
      latitude: 49.2276,
      longitude: -122.9985
    },
    address: {
      street: "147-4800 Kingsway",
      city: "Burnaby",
      province: "BC",
      postalCode: "V5H 4J2",
      country: "Canada"
    },
    isActive: true
  }

  /* TODO: Add more martLocations */
];

