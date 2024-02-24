import { View, Text, StyleSheet, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { authentication, db } from '../firebase/firebaseConfig'
import ListItem from '../components/ListItem';

export default function Home() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const unsubscribe = getUsers();
        return () => unsubscribe(); // Nettoyage de l'écouteur
    }, []);

    const getUsers = async () => {
        const docGetUserRef = collection(db, 'utilisateurs');
        const q = query(docGetUserRef, where('userUID', '!=', authentication?.currentUser?.uid));
        return onSnapshot(q, (onSnap) => {
            let getdataUsers = [];
            onSnap.docs.forEach(user => {
                getdataUsers.push({...user.data()});
            });
            setUsers(getdataUsers);
            console.table(getdataUsers);
        });
    }

    return (
        <FlatList 
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
            <View>
                <Text>{item.name}</Text>
                <Text>{item.email}</Text>
                <Text>{item.avatarUrl}</Text>
            </View>
        )}
    />
   
    );
}

const styles = StyleSheet.create({
  
})
