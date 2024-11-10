import { Text } from "react-native";

export default function SearchResultScreen({ navigation, route }) {
  const { barcode, keyword } = route.params;

  return (
    <>
      {
        // TODO: Search the barcode with API
      }
      <Text>{barcode}</Text>
    </>
  );
}

const styles = StyleSheet.create();