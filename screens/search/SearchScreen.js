import { useState } from "react";
import { Button, TextInput, View, StyleSheet } from 'react-native';

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

        value={keyword}
        onChangeText={setKeyword}
        placeholder="Search an Item"
        returnKeyType='search'
        onSubmitEditing={handleSearch}
      />

      <Button title="Search" onPress={handleSearch} />

      <Button title="Scan Barcode" onPress={handleScanBarcode} />
    </View>
  );
}

const styles = StyleSheet.create({})