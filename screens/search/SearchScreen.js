import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

export default function SearchScreen() {
  const navigation = useNavigation()
  return (
    <View>
      <Text onPress={() => navigation.navigate("SearchResult")}>
        Test navigation
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({})