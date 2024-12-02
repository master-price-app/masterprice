import { Pressable, StyleSheet, Text } from "react-native";

export default function PressableButton({
  onPress = () => {},
  children,
  title,
  disabled = false,
  componentStyle,
  pressedStyle = { opacity: 0.8 },
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
        componentStyle,
        pressed && pressedStyle,
      ]}
    >
      {children ? children : (
        <Text style={[styles.text, disabled && styles.disabledText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
  },
  pressed: {
  },
  disabled: {
  },
  text: {
  },
  disabledText: {
  },
});
