# MasterPrice

MasterPrice is a community-driven mobile application designed to help shoppers find the best deals on their everyday items. The app enables users to share and compare prices across local marts, scan barcodes to check prices, and create optimized shopping lists.

## Target Users
- City budget-conscious shoppers seeking to save on groceries.
- Community-driven consumers who love to share and update sales prices.
- A family grocery purchase decision-maker who needs to keep track of the shopping
list.

## Team Members and Contributions
Group 22:
- Jiani Guo


- Annan Fu



## Features

- **Barcode Scanner**: Instantly check prices by scanning product barcodes

  
- **Price Comparison**: Search and compare prices of products across multiple marts in your area

  
- **Community-Driven Updates**: Share and validate price information

  
- **Mart Browse**: View and schedule notifications for the chosen marts’ deal releases based on deal cycles

  
- **Interactive Map**: View nearby marts with current deals

  
- **Shopping List Manager**: Build and manage mart-specific grocery lists

  
- **My Post Manager**: Manage user's posts of price sharing efficiently

  

## Data Model

The application uses Firebase Firestore with 5 main collections:

### 1. users
```javascript
documentId: {   // Firebase Auth UID as document ID
  email: string, 
  nickname: string,
  createdAt: timestamp, 
  updatedAt: timestamp,   
  notificationOn: boolean  // Mart weekly deal release notification  
  }
}
```

### 2. prices
```javascript
documentId: {   // Auto-generated Firebase ID              
  code: string,            // Product barcode
  productName: string,     // Product name
  price: number,           // Price value
  locationId: string,        // mart identifier
  userId: string,         // User who posted the price
  createdAt: timestamp,   // Creation date
  updatedAt: timestamp,   // Last update date
  comments: {             // Nested comments
    [commentId]: {
      userId: string,
      content: string,
      createdAt: timestamp
    }
  },
}
```

### 3. martChains
```javascript
documentId: { // Auto-generated Firebase ID
  chainId: string,        // Unique chain identifier
  chainName: string,      // Chain name
  dealCycle: {           // Weekly deal cycle
    startDay: number,    // Start day (1-7)
    endDay: number      // End day (1-7)
  }
}
```

### 4. martLocations
```javascript
documentId: {   // Auto-generated Firebase ID   
  chainId: string,        // Reference to martChains
  name: string,           // Location name
  coordinates: {
    latitude: number,
    longitude: number
  },
  address: {
    street: string,
    city: string,
    province: string,
    country: string
    postalCode: string,
  },
  isActive: boolean
}
```

### 5. shoppingLists
```javascript
userId: {     // Document ID is the userId
  userId: string,           // Reference to users collection
  items: {                  // Map of items in the shopping list
    [locationId: string]: {    // The key is the martLocation document ID from martLocations collections
      [priceId: string]: boolean   // The key is the price document ID, value is always true
    }
  },
  lastUpdated: timestamp,   // Last time the shopping list was modified
  userId: string           // user ID for queries
}
```

## CRUD Operations

### prices Collection
- **Create**: Add new price entries via PriceFormScreen
- **Read**: 
  - View price comparisons across different martLocations in ProductDetailScreen
  - View price details in PriceDetailScreen
  - View prices in shopping list
- **Update**: Edit price entries via PriceFormScreen
- **Delete**: Delete price entries in PriceDetailScreen
  
### shoppingLists Collection
- **Create**: Create new shopping list when user adds first item
- **Read**: 
  - Fetch user's shopping list
  - Get items by store
- **Update**: 
  - Add/remove items from shopping list
- **Delete**: Remove items or the entire shopping list

### users Collection (Iteration 2)
- **Create**: Create user profile upon Firebase Authentication signup
- **Read**: 
  - Fetch user profile
  - Get user preferences
- **Update**: 
  - Update profile information
  - Modify notification preferences
  - Update last login
- **Delete**: Delete user account and associated data

**Note**: The users collection CRUD operations will be implemented in Iteration 2 along with Firebase Authentication and Notification. 

## Setup and Installation

### Prerequisites
- Node.js 
- npm
- Expo CLI
- Firebase account

### Environment Setup
1. Clone the repository
2. Copy the `.env` file in the root directory:
```
EXPO_PUBLIC_API_KEY=api_key
EXPO_PUBLIC_AUTH_DOMAIN=auth_domain
EXPO_PUBLIC_PROJECT_ID=project_id
EXPO_PUBLIC_STORAGE_BUCKET=storage_bucket
EXPO_PUBLIC_MESSAGING_SENDER_ID=messaging_sender_id
EXPO_PUBLIC_APP_ID=app_id
```

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

## Project Structure
```
.
├── App.js                 # Main application entry
├── assets/               # Static assets
├── components/           # Reusable UI components
├── navigation/           # Navigation configuration
├── screens/             # Application screens
│   ├── account/         # Account-related screens
│   ├── common/          # Shared screens mart/product/price
│   ├── list/           # Shopping list screens
│   └── search/         # Search-related screens
└── services/            # Firebase and API services
```

## Dependencies
- react-native
- react-navigation
- react-native-paper
- expo-camera
- firebase

## Acknowledgments
- OpenFoodFacts API for product data
- Firebase for backend services
- Expo for development framework
