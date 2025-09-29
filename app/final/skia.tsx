import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Fill, Circle, Rect, RoundedRect } from '@shopify/react-native-skia';

const BasicShapes = () => {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill color="lightblue" />
        <Circle cx={80} cy={80} r={50} color="red" />
        <Rect x={180} y={40} width={100} height={80} color="green" />
        <RoundedRect x={40} y={150} width={120} height={80} r={15} color="purple" />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: 300,
    height: 300,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default BasicShapes;
