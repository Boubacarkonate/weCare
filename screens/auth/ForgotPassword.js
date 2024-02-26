import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { sendPasswordResetEmail } from 'firebase/auth';
import { authentication, db } from '../../firebase/firebaseConfig';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(authentication, email);
      Alert.alert('Success', 'Un email de réinitialisation de mot de passe a été envoyé.');
      navigation.goBack(); // Retour à l'écran de connexion après l'envoi de l'e-mail
    } catch (error) {
      console.error('Error sending password reset email:', error);
      Alert.alert('Error', 'Une erreur s\'est produite lors de l\'envoi de l\'email de réinitialisation de mot de passe.');
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Adresse email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button
        title="Réinitialiser le mot de passe"
        onPress={handleResetPassword}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default ForgotPasswordScreen;
