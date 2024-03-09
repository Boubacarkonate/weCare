import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { Input, Button } from 'react-native-elements';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { authentication, db } from '../../firebase/firebaseConfig';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';


export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null); // State pour stocker l'aperçu de l'avatar

    const navigation = useNavigation();

    const registerUser = async () => {
        try {
            const credentials = await createUserWithEmailAndPassword(authentication, email, password);
            const userUID = credentials.user.uid;
            const docUserRef = doc(db, 'utilisateurs', userUID);
            await setDoc(docUserRef, {
                avatarUrl: avatar ? avatar : 'https://static.thenounproject.com/png/363640-200.png',
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
    const handleAvatarChange = (text) => {
        setAvatar(text);
        setAvatarPreview(text); // Met à jour l'aperçu de l'avatar
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
            <Input
                placeholder='Avatar'
                label='Avatar'
                value={avatar}
                onChangeText={handleAvatarChange} // Utilise la fonction handleAvatarChange pour mettre à jour l'avatar
                leftIcon={{ type: 'material', name: 'photo' }}
            />
            {/* Affiche l'aperçu de l'avatar si une URL d'avatar est saisie */}
            {avatarPreview && (
                <Image source={{ uri: avatarPreview }} style={{ width: 100, height: 100 }} />
            )}
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
    btn: {
        marginTop: 10
    },
});
