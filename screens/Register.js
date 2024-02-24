import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Input, Button } from 'react-native-elements' 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { authentication, db } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');

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
        });
        console.log("Vous êtes inscrit :", credentials);
      } catch (err) {
        console.log(err.message);
      }
    };

  return (
    <View style={styles.container}>
        <Input 
        placeholder='Enter your email'
        label='Email'
        value={ email }
        onChangeText={ text => setEmail(text) }
        leftIcon={{type: 'material', name: 'email'}}
        />
        <Input 
        placeholder='Enter your password'
        label='Password'
        value={ password }
        onChangeText={ text => setPassword(text) }
        leftIcon={{type: 'material', name: 'lock'}}
        secureTextEntry
        />
        <Input 
        placeholder='Username'
        label='Username'
        value={ username }
        onChangeText={ text => setUsername(text) }
        leftIcon={{type: 'material', name: 'account-circle'}}
        />
        <Input 
        placeholder='Avatar'
        label='Avatar'
        value={ avatar }
        onChangeText={ text => setAvatar(text) }
        leftIcon={{type: 'material', name: 'photo'}}
        />

       
        <Button
        onPress={ registerUser }
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
})

