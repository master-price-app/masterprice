import { Text } from "react-native";

export default function SearchResultScreen({ navigation, route }) {
  const { barcode, keyword } = route.params;

  return (
    <>
      {
        // TODO: Search the barcode with API
      }
      <Text>{barcode}</Text>
      {
        // TODO: Search the keyword with API
      }
      <Text>{keyword}</Text>
    </>
  );
}
