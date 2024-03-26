import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Clipboard,
  PermissionsAndroid,
  FileSystem,
  Alert,
} from 'react-native';
// import Camera from 'react-native-camera';
import {Camera} from 'react-native-vision-camera';
import TesseractOcr from 'react-native-tesseract-ocr';
import SelectableText from 'react-native-color-picker';

const Cam2 = () => {
  const cameraRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [highlightColor, setHighlightColor] = useState('yellow');

  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Camera permission denied');
        }
      }
    };
    requestCameraPermission();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = {quality: 0.8};
      const data = await cameraRef.current.takePictureAsync(options);
      setCapturedImage(data.uri);
    }
  };

  const recognizeText = async () => {
    setIsLoading(true);
    try {
      const recognizedText = await TesseractOcr.extractTextFromImage(
        capturedImage,
      );
      setText(recognizedText);
    } catch (error) {
      console.error('Error recognizing text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (capturedImage) {
      recognizeText();
    }
  });

  const handleSelection = selection => {
    setSelectedText(selection);
    setIsPopupVisible(true);
  };

  const handleHighlightColorChange = color => {
    setHighlightColor(color);
  };

  const saveText = async () => {
    if (!selectedText) {
      return;
    }

    const filename = `${Date.now()}.txt`;
    const path = `${FileSystem.DocumentDirectory}/${filename}`;

    try {
      await FileSystem.writeAsStringAsync(path, selectedText);
      Alert.alert('Success', `Text saved to "${filename}" in Documents`);
    } catch (error) {
      console.error('Error saving texxt:', error);
      Alert.alert('Error', 'Failed to save text');
    }
  };

  const copyToClipboard = async () => {
    if (!selectedText) {
      return;
    }

    await Clipboard.setString(selectedText);
    Alert.alert('Success', 'Text copied to clipboard');
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message:
            'We need your permission to use your camera to scan documents.',
        }}>
        {({camera, status}) => {
          if (status !== 'READY') return <Text>Waiting for camera...</Text>;
          return (
            <View style={styles.captureButtonContainer}>
              <TouchableOpacity
                onPress={takePicture}
                style={styles.captureButton}>
                <Text style={styles.captureButtonText}>Capture</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      </Camera>
      {capturedImage && (
        <View style={styles.ocrResult}>
          {isLoading && <Text>Extracting Text...</Text>}
          {text && (
            <SelectableText
              text={text}
              onSelectionChange={handleSelection}
              style={{fontSize: 18}}
            />
          )}
        </View>
      )}
      <Modal animationType="slide" transparent={true} visible={isPopupVisible}>
        <View style={styles.popupContainer}>
          <Text style={styles.selectedText}>{selectedText}</Text>
          <Text
            style={[styles.selectedText, {backgroundColor: highlightColor}]}>
            This text will visually appear highlighted with the chosen color.
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsPopupVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={copyToClipboard}>
              <Text style={styles.actionButtonText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={saveText}>
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#ccc',
    padding: 20,
    borderRadius: 50,
  },
  captureButtonText: {
    color: '#000',
    fontSize: 16,
  },
  ocrResult: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  popupContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  selectedText: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    fontSize: 16,
  },
});

export default Cam2;
