import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PressableButton from "../../components/PressableButton";

export default function SearchScreen({ navigation }) {
  const [keyword, setKeyword] = useState("");

  // Navigate to barcode scanner
  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner');
  };

  // Navigate to search results
  const handleSearch = () => {
    if (keyword.trim()) {
      navigation.navigate("SearchResult", { keyword: keyword.trim() });
    }
  };

  // Clear search keyword
  const handleClearSearch = () => {
    setKeyword("");
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Master Price</Text>
        <Text style={styles.subtitle}>
          Find the Best Grocery Deals Near You
        </Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Search for products, try 'coke'"
            placeholderTextColor="#999"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            style={styles.searchInput}
          />
          {/* Clear search keyword button */}
          {keyword.length > 0 && (
            <PressableButton
              onPress={handleClearSearch}
              componentStyle={styles.clearButton}
              pressedStyle={styles.clearButtonPressed}
            >
              <MaterialIcons name="close" size={20} color="#666" />
            </PressableButton>
          )}
        </View>

        <Text style={styles.orText}>or</Text>

        {/* Scan Barcode Button */}
        <PressableButton
          onPress={handleScanBarcode}
          componentStyle={styles.scanButton}
          pressedStyle={styles.scanButtonPressed}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="qr-code-scanner" size={24} color="#fff" />
            <Text style={styles.scanButtonText}>Scan Barcode</Text>
          </View>
        </PressableButton>
      </View>

      {/* Search Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Search Tips</Text>
        <View style={styles.tipItem}>
          <MaterialIcons name="info" size={20} color="#666" />
          <Text style={styles.tipText}>
            Enter product name or brand to search
          </Text>
        </View>
        <View style={styles.tipItem}>
          <MaterialIcons name="info" size={20} color="#666" />
          <Text style={styles.tipText}>
            Scan barcode for instant price comparison
          </Text>
        </View>
      </View>
    </View>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
  },
  clearButtonPressed: {
    backgroundColor: '#f0f0f0',
  },
  orText: {
    marginVertical: 16,
    fontSize: 14,
    color: '#666',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonPressed: {
    backgroundColor: '#0056b3',
    opacity: 0.9,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsSection: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
