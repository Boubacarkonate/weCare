import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db, authentication } from '../../firebase/firebaseConfig';
import { Button } from 'react-native-elements';

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer l'utilisateur actuellement authentifié
        const currentUser = authentication.currentUser;
        
        // Vérifier si l'utilisateur est connecté
        if (currentUser) {
          // Récupérer les données de l'utilisateur depuis Firestore
          const userRef = collection(db, 'utilisateurs');
          const snapshot = await getDocs(userRef);
          snapshot.forEach((doc) => {
            if (doc.id === currentUser.uid) {
              // Mettre à jour l'état avec les données de l'utilisateur
              setUserData({ ...doc.data(), id: doc.id });
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur :', error);
      }
    };

    // Appeler la fonction de récupération des données utilisateur
    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
          <Text style={styles.text}>Username: {userData.username}</Text>
          <Text style={styles.text}>Email: {userData.email}</Text>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
       <Button
                // style={styles.btn}
                title='Avatar'
            />
       <Button
                onPress={() => navigation.navigate("UpdateProfile")}
                // style={styles.btn}
                title='Update'
            />
       <Button
                onPress={() => navigation.navigate("DeleteProfile")}
                // style={styles.btn}
                title='Delete'
            />
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
    borderRadius: 50,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
