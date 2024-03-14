import { StyleSheet, Text, View, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Input, Button } from 'react-native-elements';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { authentication, db } from '../../firebase/firebaseConfig';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';


export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [image, setImage] = useState(null);
    // const [avatarPreview, setAvatarPreview] = useState(null); // State pour stocker l'aperçu de l'avatar

    const navigation = useNavigation();

    const registerUser = async () => {
        try {
            const credentials = await createUserWithEmailAndPassword(authentication, email, password);
            const userUID = credentials.user.uid;
            const docUserRef = doc(db, 'utilisateurs', userUID);
            await setDoc(docUserRef, {
                // avatarUrl: avatar ? avatar : 'https://static.thenounproject.com/png/363640-200.png',
                avatarUrl: image ? image : 'https://static.thenounproject.com/png/363640-200.png',
                username,
                email,
                password,
                userUID,
                createdAt: serverTimestamp()
            });
            console.log("Vous êtes inscrit :", credentials);
            Alert.alert('Success', 'Incsrit supprimé');
            // Rediriger automatiquement vers la page d'accueil après la suppression
            navigation.navigate('Home');
        } catch (err) {
            console.log(err.message);
        }
    };

    // Fonction pour mettre à jour l'aperçu de l'avatar lors de la saisie de l'URL de l'avatar
    // const handleAvatarChange = (text) => {
    //     setAvatar(text);
    //     setAvatarPreview(text); // Met à jour l'aperçu de l'avatar
    //};

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
         
        });
    
        if (!result.cancelled) {
          setImage(result.assets[0].uri);
        }
      };
    
      const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        if (!result.cancelled) {
          setImage(result.assets[0].uri);
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
            text: 'Annuler',
            onPress: () => {}, // Ne fait rien, ferme simplement l'alerte
            style: 'cancel', // Style iOS pour indiquer une action d'annulation
          },
        ]
      );
    };

    return (
        <View style={styles.container}>
            <Input
                placeholder='Enter your email'
                label='Email'
                value={email}
                onChangeText={text => setEmail(text)}
                leftIcon={{ type: 'material', name: 'email' }}
            />
            <Input
                placeholder='Enter your password'
                label='Password'
                value={password}
                onChangeText={text => setPassword(text)}
                leftIcon={{ type: 'material', name: 'lock' }}
                secureTextEntry
            />
            <Input
                placeholder='Username'
                label='Username'
                value={username}
                onChangeText={text => setUsername(text)}
                leftIcon={{ type: 'material', name: 'account-circle' }}
            />
            {/* <Input
                placeholder='Avatar'
                label='Avatar'
                value={avatar}
                onChangeText={handleAvatarChange} // Utilise la fonction handleAvatarChange pour mettre à jour l'avatar
                leftIcon={{ type: 'material', name: 'photo' }}
            />
           
            {avatarPreview && (
                <Image source={{ uri: avatarPreview }} style={{ width: 100, height: 100 }} />
            )} */}
            
    <View style={styles.containerAvatar}>
      <Text style={styles.introText}>📸 Choisissez votre avatar</Text>

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
            <Button
                onPress={registerUser}
                style={styles.btn}
                title='Register'
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerAvatar: {
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#f2f2f2',
        // paddingTop: 50,
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
    btn: {
        marginTop: 10
    },
});
