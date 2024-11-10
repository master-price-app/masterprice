import React from "react";
import { Pressable, Text, View } from "react-native";

export default function PressableButton({
  children,
  componentStyle,
  pressedHandler,
  pressedStyle,
  text,
  screenType,
}) {
  return (
    <Pressable
      onPress={pressedHandler}
      style={({ pressed }) => [componentStyle, pressed && pressedStyle]}
    >
      {children ? children : <Text>{text}</Text>}
    </Pressable>
  );
}
