// Importez les modules nécessaires depuis React et react-native
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image,  Alert } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { authentication, db } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

// Définissez votre composant UpdateProfile
export default function UpdateProfile() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDoc = doc(db, 'utilisateurs', authentication.currentUser.uid);
                const snapshot = await getDoc(userDoc);
                if (snapshot.exists()) {
                    const userData = snapshot.data();
                    setEmail(userData.email);
                    setUsername(userData.username);
                    setAvatar(userData.avatarUrl);
                    // Ne pas récupérer le mot de passe de la base de données
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const updateUserProfile = async () => {
        try {
            const userDoc = doc(db, 'utilisateurs', authentication.currentUser.uid);
            await updateDoc(userDoc, {
                email,
                username,
                avatarUrl: avatar,
                updateDate: serverTimestamp()
            });
            console.log('User profile updated successfully');
            Alert.alert('Success', 'Profile updated successfully');
            setTimeout(() => {
                navigation.navigate('Home');
            }, 2000);
        } catch (error) {
            console.error('Error updating user profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleAvatarChange = (text) => {
        setAvatar(text);
        setAvatarPreview(text);
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
                onChangeText={handleAvatarChange}
                leftIcon={{ type: 'material', name: 'photo' }}
            />
            {avatarPreview && (
                <Image source={{ uri: avatarPreview }} style={{ width: 100, height: 100 }} />
            )}

            <Button
                onPress={updateUserProfile}
                style={styles.btn}
                title='Save Changes'
            />
        </View>
    );
}


// Définissez les styles CSS pour votre composant
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
