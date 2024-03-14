import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { Input, Button } from 'react-native-elements'
import * as ImagePicker from 'expo-image-picker';

export default function AvatarPicker() {
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  const handleAvatarChange = (text) => {
    setAvatar(text);
  };

  const takePhotoFromCamera = async () => {
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

  const choosePhotoFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        setAvatarPreview(result.uri);
      }
    } else {
      alert('Permission to access media library denied');
    }
  };

  const registerUser = () => {
    // Logique pour enregistrer l'utilisateur avec l'avatar sélectionné
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder='Avatar'
        label='Avatar'
        value={avatar}
        onChangeText={handleAvatarChange}
        leftIcon={{ type: 'material', name: 'photo' }}
      />
      <TouchableOpacity onPress={takePhotoFromCamera}>
        <Text>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={choosePhotoFromLibrary}>
        <Text>Choose from Library</Text>
      </TouchableOpacity>
      {avatarPreview && (
        <Image source={{ uri: avatarPreview }} style={styles.avatar} />
      )}
      {/* <Button
        onPress={registerUser}
        style={styles.btn}
        title='Register Avatar'
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 20,
  },
  btn: {
    marginTop: 20,
  },
});
