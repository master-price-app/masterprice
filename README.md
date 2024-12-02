# MasterPrice

MasterPrice is a community-driven mobile application designed to help shoppers find the best deals on their everyday items. The app enables users to share and compare prices across local marts, scan barcodes to check prices, and create optimized shopping lists.

## Target Users
- City budget-conscious shoppers seeking to save on groceries.
- Community-driven consumers who love to share and update sales prices.
- A family grocery purchase decision-maker who needs to keep track of the shopping
list.

## Team Members and Contributions
Group 22:

### Annan Fu
**Iteration 1**
- firebase setup and configuration
- Collection design and CRUD operation services
- third-party web API integration
- Common screens development: MartDetail, PriceDetail, PriceForm, ProductDetail
- Search screens development: SearchResult
- Account screens development: MyPosts
- Assets: martLogos and dummyProduct data storage

**Iteration 2**
- External API use (Finished in Iteration 1)
- Sort: Price list sort by post time or price
- Authentication: Register and login functionalities with firebase rules and public/private access to different screens
- Image storage: upload and read from firebase storage

### Jiani Guo
**Iteration 1**
- Project structure design
- Collection design
- Navigation and stack setup
- Component creation
- UI and styling
- Account screens development: Account, AccountSecurity, EditProfile, TermsAndConditions
- List screens development: ShoppingList
- Search screens development: BarcodeScanner, Search

**Iteration 2**
- Search (Finished in Iteration 1)
- Camera use: Take picture and choose from album functionality with permission validation
- Location and map: Use user's location and show an interactive map with multiplemarkers of marts with permission validation
- Notification: Schedule local notification to pop alert for checking mart deals
- Tab navigation iteration: Improve navigation through different screens
- UI and styling

## Features

- **Barcode Scanner**: Instantly check prices by scanning product barcodes
<img src="https://github.com/user-attachments/assets/80b276ca-8158-4504-93ab-56d29f8d2bed" width="200" alt="Search Screen"/>
<img src="https://github.com/user-attachments/assets/bd99985d-c56f-4888-900a-6d8eb625e8f3" width="200" alt="Barcode Scanner Screen"/>


<br><br>
Try scanning this barcode:

<img width="200" alt="image" src="https://github.com/user-attachments/assets/26d0d634-eb87-4d5c-a987-48fd506d0954">

<br><br>

- **Price Comparison with interative map**:

Search and compare prices of products across multiple marts marked in an interative map (users can click locate to show location)

<img src="https://github.com/user-attachments/assets/97c34443-1eeb-42bd-b643-5ac2d5e225b3" width="200" alt="Search Result Screen"/>
<img src="https://github.com/user-attachments/assets/f5cac00a-89ad-43e0-a4a7-4f165cbef811" width="200"/>

<br><br>
Sort the price by post date or price with 'Master Price' marked for users

<img src="https://github.com/user-attachments/assets/c27986db-c4c5-4557-b269-16b22ab2a56b" width="200"/>
<img src="https://github.com/user-attachments/assets/e95aada8-5871-442c-a735-81c6be757136" width="200"/>

<br><br>
<br><br>
  
- **Community-Driven Updates with camera use**: Share and comment on price information with image taking/uploading
<img src="https://github.com/user-attachments/assets/06a0da7a-be4d-45e7-abdf-c8e9b3ccaa24" width="200" alt="Price Detail Screen"/>
<img src="https://github.com/user-attachments/assets/3551b4ef-a996-43be-ade4-91437f73aade" width="200"/>
<img src="https://github.com/user-attachments/assets/3c0f4646-3005-458c-8927-e8813cddd062" width="200"/>

<br><br>
<br><br>
  
- **Mart Browse and notification scheduling**: View mart location and schedule notifications for the chosen marts’ weekly deal reminder based on deal cycles
<img src="https://github.com/user-attachments/assets/33ee346f-5410-4d7f-8b75-6eb43bb5a95d" width="200"/>
<img src="https://github.com/user-attachments/assets/1a6d94cf-5399-4964-880f-3ab5f911022d" width="200"/>
<img src="https://github.com/user-attachments/assets/9556ffca-5453-4d20-928e-e2d9f6d74ae4" width="200"/>

<br><br>
<br><br> 

- **Shopping List Management**:

Build and manage mart-specific grocery lists by adding/removing items on price detail screen

<img src="https://github.com/user-attachments/assets/547c48d0-3b25-4768-87c1-69678af6d66f" width="200" alt="Price Detail Screen"/>
<img src="https://github.com/user-attachments/assets/c22d4c71-24f0-4acf-bd6e-ffb67e87780f" width="200" alt="Price Detail Screen"/>

<br><br>

Make budget and manage deletion for selected items

<img src="https://github.com/user-attachments/assets/2e7486b0-7cb4-4f1e-ae23-973ce81a8ba3" width="200" alt="Shopping List Screen"/>
<img src="https://github.com/user-attachments/assets/fd6d7ad6-d018-4361-b074-cc64abb7c541" width="200" alt="Shopping List Screen"/>

<br><br>
<br><br>

- **My Post Management**: Manage user's posts of price sharing efficiently
<img src="https://github.com/user-attachments/assets/065e6e01-6dcf-452b-9d30-c4c2b100dae7" width="200" alt="My Post Screen"/>
<img src="https://github.com/user-attachments/assets/e4845a51-582e-414f-a829-a859f5973362" width="200" alt="Price Detail Screen"/>

<br><br>
<br><br>

- **Authentication**: Login and Register functionalities to distinguish public and protected access to different features
<img src="https://github.com/user-attachments/assets/9a0d7f4d-6697-4636-8102-df96dd221cb8" width="200"/>
<img src="https://github.com/user-attachments/assets/8576cb76-cdea-4c64-969e-38c9e30cfbcf" width="200"/>
<img src="https://github.com/user-attachments/assets/4727d2f0-fe2d-40f2-bc50-38f0fb9f6e4f" width="200"/>

<br><br>
<br><br>

- **Account Management**: Allow user to manage user CRUD information like change avatar
<img src="https://github.com/user-attachments/assets/fb52cb4a-5639-457b-80e2-d8108bba1e96" width="200"/>
<img src="https://github.com/user-attachments/assets/475fcda3-6b53-41b6-bd10-7b7e6b6218e7" width="200"/>
<img src="https://github.com/user-attachments/assets/6ae02de2-1149-4e39-8c8c-ba6a42e01a67" width="200"/>

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
  imagePath: string,      // Profile avatar image uploaded/taken by users, reference to image stored in storage
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
  imagePath: string,        // Item image uploaded/taken by users, reference to image stored in storage
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
├── contexts/     # Context management to share state
├── components/   # Reusable UI components
├── navigation/   # Navigation configuration
├── screens/      # Application screens
│   ├── account/  # Account-related screens
│   ├── common/   # Shared screens mart/product/price
│   ├── list/     # Shopping list screens
│   ├── auth/     # Register and login screens
│   └── search/   # Search-related screens
├── services/     # Firebase and API services
└── utils/        # Shared functions and helpers
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
## Firebase Rules
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // This rule allows anyone with your Firestore database reference to view, edit,
    // and delete all data in your Firestore database. It is useful for getting
    // started, but it is configured to expire after 30 days because it
    // leaves your app open to attackers. At that time, all client
    // requests to your Firestore database will be denied.
    //
    // Make sure to write security rules for your app before that time, or else
    // all client requests to your Firestore database will be denied until you Update
    // your rules

    // Base rule - no public access by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Prices collection
      match /prices/{priceId} {
        // Anyone can read prices
        allow read: if true;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
      }
    
    // Shopping Lists collection
    match /shoppingLists/{userId} {
      // Only the owner can access their shopping list
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User profiles collection
    match /users/{userId} {
      match /nickname {
      // Users can read other users' nicknames
        allow read: if true;
      }
    }
    
    match /users/{userId}{
      // Users can only modify their own profile
      allow read: if true;
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }

    // Mart collections (locations, chains)
    match /martLocations/{location} {
      allow read: if true;  // Anyone can read mart locations
      allow write: if false; // Only admins can modify 
    }
    
    match /martChains/{chain} {
      allow read: if true;  // Anyone can read mart chains
      allow write: if false; // Only admins can modify 
    }
  
  }
}
```


## Acknowledgments
- OpenFoodFacts API for product data
- Firebase for backend services
- Expo for development framework
