import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

const globalAnimatedValue = new Animated.Value(0);
let animationInstance = null;
let activeSkeletons = 0;

const startGlobalAnimation = () => {
  if (animationInstance) {
    return;
  }

  animationInstance = Animated.loop(
    Animated.sequence([
      Animated.timing(globalAnimatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(globalAnimatedValue, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  );

  animationInstance.start();
};

const cleanupGlobalAnimation = () => {
  activeSkeletons--;

  if (activeSkeletons === 0 && animationInstance) {
    animationInstance.stop();
    animationInstance = null;
    globalAnimatedValue.setValue(0);
  }
};

export default function Skeleton({ width, height, style }) {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    activeSkeletons++;
    startGlobalAnimation();

    return () => {
      if (isMounted.current) {
        isMounted.current = false;
        cleanupGlobalAnimation();
      }
    };
  }, []);

  const opacity = globalAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
});
