# MasterPrice

MasterPrice is a community-driven mobile application designed to help shoppers find the best deals on their everyday items. The app enables users to share and compare prices across local marts, scan barcodes to check prices, and create optimized shopping lists.

## Target Users
- City budget-conscious shoppers seeking to save on groceries.
- Community-driven consumers who love to share and update sales prices.
- A family grocery purchase decision-maker who needs to keep track of the shopping
list.

## Team Members and Contributions
Group 22:

**Annan Fu**
- firebase setup and configuration
- Collection design and CRUD operation services
- third-party web API integration
- Common screens development: MartDetail, PriceDetail, PriceForm, ProductDetail
- Search screens development: SearchResult
- Account screens development: MyPosts
- Assets: martLogos and dummyProduct data storage

**Jiani Guo**
- Project structure design
- Collection design
- Navigation and stack setup
- Component creation
- UI and styling
- Account screens development: Account, AccountSecurity, EditProfile, TermsAndConditions
- List screens development: ShoppingList
- Search screens development: BarcodeScanner, Search


## Features

- **Barcode Scanner**: Instantly check prices by scanning product barcodes(To be updated in the next iteration with location and map) 
<img src="https://github.com/user-attachments/assets/1bf5c7c1-8009-444a-8758-cbdd8002792e" width="200" alt="Search Screen"/>
<img src="https://github.com/user-attachments/assets/bd99985d-c56f-4888-900a-6d8eb625e8f3" width="200" alt="Barcode Scanner Screen"/>

<br><br>
Try scanning this barcode:

<img width="200" alt="image" src="https://github.com/user-attachments/assets/26d0d634-eb87-4d5c-a987-48fd506d0954">

<br><br>

- **Price Comparison**: Search and compare prices of products across multiple marts in your area(To be updated in the next iteration with authentication)
<img src="https://github.com/user-attachments/assets/59848bd2-2bbb-4917-9a9c-56404b43a75c" width="200" alt="Search Screen"/>
<img src="https://github.com/user-attachments/assets/7f536aac-d1f3-4750-aeb2-ecf5fa162d45" width="200" alt="Search Result Screen"/>
<img src="https://github.com/user-attachments/assets/1b9d81ae-3116-41a1-91aa-a684bfcc2c2d" width="200" alt="Product Detail Screen"/>
<br><br>
<br><br>
  
- **Community-Driven Updates**: Share and comment on price information
<img src="https://github.com/user-attachments/assets/06a0da7a-be4d-45e7-abdf-c8e9b3ccaa24" width="200" alt="Price Detail Screen"/>
<img src="https://github.com/user-attachments/assets/4e342019-8489-48f1-8233-e37d92a37772" width="200" alt="Price Form Screen"/>
<img src="https://github.com/user-attachments/assets/02cf2247-8d3b-4393-a152-1a78c37c5085" width="200" alt="Price Detail Screen"/>
<br><br>
<br><br>

  
- **Mart Browse**: View and schedule notifications for the chosen marts’ deal releases based on deal cycles(To be updated in the next iteration with location, map and notification) 
<img src="https://github.com/user-attachments/assets/16cff329-4e1c-4773-8bb7-e3838981d313" width="200" alt="Mart Detail Screen"/>
<br><br>
<br><br>

- **Interactive Map**: View nearby marts with current deals(To be developed in the next iteration with location and map) 
<br><br>  

- **Shopping List Management**: Build and manage mart-specific grocery lists by adding/removing items on price detail screen
<img src="https://github.com/user-attachments/assets/547c48d0-3b25-4768-87c1-69678af6d66f" width="200" alt="Price Detail Screen"/>
<img src="https://github.com/user-attachments/assets/c22d4c71-24f0-4acf-bd6e-ffb67e87780f" width="200" alt="Price Detail Screen"/>
<img src="https://github.com/user-attachments/assets/1448417b-fdeb-4647-ab0f-d19e5293f9a6" width="200" alt="Shopping List Screen"/>
<br><br>
<br><br>

- **My Post Management**: Manage user's posts of price sharing efficiently
<img src="https://github.com/user-attachments/assets/4a2e0871-1dd2-4b7a-bf83-2fab0bc1c44c" width="200" alt="My Post Screen"/>
<img src="https://github.com/user-attachments/assets/285e83b8-30c6-49d3-afa2-e8f5d43ac604" width="200" alt="Price Detail Screen"/>
<br><br>
<br><br>

- **Account Management**: Allow user to manage user CRUD information(To be updated in the next iteration with authentication)
<img src="https://github.com/user-attachments/assets/deed7fbb-6ed6-481b-ab71-17db00870495" width="200" alt="Account Screen"/>
<img src="https://github.com/user-attachments/assets/fdfa6e5c-e4df-4cfd-bc8c-113cbbce186e" width="200" alt="Edit Profile Screen"/>
<img src="https://github.com/user-attachments/assets/ea3e65e9-6fcf-41af-a05f-7a3e02c07f92" width="200" alt="Account Security Screen"/>
<br><br>

## Data Model

The application uses Firebase Firestore with 5 main collections:

### 1. users
```javascript
documentId: {             // Firebase Auth UID as document ID
  email: string, 
  nickname: string,
  createdAt: timestamp, 
  updatedAt: timestamp,   
  notificationOn: boolean // Mart weekly deal release notification  
  }
```

### 2. prices
```javascript
documentId: {               // Auto-generated Firebase ID              
  code: string,             // Product barcode
  productName: string,      // Product name
  price: number,            // Price value
  locationId: string,       // mart identifier
  userId: string,           // User who posted the price
  createdAt: timestamp,     // Creation date
  updatedAt: timestamp,     // Last update date
  comments: {               // Nested comments
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
documentId: {         // Auto-generated Firebase ID
  chainId: string,    // Unique chain identifier
  chainName: string,  // Chain name
  dealCycle: {        // Weekly deal cycle
    startDay: number, // Start day (1-7)
    endDay: number    // End day (1-7)
  }
}
```

### 4. martLocations
```javascript
documentId: {           // Auto-generated Firebase ID   
  chainId: string,      // Reference to martChains
  name: string,         // Location name
  coordinates: {
    latitude: number,
    longitude: number
  },
  address: {
    street: string,
    city: string,
    province: string,
    country: string,
    postalCode: string,
  },
  isActive: boolean
}
```

### 5. shoppingLists
```javascript
userId: {                 // Document ID is the userId
  userId: string          // user ID for queries
  items: {                // Map of items in the shopping list
    [locationId: string]: {       // The key is the martLocation document ID from martLocations collections
      [priceId: string]: boolean  // The key is the price document ID, value is always true
    }
  },
  lastUpdated: timestamp, // Last time the shopping list was modified
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

**Note**: 
- The users collection CRUD operations will be implemented in Iteration 2 along with Firebase Authentication and Notification. 
- The search result of product list is fetched from external APIs; when product is selected, the price records are read from database.

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
├── App.js        # Main application entry
├── assets/       # Static assets
├── components/   # Reusable UI components
├── navigation/   # Navigation configuration
├── screens/      # Application screens
│   ├── account/  # Account-related screens
│   ├── common/   # Shared screens mart/product/price
│   ├── list/     # Shopping list screens
│   └── search/   # Search-related screens
└── services/     # Firebase and API services
```
  
## External APIs and Endpoints

### OpenFoodFacts API
The application uses the OpenFoodFacts API to fetch product information based on barcode scanning and text search. OpenFoodFacts is an open-source food products database.

#### Base URLs
- Search endpoint: `https://world.openfoodfacts.org/cgi/search.pl`
- Product lookup endpoint: `https://world.openfoodfacts.net/api/v2/search`
- Product by barcode: `https://world.openfoodfacts.net/api/v2/product/{barcode}`

#### Endpoints Used
1. **Product Search by Keyword**
```
GET https://world.openfoodfacts.org/cgi/search.pl
Query Parameters:
- search_terms: string    // Search keyword
- json: 1                 // Response format
- page_size: number       // Number of results (default: 5)
- fields: string         // Comma-separated list of fields to return
```

2. **Product Search by Barcode**
```
GET https://world.openfoodfacts.net/api/v2/search
Query Parameters:
- code: string           // Product barcode
- fields: string        // Comma-separated list of fields to return
- page_size: number     // Number of results (default: 5)
```

3. **Product Details by Barcode**
```
GET https://world.openfoodfacts.net/api/v2/product/{barcode}
```

## Dependencies
- react-native
- react-navigation
- react-native-paper
- expo-camera
- expo-image-picker
- firebase

## Acknowledgments
- OpenFoodFacts API for product data
- Firebase for backend services
- Expo for development framework
