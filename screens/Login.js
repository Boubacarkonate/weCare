import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Input, Button } from 'react-native-elements' 
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { authentication } from '../firebase/firebaseConfig';
import { AuthContext } from "../context/AuthContext";

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const loginUser = async () => {
      signInWithEmailAndPassword(authentication, email, password)
      .then((credentials) => {
        console.log("utilisateur connecté", credentials.user);
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
    useEffect(() => {
      onAuthStateChanged(authentication, (user) => {
        if (user) {
          navigation.navigate('Home');
        } else {
          console.log('no user');
        }
      });
    },[]);

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

        <Button
        onPress={ loginUser }
        title='Login'
        />
        <Button
        style={styles.btn}
        onPress={() => navigation.navigate("Register")}
        title='Register'
        />
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#fff',
        // alignItems: 'center',
        // justifyContent: 'center',
      },
    btn: {
        marginTop: 10
      },
})

