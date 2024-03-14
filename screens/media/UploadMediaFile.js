import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../firebase/firebaseConfig'; // Importez la configuration Firebase Storage
import { ref, uploadBytes } from "firebase/storage";

export default function UploadMediaFile() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('image sélectionnée : ', result);

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    try {
      // Vérification si une image a été sélectionnée
      if (!image) {
        console.log('Aucune image sélectionnée');
        return;
      }

      // Récupération du nom de fichier à partir de l'URI de l'image
      const filename = image.substring(image.lastIndexOf('/') + 1);

      // Création d'une référence vers le dossier où stocker l'image dans Firebase Storage
      const storageRef = ref(storage, filename);

      // Conversion de l'image en blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Téléchargement de l'image vers Firebase Storage
      await uploadBytes(storageRef, blob);

      // Affichage d'un message de succès
      console.log('Image téléchargée avec succès vers Firebase Storage');

      // Réinitialisation de l'état de l'image
      setImage(null);
    } catch (error) {
      // En cas d'erreur, affichage de l'erreur dans la console
      console.error('Erreur lors du téléchargement de l\'image vers Firebase Storage :', error);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="choisir fichier/image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />}
      <Button title="Upload image" onPress={uploadImage} />
    </View>
  );
}
