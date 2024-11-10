import { Button, TextInput, View, StyleSheet } from 'react-native';
import { useState } from "react";

export default function SearchScreen({ navigation }) {
  const [keyword, setKeyword] = useState("");
  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner');
  };

  const handleSearch = () => {
    if (keyword.trim()) {
      navigation.navigate("SearchResult", { keyword });
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Search an Item"
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={handleSearch}
      />
      <Button title="Search" onPress={handleSearch} />
      <Button title="Scan Barcode" onPress={handleScanBarcode} />
    </View>
  );
}

const styles = StyleSheet.create({})