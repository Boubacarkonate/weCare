import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';

export default function TakeVideo_Photo_Gallery() {
  const [image, setImage] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  // Référence pour accéder aux méthodes de contrôle de la vidéo
  const video = useRef(null);
  // State pour gérer le statut de lecture de la vidéo
  const [status, setStatus] = useState({});

  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      if (status !== 'granted') {
        Alert.alert('Désolé, nous avons besoin des permissions de caméra pour que cela fonctionne!');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        setAvatarPreview(result.uri);
      }
    } else {
      alert('Permission to access camera denied');
    }
  };

  const registerVideo = async () => {
    // Demande de permission pour accéder à la caméra
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    // Lancement de la caméra pour capturer une vidéo
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true, // Permet l'édition de la vidéo après la capture
      quality: 1, // Qualité maximale de la vidéo
    });

    console.log('video enregistrée : ', result);

    // Si l'utilisateur ne cancelle pas la prise de vidéo, sauvegarde de l'URI de la vidéo
    if (!result.cancelled) {
      setVideoUri(result.uri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Choisissez une option 📸',
      'Voulez-vous choisir une image de votre bibliothèque ou prendre une nouvelle photo?',
      [
        {
          text: 'Choisir de la bibliothèque',
          onPress: pickImage,
        },
        {
          text: 'Prendre une photo',
          onPress: takePhoto,
        },
        {
          text: 'Prendre une video',
          onPress: registerVideo,
        },
        {
          text: 'Annuler',
          onPress: () => {}, // Ne fait rien, ferme simplement l'alerte
          style: 'cancel', // Style iOS pour indiquer une action d'annulation
        },
      ]
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.introText}>📸 Choisissez votre avatar ! 🌟</Text>

      {!image && (
        <TouchableOpacity onPress={showImagePickerOptions}>
          <View style={{ borderRadius: 300, overflow: 'hidden' }}>
            <Ionicons name="image" size={150} color="grey" />
          </View>
        </TouchableOpacity>
      )}

      {image && (
        <TouchableOpacity onPress={showImagePickerOptions}>
          <Image source={{ uri: image }} style={styles.image} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f2f2f2',
    paddingTop: 50,
  },
  introText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});
