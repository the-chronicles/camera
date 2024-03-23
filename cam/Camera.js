import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {RNCamera} from '@react-native-camera/core';
import {Camera} from 'react-native-vision-camera';

function CameraScreen() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        await Camera.requestCameraPermissions();
        setIsCameraReady(true);
      } catch (e) {
        console.error('Failed to initialize camera:', e);
      }
    };

    initializeCamera();

    return () => {
      setIsCameraReady(false);
    };
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          quality: 'High',
        });
        setCapturedImage(photo.uri);
        // You can perform OCR here using Tesseract OCR library
        // Example: performOCR(photo.uri);
      } catch (e) {
        console.error('Failed to take picture!:', e);
      }
    }
  };

  return (
    <View style={{flex: 1}}>
      {isCameraReady ? (
        <Camera
          style={{flex: 1}}
          ref={cameraRef}
          // Adjust camera options according to your needs
        />
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Loading Camera...</Text>
        </View>
      )}

      <TouchableOpacity
        style={{position: 'absolute', bottom: 20, alignSelf: 'center'}}
        onPress={takePicture}>
        <Text style={{fontSize: 20, color: 'white'}}>Take Picture</Text>
      </TouchableOpacity>

      {capturedImage && (
        <View style={{position: 'absolute', top: 20, left: 20}}>
          <Text>Preview:</Text>
          <Image
            source={{uri: capturedImage}}
            style={{width: 100, height: 100}}
          />
        </View>
      )}
    </View>
  );
}

export default CameraScreen;
