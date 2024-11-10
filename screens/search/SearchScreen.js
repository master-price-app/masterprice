import { Button, TextInput, View } from 'react-native';

export default function SearchScreen({ navigation }) {
  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner');
  };

  return (
    <View>
      <TextInput placeholder="Search an Item" />
      <Button title="Scan Barcode" onPress={handleScanBarcode} />
    </View>
  );
}
