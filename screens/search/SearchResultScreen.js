import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

export default function SearchResultScreen() {
  const navigation = useNavigation();

  return (
    <View>
      <Text>No price record shared yet.</Text>
      <Text
        onPress={() =>
          navigation.navigate("Common", {
            screen: "PriceForm",
          })
        }
      >
        Be the first one to share
      </Text>
    </View>
  );
}

const styles = StyleSheet.create();