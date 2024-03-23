import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import CameraScreen from './cam/Camera';
import Cam2 from './cam/Cam2';

export default function App() {
  return (
    <View style={styles.container}>
      {/* <CameraScreen /> */}
      <Cam2 />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
