import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Input, Button } from 'react-native-elements' 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { authentication } from '../firebase/firebaseConfig';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');

    const registerUser = async () => {
      createUserWithEmailAndPassword(authentication, email, password)
      .then((credentials) => {
        console.log("Utilisateur inscrit :", credentials);
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
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
        value={ Username }
        onChangeText={ text => setUsername(text) }
        leftIcon={{type: 'material', name: 'account-circle'}}
        // secureTextEntry
        />
        <Input 
        placeholder='Avatar'
        label='Avatar'
        value={ avatar }
        onChangeText={ text => setAvatar(text) }
        leftIcon={{type: 'material', name: 'photo'}}
        secureTextEntry
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

