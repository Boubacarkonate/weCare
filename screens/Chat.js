import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { authentication, db } from '../firebase/firebaseConfig';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Chat({ route }) {
    const uid = route.params.uid;
    const currentUser = authentication?.currentUser?.uid;
    const [messages, setMessages] = useState([]);

    const call = () => {
        // Implémentez la fonctionnalité d'appel ici
    };

    const navigation = useNavigation(); // Utilisation de useNavigation pour obtenir l'objet navigation
    
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => alert('This is a button!')} style={styles.headerRightBtn}>
                    <Ionicons name="call" size={30} color="black"  style={{ paddingRight:20 }} />
                    <Ionicons name="videocam" size={30} color="black" style={{ paddingRight:20 }} />
                    <Ionicons name="ellipsis-vertical" size={30} color="black"/>
                </TouchableOpacity>
            )
        });
    }, [navigation]); // Passez navigation en tant que dépendance

    useEffect(() => {
        const chatId = uid > currentUser ? `${uid + '-' + currentUser}` : `${currentUser + '-' + uid}`;
        const documentRef = doc(db, 'chatRooms', chatId);
        const collectionRef = collection(documentRef, 'messages');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const docSnap = onSnapshot(q, (onSnap) => {
            const allMessages = onSnap.docs.map((mes, index) => ({
                ...mes.data(),
                _id: index.toString(), // Ajoutez une clé _id unique pour chaque message
                createdAt: mes.data().createdAt.toDate(),
            }));
            setMessages(allMessages);
        });
    }, []);
  
    const onSend = useCallback((messagesArray) => {
        const msg = messagesArray[0];
        const chatId = uid > currentUser ? `${uid + '-' + currentUser}` : `${currentUser + '-' + uid}`
        const documentRef = doc(db, 'chatRooms', chatId);
        const collectionRef = collection(documentRef, 'messages');
        const chatSnap = addDoc(collectionRef, {
            ...msg,
            sentBy: currentUser,
            sentTo: uid,
            createdAt: serverTimestamp(),
        });
        console.log('le messages a été envoyé et enregistré en base de données');
        setMessages(previousMessages => GiftedChat.append(previousMessages, messagesArray));
    }, []);
    
    return (
      <GiftedChat
        messages={messages}
        onSend={text => onSend(text)}
        user={{
          _id: authentication?.currentUser?.uid, 

        }}
      />
    );
}

const styles = StyleSheet.create({
    headerRightBtn: {
        flexDirection: 'row',
    }
});
